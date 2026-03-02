---
name: arndtos-zeroclaw-workspace
description: This workspace is primarily managed by the ZeroClaw runtime optimized for ArndtOS development. Refer to the zeroclaw-master skill in the .agent directory for deep configuration management protocols.
---

# ArndtOS ZeroClaw Workspace

This is the main workspace for **ArndtOS**. The AI orchestration is powered by **ZeroClaw** (containerized runtime). 

If you are an agent operating in this workspace and need to configure, fix, or extend the ZeroClaw runtime, you **MUST** load and follow the instructions defined in:
`.agent/skills/zeroclaw-master/SKILL.md`

**Quick Operations:**
- Check status: `docker exec -it -e TERM=xterm zeroclaw-runtime zeroclaw status`
- Check channels: `docker exec -it -e TERM=xterm zeroclaw-runtime zeroclaw channel doctor`
