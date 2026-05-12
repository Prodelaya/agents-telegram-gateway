# Contributing

This project is intended as an independent community integration for local coding agents, with OpenCode as the first adapter.

Keep contributions small, safe, and reviewable. This gateway controls local coding agents from Telegram, so security-sensitive changes deserve extra care.

## Principles

- Keep the core agent-agnostic.
- Keep Telegram transport independent from OpenCode-specific logic.
- Do not add model calls to the gateway.
- Do not bypass local agent permissions.
- Protect local paths and secrets.
- Add adapters as separate packages.

## Workflow

For now, this repository uses a lightweight version of the Gentle-AI contribution workflow:

1. Open or reference an issue for non-trivial features, security-sensitive changes, or architectural changes.
2. Keep each change focused on one deliverable work unit.
3. Include tests or a clear verification note for behavior changes.
4. Update docs when setup, commands, security expectations, or user-visible behavior changes.
5. Self-review the diff before opening a PR or asking for review.

Small docs fixes and mechanical maintenance can be handled directly.

## Branch naming

Use lowercase branch names in this shape:

```text
<type>/<short-description>
```

Examples:

```text
feat/session-recovery
fix/path-allowlist
docs/gentle-ai-positioning
ci/typecheck-workspace
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `build`, `chore`, `perf`, `style`, `revert`.

## Commit convention

Use Conventional Commits:

```text
<type>(<optional-scope>): <description>
```

Examples:

```text
feat(telegram): add permission approval buttons
fix(core): prevent project path traversal
docs: clarify Gentle-AI integration boundary
ci: build workspace dependencies before typecheck
```

Use `!` and a `BREAKING CHANGE:` footer for breaking changes.

## Review size

Prefer small PRs that can be reviewed in one focused pass.

- Keep one PR to one behavior or workflow when possible.
- Keep code, tests, and docs for that behavior together.
- If a change becomes large or cross-cutting, split it into chained work units or use SDD before implementation.
- Call out intentionally large diffs in the PR description.

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

Also include a security note for changes touching logging, Telegram user allowlists, OpenCode server binding, config loading, or secret handling.

## Verification

Use the repository package manager through Corepack:

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
```

Before asking for review, report which commands were run and any known unverified areas.
