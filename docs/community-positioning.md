# Community positioning

This project should be presented as an independent integration, not as something that belongs inside the Gentle-AI core installer.

## Reason

A Telegram bridge scoped only to OpenCode would be too narrow for Gentle-AI core, because Gentle-AI supports many agents and editors.

## Proposed framing

```text
agents-telegram-gateway

An unofficial community integration for controlling local coding agents from Telegram.
OpenCode adapter first. Designed with Gentle-AI workflows in mind.
```

## Key points

- Independent plugin/project.
- Adapter-based architecture.
- Telegram transport reusable across agents.
- OpenCode is the first supported adapter.
- Gentle-AI remains the configuration/memory/workflow layer.
- Engram remains MCP memory.

## Future README request to Gentle-AI

Once stable:

> Could you link `agents-telegram-gateway` in the Community Integrations section? It is an independent Telegram gateway for local coding agents, with OpenCode as the first adapter and an adapter API for future agents.
