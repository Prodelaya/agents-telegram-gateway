# OpenCode adapter

## Purpose

The OpenCode adapter is the first adapter for `agents-telegram-gateway`.

Its job is to make OpenCode controllable through the generic gateway interface while preserving OpenCode as the real agent.

## Managed runtime

The adapter should start OpenCode in server/headless mode:

```bash
opencode serve --hostname 127.0.0.1 --port <port>
```

The process must be spawned with `cwd` set to the selected project path:

```ts
spawn("opencode", ["serve", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: projectPath,
  env: {
    ...process.env,
    OPENCODE_SERVER_PASSWORD: password,
    OPENCODE_CONFIG_CONTENT: JSON.stringify({
      default_agent: "gentle-orchestrator"
    })
  }
})
```

This should behave like running:

```bash
cd /home/prodelaya/proyectos/SomeProject
opencode
```

except that the gateway talks to the server API.

## Agent forcing

For the target Gentle-AI workflow, the adapter should enforce:

```text
agent = gentle-orchestrator
```

At three levels:

1. OpenCode config, if possible;
2. `OPENCODE_CONFIG_CONTENT` overlay for managed runtimes;
3. message request body.

## API operations to implement

The adapter should implement the generic `AgentAdapter` interface with OpenCode operations:

```text
startRuntime(project)
stopRuntime(runtime)
listSessions(runtime)
createSession(runtime)
attachSession(runtime, sessionId)
sendMessage(session, text)
abort(session)
listMessages(session)
subscribe(runtime, eventHandler)
answerPermission(session, permissionId, answer)
getDiff(session)
```

The exact endpoint shapes should be validated against the local OpenCode OpenAPI document exposed by the user's installed version.

## Expected OpenCode API concepts

The adapter expects OpenCode server/headless mode to expose concepts equivalent to:

- health;
- agents;
- sessions;
- messages;
- events;
- permissions;
- diffs;
- abort.

If the installed OpenCode version differs, update the adapter, not the core gateway.

## Attached TUI support

For controlling a TUI that is already open, use a wrapper that starts OpenCode with a known port:

```bash
opencode . \
  --agent gentle-orchestrator \
  --hostname 127.0.0.1 \
  --port 4201
```

The gateway then records:

```json
{
  "mode": "attached_tui",
  "project": "JobMatchRAG",
  "serverUrl": "http://127.0.0.1:4201"
}
```

## Things the adapter must not do

- Do not expose OpenCode outside localhost.
- Do not bypass permissions.
- Do not use `--dangerously-skip-permissions`.
- Do not read arbitrary paths outside the configured project base.
- Do not implement its own model calls.
