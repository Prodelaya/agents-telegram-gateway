# Requirements

## User goal

Control the OpenCode instance running on a desktop workstation from a phone, using Telegram only as the communication medium.

The goal is to be able to ask OpenCode to work in a concrete project directory while preserving the local context:

- project files;
- OpenCode sessions;
- Gentle-AI configuration;
- `gentle-orchestrator`;
- Engram MCP persistent memory;
- local credentials and tools;
- OpenCode permission flow.

## Hard requirements

1. The gateway runs inside WSL.
2. Projects are located under `/home/prodelaya/proyectos`.
3. The gateway may open any project under that base directory, but never outside it.
4. `/open <project>` opens OpenCode in that project directory.
5. A new session is created by default.
6. Previous sessions are recoverable via `/sessions`, `/session <id>`, or `/continue`.
7. OpenCode should use `gentle-orchestrator` by default.
8. The gateway must forward normal Telegram messages to OpenCode as-is.
9. OpenCode responses should be sent back to Telegram without summarization or rewriting.
10. Responses may be technically adapted to Telegram limits.
11. Permission requests must be approvable from Telegram.
12. Telegram buttons must include:
    - approve once;
    - approve always;
    - deny.
13. The gateway must not bypass or replace OpenCode's permission system.
14. Engram must remain the memory layer via Gentle-AI/OpenCode MCP configuration.
15. The gateway must not run its own LLM for coding or routing in the initial version.

## Desired requirements

1. Attach to an already-running OpenCode TUI when started through a known wrapper.
2. Show only useful orchestrator messages initially.
3. Optionally expose subagent activity later.
4. Export long diffs/logs as Telegram files.
5. Support future adapters beyond OpenCode.

## Non-goals

- Building a Telegram shell.
- Exposing OpenCode to the public internet.
- Adding a second model between Telegram and OpenCode.
- Replacing Gentle-AI or Engram.
- Bundling this into Gentle-AI core.
