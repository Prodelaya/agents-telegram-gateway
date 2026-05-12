# Security

This gateway can become a remote control for a workstation. Treat it as sensitive infrastructure.

## Required controls

1. Run inside WSL as the normal user, not root.
2. Allowlist Telegram user ids.
3. Keep OpenCode listening only on `127.0.0.1`.
4. Never expose OpenCode server ports to the public internet.
5. Use a fixed workspace base directory.
6. Use `realpath` checks to prevent path traversal.
7. Store tokens in `.env` or a secret manager, never in Git.
8. Do not log secrets.
9. Do not bypass OpenCode permissions.
10. Do not use dangerous permission-skipping flags.

## Telegram allowlist

Only messages from configured Telegram user ids should be accepted.

Environment:

```bash
ALLOWED_TELEGRAM_USER_IDS=123456789,987654321
```

Messages from all other users should be ignored or rejected.

## Path safety

All project paths must resolve under:

```bash
/home/prodelaya/proyectos
```

Never trust Telegram input as a path.

## Permissions

OpenCode remains the authority for permissions.

Telegram only mirrors prompts and returns the answer:

- approve once;
- approve always;
- deny.

The gateway must not silently approve tools.

## Network

Recommended:

```text
Telegram Bot API ← outbound connection from WSL
OpenCode API ← localhost only
```

No inbound port forwarding is required for the gateway in polling mode.

## Logs

Logs should include:

- project id;
- session id;
- command names;
- permission request ids;
- runtime state transitions.

Logs should not include:

- `.env` contents;
- API keys;
- full secret-containing prompts;
- private file contents unless explicitly needed for debugging.
