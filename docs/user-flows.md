# User flows

## Open a project

Telegram:

```text
/open JobMatchRAG
```

Gateway:

1. resolves `JobMatchRAG` under the configured workspace base directory;
2. starts or reuses an OpenCode runtime in that directory;
3. creates a new session;
4. sets `gentle-orchestrator` as the agent;
5. confirms the active session.

Telegram response:

```text
✅ Project opened

Project: JobMatchRAG
Path: /absolute/path/to/projects/JobMatchRAG
Agent: gentle-orchestrator
Session: new
```

## Send normal text to OpenCode

Telegram:

```text
abre un slice para revisar el ranking de ofertas y usa SDD
```

Gateway:

- forwards the message to the active OpenCode session;
- does not summarize;
- does not rewrite;
- does not call another model.

## Start a slice

Telegram:

```text
/slice JobMatchRAG revisar ranking de ofertas con SDD
```

Recommended behavior:

1. equivalent to `/open JobMatchRAG`;
2. sends a short slice prompt to the new session:

```text
Quiero abrir un nuevo slice de trabajo en este proyecto usando gentle-orchestrator.

Objetivo:
revisar ranking de ofertas con SDD

Usa el flujo SDD de Gentle-AI cuando lo consideres adecuado. Primero explora y plantea el enfoque antes de cambios importantes.
```

The gateway does not implement SDD. `gentle-orchestrator` does.

## List sessions

Telegram:

```text
/sessions
```

Gateway:

- lists available OpenCode sessions for the active project/runtime;
- renders buttons for selection;
- stores the selected session as active.

## Continue latest session

Telegram:

```text
/continue
```

Gateway:

- selects the latest session for the active project;
- attaches Telegram to it.

If no project is active, the command may require:

```text
/continue JobMatchRAG
```

## Permission approval

OpenCode asks for permission:

```text
bash: pytest tests/
```

Telegram shows:

```text
🔐 OpenCode permission request

Project: JobMatchRAG
Tool: bash
Command:
pytest tests/

[✅ Approve once] [♻️ Approve always] [❌ Deny]
```

The user's button press is sent back to OpenCode.

## Abort current work

Telegram:

```text
/abort
```

Gateway:

- sends abort to the active OpenCode session if supported by the adapter.

## Attach to an already-open TUI

Preferred workflow:

```bash
gentle-remote-tui JobMatchRAG
```

Then from Telegram:

```text
/attach JobMatchRAG
```

The wrapper should start OpenCode with a known localhost port so the gateway can attach cleanly.
