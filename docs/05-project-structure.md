
---
**Previous:** [04-installation-and-configuration.md](../04-installation-and-configuration.md) | **Next:** [06-technologies-and-tools.md](../06-technologies-and-tools.md)

## 5. Project Structure

### 5.1 Root Directory Structure

```
ArndtOs/
├── .agent/                    # Agent-specific configuration
├── .antigravity-config.json   # Antigravity System configuration
├── .config/                   # Global configuration files
├── .dockerignore             # Docker ignore patterns
├── .env                      # Environment variables (gitignored)
├── .git/                     # Git repository
├── .gitignore                # Git ignore patterns
├── .ruff_cache/              # Python linting cache
├── .signals/                 # Antigravity signal pipeline
├── .sisyphus/                # Sisyphus orchestration state
├── .workspaces/              # Workspace configurations
├── AGENTS.md                 # Development guide (this project)
├── ArndtOs.code-workspace    # VS Code workspace
├── bootstrap-antigravity.ps1 # Antigravity bootstrap script
├── daemon/                   # ZeroClaw Daemon (Rust)
├── docker/                   # Docker configurations
├── docs/                     # Documentation
├── GEMINI.md                 # Gemini integration docs
├── MCP_COMPLIANCE_REPORT.md # MCP compliance report
├── memory/                   # Memory module directory
├── router/                   # AntiGravity Router (Python)
├── scripts/                  # Utility scripts
├── SKILLS.md                 # Agent skills documentation
├── web-ui/                   # Next.js Web UI
└── zeroclaw-dashboard.png    # Dashboard screenshot
```

### 5.2 Web UI Structure

```
web-ui/
├── Dockerfile                # Docker image for web-ui
├── next-env.d.ts            # Next.js TypeScript definitions
├── next.config.js           # Next.js configuration
├── node_modules/            # Node.js dependencies
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lockfile
├── postcss.config.js        # PostCSS configuration
├── src/                     # Source code
│   ├── __tests__/          # Test files
│   ├── app/                # Next.js App Router pages
│   │   ├── agents/        # Agents management page
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.test.tsx  # Home page tests
│   │   ├── page.tsx       # Dashboard home page
│   │   ├── plugins/       # Plugins page
│   │   ├── settings/      # Settings page
│   │   └── tldraw-canvas/ # TLDraw canvas page
│   ├── components/         # Reusable components
│   │   ├── __tests__/    # Component tests
│   │   ├── ErrorBoundary.tsx      # Error boundary wrapper
│   │   ├── FloatingChat.tsx       # Floating chat interface
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── TLDrawAgentBridge.tsx  # TLDraw integration
│   │   └── WebSocketProvider.tsx  # WebSocket context provider
│   ├── plugins/           # Plugin system
│   │   ├── index.ts      # Plugin exports
│   │   ├── isolation.test.ts  # Plugin isolation tests
│   │   ├── PluginSandbox.tsx     # Plugin sandbox component
│   │   ├── registry.ts           # Plugin registry
│   │   └── tldraw-canvas/       # TLDraw canvas plugin
│   │       ├── canvasBridge.ts  # Canvas bridge logic
│   │       ├── index.tsx        # Plugin component
│   │       ├── manifest.json    # Plugin manifest
│   │       └── templates.ts     # Canvas templates
│   ├── services/          # External services
│   │   ├── agentActions.ts    # Agent action handlers
│   │   └── websocket.ts       # WebSocket service
│   ├── store/             # Zustand state stores
│   │   ├── agentStore.ts      # Agent state management
│   │   ├── chatStore.ts        # Chat state management
│   │   └── uiStore.ts          # UI state management
│   ├── test/              # Test utilities
│   └── types/             # TypeScript type definitions
│       ├── index.ts       # Type exports
│       ├── plugin.test.ts # Plugin type tests
│       ├── plugin.ts      # Plugin types
│       └── websocket.ts   # WebSocket types
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.tsbuildinfo   # TypeScript build cache
└── vitest.config.ts       # Vitest test configuration
```

### 5.3 Daemon Structure (Rust)

```
daemon/
├── Cargo.lock             # Cargo lockfile
├── Cargo.toml             # Rust package configuration
├── src/                  # Source code
│   ├── auth.rs           # WebSocket authentication
│   ├── chat.rs           # Chat message handling
│   ├── jwt_auth.rs       # JWT token generation/validation
│   ├── lib.rs            # Library exports
│   ├── main.rs           # Main entry point
│   ├── messages.rs       # Message types and serialization
│   ├── metrics.rs        # Prometheus metrics
│   ├── rate_limiter.rs   # Rate limiting implementation
│   ├── server.rs         # HTTP and WebSocket server
│   └── telegram.rs       # Telegram bot integration
└── target/               # Build artifacts
```

### 5.4 Router Structure (Python)

```
router/
├── pyproject.toml         # Python project configuration
├── src/                  # Source code
│   ├── __init__.py      # Package initialization
│   ├── agents/           # Agent-related modules
│   ├── router.py         # Main router implementation
│   ├── telegram/         # Telegram integration
│   ├── types.py          # Type definitions
│   └── zeroclaw_router.egg-info/  # Package metadata
├── tests/                # Test files
└── .pytest_cache/        # pytest cache
```

### 5.5 Docker Structure

```
docker/
├── .env.example           # Environment variables template
├── Dockerfile             # Base Dockerfile for daemon
├── docker-compose.yml     # Docker Compose configuration
├── grafana/              # Grafana provisioning
│   └── provisioning/
│       └── datasources/  # Prometheus datasource config
├── loki-config.yml       # Loki logging config (disabled)
├── prometheus.yml        # Prometheus scrape config
└── promtail-config.yml   # Promtail config (disabled)
```

### 5.6 Documentation Structure

```
docs/
├── Architektura Systemu.md    # System Architecture (Polish)
├── Brainstorm_Session.md      # Brainstorming notes
├── Plan Implementacji.md      # Implementation plan
├── Product Requirements Document.md  # PRD
├── plans/                    # Detailed plans
└── reports/                  # Project reports
```

---

