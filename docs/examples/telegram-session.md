# Example Telegram session

```text
Pablo:
/projects

Gateway:
JobMatchRAG
auto-reddit
private-odoo-modules
gentle-ai-sandbox
```

```text
Pablo:
/open JobMatchRAG

Gateway:
✅ Project opened

Project: JobMatchRAG
Path: /absolute/path/to/projects/JobMatchRAG
Agent: gentle-orchestrator
Session: ses_123
```

```text
Pablo:
abre un slice para revisar el ranking de ofertas y usa SDD

Gateway:
↗️ sent to OpenCode
```

```text
OpenCode:
Voy a inspeccionar el proyecto y revisar el estado actual antes de proponer cambios...
```

```text
Gateway:
🔐 OpenCode permission request

Tool: bash
Command:
git status --short

[✅ Approve once] [♻️ Approve always] [❌ Deny]
```
