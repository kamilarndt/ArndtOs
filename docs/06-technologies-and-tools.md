
---
**Previous:** [05-project-structure.md](../05-project-structure.md) | **Next:** [07-features.md](../07-features.md)

## 6. Technologies and Tools

### 6.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0.4 | React framework with App Router |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.2.2 | Type-safe JavaScript |
| **Tailwind CSS** | 3.3.5 | Utility-first CSS framework |
| **Zustand** | 4.4.1 | State management with persistence |
| **@tldraw/tldraw** | 4.4.0 | Interactive canvas for diagrams |
| **PostCSS** | 8.4.31 | CSS transformation |
| **Autoprefixer** | 10.4.16 | CSS vendor prefixes |

### 6.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Rust** | 1.70+ | ZeroClaw Daemon implementation |
| **Tokio** | 1.x | Async runtime for Rust |
| **Axum** | 0.7 | Web framework for Rust |
| **Python** | 3.10+ | AntiGravity Router |
| **FastAPI** | 0.104+ | ASGI web framework |
| **Pydantic** | 2.0+ | Data validation |
| **aiohttp** | 3.9+ | Async HTTP client |
| **uvicorn** | 0.24+ | ASGI server |

### 6.3 Security Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **jsonwebtoken** | 9 | JWT token generation/validation |
| **Tailscale** | Latest | Mesh VPN network |
| **governor** | 0.6 | Rate limiting |
| **tower-http** | 0.5 | HTTP middleware (CORS, tracing) |

### 6.4 Observability Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Prometheus** | Latest | Metrics collection |
| **Grafana** | Latest | Metrics visualization |
| **tracing** | 0.1 | Structured logging (Rust) |
| **structlog** | 23.0+ | Structured logging (Python) |
| **tracing-subscriber** | 0.3 | Log formatting |

### 6.5 Testing Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 1.0.0 | Unit testing (TypeScript/JavaScript) |
| **@testing-library/react** | 13.4.0 | React component testing |
| **@testing-library/jest-dom** | 6.1.1 | DOM testing utilities |
| **jsdom** | 23.0.1 | DOM implementation for testing |
| **pytest** | 7.0+ | Python testing |
| **pytest-asyncio** | 0.21+ | Async test support |

### 6.6 Development Tools

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Git** | Version control |
| **VS Code** | Primary development environment |
| **Critters** | CSS critical path optimization |

### 6.7 LLM Integration

| Provider | Model | Purpose |
|----------|-------|---------|
| **NVIDIA** | meta/llama-3.1-405b-instruct | Primary LLM provider |
| **OpenRouter** | anthropic/claude-3.5-sonnet | Fallback provider |
| **Mistral** | mistral-large-latest | Secondary fallback |
| **Ollama** | llama3 | Local fallback (optional) |

---

