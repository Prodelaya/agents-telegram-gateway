# Architecture

## Summary

`agents-telegram-gateway` is a local bridge between Telegram and local coding agents.

```text
Telegram mobile
  ↓
Telegram transport
  ↓
Command router
  ↓
Project/session/runtime manager
  ↓
Agent adapter interface
  ↓
OpenCode adapter
  ↓
OpenCode server running in selected project directory
  ↓
gentle-orchestrator + Gentle-AI + Engram MCP
```

## Main principle

Telegram is a remote keyboard and screen. The gateway is not the agent.

Normal messages are forwarded to the active agent session. Responses from the agent are sent back to Telegram with only transport-level adaptation.

## Runtime model

The recommended initial runtime model is one managed OpenCode server per active project.

```text
ProjectRuntime
- projectId
- path
- adapter: opencode
- serverUrl
- port
- pid
- mode: managed | attached_tui
- activeSessionId
- agent: gentle-orchestrator
```

When the user runs:

```text
/open JobMatchRAG
```

the gateway:

1. resolves the project under `/home/prodelaya/proyectos`;
2. starts `opencode serve` with `cwd` set to the project directory;
3. injects or enforces `default_agent=gentle-orchestrator`;
4. creates a new OpenCode session;
5. stores the active project/session in local state;
6. starts forwarding Telegram messages to that session.

## Project resolution

All user-provided project names or paths are treated as relative to the configured base directory.

```text
baseDir = /home/prodelaya/proyectos
```

The gateway must use `realpath` and reject any path that does not remain inside the base directory.

Examples:

```text
/open JobMatchRAG                 allowed
/open clientes/odoo/module-x      allowed
/open ../../.ssh                  rejected
/open /home/prodelaya/.config     rejected
/open /mnt/c/Users/...            rejected
```

## Agent selection

OpenCode should always use `gentle-orchestrator` for this workflow.

Preferred layers:

1. project/global OpenCode config: `default_agent = gentle-orchestrator`;
2. managed runtime env overlay: `OPENCODE_CONFIG_CONTENT`;
3. every message sent through the API includes `agent: gentle-orchestrator`.

This avoids having to press TAB in the OpenCode TUI to switch from Plan/Build to `gentle-orchestrator`.

## Message flow

```text
Telegram text message
  ↓
if starts with /: command router
else: send to active agent session
  ↓
OpenCode adapter
  ↓
OpenCode session message API
  ↓
OpenCode response/events
  ↓
message formatter
  ↓
Telegram
```

## Permission flow

```text
OpenCode permission request
  ↓
OpenCode event stream
  ↓
PermissionBroker
  ↓
Telegram inline buttons
  ↓
User presses approve once / always / deny
  ↓
OpenCode adapter sends permission answer
  ↓
OpenCode continues
```

The gateway mirrors permission requests. It does not override OpenCode's permission policy.

## Attached TUI mode

For an already-running TUI, the recommended approach is to start OpenCode through a wrapper that exposes a known localhost port.

Example wrapper behavior:

```bash
cd /home/prodelaya/proyectos/JobMatchRAG
OPENCODE_CONFIG_CONTENT='{"default_agent":"gentle-orchestrator"}' \
  opencode . --agent gentle-orchestrator --hostname 127.0.0.1 --port 4201
```

Then the gateway can attach to `http://127.0.0.1:4201`.

Manual OpenCode instances started without a known port may be harder to discover safely.
