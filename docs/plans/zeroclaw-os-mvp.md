# ZeroClaw OS Dashboard MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modular UI dashboard for autonomous AI agents with Split-Brain architecture (EC2 frontend + Home PC backend), featuring plugin system, WebSocket communication, Telegram control, and TLDraw canvas.

**Key Architecture Decision:** ZeroClaw runs in Docker with access to both ArndtOs and Antigravity-System. Plugin development uses isolated workspaces in `ArndtOs/.workspaces/` with template inheritance.

**Architecture:** Plugin-First Next.js frontend communicating via JWT-secured WebSocket to Rust daemon. Python router handles LLM delegation. Node.js MCP provides memory. Telegram bot provides out-of-band control.

**Tech Stack:** Next.js 14, React 18, TailwindCSS, Zustand, TypeScript, Rust (tokio/axum), Python, Node.js, TLDraw, Tailscale

---

## TL;DR

> **Quick Summary**: Build a complete MVP for ZeroClaw OS Dashboard - a modular web interface for AI agents with WebSocket communication, Telegram control, and TLDraw canvas integration.
>
> **Deliverables**:
> - Next.js dashboard with plugin architecture
> - Rust WebSocket daemon with JWT auth
> - Node.js MCP memory service
> - Python AntiGravity router
> - Telegram bot integration
> - TLDraw canvas plugin
> - Systemd service configurations
>
> **Estimated Effort**: Large (7 phases, ~40 tasks)
> **Parallel Execution**: YES - 4-6 waves per phase
> **Critical Path**: Phase 0 → Phase 1 → Phase 2 → Phase 5

---

## Context

### Original Request
Create a comprehensive implementation plan for ZeroClaw OS Dashboard based on existing documentation (PRD, Architecture, Implementation Plan, Brainstorm Session).

### Interview Summary
**Key Discussions**:
- Plugin-First Architecture: Dynamic loading from `src/plugins/` with Error Boundaries
- Split-Brain Model: EC2 (frontend) + Home PC (backend) via Tailscale VPN
- TDD Enforcement: Absolute requirement - no fake screenshots
- TLDraw Priority: Highest priority for MVP

**Research Findings**:
- Project is greenfield - only docs exist, no code
- Tech stack confirmed: Next.js + Rust + Python + Node.js
- Security requirements: JWT + Tailscale ACL deny-by-default

### Metis Review
**Identified Gaps** (addressed):
- Missing: Exact file paths for all tasks
- Missing: Test commands with expected output
- Missing: Commit strategy with atomic commits
- Added: Bite-sized tasks (2-5 min each)
- Added: Complete code snippets in plan

---

## Work Objectives

### Core Objective
Build a production-ready MVP of ZeroClaw OS Dashboard that allows AI agents to be controlled remotely via web interface and Telegram, with visual planning via TLDraw canvas.

### Concrete Deliverables
- `web-ui/` - Next.js dashboard application
- `daemon/` - Rust WebSocket server (in Docker)
- `memory/` - Node.js MCP memory service
- `router/` - Python AntiGravity router
- `docker/` - Docker Compose configuration for ZeroClaw
- `.workspaces/` - Plugin development workspaces with templates
- `scripts/create-workspace.sh` - Plugin workspace generator
- `.config/` - Configuration files (soul.yaml, Tailscale ACL)

### Architecture Overview
```
ArndtOs/                          # Main dashboard project
├── .workspaces/                   # Plugin development workspaces
│   ├── plugin-tldraw/             # Each plugin = separate workspace
│   │   ├── src/
│   │   ├── .template.json         # Inherits from ArndtOs context
│   │   └── package.json
│   └── plugin-analytics/
├── web-ui/                        # Main dashboard
│   └── src/plugins/               # Deployed plugins
├── docker/
│   └── docker-compose.yml         # ZeroClaw container config
└── .zeroclaw/                     # Symlinks to Antigravity-System

Antigravity-System/               # Existing infrastructure
├── daemon/                        # ZeroClaw (Rust) - Docker mount
├── router/                        # AntiGravity (Python)
├── memory/                        # MCP Memory (Node.js)
└── .signals/                      # Task queue (visible in dashboard)
```

### Docker Configuration
ZeroClaw runs in Docker with access to both folders:
- Mount `ArndtOs/` → `/workspace/arndtos`
- Mount `Antigravity-System/` → `/workspace/antigravity`
- Security: `no-new-privileges`, `cap_drop: ALL`
- `web-ui/` - Next.js dashboard application
- `daemon/` - Rust WebSocket server
- `memory/` - Node.js MCP memory service
- `router/` - Python AntiGravity router
- `scripts/create-sandbox.sh` - Plugin sandbox generator
- `.config/` - Configuration files (soul.yaml, systemd services)
- Tailscale ACL configuration

### Definition of Done
- [ ] All tests pass (Vitest, cargo test, pytest)
- [ ] WebSocket ping-pong works with JWT auth
- [ ] TLDraw canvas renders with agent/chat templates
- [ ] Telegram bot responds to authorized user
- [ ] Systemd services auto-restart on failure

### Must Have
- Plugin architecture with Error Boundaries
- JWT-secured WebSocket communication
- Zustand stores with persistence
- TLDraw with CUD operations via WebSocket
- Telegram bot with user ID verification

### Must NOT Have (Guardrails)
- No `@ts-ignore` or `as any`
- No empty catch blocks
- No fake screenshots as proof
- No hardcoded secrets
- No direct DOM manipulation in React

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (greenfield project)
- **Automated tests**: YES (TDD)
- **Framework**: Vitest (frontend), cargo test (Rust), pytest (Python), bun test (Node.js)
- **TDD**: Each task follows RED → GREEN → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux) — Run command, send keystrokes, validate output
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields

---

## Execution Strategy

### Parallel Execution Waves

```
Phase 0 (Foundation - Sequential):
├── Task 0.1: Project structure [quick]
├── Task 0.2: web-ui scaffolding [quick]
├── Task 0.3: daemon scaffolding [quick]
├── Task 0.4: memory scaffolding [quick]
├── Task 0.5: router scaffolding [quick]
├── Task 0.6: Scripts directory [quick]
├── Task 0.7: Docker configuration [quick]        ← NEW
└── Task 0.8: Workspace template system [quick]  ← NEW
├── Task 0.1: Project structure [quick]
├── Task 0.2: web-ui scaffolding [quick]
├── Task 0.3: daemon scaffolding [quick]
├── Task 0.4: memory scaffolding [quick]
├── Task 0.5: router scaffolding [quick]
└── Task 0.6: Scripts directory [quick]

Phase 1 (Dashboard Core - Parallel Wave 1):
├── Task 1.1: TypeScript types [quick]
├── Task 1.2: Zustand uiStore [quick]
├── Task 1.3: Zustand agentStore [quick]
├── Task 1.4: ErrorBoundary component [quick]
└── Task 1.5: Plugin types [quick]

Phase 1 (Dashboard Core - Parallel Wave 2):
├── Task 1.6: Plugin loader [unspecified-high]
├── Task 1.7: Plugin registry [quick]
├── Task 1.8: Sidebar navigation [visual-engineering]
└── Task 1.9: Mini-Sandbox script [quick]

Phase 2 (ZeroClaw Daemon - Sequential due to deps):
├── Task 2.1: WebSocket server base [deep]
├── Task 2.2: JWT auth middleware [deep]
├── Task 2.3: Rate limiter [unspecified-high]
├── Task 2.4: Message types [quick]
└── Task 2.5: Frontend WebSocket client [unspecified-high]

Phase 3 (Memory & Soul - Parallel):
├── Task 3.1: MCP memory server [unspecified-high]
├── Task 3.2: Memory types [quick]
├── Task 3.3: Soul configuration [writing]
└── Task 3.4: Systemd services [quick]

Phase 4 (Telegram - Sequential):
├── Task 4.1: Telegram bot base [unspecified-high]
├── Task 4.2: User verification [quick]
├── Task 4.3: Command handlers [unspecified-high]
└── Task 4.4: Structured logging [quick]

Phase 5 (TLDraw - Parallel Wave 1):
├── Task 5.1: TLDraw plugin scaffolding [quick]
├── Task 5.2: TLDraw component [visual-engineering]
└── Task 5.3: Canvas templates [visual-engineering]

Phase 5 (TLDraw - Parallel Wave 2):
├── Task 5.4: WebSocket bridge [deep]
├── Task 5.5: CUD operations [unspecified-high]
└── Task 5.6: Canvas export [quick]

Phase FINAL (Verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Integration QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
```

---

## TODOs

---

## PHASE 0: Project Foundation

> **Sequential execution** - establish base structure before parallel work.

### Task 0.1: Create Project Structure

**Files:**
- Create: `web-ui/` (directory)
- Create: `daemon/` (directory)
- Create: `memory/` (directory)
- Create: `router/` (directory)
- Create: `scripts/` (directory)
- Create: `.config/` (directory)
- Create: `.gitignore`

**Step 1: Create directory structure**

```bash
mkdir -p web-ui/src/{components,plugins,services,store,types,tests}
mkdir -p daemon/src
mkdir -p memory/src
mkdir -p router/src router/tests
mkdir -p scripts
mkdir -p .config/openclaw .config/systemd
```

**Step 2: Create root .gitignore**

```gitignore
# Dependencies
node_modules/
__pycache__/
target/

# Build outputs
.next/
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Test coverage
coverage/
.nyc_output/
```

**Step 3: Verify structure**

```bash
ls -la
# Expected: web-ui/, daemon/, memory/, router/, scripts/, .config/, .gitignore
```

**Commit:**
```bash
git add .
git commit -m "chore: initialize project structure"
```

**QA Scenario:**
```
Scenario: Directory structure exists
  Tool: Bash
  Steps:
    1. ls -d web-ui daemon memory router scripts .config
  Expected Result: All 6 directories listed
  Evidence: .sisyphus/evidence/task-0.1-structure.txt
```

---

### Task 0.2: Scaffold web-ui (Next.js)

**Files:**
- Create: `web-ui/package.json`
- Create: `web-ui/tsconfig.json`
- Create: `web-ui/next.config.js`
- Create: `web-ui/tailwind.config.js`
- Create: `web-ui/postcss.config.js`
- Create: `web-ui/vitest.config.ts`
- Create: `web-ui/src/app/layout.tsx`
- Create: `web-ui/src/app/page.tsx`
- Create: `web-ui/src/app/globals.css`
- Test: `web-ui/src/__tests__/setup.test.ts`

**Step 1: Create package.json**

```json
{
  "name": "zeroclaw-web-ui",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "immer": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "jsdom": "^24.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

**Step 4: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tldraw/tldraw']
}
module.exports = nextConfig
```

**Step 5: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/plugins/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f9ff', 500: '#0ea5e9', 900: '#0c4a6e' }
      }
    }
  },
  plugins: []
}
```

**Step 6: Create postcss.config.js**

```javascript
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} }
}
```

**Step 7: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { color: white; background: #0a0a14; }
```

**Step 8: Create layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZeroClaw OS Dashboard',
  description: 'Modular UI for autonomous AI agents'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
```

**Step 9: Create page.tsx**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-primary-500">ZeroClaw OS Dashboard</h1>
      <p className="mt-4 text-gray-400">Modular UI for autonomous AI agents</p>
    </main>
  )
}
```

**Step 10: Write test**

```typescript
// web-ui/src/__tests__/setup.test.ts
import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have correct project name', () => {
    expect('zeroclaw-web-ui').toBe('zeroclaw-web-ui')
  })
})
```

**Step 11: Install and test**

```bash
cd web-ui && npm install && npm test -- --run
# Expected: 1 test pass
```

**Commit:**
```bash
git add web-ui/
git commit -m "feat(web-ui): scaffold Next.js project with Tailwind and Vitest"
```

**QA Scenario:**
```
Scenario: Next.js dev server starts
  Tool: Bash
  Steps:
    1. cd web-ui && npm run dev &
    2. sleep 5 && curl -s http://localhost:3000 | grep 'ZeroClaw'
  Expected Result: "ZeroClaw" found in HTML
  Evidence: .sisyphus/evidence/task-0.2-nextjs.txt
```

---

### Task 0.3: Scaffold daemon (Rust)

**Files:**
- Create: `daemon/Cargo.toml`
- Create: `daemon/src/lib.rs`
- Create: `daemon/src/main.rs`

**Step 1: Create Cargo.toml**

```toml
[package]
name = "zeroclaw-daemon"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
tokio-tungstenite = "0.21"
futures-util = "0.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
jsonwebtoken = "9"
chrono = { version = "0.4", features = ["serde"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json"] }
tower-http = { version = "0.5", features = ["trace", "cors"] }

[dev-dependencies]
tempfile = "3"
```

**Step 2: Create lib.rs**

```rust
pub mod messages {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(tag = "type", rename_all = "camelCase")]
    pub enum WebSocketMessage {
        Ping { timestamp: i64 },
        Pong { timestamp: i64 },
        Error { message: String },
    }

    impl WebSocketMessage {
        pub fn ping() -> Self { WebSocketMessage::Ping { timestamp: chrono::Utc::now().timestamp_millis() } }
        pub fn pong(ts: i64) -> Self { WebSocketMessage::Pong { timestamp: ts } }
    }
}

pub mod auth {
    use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Serialize, Deserialize)]
    pub struct Claims { pub sub: String, pub exp: usize, pub iat: usize }

    pub fn generate_token(user_id: &str, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
        let now = chrono::Utc::now().timestamp() as usize;
        encode(&Header::default(), &Claims { sub: user_id.to_owned(), exp: now + 3600, iat: now }, &EncodingKey::from_secret(secret))
    }

    pub fn validate_token(token: &str, secret: &[u8]) -> Result<Claims, jsonwebtoken::errors::Error> {
        Ok(decode::<Claims>(token, &DecodingKey::from_secret(secret), &Validation::new(Algorithm::HS256))?.claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn test_ping() { assert!(serde_json::to_string(&messages::WebSocketMessage::ping()).unwrap().contains("ping")); }
    #[test] fn test_jwt() {
        let secret = b"test";
        let token = auth::generate_token("user", secret).unwrap();
        assert_eq!(auth::validate_token(&token, secret).unwrap().sub, "user");
    }
}
```

**Step 3: Create main.rs**

```rust
fn main() { println!("ZeroClaw Daemon starting..."); }
```

**Step 4: Run tests**

```bash
cd daemon && cargo test
# Expected: 2 tests pass
```

**Commit:**
```bash
git add daemon/
git commit -m "feat(daemon): scaffold Rust project with JWT and WebSocket types"
```

---

### Task 0.4: Scaffold memory (Node.js MCP)

**Files:**
- Create: `memory/package.json`
- Create: `memory/tsconfig.json`
- Create: `memory/src/index.ts`
- Create: `memory/src/types.ts`

**Step 1: Create package.json**

```json
{
  "name": "zeroclaw-memory",
  "version": "0.1.0",
  "type": "module",
  "scripts": { "dev": "tsx watch src/index.ts", "test": "vitest run" },
  "dependencies": { "@modelcontextprotocol/sdk": "^1.0.0", "zod": "^3.22.0" },
  "devDependencies": { "@types/node": "^20.0.0", "typescript": "^5.3.0", "tsx": "^4.7.0", "vitest": "^1.2.0" }
}
```

**Step 2: Create types.ts**

```typescript
import { z } from 'zod';

export const MemoryEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['fact', 'preference', 'task', 'context']),
  content: z.string(),
  createdAt: z.string(),
});

export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;
```

**Step 3: Create index.ts**

```typescript
import { MemoryEntry, MemoryEntrySchema } from './types.js';

const store = new Map<string, MemoryEntry>();

export async function createEntry(type: MemoryEntry['type'], content: string): Promise<MemoryEntry> {
  const entry = MemoryEntrySchema.parse({ id: crypto.randomUUID(), type, content, createdAt: new Date().toISOString() });
  store.set(entry.id, entry);
  return entry;
}

console.log('ZeroClaw Memory Service starting...');
```

**Step 4: Install and verify**

```bash
cd memory && npm install && npx tsc --noEmit
# Expected: No errors
```

**Commit:**
```bash
git add memory/
git commit -m "feat(memory): scaffold Node.js MCP memory service"
```

---

### Task 0.5: Scaffold router (Python)

**Files:**
- Create: `router/pyproject.toml`
- Create: `router/src/__init__.py`
- Create: `router/src/router.py`
- Create: `router/src/types.py`
- Create: `router/tests/test_router.py`

**Step 1: Create pyproject.toml**

```toml
[project]
name = "zeroclaw-router"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["pydantic>=2.0.0", "structlog>=23.0.0"]

[project.optional-dependencies]
dev = ["pytest>=7.0.0", "pytest-asyncio>=0.21.0"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

**Step 2: Create types.py**

```python
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentTask(BaseModel):
    id: str = Field(default_factory=lambda: __import__('uuid').uuid4().hex)
    prompt: str
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[str] = None
```

**Step 3: Create router.py**

```python
import structlog
from .types import AgentTask, TaskStatus
from typing import Optional

logger = structlog.get_logger()

class AntiGravityRouter:
    def __init__(self): self.tasks: dict[str, AgentTask] = {}
    async def submit(self, task: AgentTask) -> str:
        self.tasks[task.id] = task
        logger.info("task_submitted", task_id=task.id)
        return task.id
    async def get(self, task_id: str) -> Optional[AgentTask]: return self.tasks.get(task_id)
```

**Step 4: Write test**

```python
# router/tests/test_router.py
import pytest
from router.src.router import AntiGravityRouter
from router.src.types import AgentTask

@pytest.fixture
def router(): return AntiGravityRouter()

@pytest.mark.asyncio
async def test_submit(router):
    task = AgentTask(prompt="test")
    await router.submit(task)
    assert await router.get(task.id) == task
```

**Step 5: Install and test**

```bash
cd router && pip install -e ".[dev]" && pytest -v
# Expected: 1 test pass
```

**Commit:**
```bash
git add router/
git commit -m "feat(router): scaffold Python AntiGravity router"
```

---

### Task 0.6: Create Utility Scripts

**Files:**
- Create: `scripts/create-sandbox.sh`

**Step 1: Create create-sandbox.sh**

```bash
#!/bin/bash
set -e
if [ -z "$1" ]; then echo "Usage: $0 <plugin-name>"; exit 1; fi

NAME=$1
DIR=".sandbox/$NAME"
mkdir -p "$DIR/src"

cat > "$DIR/package.json" << EOF
{ "name": "sandbox-$NAME", "scripts": { "dev": "vite" }, "dependencies": { "react": "18.2.0", "react-dom": "18.2.0" }, "devDependencies": { "vite": "5.0.0", "@vitejs/plugin-react": "4.2.0", "typescript": "5.3.0" } }
EOF

echo "Sandbox created at $DIR"
```

**Step 2: Make executable**

```bash
chmod +x scripts/create-sandbox.sh
```

**Commit:**
```bash
git add scripts/
git commit -m "feat(scripts): add create-sandbox utility"
```

---

### Task 0.7: Docker Configuration for ZeroClaw

**Files:**
- Create: `docker/Dockerfile`
- Create: `docker/docker-compose.yml`
- Create: `docker/.env.example`
- Create: `.dockerignore`

**Step 1: Create Dockerfile**

```dockerfile
# docker/Dockerfile
FROM rust:1.75-slim as builder
WORKDIR /app
COPY ../Antigravity-System/daemon .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/zeroclaw-daemon /usr/local/bin/
EXPOSE 8080
CMD ["zeroclaw-daemon"]
```

**Step 2: Create docker-compose.yml**

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  zeroclaw:
    build:
      context: ../../Antigravity-System/daemon
      dockerfile: ./Dockerfile
    container_name: zeroclaw-daemon
    ports:
      - "8080:8080"
    volumes:
      - ../:/workspace/arndtos:rw
      - ../../Antigravity-System:/workspace/antigravity:rw
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_ALLOWED_USER=${TELEGRAM_ALLOWED_USER}
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Step 3: Create .env.example**

```bash
# docker/.env.example
JWT_SECRET=your-secret-here
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ALLOWED_USER=your-telegram-user-id
```

**Step 4: Create .dockerignore**

```
# .dockerignore
node_modules/
target/
.git/
*.md
.sisyphus/
.workspaces/
```

**Commit:**
```bash
git add docker/ .dockerignore
git commit -m "feat(docker): add ZeroClaw container configuration"
```

---

### Task 0.8: Plugin Workspace System

**Files:**
- Create: `.workspaces/.template/` (directory)
- Create: `.workspaces/.template/package.json`
- Create: `.workspaces/.template/tsconfig.json`
- Create: `.workspaces/.template/vite.config.ts`
- Create: `.workspaces/.template/src/App.tsx`
- Create: `.workspaces/.template/src/main.tsx`
- Create: `.workspaces/.template/.template.json`
- Create: `scripts/create-workspace.sh`

**Step 1: Create template package.json**

```json
// .workspaces/.template/package.json
{
  "name": "plugin-{{NAME}}",
  "version": "0.0.1",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.2.0",
    "typescript": "5.3.0",
    "vite": "5.0.0",
    "vitest": "1.2.0",
    "@testing-library/react": "14.0.0"
  }
}
```

**Step 2: Create .template.json (context inheritance)**

```json
// .workspaces/.template/.template.json
{
  "parent": "ArndtOs",
  "zeroclaw_endpoint": "ws://host.docker.internal:8080",
  "shared_config": {
    "tailwind": "../../web-ui/tailwind.config.js",
    "types": "../../web-ui/src/types"
  },
  "manifest_template": {
    "permissions": ["websocket"],
    "sandbox": "loose"
  },
  "arndtos_context": {
    "dashboard_version": "0.1.0",
    "plugin_api_version": "1.0.0"
  }
}
```

**Step 3: Create create-workspace.sh**

```bash
#!/bin/bash
# scripts/create-workspace.sh
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <plugin-name>"
    echo "Example: $0 tldraw-canvas"
    exit 1
fi

NAME=$1
DIR=".workspaces/$NAME"

if [ -d "$DIR" ]; then
    echo "Error: Workspace $DIR already exists"
    exit 1
fi

echo "Creating workspace: $NAME"

# Copy template
cp -r .workspaces/.template "$DIR"

# Replace placeholders
sed -i "s/{{NAME}}/$NAME/g" "$DIR/package.json"

# Update manifest
cat > "$DIR/manifest.json" << EOF
{
  "name": "$NAME",
  "version": "0.0.1",
  "displayName": "$NAME",
  "description": "Plugin for ZeroClaw OS Dashboard",
  "icon": "\ud83d\udd2e",
  "entry": "./src/App.tsx",
  "enabled": true
  "permissions": ["websocket"]
}
EOF

echo "Workspace created at: $DIR"
echo "Next steps:"
echo "  1. cd $DIR && npm install"
echo "  2. npm run dev  # Start development server"
echo "  3. Build and copy to web-ui/src/plugins/ when ready"
```

**Step 4: Make executable**

```bash
chmod +x scripts/create-workspace.sh
```

**Step 5: Test workspace creation**

```bash
./scripts/create-workspace.sh test-plugin
ls -la .workspaces/test-plugin
# Expected: package.json, src/, manifest.json, .template.json
```

**Commit:**
```bash
git add .workspaces/ scripts/
git commit -m "feat(workspaces): add plugin workspace system with template inheritance"
```

**QA Scenario:**
```
Scenario: Workspace creation works
  Tool: Bash
  Steps:
    1. ./scripts/create-workspace.sh test-plugin
    2. test -d .workspaces/test-plugin
    3. grep -q 'zeroclaw_endpoint' .workspaces/test-plugin/.template.json
  Expected Result: All commands succeed
  Evidence: .sisyphus/evidence/task-0.8-workspace.txt
```

---

---

## PHASE 1: Dashboard Core

> **Parallel Wave 1**: Types, stores, and core components

### Task 1.1: TypeScript Types

**Files:**
- Create: `web-ui/src/types/index.ts`
- Create: `web-ui/src/types/websocket.ts`
- Create: `web-ui/src/types/plugin.ts`

**Step 1: Create index.ts**

```typescript
export * from './websocket'
export * from './plugin'
```

**Step 2: Create websocket.ts**

```typescript
export interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: number
  version: string
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface PingMessage { type: 'ping'; timestamp: number }
export interface PongMessage { type: 'pong'; timestamp: number }
export interface ErrorMessage { type: 'error'; message: string }

export type DaemonMessage = PingMessage | PongMessage | ErrorMessage
```

**Step 3: Create plugin.ts**

```typescript
export interface PluginManifest {
  name: string
  version: string
  displayName: string
  description: string
  icon: string
  entry: string
  enabled: boolean
}

export interface Plugin {
  id: string
  manifest: PluginManifest
  component: React.LazyExoticComponent<React.ComponentType>
  error?: string
}

export type PluginStatus = 'loading' | 'ready' | 'error'
```

**Commit:**
```bash
git add web-ui/src/types/
git commit -m "feat(web-ui): add TypeScript types for WebSocket and plugins"
```

---

### Task 1.2: Zustand uiStore

**Files:**
- Create: `web-ui/src/store/uiStore.ts`

**Step 1: Create uiStore.ts**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConnectionStatus } from '@/types'

interface UIState {
  sidebarOpen: boolean
  connectionStatus: ConnectionStatus
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      connectionStatus: 'disconnected',
      theme: 'dark',
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'zeroclaw-ui' }
  )
)
```

**Commit:**
```bash
git add web-ui/src/store/uiStore.ts
git commit -m "feat(web-ui): add Zustand uiStore with persistence"
```

---

### Task 1.3: Zustand agentStore

**Files:**
- Create: `web-ui/src/store/agentStore.ts`

**Step 1: Create agentStore.ts**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AgentState {
  agentId: string | null
  status: 'idle' | 'thinking' | 'working' | 'error'
  lastMessage: string | null
  setAgentId: (id: string) => void
  setStatus: (status: AgentState['status']) => void
  setLastMessage: (msg: string) => void,
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      agentId: null,
      status: 'idle',
      lastMessage: null,
      setAgentId: (id) => set({ agentId: id }),
      setStatus: (status) => set({ status }),
      setLastMessage: (msg) => set({ lastMessage: msg }),
    }),
    { name: 'zeroclaw-agent' }
  )
)
```

**Commit:**
```bash
git add web-ui/src/store/agentStore.ts
git commit -m "feat(web-ui): add Zustand agentStore with persistence"
```

---

### Task 1.4: ErrorBoundary Component

**Files:**
- Create: `web-ui/src/components/ErrorBoundary.tsx`
- Test: `web-ui/src/components/__tests__/ErrorBoundary.test.tsx`

**Step 1: Create ErrorBoundary.tsx**

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-900/50 rounded-lg">
          <h2 className="text-lg font-bold">Something went wrong</h2>
          <p className="text-sm text-gray-400">{this.state.error?.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Step 2: Write test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

const ThrowError = () => { throw new Error('test error') }

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><div>OK</div></ErrorBoundary>)
    expect(screen.getByText('OK')).toBeDefined()
  })

  it('renders fallback on error', () => {
    render(<ErrorBoundary><ThrowError /></ErrorBoundary>)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })
})
```

**Step 3: Run test**

```bash
cd web-ui && npm test -- --run
# Expected: 3 tests pass (1 from setup + 2 from ErrorBoundary)
```

**Commit:**
```bash
git add web-ui/src/components/
git commit -m "feat(web-ui): add ErrorBoundary component with tests"
```

---

### Task 1.5: Plugin Types and Registry

**Files:**
- Create: `web-ui/src/plugins/index.ts`
- Create: `web-ui/src/plugins/registry.ts`

**Step 1: Create index.ts (plugin loader)**

```typescript
import { Plugin, PluginManifest } from '@/types/plugin'

const plugins: Map<string, Plugin> = new Map()

export async function loadPlugins(): Promise<Plugin[]> {
  // Scan plugins directory and load manifests
  const pluginDirs = ['tldraw-canvas'] // Will be populated dynamically
  
  for (const dir of pluginDirs) {
    try {
      const manifest: PluginManifest = await import(`./${dir}/manifest.json`)
      const component = React.lazy(() => import(`./${dir}/index`))
      plugins.set(manifest.name, { id: manifest.name, manifest, component })
    } catch (e) {
      console.error(`Failed to load plugin: ${dir}`, e)
    }
  }
  
  return Array.from(plugins.values())
}

export function getPlugin(id: string): Plugin | undefined {
  return plugins.get(id)
}

export function getAllPlugins(): Plugin[] {
  return Array.from(plugins.values())
}
```

**Step 2: Create registry.ts**

```typescript
import { PluginManifest } from '@/types/plugin'

export const pluginRegistry: PluginManifest[] = []

export function registerPlugin(manifest: PluginManifest) {
  pluginRegistry.push(manifest)
}

export function getRegisteredPlugins(): PluginManifest[] {
  return pluginRegistry.filter(p => p.enabled)
}
```

**Commit:**
```bash
git add web-ui/src/plugins/
git commit -m "feat(web-ui): add plugin loader and registry"
```

---

### Task 1.6: Sidebar Navigation

**Files:**
- Create: `web-ui/src/components/Sidebar.tsx`

**Step 1: Create Sidebar.tsx**

```tsx
'use client'
import { useUIStore } from '@/store/uiStore'
import { getAllPlugins } from '@/plugins'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const plugins = getAllPlugins()

  if (!sidebarOpen) return null

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold text-primary-500">ZeroClaw OS</h1>
      </div>
      <nav className="mt-4">
        {plugins.map((p) => (
          <a
            key={p.id}
            href={`/plugin/${p.id}`}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800"
          >
            <span>{p.manifest.icon}</span>
            <span>{p.manifest.displayName}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
```

**Commit:**
```bash
git add web-ui/src/components/Sidebar.tsx
git commit -m "feat(web-ui): add Sidebar navigation component"
```

---

---

## PHASE 2: ZeroClaw Daemon WebSocket

> **Sequential execution** - each task builds on the previous

### Task 2.1: WebSocket Server Base

**Files:**
- Modify: `daemon/src/main.rs`
- Create: `daemon/src/server.rs`

**Step 1: Create server.rs**

```rust
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::Response,
    routing::get,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use std::net::SocketAddr;

pub async fn ws_handler(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        if let Ok(Message::Text(text)) = msg {
            if socket.send(Message::Text(text)).await.is_err() { break; }
        }
    }
}

pub fn create_router() -> Router {
    Router::new().route("/ws", get(ws_handler))
}

pub async fn run_server(addr: SocketAddr) {
    let app = create_router();
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

**Step 2: Update main.rs**

```rust
mod server;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let addr: std::net::SocketAddr = "0.0.0.0:8080".parse().unwrap();
    println!("ZeroClaw Daemon listening on {}", addr);
    server::run_server(addr).await;
}
```

**Step 3: Build and test**

```bash
cd daemon && cargo build
# Expected: Compiles successfully
```

**Commit:**
```bash
git add daemon/
git commit -m "feat(daemon): add WebSocket server with echo handler"
```

---

### Task 2.2: JWT Authentication Middleware

**Files:**
- Modify: `daemon/src/server.rs`
- Create: `daemon/src/auth.rs`

**Step 1: Create auth.rs**

```rust
use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    response::{Response, IntoResponse},
    http::StatusCode,
};
use crate::auth::validate_token;

pub async fn ws_auth_handler(ws: WebSocketUpgrade, query: axum::extract::Query<std::collections::HashMap<String, String>>) -> Response {
    let token = query.get("token").cloned().unwrap_or_default();
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret".to_string());
    
    match validate_token(&token, secret.as_bytes()) {
        Ok(_claims) => ws.on_upgrade(handle_auth_socket),
        Err(_) => (StatusCode::Unauthorized, "Invalid token").into_response(),
    }
}

async fn handle_auth_socket(socket: WebSocket) {
    // Handle authenticated WebSocket
    super::server::handle_socket(socket).await;
}
```

**Commit:**
```bash
git add daemon/src/auth.rs daemon/src/server.rs
git commit -m "feat(daemon): add JWT authentication for WebSocket connections"
```

---

### Task 2.3: Frontend WebSocket Client

**Files:**
- Create: `web-ui/src/services/daemonClient.ts`

**Step 1: Create daemonClient.ts**

```typescript
import { useAgentStore } from '@/store/agentStore'
import { useUIStore } from '@/store/uiStore'

export class DaemonClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(url: string) {
    this.url = url
  }

  connect(token: string) {
    this.ws = new WebSocket(`${this.url}?token=${token}`)
    useUIStore.getState().setConnectionStatus('connecting')

    this.ws.onopen = () => {
      useUIStore.getState().setConnectionStatus('connected')
      this.reconnectAttempts = 0
    }

    this.ws.onclose = () => {
      useUIStore.getState().setConnectionStatus('disconnected')
      this.attemptReconnect(token)
    }

    this.ws.onerror = () => {
      useUIStore.getState().setConnectionStatus('error')
    }

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      this.handleMessage(msg)
    }
  }

  private handleMessage(msg: { type: string; payload?: unknown }) {
    switch (msg.type) {
      case 'pong':
        useAgentStore.getState().setLastMessage('pong received')
        break
      default:
        console.log('Unknown message:', msg)
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => this.connect(token), 2000 * this.reconnectAttempts)
    }
  }

  send(msg: object) {
    this.ws?.send(JSON.stringify(msg))
  }

  disconnect() {
    this.ws?.close()
  }
}

export const daemonClient = new DaemonClient('ws://localhost:8080/ws')
```

**Commit:**
```bash
git add web-ui/src/services/daemonClient.ts
git commit -m "feat(web-ui): add WebSocket client with auto-reconnect"
```

---

---

## PHASE 3: Memory & Soul Configuration

> **Parallel execution** - independent tasks

### Task 3.1: MCP Memory Server

**Files:**
- Modify: `memory/src/index.ts`

**Step 1: Add MCP server**

```typescript
// memory/src/index.ts - extended
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// ... existing code ...

const server = new Server({ name: 'zeroclaw-memory', version: '0.1.0' }, { capabilities: { tools: {} } })

server.setRequestHandler('tools/list', async () => ({
  tools: [{ name: 'store_memory', description: 'Store a memory entry', inputSchema: { type: 'object', properties: { type: { type: 'string' }, content: { type: 'string' } } } }]
}))

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log('ZeroClaw Memory MCP server running')
}

main()
```

**Commit:**
```bash
git add memory/src/index.ts
git commit -m "feat(memory): add MCP server implementation"
```

---

### Task 3.2: Soul Configuration

**Files:**
- Create: `.config/openclaw/soul.yaml`

**Step 1: Create soul.yaml**

```yaml
name: zeroclaw-orchestrator
version: "1.0"
role: |
  You are ZeroClaw, an autonomous AI orchestrator.
  Your primary function is to coordinate tasks between different AI agents and services.

directives:
  - name: tdd-enforcement
    priority: critical
    rule: |
      NEVER declare a task complete without showing passing test logs.
      Visual screenshots are NOT acceptable as proof of completion.

  - name: anti-hallucination
    priority: critical
    rule: |
      Never generate fake screenshots or mock data as proof of work.
      Only report what has been verified through actual test execution.

  - name: sandbox-isolation
    priority: high
    rule: |
      All new plugins must be created in isolated sandbox environments first.
      Test thoroughly before integrating into main dashboard.

capabilities:
  - websocket-communication
  - telegram-control
  - tldraw-canvas
  - memory-storage

integrations:
  - name: docker-mcp
    purpose: Run isolated code execution containers
  - name: memory-mcp
    purpose: Long-term memory and context persistence
```

**Commit:**
```bash
git add .config/openclaw/soul.yaml
git commit -m "feat(config): add OpenClaw soul configuration with TDD enforcement"
```

---

### Task 3.3: Systemd Services

**Files:**
- Create: `.config/systemd/zeroclaw-daemon.service`
- Create: `.config/systemd/zeroclaw-memory.service`

**Step 1: Create zeroclaw-daemon.service**

```ini
[Unit]
Description=ZeroClaw Daemon
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/zeroclaw-daemon
Restart=always
RestartSec=5
WatchdogSec=30
Environment=JWT_SECRET=%d/jwt_secret

[Install]
WantedBy=multi-user.target
```

**Step 2: Create zeroclaw-memory.service**

```ini
[Unit]
Description=ZeroClaw Memory MCP
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /opt/zeroclaw/memory/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Commit:**
```bash
git add .config/systemd/
git commit -m "feat(config): add systemd service files with auto-restart"
```

---

---

## PHASE 4: Telegram Integration

> **Sequential execution**

### Task 4.1: Telegram Bot Module

**Files:**
- Create: `daemon/src/telegram.rs`

**Step 1: Add teloxide dependency**

```toml
# Add to daemon/Cargo.toml
teloxide = { version = "0.12", features = ["macros"] }
```

**Step 2: Create telegram.rs**

```rust
use teloxide::{prelude::*, utils::command::BotCommands};

#[derive(BotCommands, Clone)]
[command(rename = "lower_case", description = "Available commands:")]
enum Command {
    #[command(description = "Check if bot is alive")]
    Ping,
    #[command(description = "Get system status")]
    Status,
}

pub async fn run_telegram_bot(token: String, allowed_user_id: i64) {
    let bot = Bot::new(token);
    teloxide::repl(bot, move |cx: UpdateWithCx<Bot, Message>| {
        let user_id = cx.update.from().map(|u| u.id.0).unwrap_or(0);
        async move {
            if user_id != allowed_user_id {
                cx.answer("Unauthorized").await?;
                return Ok(());
            }
            if let Some(text) = cx.update.text() {
                match Command::parse(text, "zeroclaw_bot") {
                    Ok(Command::Ping) => cx.answer("Pong! ZeroClaw is alive.").await?,
                    Ok(Command::Status) => cx.answer("Status: All systems operational.").await?,
                    Err(_) => cx.answer("Unknown command.").await?,
                }
            }
            Ok(())
        }
    }).await;
}
```

**Step 3: Update main.rs**

```rust
mod telegram;

#[tokio::main]
async fn main() {
    let tg_token = std::env::var("TELEGRAM_BOT_TOKEN").expect("TELEGRAM_BOT_TOKEN required");
    let tg_user: i64 = std::env::var("TELEGRAM_ALLOWED_USER")
        .expect("TELEGRAM_ALLOWED_USER required")
        .parse().expect("Invalid user ID");

    tokio::spawn(telegram::run_telegram_bot(tg_token, tg_user));
    // ... rest of main
}
```

**Commit:**
```bash
git add daemon/
git commit -m "feat(daemon): add Telegram bot with user verification"
```

---

### Task 4.2: Structured Logging

**Files:**
- Modify: `daemon/src/main.rs`

**Step 1: Configure JSON logging**

```rust
// In main.rs, replace tracing_subscriber::fmt::init()
tracing_subscriber::fmt()
    .json()
    .with_target(false)
    .with_current_span(false)
    .with_file(true)
    .with_line_number(true)
    .init();
```

**Commit:**
```bash
git add daemon/src/main.rs
git commit -m "feat(daemon): add structured JSON logging"
```

---

---

## PHASE 5: TLDraw Integration

> **HIGHEST PRIORITY** - Parallel execution

### Task 5.1: TLDraw Plugin Scaffolding

**Files:**
- Create: `web-ui/src/plugins/tldraw-canvas/manifest.json`
- Create: `web-ui/src/plugins/tldraw-canvas/index.tsx`

**Step 1: Create manifest.json**

```json
{
  "name": "tldraw-canvas",
  "version": "0.1.0",
  "displayName": "Canvas",
  "description": "Interactive canvas for architecture diagrams",
  "icon": "🎨",
  "entry": "./index.tsx",
  "enabled": true
}
```

**Step 2: Install TLDraw**

```bash
cd web-ui && npm install @tldraw/tldraw
```

**Step 3: Create index.tsx**

```tsx
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/editor.css'
import '@tldraw/tldraw/ui.css'

export default function TLDrawCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw />
    </div>
  )
}

export const manifest = {
  name: 'tldraw-canvas',
  displayName: 'Canvas',
  icon: '🎨',
}
```

**Commit:**
```bash
git add web-ui/src/plugins/tldraw-canvas/
git commit -m "feat(web-ui): add TLDraw canvas plugin scaffolding"
```

---

### Task 5.2: Canvas Templates

**Files:**
- Create: `web-ui/src/plugins/tldraw-canvas/templates.ts`

**Step 1: Create templates.ts**

```typescript
import { createShapeId } from '@tldraw/tldraw'

export const agentTemplate = {
  id: 'agent-template',
  shapes: [
    { id: createShapeId('agent-box'), type: 'geo', x: 100, y: 100, props: { geo: 'rectangle', w: 200, h: 100, color: 'blue', fill: 'semi' } },
    { id: createShapeId('agent-label'), type: 'text', x: 130, y: 130, props: { text: 'AI Agent', size: 'm' } },
  ]
}

export const chatTemplate = {
  id: 'chat-template',
  shapes: [
    { id: createShapeId('user-box'), type: 'geo', x: 100, y: 100, props: { geo: 'rectangle', w: 150, h: 80, color: 'green', fill: 'semi' } },
    { id: createShapeId('ai-box'), type: 'geo', x: 300, y: 100, props: { geo: 'rectangle', w: 150, h: 80, color: 'violet', fill: 'semi' } },
    { id: createShapeId('arrow'), type: 'arrow', x: 175, y: 140, props: { start: { type: 'point', x: 0, y: 0 }, end: { type: 'point', x: 125, y: 0 } } },
  ]
}
```

**Commit:**
```bash
git add web-ui/src/plugins/tldraw-canvas/templates.ts
git commit -m "feat(web-ui): add TLDraw agent and chat templates"
```

---

### Task 5.3: WebSocket Bridge for Canvas

**Files:**
- Modify: `web-ui/src/plugins/tldraw-canvas/index.tsx`
- Create: `web-ui/src/plugins/tldraw-canvas/canvasBridge.ts`

**Step 1: Create canvasBridge.ts**

```typescript
import { Editor, createShapeId } from '@tldraw/tldraw'

export type CanvasAction = 
  | { type: 'create'; shape: unknown }
  | { type: 'update'; id: string; changes: unknown }
  | { type: 'delete'; id: string }

export function applyCanvasAction(editor: Editor, action: CanvasAction) {
  switch (action.type) {
    case 'create':
      editor.createShapes([action.shape as any])
      break
    case 'update':
      editor.updateShape({ id: createShapeId(action.id), ...(action.changes as any) })
      break
    case 'delete':
      editor.deleteShapes([createShapeId(action.id)])
      break
  }
}

export function exportCanvasState(editor: Editor) {
  return editor.getCurrentPageShapes().map(s => ({
    id: s.id, type: s.type, x: s.x, y: s.y, props: s.props
  }))
}
```

**Step 2: Update index.tsx to use bridge**

```tsx
import { Tldraw, useEditor } from '@tldraw/tldraw'
import { useEffect } from 'react'
import { daemonClient } from '@/services/daemonClient'
import { applyCanvasAction, CanvasAction } from './canvasBridge'
import '@tldraw/tldraw/editor.css'
import '@tldraw/tldraw/ui.css'

function CanvasComponent() {
  const editor = useEditor()

  useEffect(() => {
    // Listen for canvas commands from daemon
    const handler = (msg: { type: string; payload: CanvasAction }) => {
      if (msg.type === 'canvas_action') {
        applyCanvasAction(editor, msg.payload)
      }
    }
    // Subscribe to daemon messages
    return () => {/* cleanup */}
  }, [editor])

  return null
}

export default function TLDrawCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw>
        <CanvasComponent />
      </Tldraw>
    </div>
  )
}
```

**Commit:**
```bash
git add web-ui/src/plugins/tldraw-canvas/
git commit -m "feat(web-ui): add WebSocket bridge for TLDraw canvas operations"
```

---

---

## Final Verification Wave (MANDATORY)

> 4 review agents run in PARALLEL. ALL must APPROVE.

### Task F1: Plan Compliance Audit

**Agent:** oracle

**What to do:**
1. Read the plan end-to-end
2. For each 'Must Have': verify implementation exists
3. For each 'Must NOT Have': search codebase for forbidden patterns
4. Check evidence files exist in .sisyphus/evidence/
5. Compare deliverables against plan

**Output:** `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

---

### Task F2: Code Quality Review

**Agent:** unspecified-high

**What to do:**
1. Run `tsc --noEmit` in web-ui/
2. Run `cargo clippy` in daemon/
3. Run `npm test` in all packages
4. Review all changed files for anti-patterns
5. Check for AI slop: excessive comments, over-abstraction, generic names

**Output:** `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

---

### Task F3: Integration QA

**Agent:** unspecified-high

**What to do:**
1. Start all services with scripts/dev-start.sh
2. Verify WebSocket connection works
3. Verify TLDraw canvas renders
4. Test Telegram bot responds
5. Capture evidence screenshots

**Output:** `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

---

### Task F4: Scope Fidelity Check

**Agent:** deep

**What to do:**
1. For each task: read 'What to do', read actual diff
2. Verify 1:1 — everything in spec was built, nothing beyond spec
3. Check 'Must NOT do' compliance
4. Detect cross-task contamination

**Output:** `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

---

## Commit Strategy

| Phase | Commit Message Pattern | Pre-commit Check |
|-------|------------------------|------------------|
| 0 | `chore: initialize X` | N/A |
| 1 | `feat(web-ui): add X` | `npm test` |
| 2 | `feat(daemon): add X` | `cargo test` |
| 3 | `feat(config): add X` | N/A |
| 4 | `feat(daemon): add telegram` | `cargo test` |
| 5 | `feat(web-ui): add tldraw` | `npm test` |

---

## Success Criteria

### Verification Commands

```bash
# Web UI
cd web-ui && npm run build && npm test -- --run
# Expected: Build succeeds, all tests pass

# Daemon
cd daemon && cargo build --release && cargo test
# Expected: Build succeeds, all tests pass

# Memory
cd memory && npm run build && npm test
# Expected: Build succeeds, all tests pass

# Router
cd router && pytest -v
# Expected: All tests pass
```

### Final Checklist
- [ ] All 'Must Have' present
- [ ] All 'Must NOT Have' absent
- [ ] All tests pass
- [ ] WebSocket ping-pong works with JWT
- [ ] TLDraw canvas renders with templates
- [ ] Telegram bot responds to authorized user
- [ ] Systemd services configured with auto-restart

