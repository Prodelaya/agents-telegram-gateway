export type AdapterId = string;
export type RuntimeMode = "managed" | "attached_tui";
export type RuntimeStatus = "starting" | "ready" | "stopped" | "error";

export interface Project {
  id: string;
  name: string;
  path: string;
  adapter?: AdapterId;
}

export interface Runtime {
  id: string;
  projectId: string;
  adapter: AdapterId;
  serverUrl: string;
  port?: number;
  pid?: number;
  mode: RuntimeMode;
  status: RuntimeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSession {
  id: string;
  runtimeId: string;
  projectId: string;
  agentSessionId: string;
  title?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system" | "tool";
  text: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface StartRuntimeInput {
  project: Project;
  preferredPort?: number;
  defaultAgent?: string;
}

export interface CreateSessionInput {
  title?: string;
  defaultAgent?: string;
}

export interface SendMessageInput {
  runtimeId: string;
  sessionId: string;
  text: string;
  agent?: string;
}

export type PermissionAnswer = "approve_once" | "approve_always" | "deny";

export interface PermissionRequest {
  id: string;
  runtimeId: string;
  sessionId: string;
  projectId: string;
  toolName: string;
  description: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface PermissionAnswerInput {
  runtimeId: string;
  sessionId: string;
  permissionId: string;
  answer: PermissionAnswer;
}

export interface DiffResult {
  text: string;
  format: "diff" | "patch" | "text";
}

export interface AgentEvent {
  type: string;
  runtimeId: string;
  sessionId?: string;
  payload?: unknown;
}

export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>;
export type Unsubscribe = () => Promise<void> | void;
