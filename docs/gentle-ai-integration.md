# Gentle-AI integration

## Goal

Make the gateway useful for Gentle-AI users without making it part of Gentle-AI core.

The project should be an independent community integration:

```text
Telegram transport for local coding agents.
OpenCode adapter first.
Designed for Gentle-AI configured agents.
```

## Current target

The first supported workflow is:

```text
OpenCode + Gentle-AI + gentle-orchestrator + Engram MCP
```

The gateway does not know how SDD works internally. It simply opens the correct project, ensures the correct agent is used, forwards messages, and mirrors permission requests.

## Engram

Engram should remain configured through Gentle-AI/OpenCode MCP.

The gateway should not implement memory and should not query Engram directly in the MVP.

Correct behavior:

```text
Telegram → gateway → OpenCode → gentle-orchestrator → Engram MCP
```

Incorrect behavior:

```text
Telegram → gateway → Engram/model logic → OpenCode
```

## Community positioning

A single-agent Telegram bridge is not appropriate for Gentle-AI core. However, an independent adapter-based project can be useful as a community integration.

This repository should therefore be structured as:

```text
core gateway
  transport: Telegram
  adapters:
    opencode first
    claude-code future
    gemini-cli future
    codex future
    cursor future
    vscode-copilot future
```

## README wording for future community submission

Suggested wording:

> `agents-telegram-gateway` is an unofficial community integration that lets users control local Gentle-AI configured coding agents from Telegram. It does not run a model or replace the agent. It provides a Telegram transport, project/session routing, and a permission bridge. OpenCode is the first adapter.

## Design constraints for Gentle-AI compatibility

1. Do not modify Gentle-AI installer behavior.
2. Do not assume only OpenCode exists.
3. Keep adapter API public and documented.
4. Avoid agent-specific logic in Telegram transport.
5. Keep Gentle-AI-specific assumptions in config and adapter docs.
6. Keep Engram as MCP memory, not gateway memory.
