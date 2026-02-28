# ZeroClaw OS Dashboard - Project Overview

**Version:** 0.1.0  
**Last Updated:** February 28, 2026

---

## 1. Project Overview

ZeroClaw OS Dashboard is a modular, plugin-based UI system built on Next.js/React that serves as a visual operating system for autonomous AI agents. The project follows a **"Split-Brain" architecture** that separates lightweight web interface components from heavy computational workloads.

### 1.1 Purpose and Functionality

The dashboard provides:
- **Centralized orchestration** of AI agents and tasks through a unified web interface
- **Real-time visualization** of agent activities, connections, and tasks
- **Plugin-first architecture** allowing dynamic addition of features through isolated modules
- **Secure communication** via JWT-protected WebSocket connections to ZeroClaw daemon
- **Remote access capability** to control agents from any device (desktop/mobile)
- **Integration with TLDraw** for visual workflow planning and diagramming
- **Antigravity System integration** for LLM task orchestration with provider fallback

### 1.2 Key Characteristics

- **Modularity:** All features implemented as isolated plugins in `web-ui/src/plugins/`
- **Error Isolation:** Components wrapped in React Error Boundaries to prevent cascade failures
- **State Persistence:** Zustand with persist middleware prevents state loss on refresh
- **Security by Default:** Tailscale ACL with deny-by-default policy
- **Test-Driven Development:** TDD protocol with automated testing for all components
- **"Red Phone" Communication:** Telegram integration as a backup control channel

---

**Next:** [System Architecture](02-system-architecture.md)
