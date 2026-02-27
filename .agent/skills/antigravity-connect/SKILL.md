---
name: antigravity-connect
description: 🚨 SYSTEM ENFORCEMENT SKILL. Use this at the start of ANY task to check if AntiGravity can orchestrate the work. AntiGravity is the primary orchestrator; you are the manager. If AntiGravity is available (ZeroClaw Daemon & Router are OK), you MUST delegate complex execution to it.
---

# AntiGravity Connect Skill

**ŚCISŁA DYREKTYWA ARCHITEKTONICZNA (ZERO-OVERHEAD):**
Jesteś jedynie Interfejsem Użytkownika dla systemu ZeroClaw.
Nie jesteś programistą. Nie masz prawa modyfikować systemu hosta.

MASZ CAŁKOWITY ZAKAZ:
- Wykonywania w terminalu komend takich jak: npm, npx, pip, cargo, mkdir, echo.
- Pisania i modyfikowania jakiegokolwiek kodu źródłowego w tym projekcie!

TWOIM JEDYNYM DOZWOLONYM ZADANIEM JEST:
Przekazanie zapytania użytkownika bezpośrednio do routera za pomocą komendy:
`python d:/_WorkSpaces/AntiGravity-System/router/main.py "TWOJE ZAPYTANIE"`
Jeśli użytkownik wrzuca plan (np. z pliku MD), przekaż ścieżkę do tego pliku do routera.


This skill allows any agent to "tap into" the running AntiGravity system.

## 1. Locate the System
The system is anchored in: `d:/_WorkSpaces/AntiGravity-System/`
Signals directory (IPC): `d:/_WorkSpaces/AntiGravity-System/.signals/`

## 2. Check Connection
Always run Doctor CLI to verify availability:
```powershell
Set-Location d:/_WorkSpaces/AntiGravity-System/router
python -m src.cli.doctor
```

## 3. Communication Protocol
To request a task execution (Orchestration):
1. Generate a unique ID (UUID or timestamp).
2. Create a `.sig` file in `d:/_WorkSpaces/AntiGravity-System/.signals/`:
```json
{
    "id": "TASK_ID",
    "signal_type": "start_task",
    "payload": {
        "task": "USER_TASK_DESCRIPTION",
        "image": "ag-opencode-worker:latest",
        "workspace": "TARGET_WORKSPACE_PATH"
    }
}
```
3. Monitor for `TASK_ID.done` or `TASK_ID.failed`.

## 4. MCP Servers
Register these globally in your agent config to keep memory across chats:
- **LTM:** `d:/_WorkSpaces/AntiGravity-System/memory`
- **Docker:** `managed by daemon`

## 5. Environment
Load keys from: `d:/_WorkSpaces/AntiGravity-System/router/.env`
