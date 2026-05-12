import type {
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
} from "./types.js";

export interface AgentAdapter {
  id: string;

  startRuntime(input: StartRuntimeInput): Promise<Runtime>;
  stopRuntime(runtimeId: string): Promise<void>;

  listSessions(runtimeId: string): Promise<AgentSession[]>;
  createSession(runtimeId: string, input: CreateSessionInput): Promise<AgentSession>;
  attachSession(runtimeId: string, sessionId: string): Promise<AgentSession>;

  sendMessage(input: SendMessageInput): Promise<void>;
  abort(sessionId: string): Promise<void>;
  listMessages(sessionId: string): Promise<AgentMessage[]>;

  subscribe(runtimeId: string, handler: AgentEventHandler): Promise<Unsubscribe>;

  answerPermission(input: PermissionAnswerInput): Promise<void>;

  getDiff?(sessionId: string): Promise<DiffResult>;
}
