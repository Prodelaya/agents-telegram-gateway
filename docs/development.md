# Development

## Setup

```bash
pnpm install
cp .env.example .env
cp config/agents-telegram-gateway.example.yaml config/agents-telegram-gateway.local.yaml
pnpm dev -- --config config/agents-telegram-gateway.local.yaml
```

## Verify OpenCode manually

Inside WSL:

```bash
cd /home/prodelaya/proyectos/SomeProject
opencode
```

Confirm that `gentle-orchestrator` is available.

Then test a managed server:

```bash
cd /home/prodelaya/proyectos/SomeProject
OPENCODE_CONFIG_CONTENT='{"default_agent":"gentle-orchestrator"}' \
OPENCODE_SERVER_PASSWORD='local-dev' \
opencode serve --hostname 127.0.0.1 --port 4101
```

Open the local API docs exposed by your installed OpenCode version and align `adapter-opencode` endpoint paths with it.

## Testing

```bash
pnpm test
pnpm typecheck
```

## Implementation order

1. Project resolver.
2. Telegram allowlist.
3. Runtime registry.
4. OpenCode managed runtime start/stop.
5. OpenCode create session and send message.
6. Telegram message formatting.
7. Permission bridge.
8. Session list/continue.
9. Attached TUI wrapper.
