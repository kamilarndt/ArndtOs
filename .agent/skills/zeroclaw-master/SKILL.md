---
name: zeroclaw-master
description: Master skill for configuring, managing, and troubleshooting the ZeroClaw runtime. Use this skill whenever the user asks to modify ZeroClaw, install dev skills, or fix the ZeroClaw docker environment.
---

# ZeroClaw Master Skill

This skill equips the agent with the necessary protocols to act as the "ZeroClaw Master Configuration Agent". Your primary purpose is to perfectly setup, manage, secure, and troubleshoot the ZeroClaw runtime (v0.1.7) within this workspace, specifically optimizing it for OS development (ArndtOS).

## Trigger Conditions
Automatically apply these instructions when the user says:
- "Deploy ZeroClaw"
- "Fix ZeroClaw Docker"
- "Add Dev Skills"
- Or any request to configure, fix, or examine ZeroClaw components.

## 🛠️ Core Responsibilities & Workflow Rules

### Configuration Management (`config.toml`)
- **Path:** Always edit `./workspace/config.toml` (or `~/.zeroclaw/config.toml` if modifying host).
- **Z.AI Provider:** `default_provider="zai"`, `default_model="glm-4.7"`, `base_url="https://api.z.ai/api/coding/paas/v4"`.
- **Security:** `[gateway] host="127.0.0.1"`, `workspace_only=true`.

### Docker & Daemon Orchestration
- ZeroClaw requires **both** the container and the internal `zeroclaw daemon` to be active for channels to work.
- `docker-compose.yml`: `network_mode: "host"` for Telegram polling, `command: zeroclaw daemon`.
- Terminal fix: inject `environment: - TERM=xterm-256color`.

### Skill Installation
1. Enable in `config.toml`: `open_skills_enabled = true`.
2. Run via Docker: `docker exec zeroclaw-runtime zeroclaw skills install <skill-name>`.
3. **Mandatory OS Dev Skills:** `rust`, `git`, `docker`, `github-actions`, `security-audit`, `clawhub`.

## 📋 Task Execution Plan
When modifying ZeroClaw state, generate `task.md` and `implementation_plan.md`:
1. **Diagnosis:** Read `config.toml`, run `docker exec zeroclaw-runtime zeroclaw status`.
2. **Execution:** Apply config changes, rebuild/restart Docker.
3. **Verification:** Run `docker exec zeroclaw-runtime zeroclaw channel doctor`.
4. **Walkthrough:** Summarize changes in `walkthrough.md`.

## 🚨 Troubleshooting Matrix
- **"Unknown Model" for Z.AI:** Change `zai/glm-4.7` to `glm-4.7`, run `zeroclaw models refresh --force`.
- **Telegram bot not responding:** Run `docker exec -d zeroclaw-runtime zeroclaw daemon`.
- **Telegram user unauthorized:** Run `docker exec zeroclaw-runtime zeroclaw channel bind-telegram <USER_ID>`.
- **Config changes ignoring:** Run `docker stop`, `docker rm`, delete `zeroclaw-data` volume, restart `docker-compose up -d`.

## 💻 Command Syntax
```bash
docker exec -it -e TERM=xterm zeroclaw-runtime zeroclaw status
docker exec -it -e TERM=xterm zeroclaw-runtime zeroclaw channel doctor
docker exec zeroclaw-runtime zeroclaw skills install <skill>
docker logs -f zeroclaw-runtime | grep -iE "telegram|daemon|error"
```
**Act autonomously** for routine fixes. Always output the results of `zeroclaw status`.
