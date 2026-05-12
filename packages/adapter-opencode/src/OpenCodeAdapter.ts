import { spawn, type ChildProcess } from "node:child_process";
import type {
  AgentAdapter,
  AgentEventHandler,
  AgentMessage,
  AgentSession,
  CreateSessionInput,
  DiffResult,
  PermissionAnswerInput,
  Runtime,
  SendMessageInput,
  StartRuntimeInput,
  Unsubscribe,
} from "@agents-telegram-gateway/core";
import type { OpenCodeConfig } from "./OpenCodeConfig.js";
import { defaultOpenCodeConfig } from "./OpenCodeConfig.js";

interface ManagedProcess {
  runtime: Runtime;
  process: ChildProcess;
}

export class OpenCodeAdapter implements AgentAdapter {
  id = "opencode";

  private readonly config: OpenCodeConfig;
  private readonly managed = new Map<string, ManagedProcess>();

  constructor(config: Partial<OpenCodeConfig> = {}) {
    this.config = { ...defaultOpenCodeConfig, ...config };
  }

  async startRuntime(input: StartRuntimeInput): Promise<Runtime> {
    const port = input.preferredPort ?? (await this.findFreePort());
    const serverUrl = `http://${this.config.host}:${port}`;
    const now = new Date().toISOString();
    const runtime: Runtime = {
      id: `opencode:${input.project.id}:${port}`,
      projectId: input.project.id,
      adapter: this.id,
      serverUrl,
      port,
      mode: "managed",
      status: "starting",
      createdAt: now,
      updatedAt: now,
    };

    const env = {
      ...process.env,
      OPENCODE_CLIENT: "agents-telegram-gateway",
      OPENCODE_CONFIG_CONTENT: JSON.stringify({
        default_agent: input.defaultAgent ?? this.config.defaultAgent,
      }),
      ...(this.config.serverPassword ? { OPENCODE_SERVER_PASSWORD: this.config.serverPassword } : {}),
    };

    const child = spawn(
      this.config.command,
      ["serve", "--hostname", this.config.host, "--port", String(port)],
      {
        cwd: input.project.path,
        env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    runtime.pid = child.pid;
    this.managed.set(runtime.id, { runtime, process: child });

    child.stderr?.on("data", (chunk) => {
      // Keep logs minimal. Do not log secrets or full prompts here.
      process.stderr.write(`[opencode:${input.project.id}] ${chunk}`);
    });

    await this.waitForHealth(serverUrl, this.config.startupTimeoutMs);
    runtime.status = "ready";
    runtime.updatedAt = new Date().toISOString();
    return runtime;
  }

  async stopRuntime(runtimeId: string): Promise<void> {
    const managed = this.managed.get(runtimeId);
    if (!managed) return;
    managed.process.kill("SIGTERM");
    this.managed.delete(runtimeId);
  }

  async listSessions(runtimeId: string): Promise<AgentSession[]> {
    const runtime = this.getRuntime(runtimeId);
    const data = await this.request<any[]>(runtime.serverUrl, "/session", { method: "GET" });
    return data.map((session) => this.mapSession(runtime, session));
  }

  async createSession(runtimeId: string, input: CreateSessionInput): Promise<AgentSession> {
    const runtime = this.getRuntime(runtimeId);
    const data = await this.request<any>(runtime.serverUrl, "/session", {
      method: "POST",
      body: JSON.stringify({ title: input.title }),
    });
    return this.mapSession(runtime, data);
  }

  async attachSession(runtimeId: string, sessionId: string): Promise<AgentSession> {
    const runtime = this.getRuntime(runtimeId);
    const data = await this.request<any>(runtime.serverUrl, `/session/${encodeURIComponent(sessionId)}`, {
      method: "GET",
    });
    return this.mapSession(runtime, data);
  }

  async sendMessage(input: SendMessageInput): Promise<void> {
    const runtime = this.getRuntime(input.runtimeId);
    await this.request(runtime.serverUrl, `/session/${encodeURIComponent(input.sessionId)}/message`, {
      method: "POST",
      body: JSON.stringify({
        agent: input.agent ?? this.config.defaultAgent,
        parts: [{ type: "text", text: input.text }],
      }),
    });
  }

  async abort(sessionId: string): Promise<void> {
    const runtime = this.findRuntimeBySession(sessionId);
    if (!runtime) throw new Error(`Runtime for session not found: ${sessionId}`);
    await this.request(runtime.serverUrl, `/session/${encodeURIComponent(sessionId)}/abort`, {
      method: "POST",
    });
  }

  async listMessages(sessionId: string): Promise<AgentMessage[]> {
    const runtime = this.findRuntimeBySession(sessionId);
    if (!runtime) throw new Error(`Runtime for session not found: ${sessionId}`);
    const data = await this.request<any[]>(runtime.serverUrl, `/session/${encodeURIComponent(sessionId)}/message`, {
      method: "GET",
    });
    return data.map((message) => ({
      id: String(message.id),
      sessionId,
      role: message.role ?? "assistant",
      text: extractMessageText(message),
      createdAt: message.time?.created ? new Date(message.time.created).toISOString() : undefined,
      metadata: message,
    }));
  }

  async subscribe(_runtimeId: string, _handler: AgentEventHandler): Promise<Unsubscribe> {
    // TODO: implement against OpenCode's SSE event stream for the installed version.
    // The MVP can start by polling listMessages and permission state, then move to SSE.
    return () => undefined;
  }

  async answerPermission(input: PermissionAnswerInput): Promise<void> {
    const runtime = this.getRuntime(input.runtimeId);
    const response = mapPermissionAnswer(input.answer);
    await this.request(
      runtime.serverUrl,
      `/session/${encodeURIComponent(input.sessionId)}/permissions/${encodeURIComponent(input.permissionId)}`,
      {
        method: "POST",
        body: JSON.stringify(response),
      },
    );
  }

  async getDiff(sessionId: string): Promise<DiffResult> {
    const runtime = this.findRuntimeBySession(sessionId);
    if (!runtime) throw new Error(`Runtime for session not found: ${sessionId}`);
    const data = await this.request<{ text?: string; diff?: string }>(runtime.serverUrl, `/session/${encodeURIComponent(sessionId)}/diff`, {
      method: "GET",
    });
    return { text: data.diff ?? data.text ?? "", format: "diff" };
  }

  private getRuntime(runtimeId: string): Runtime {
    const managed = this.managed.get(runtimeId);
    if (!managed) throw new Error(`Runtime not found: ${runtimeId}`);
    return managed.runtime;
  }

  private findRuntimeBySession(_sessionId: string): Runtime | undefined {
    // TODO: track session -> runtime mapping in the core SessionManager.
    return [...this.managed.values()][0]?.runtime;
  }

  private async request<T = unknown>(serverUrl: string, path: string, init: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.serverPassword) {
      headers.Authorization = `Basic ${Buffer.from(`:${this.config.serverPassword}`).toString("base64")}`;
    }

    const response = await fetch(new URL(path, serverUrl), {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenCode request failed ${response.status}: ${text}`);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  private async waitForHealth(serverUrl: string, timeoutMs: number): Promise<void> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      try {
        await this.request(serverUrl, "/global/health", { method: "GET" });
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    throw new Error(`OpenCode server did not become healthy within ${timeoutMs}ms`);
  }

  private async findFreePort(): Promise<number> {
    // TODO: use a proper port probe. For now pick the first configured port.
    return this.config.portFrom;
  }

  private mapSession(runtime: Runtime, session: any): AgentSession {
    const agentSessionId = String(session.id ?? session.sessionID ?? session.sessionId);
    return {
      id: agentSessionId,
      runtimeId: runtime.id,
      projectId: runtime.projectId,
      agentSessionId,
      title: session.title ?? session.name,
      createdAt: session.time?.created ? new Date(session.time.created).toISOString() : undefined,
      updatedAt: session.time?.updated ? new Date(session.time.updated).toISOString() : undefined,
    };
  }
}

function extractMessageText(message: any): string {
  if (typeof message.text === "string") return message.text;
  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part: any) => part.text ?? part.content ?? "")
      .filter(Boolean)
      .join("\n");
  }
  return JSON.stringify(message);
}

function mapPermissionAnswer(answer: PermissionAnswerInput["answer"]): Record<string, unknown> {
  switch (answer) {
    case "approve_once":
      return { response: "allow", remember: false };
    case "approve_always":
      return { response: "allow", remember: true };
    case "deny":
      return { response: "deny", remember: false };
  }
}
