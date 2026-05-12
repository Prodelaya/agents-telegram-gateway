# Security policy

This project controls local coding agents from Telegram. Security issues are high impact.

## Sensitive areas

- Telegram authentication and user allowlists.
- Project path resolution.
- Process spawning.
- Permission approval flow.
- Secret handling.
- OpenCode server exposure.

## Rules

- OpenCode and other agent servers must bind to localhost only.
- The gateway must not expose a public unauthenticated control API.
- The gateway must never silently approve dangerous actions.
- The gateway must never use permission-bypass flags.
- Path traversal must be tested.

## Reporting

For now, report privately to the repository owner.
