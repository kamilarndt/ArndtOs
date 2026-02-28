
---
**Previous:** [07-features.md](../07-features.md) | **Next:** [09-database.md](../09-database.md)

## 8. API and Endpoints

### 8.1 WebSocket Endpoints

#### 8.1.1 WebSocket Connection

**Endpoint:** `ws://localhost:8080/ws?token=<jwt_token>`

**Authentication:**
- JWT token required as query parameter
- Validated on handshake
- Token expiration checked

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Valid JWT authentication token |

**Response Codes:**
- `101 Switching Protocols`: Connection established
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded

**Example:**

```javascript
// Connect with JWT token
const token = 'your-jwt-token-here';
const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### 8.2 HTTP Endpoints

#### 8.2.1 Health Check

**Endpoint:** `GET /health`

**Purpose:** Check daemon health status

**Response:**

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": 1709123456789
}
```

**Status Codes:**
- `200 OK`: Daemon is healthy

**Example:**

```bash
curl http://localhost:8080/health
```

#### 8.2.2 Metrics Export

**Endpoint:** `GET /metrics`

**Purpose:** Export Prometheus metrics

**Response Format:** Prometheus text format

**Example:**

```bash
curl http://localhost:8080/metrics
```

**Metrics Include:**
- `zeroclaw_active_connections`: Current WebSocket connections
- `zeroclaw_request_latency_seconds`: Request latency histogram
- `zeroclaw_requests_total`: Total request count

### 8.3 WebSocket Message Types

#### 8.3.1 Message Structure

All WebSocket messages follow this structure:

```typescript
interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: number
  version: string
}
```

#### 8.3.2 Message Types

**Ping Message:**

```typescript
{
  "type": "ping",
  "payload": {},
  "timestamp": 1709123456789,
  "version": "1.0"
}
```

**Pong Message:**

```typescript
{
  "type": "pong",
  "payload": {},
  "timestamp": 1709123456789,
  "version": "1.0"
}
```

**Error Message:**

```typescript
{
  "type": "error",
  "payload": "Error description here",
  "timestamp": 1709123456789,
  "version": "1.0"
}
```

**Agent Status Message:**

```typescript
{
  "type": "AgentStatus",
  "payload": {
    "status": "working",
    "message": "Processing task ABC123"
  },
  "timestamp": 1709123456789,
  "version": "1.0"
}
```

**Task Update Message:**

```typescript
{
  "type": "TaskUpdate",
  "payload": {
    "taskId": "abc123",
    "status": "completed"
  },
  "timestamp": 1709123456789,
  "version": "1.0"
}
```

### 8.4 AntiGravity Router API

The AntiGravity Router runs as a separate service and provides task management capabilities.

#### 8.4.1 Submit Task

**Endpoint:** `POST /api/tasks/submit`

**Request Body:**

```json
{
  "prompt": "Task description here"
}
```

**Response:**

```json
{
  "task_id": "abc123def456",
  "status": "pending"
}
```

#### 8.4.2 Get Task Status

**Endpoint:** `GET /api/tasks/{task_id}`

**Response:**

```json
{
  "id": "abc123def456",
  "prompt": "Task description",
  "status": "completed",
  "result": "Task result here",
  "provider_used": "nvidia",
  "created_at": "2024-02-28T10:30:00Z",
  "completed_at": "2024-02-28T10:30:05Z",
  "retry_count": 0
}
```

#### 8.4.3 Cancel Task

**Endpoint:** `DELETE /api/tasks/{task_id}`

**Response:**

```json
{
  "success": true
}
```

**Note:** AntiGravity Router API endpoints are not fully documented in the repository. Additional endpoints may exist.

---

