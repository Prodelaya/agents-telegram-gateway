# agents-telegram-gateway

Private Telegram gateway for controlling local coding agents from a phone.

The first supported adapter is **OpenCode**, designed for a local workstation running **Gentle-AI**, `gentle-orchestrator`, and persistent memory through **Engram MCP**.

This project is intentionally **not** a Telegram bot with its own model. Telegram is only the remote keyboard/screen. The local coding agent remains the real worker.

```text
Telegram mobile
  ↓
agents-telegram-gateway
  ↓
Agent adapter: OpenCode
  ↓
OpenCode running locally in the selected project directory
  ↓
gentle-orchestrator + Gentle-AI config + Engram MCP + local files
```

## Status

Early architecture/scaffold.

The repository captures the design for a first MVP and provides a TypeScript monorepo skeleton:

- `packages/core` — agent-agnostic gateway primitives.
- `packages/adapter-opencode` — first adapter, targeting OpenCode server/headless mode.
- `packages/transport-telegram` — Telegram transport.
- `packages/cli` — CLI entry point.

The intent is to make the OpenCode version useful immediately, while keeping the project open for future adapters such as Claude Code, Gemini CLI, Codex CLI, Cursor, VS Code Copilot, or any Gentle-AI configured local agent.

## What this is

A private remote-control bridge for local coding agents.

It should allow a user to:

- open an agent in a concrete project directory;
- create a new session by default;
- list and recover previous sessions;
- send plain Telegram messages directly to the active agent session;
- receive agent responses adapted to Telegram without summarizing or rewriting them;
- approve, remember, or deny permission requests from Telegram;
- keep the real model, tools, MCPs, memory, and repository access inside the local workstation.

## What this is not

It is not:

- a second AI layer;
- a replacement for OpenCode;
- a replacement for Gentle-AI;
- a cloud execution service;
- a public HTTP API exposed to the internet;
- a generic shell-over-Telegram tool.

## Target environment for the initial MVP

The architecture is workstation-agnostic: configure a workspace root, keep the local agent runtime loopback-only, and allow Telegram access only for trusted user IDs.

The first tested environment is:

```text
OS/runtime: WSL Ubuntu
Workspace root: configurable, for example /home/user/projects
Agent: OpenCode
Gentle-AI agent: gentle-orchestrator
Memory: Engram MCP configured by Gentle-AI
Transport: Telegram bot, allowlisted to a single Telegram user id
```

WSL-specific example:

```text
Windows-visible path: \\wsl.localhost\Ubuntu\home\user\projects
WSL path: /home/user/projects
```

## Core user experience

```text
/open JobMatchRAG
```

Creates a new OpenCode session in the configured workspace root, for example:

```bash
/home/user/projects/JobMatchRAG
```

using `gentle-orchestrator`.

Then any normal Telegram message is forwarded to OpenCode:

```text
abre un slice para revisar el ranking de ofertas y usa SDD
```

The gateway sends that text to the active OpenCode session. The answer from OpenCode is returned to Telegram, adapted for Telegram limits and formatting, but not summarized.

## MVP commands

```text
/start                 Show minimal help and active status
/projects              List detected projects under the configured base directory
/open <project>         Open a project and create a new session
/sessions              List sessions for the active project
/session <id>           Attach Telegram to an existing agent session
/continue              Attach to the latest session for the active project
/status                Show active project/session/runtime
/abort                 Abort the current agent response
/diff                  Show or send the current diff when supported by the adapter
/close                 Detach Telegram from the active session
/stop_runtime          Stop the managed local agent runtime for the active project
```

Everything that does not start with `/` is forwarded as-is to the active agent session.

## Permission buttons

When OpenCode asks for permission, Telegram should show inline buttons:

```text
🔐 Permission request

Project: JobMatchRAG
Tool: bash
Command: pytest tests/

[✅ Approve once] [♻️ Approve always] [❌ Deny]
```

The gateway does not invent its own permission rules. It mirrors what the agent asks for and sends the user's answer back to the agent runtime.

## Why agent-agnostic?

This started from a concrete OpenCode + Gentle-AI + Engram workflow, but the architecture should not be locked to OpenCode.

The intended public framing is:

> Telegram transport for local coding agents. OpenCode adapter first.

This makes it possible to offer it later as a Gentle-AI community integration without asking Gentle-AI core to bundle a single-agent bridge.

## Quick start for local development

```bash
git clone git@github.com:Prodelaya/agents-telegram-gateway.git
cd agents-telegram-gateway
corepack pnpm install
cp .env.example .env
cp config/agents-telegram-gateway.example.yaml config/agents-telegram-gateway.local.yaml
$EDITOR config/agents-telegram-gateway.local.yaml # set absolute workspace/data paths
corepack pnpm dev -- --config config/agents-telegram-gateway.local.yaml
```

Required environment variables:

```bash
TELEGRAM_BOT_TOKEN=...
ALLOWED_TELEGRAM_USER_IDS=123456789
OPENCODE_SERVER_PASSWORD=change-me
```

## Documentation

- [Architecture](docs/architecture.md)
- [Requirements](docs/requirements.md)
- [User flows](docs/user-flows.md)
- [OpenCode adapter](docs/opencode-adapter.md)
- [Gentle-AI integration](docs/gentle-ai-integration.md)
- [Adapter API](docs/adapter-api.md)
- [Security](docs/security.md)
- [Roadmap](docs/roadmap.md)

## License

MIT. See [LICENSE](LICENSE).
