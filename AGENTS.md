# Agent Instructions

Follow this file as the runtime contract for all work in `agents-telegram-gateway`.

This project is an **unofficial Gentle-AI community integration**: a private Telegram gateway for controlling local coding agents from a phone.

## Scope

These rules apply to code, docs, tests, scripts, configuration, CI, and release work in this repository.

Project rules override generic agent defaults when they conflict.

## Hard Rules

- MUST keep the gateway transport-only.
- MUST NOT add model calls, reasoning, summarization, planning, or prompt rewriting to the gateway.
- MUST NOT implement Engram memory inside the gateway MVP.
- MUST NOT implement SDD inside the gateway. Forward user intent to the active local agent; `gentle-orchestrator` owns SDD.
- MUST NOT expose OpenCode or any local agent server publicly.
- MUST NOT add Telegram shell behavior.
- MUST NOT use `--dangerously-skip-permissions` or equivalent permission bypasses.
- MUST NOT commit secrets, local credentials, bot tokens, server passwords, or machine-local config.
- STOP if repository state, cwd, permissions, or target project path are ambiguous.

## Mental Model

```text
Telegram mobile
  -> agents-telegram-gateway
  -> local agent adapter, OpenCode first
  -> OpenCode running inside the selected project
  -> gentle-orchestrator + Gentle-AI config + Engram MCP + local tools
```

Telegram is the remote keyboard/screen. The local coding agent is the worker.

## Target Workflow

Optimize first for:

- WSL Ubuntu;
- workspace root: `/home/prodelaya/proyectos`;
- OpenCode as the first local agent adapter;
- Gentle-AI configured OpenCode;
- `gentle-orchestrator` as the default OpenCode agent;
- Engram MCP as persistent memory;
- Telegram as transport only.

Do not hardcode the architecture so tightly that future adapters become impossible.

## Architecture Boundaries

| Area | Rule |
| --- | --- |
| `packages/core` | Keep reusable agent-agnostic contracts, project/session routing, permissions, and formatting here. |
| `packages/adapter-opencode` | Keep OpenCode-specific runtime behavior here. |
| `packages/transport-telegram` | Keep Telegram-specific transport behavior here. Do not leak OpenCode assumptions into transport. |
| `packages/cli` | Keep executable wiring and config loading here. |
| Future agents | Add separate adapter packages, e.g. `packages/adapter-claude-code`. |

## MVP Priority Order

Build the smallest safe remote-control loop first:

1. `/projects` — list allowlisted projects under the configured base directory.
2. `/open <project>` — create a new local agent session for a project.
3. Forward normal Telegram messages to `gentle-orchestrator`.
4. Return local agent responses adapted to Telegram limits without changing meaning.
5. Mirror permission requests with buttons: approve once, approve always, deny.
6. `/sessions`, `/session <id>`, `/continue` — recover existing work.
7. `/status`, `/abort`, `/diff` — expose safe runtime controls.

## Security Rules

- Bind local agent servers to localhost only.
- Allow only configured Telegram user IDs.
- Resolve project paths with `realpath` and require them to stay inside the configured base directory.
- Treat bot tokens, server passwords, prompts, diffs, tool payloads, and project paths as sensitive.
- Never log secrets or full prompts by default.
- Permission decisions must be explicit user actions and sent back to the local agent runtime.
- Changes touching auth, path resolution, process spawning, permissions, logging, or secret handling require tests or a clear verification note.

## Orchestration Rules

| Condition | Action |
| --- | --- |
| Reading 4+ files to understand behavior | Delegate exploration or use SDD. |
| Touching 2+ non-trivial files | Keep the change as one focused work unit and verify before handoff. |
| Substantial feature, unclear scope, or cross-cutting refactor | Use SDD. |
| Small mechanical change | Keep it lightweight; do not force ceremony. |
| Confusing CI, cwd, git, permission, or environment state | STOP, inspect state, then continue only when clear. |
| Commit/PR after code changes | Verify relevant checks first. |

## Repository Workflow

- Use Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `build`, `chore`, `perf`, `style`, `revert`.
- Use focused branches when branch work is needed: `<type>/<short-description>`, lowercase with hyphens, dots, or underscores.
- Prefer one reviewable work unit at a time.
- Keep code, tests, and docs for one behavior together in the same work unit.
- Keep PRs small enough to review without fatigue. If a change grows large, split it before implementation or use SDD/chained delivery.
- Before commit or PR, self-review the diff and verify no local-only files or secrets are included.

## Gentle-AI Compatibility

- Keep Gentle-AI as the configuration/workflow/memory layer.
- Keep Engram configured through Gentle-AI/OpenCode MCP.
- Keep SDD execution inside `gentle-orchestrator` and its sub-agents.
- Frame this repository as an independent community integration, not a Gentle-AI core feature.
- Use this public positioning in docs:

  > Unofficial community integration for controlling local Gentle-AI configured coding agents from Telegram. OpenCode adapter first. Adapter-based for future local agents.

## Verification Commands

Use the declared package manager:

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
```

CI requires `pnpm-lock.yaml` because GitHub Actions uses pnpm caching.

## Documentation Rules

- Lead with the answer.
- Explain the mental model before commands.
- Keep user-facing docs practical and low-ceremony.
- Separate quick path from details.
- Use tables/checklists when they reduce cognitive load.
- State security boundaries explicitly.
- Do not overclaim stability while the project is MVP/experimental.
- Move long rationale to `docs/`; keep this file operational.

## Project References

Use these documents instead of rediscovering project context:

| Document | Use it for |
| --- | --- |
| `README.md` | Public entry point, status, quick start, and project positioning. |
| `docs/community-readiness.md` | MVP slices, Gentle-AI inclusion checklist, and current readiness blockers. |
| `docs/architecture.md` | System boundaries and package responsibilities. |
| `docs/requirements.md` | Product requirements and MVP expectations. |
| `docs/user-flows.md` | Telegram command flows and expected user experience. |
| `docs/security.md` | Security model, local-only assumptions, path and permission boundaries. |
| `docs/gentle-ai-integration.md` | How this project fits Gentle-AI, Engram, OpenCode, and SDD. |
| `docs/community-positioning.md` | Public framing as an independent community integration. |
| `docs/opencode-adapter.md` | OpenCode-specific adapter behavior and assumptions. |
| `docs/adapter-api.md` | Adapter contracts for OpenCode and future local agents. |
| `docs/development.md` | Local development setup. |
| `docs/roadmap.md` | Broader roadmap beyond the immediate community-readiness slices. |
| `docs/examples/telegram-session.md` | Example Telegram interaction flow. |
| `SECURITY.md` | Security reporting policy and high-impact areas. |
| `CONTRIBUTING.md` | Contribution workflow, branch naming, commits, review size, and verification. |

## Output Contract

When handing work back, report:

- what changed;
- where it changed;
- how it was verified;
- what remains blocked, risky, or unverified.

For review or PR preparation, report findings first and include the exact verification commands run.
