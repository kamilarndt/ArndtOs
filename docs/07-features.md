
---
**Previous:** [06-technologies-and-tools.md](../06-technologies-and-tools.md) | **Next:** [08-api-and-endpoints.md](../08-api-and-endpoints.md)

## 7. Features

### 7.1 Core Features

#### 7.1.1 Dashboard Home

The main dashboard provides:
- **Connection Status:** Real-time WebSocket connection status with visual indicators
- **Agent Status:** Current agent state (idle, thinking, working, error) with unique ID
- **Quick Actions:** Fast navigation to Agents, Plugins, and Settings pages
- **Last Message Display:** Shows the most recent message from the daemon

#### 7.1.2 Plugin System

**Dynamic Plugin Loading:**
- Plugins are discovered and registered from `web-ui/src/plugins/`
- Each plugin has a manifest file (`manifest.json`) defining metadata
- Plugins appear as navigation items in the sidebar

**Plugin Isolation:**
- All plugin components wrapped in React Error Boundaries
- Complex plugins can run in isolated iframes
- Sandbox system prevents plugin failures from affecting the core UI

**Built-in Plugins:**
- **TLDraw Canvas:** Interactive canvas for visual workflows and diagrams
- **Template System:** Pre-built diagram templates for common use cases

#### 7.1.3 State Management

**Zustand Stores:**
- `uiStore`: UI state (sidebar, connection status, theme)
- `agentStore`: Agent state (ID, status, last message)
- `chatStore`: Chat history and conversation state

**Persistence:**
- All stores use `persist` middleware
- State survives page refreshes and browser restarts
- Stored in localStorage with versioning

#### 7.1.4 WebSocket Communication

**Real-time Updates:**
- Bidirectional WebSocket connection to ZeroClaw daemon
- Automatic reconnection with 3-second delay
- Heartbeat mechanism (30-second interval)

**Message Types:**
- `ping`: Heartbeat request
- `pong`: Heartbeat response
- `error`: Error notification
- `AgentStatus`: Agent state updates
- `TaskUpdate`: Task progress updates

**JWT Authentication:**
- WebSocket connections require valid JWT token
- Token passed as query parameter: `ws://localhost:8080/ws?token=<jwt>`
- Tokens validated on handshake
- Supports dev mode bypass for localhost connections

### 7.2 Advanced Features

#### 7.2.1 TLDraw Canvas Integration

**Visual Planning:**
- Interactive canvas for drawing diagrams and flowcharts
- Real-time collaboration with agents
- Template library for common patterns

**Canvas Operations:**
- Create, Update, Delete operations streamed via WebSocket
- Coordinate-based updates instead of full JSON replacement
- Supports shapes, text, connections, and annotations

**Agent Bridge:**
- `TLDrawAgentBridge` component enables agent interactions
- Agents can manipulate canvas elements directly
- Visual feedback for agent actions

#### 7.2.2 Telegram "Red Phone" Integration

**Backup Control Channel:**
- Telegram bot provides independent communication path
- Works even when web UI is completely down
- Allows sending commands and receiving updates

**Features:**
- Task submission via Telegram messages
- Status updates sent to Telegram
- Error notifications
- User ID-based access control

#### 7.2.3 AntiGravity Router

**LLM Fallback Chain:**
- Primary: NVIDIA API (meta/llama-3.1-405b-instruct)
- Fallback 1: OpenRouter (anthropic/claude-3.5-sonnet)
- Fallback 2: Mistral (mistral-large-latest)
- Final: Ollama (llama3 - local)

**Task Management:**
- Asynchronous task submission
- Task status tracking (pending, running, completed, failed)
- Retry logic with provider rotation
- Detailed logging of provider attempts

#### 7.2.4 Observability Stack

**Prometheus Metrics:**
- Connection latency tracking
- Active connection count
- Request/response metrics
- Custom application metrics

**Grafana Dashboards:**
- Real-time metrics visualization
- Historical data analysis
- Alert configuration (not available in repository)

**Structured Logging:**
- JSON-formatted logs (Rust)
- Structured logging (Python with structlog)
- Correlation IDs for request tracing

#### 7.2.5 Rate Limiting

**WebSocket Rate Limiter:**
- Prevents connection spam
- Configurable request limits
- Per-connection tracking

**Token Bucket Algorithm:**
- Governor crate implementation
- Burst capacity with refill rate
- Rejection with HTTP 429 when exceeded

### 7.3 Security Features

#### 7.3.1 JWT Authentication

**Token Generation:**
- Tokens generated on server side
- Expiration time configurable
- Subject claim identifies user

**Token Validation:**
- Strict validation on WebSocket handshake
- Expiration check
- Subject claim validation
- Rejects malformed/invalid tokens

**Dev Mode:**
- Bypasses JWT for localhost connections only
- Requires `DEV_MODE=true` environment variable
- Strict security: non-localhost connections still require JWT even in dev mode

#### 7.3.2 Tailscale VPN Security

**Mesh Network:**
- All nodes connected via Tailscale
- End-to-end encrypted connections
- No need for public IP exposure

**Access Control Lists (ACL):**
- Deny-by-default policy
- Explicit allow rules for required communication
- No SSH access from public node to private node

#### 7.3.3 Input Validation

**TypeScript Types:**
- Strong typing for all WebSocket messages
- Runtime type checking
- Validation on message parsing

**Pydantic Models:**
- Type validation for router requests
- Automatic schema generation
- Detailed error messages

### 7.4 Developer Features

#### 7.4.1 Plugin Sandbox

**Isolated Development:**
- `scripts/create-sandbox.sh` creates isolated plugin environment
- Separate package.json and dependencies
- Independent build process

**Template Generation:**
- Pre-configured Vite setup
- React and TypeScript included
- Development server ready

#### 7.4.2 Testing Infrastructure

**Unit Tests:**
- Component tests with Vitest
- Store tests
- Service tests
- Plugin tests

**Integration Tests:**
- WebSocket communication tests
- End-to-end task flow tests
- Authentication tests

**Development Mode:**
- Hot reload for all components
- Fast refresh for React components
- Automatic test re-run

---

