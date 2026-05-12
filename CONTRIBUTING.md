# Contributing

This project is intended as an independent community integration for local coding agents, with OpenCode as the first adapter.

## Principles

- Keep the core agent-agnostic.
- Keep Telegram transport independent from OpenCode-specific logic.
- Do not add model calls to the gateway.
- Do not bypass local agent permissions.
- Protect local paths and secrets.
- Add adapters as separate packages.

## Adapter contributions

New adapters should implement the `AgentAdapter` interface and declare their capabilities.

Example package names:

```text
packages/adapter-claude-code
packages/adapter-gemini-cli
packages/adapter-codex
```

## Security-sensitive changes

Changes touching permissions, path resolution, command execution, process spawning, or token handling should include tests and a security note in the PR description.
