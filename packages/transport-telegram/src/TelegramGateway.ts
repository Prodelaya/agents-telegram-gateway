import { Bot, InlineKeyboard, InputFile } from "grammy";
import type { AgentAdapter, Project, AgentSession } from "@agents-telegram-gateway/core";
import { formatForTelegram, RuntimeRegistry } from "@agents-telegram-gateway/core";

export interface TelegramGatewayOptions {
  token: string;
  allowedUserIds: number[];
  projects: Project[];
  adapter: AgentAdapter;
  defaultAgent: string;
  maxTextLength: number;
}

export class TelegramGateway {
  private readonly bot: Bot;
  private readonly runtimes = new RuntimeRegistry();
  private activeProject?: Project;
  private activeRuntimeId?: string;
  private activeSession?: AgentSession;

  constructor(private readonly options: TelegramGatewayOptions) {
    this.bot = new Bot(options.token);
    this.registerHandlers();
  }

  start(): Promise<void> {
    return this.bot.start();
  }

  private registerHandlers(): void {
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId || !this.options.allowedUserIds.includes(userId)) {
        if (ctx.message) await ctx.reply("Unauthorized.");
        return;
      }
      await next();
    });

    this.bot.command("start", async (ctx) => {
      await ctx.reply("agents-telegram-gateway ready. Use /projects or /open <project>.");
    });

    this.bot.command("projects", async (ctx) => {
      const text = this.options.projects.map((project) => `• ${project.id}`).join("\n") || "No projects found.";
      await ctx.reply(text);
    });

    this.bot.command("open", async (ctx) => {
      const requested = ctx.match?.trim();
      if (!requested) {
        await ctx.reply("Usage: /open <project>");
        return;
      }

      const project = this.options.projects.find((item) => item.id === requested || item.name === requested);
      if (!project) {
        await ctx.reply(`Project not found: ${requested}`);
        return;
      }

      const runtime = await this.options.adapter.startRuntime({ project, defaultAgent: this.options.defaultAgent });
      this.runtimes.set(runtime);
      const session = await this.options.adapter.createSession(runtime.id, { defaultAgent: this.options.defaultAgent });

      this.activeProject = project;
      this.activeRuntimeId = runtime.id;
      this.activeSession = session;

      await ctx.reply(
        [
          "✅ Project opened",
          "",
          `Project: ${project.id}`,
          `Path: ${project.path}`,
          `Agent: ${this.options.defaultAgent}`,
          `Session: ${session.agentSessionId}`,
        ].join("\n"),
      );
    });

    this.bot.command("status", async (ctx) => {
      await ctx.reply(
        [
          "Status",
          `Project: ${this.activeProject?.id ?? "none"}`,
          `Runtime: ${this.activeRuntimeId ?? "none"}`,
          `Session: ${this.activeSession?.agentSessionId ?? "none"}`,
          `Agent: ${this.options.defaultAgent}`,
        ].join("\n"),
      );
    });

    this.bot.command("sessions", async (ctx) => {
      if (!this.activeRuntimeId) {
        await ctx.reply("No active runtime. Use /open <project> first.");
        return;
      }
      const sessions = await this.options.adapter.listSessions(this.activeRuntimeId);
      if (sessions.length === 0) {
        await ctx.reply("No sessions found.");
        return;
      }
      const keyboard = new InlineKeyboard();
      for (const session of sessions.slice(0, 10)) {
        keyboard.text(session.title ?? session.agentSessionId, `session:${session.agentSessionId}`).row();
      }
      await ctx.reply("Sessions:", { reply_markup: keyboard });
    });

    this.bot.callbackQuery(/^session:(.+)$/u, async (ctx) => {
      if (!this.activeRuntimeId) {
        await ctx.answerCallbackQuery("No active runtime");
        return;
      }
      const sessionId = ctx.match[1];
      this.activeSession = await this.options.adapter.attachSession(this.activeRuntimeId, sessionId);
      await ctx.answerCallbackQuery("Session selected");
      await ctx.reply(`✅ Active session: ${sessionId}`);
    });

    this.bot.command("abort", async (ctx) => {
      if (!this.activeSession) {
        await ctx.reply("No active session.");
        return;
      }
      await this.options.adapter.abort(this.activeSession.agentSessionId);
      await ctx.reply("Aborted.");
    });

    this.bot.command("diff", async (ctx) => {
      if (!this.activeSession || !this.options.adapter.getDiff) {
        await ctx.reply("Diff not available.");
        return;
      }
      const diff = await this.options.adapter.getDiff(this.activeSession.agentSessionId);
      await this.sendFormatted(ctx, diff.text);
    });

    this.bot.on("message:text", async (ctx) => {
      const text = ctx.message.text;
      if (text.startsWith("/")) return;
      if (!this.activeRuntimeId || !this.activeSession) {
        await ctx.reply("No active session. Use /open <project> first.");
        return;
      }
      await this.options.adapter.sendMessage({
        runtimeId: this.activeRuntimeId,
        sessionId: this.activeSession.agentSessionId,
        agent: this.options.defaultAgent,
        text,
      });
      await ctx.reply("↗️ sent to OpenCode");
    });
  }

  private async sendFormatted(ctx: any, text: string): Promise<void> {
    const chunks = formatForTelegram(text, {
      maxTextLength: this.options.maxTextLength,
      sendLongCodeAsFile: true,
      sendDiffAsPatch: true,
    });

    for (const chunk of chunks) {
      if (chunk.kind === "text") {
        await ctx.reply(chunk.text);
      } else {
        await ctx.replyWithDocument(new InputFile(Buffer.from(chunk.content ?? "", "utf8"), chunk.filename ?? "output.txt"));
      }
    }
  }
}
