# Roadmap

## v0.1 — Personal MVP

Goal: usable from a phone for the target WSL/OpenCode/Gentle-AI workflow.

- [ ] Telegram polling transport
- [ ] user id allowlist
- [ ] WSL project discovery under `/home/prodelaya/proyectos`
- [ ] safe project resolver with `realpath`
- [ ] managed OpenCode runtime per project
- [ ] force `gentle-orchestrator`
- [ ] `/projects`
- [ ] `/open <project>` creates a new session
- [ ] forward normal messages to OpenCode
- [ ] receive OpenCode responses and send to Telegram
- [ ] permission request buttons: once, always, deny
- [ ] `/sessions`
- [ ] `/session <id>`
- [ ] `/continue`
- [ ] `/status`
- [ ] `/abort`

## v0.2 — Better workstation workflow

- [ ] `gentle-remote-tui` wrapper for OpenCode TUI with known port
- [ ] `/attach <project>`
- [ ] send long diffs/logs as files
- [ ] `/diff`
- [ ] robust runtime restart
- [ ] SQLite persistence
- [ ] systemd user service example

## v0.3 — Community-ready project

- [ ] clean adapter interface
- [ ] documented adapter capabilities
- [ ] contribution guide
- [ ] tests for path traversal
- [ ] tests for permission callbacks
- [ ] public examples
- [ ] README ready for Gentle-AI community integration link

## v1.0 — Multi-agent gateway

- [ ] stable OpenCode adapter
- [ ] experimental Claude Code adapter
- [ ] experimental Gemini CLI adapter
- [ ] experimental Codex adapter
- [ ] transport-agnostic core
- [ ] optional additional transports
