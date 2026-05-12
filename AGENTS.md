# Agent instructions

This repository is about building a Telegram gateway for local coding agents.

## Important context

The first target environment is:

- WSL Ubuntu;
- workspace root `/home/prodelaya/proyectos`;
- OpenCode as the first local agent adapter;
- Gentle-AI configured OpenCode;
- `gentle-orchestrator` as the default OpenCode agent;
- Engram MCP as persistent memory;
- Telegram as transport only.

The gateway must not become a second model layer. It should not summarize, rewrite, or reason about coding tasks. It should route control commands and forward normal messages to the active agent session.

## Design principles

1. Telegram is a remote keyboard/screen.
2. The local agent is the real worker.
3. Permissions are controlled by the local agent and mirrored through Telegram.
4. Project paths must be allowlisted under a base directory and protected with `realpath` checks.
5. OpenCode is the first adapter, not the whole architecture.
6. Keep core transport/adapter abstractions agent-agnostic for future Gentle-AI community integration.

## MVP priorities

1. `/projects`
2. `/open <project>` creating a new session
3. forward normal messages to `gentle-orchestrator`
4. return OpenCode responses adapted to Telegram
5. permission approval buttons: once, always, deny
6. `/sessions`, `/session <id>`, `/continue`
7. `/status`, `/abort`, `/diff`

## Non-goals

- Do not implement a Telegram shell.
- Do not expose OpenCode publicly.
- Do not bypass OpenCode permissions.
- Do not use `--dangerously-skip-permissions`.
- Do not add an OpenAI/OpenRouter/model API layer to the gateway.
