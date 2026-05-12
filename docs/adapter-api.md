# Adapter API

The gateway should expose a generic adapter interface so OpenCode is the first implementation, not the whole product.

```ts
export interface AgentAdapter {
  id: string

  startRuntime(input: StartRuntimeInput): Promise<Runtime>
  stopRuntime(runtimeId: string): Promise<void>

  listSessions(runtimeId: string): Promise<AgentSession[]>
  createSession(runtimeId: string, input: CreateSessionInput): Promise<AgentSession>
  attachSession(runtimeId: string, sessionId: string): Promise<AgentSession>

  sendMessage(input: SendMessageInput): Promise<void>
  abort(sessionId: string): Promise<void>
  listMessages(sessionId: string): Promise<AgentMessage[]>

  subscribe(runtimeId: string, handler: AgentEventHandler): Promise<Unsubscribe>

  answerPermission(input: PermissionAnswerInput): Promise<void>

  getDiff?(sessionId: string): Promise<DiffResult>
}
```

## Responsibilities

### Core

The core package owns:

- project resolution;
- path safety;
- active chat state;
- active project/session state;
- runtime registry;
- Telegram-independent message formatting primitives;
- permission request state.

### Transport

A transport owns:

- Telegram bot/webhook/polling;
- commands;
- callback buttons;
- rendering to a specific medium.

### Adapter

An adapter owns:

- starting/stopping a concrete local agent runtime;
- translating generic gateway calls into that agent's API/CLI;
- parsing events;
- answering permission requests;
- listing sessions;
- sending messages.

## Future adapters

Potential future adapters:

- `adapter-opencode`
- `adapter-claude-code`
- `adapter-gemini-cli`
- `adapter-codex`
- `adapter-cursor`
- `adapter-vscode-copilot`

Each adapter can have different capabilities. The core should detect and expose capabilities rather than assuming all agents support everything.
