
---
**Previous:** [09-database.md](../09-database.md) | **Next:** [11-deployment.md](../11-deployment.md)

## 10. Testing

### 10.1 Testing Strategy

ZeroClaw OS Dashboard follows **Test-Driven Development (TDD)** principles:

- **No feature is complete without passing tests**
- **Tests must pass before committing**
- **End-to-end tests required for WebSocket communication**
- **Sandbox isolation tests for all plugins**

### 10.2 Frontend Testing

#### 10.2.1 Test Framework

**Vitest** is used for TypeScript/JavaScript testing with jsdom environment.

**Configuration:** `web-ui/vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

#### 10.2.2 Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm test -- --coverage
```

#### 10.2.3 Test Types

**Unit Tests:**
- Component tests (`*.test.tsx`)
- Store tests
- Service tests
- Plugin tests

**Example:** `web-ui/src/app/page.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'

describe('DashboardPage', () => {
  it('renders dashboard title', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
```

**Integration Tests:**
- WebSocket communication tests
- State persistence tests
- Plugin loading tests

**Example:** `web-ui/src/plugins/isolation.test.ts`

### 10.3 Backend Testing (Rust)

#### 10.3.1 Test Framework

Rust's built-in test framework (`cargo test`).

#### 10.3.2 Running Tests

```bash
cd daemon

# Run all tests
cargo test

# Run specific test
cargo test test_ws_auth_rejects_missing_token

# Run tests with output
cargo test -- --nocapture

# Run tests in release mode
cargo test --release
```

#### 10.3.3 Test Examples

**WebSocket Authentication Tests:** `daemon/src/auth.rs`

```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_ws_auth_rejects_missing_token() {
        let response = ws_auth_handler(/* ... */).await;
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn test_ws_auth_accepts_valid_token() {
        let valid_token = create_test_token("test-user");
        let response = ws_auth_handler(/* ... */).await;
        assert_eq!(response.status(), axum::http::StatusCode::SWITCHING_PROTOCOLS);
    }

    #[tokio::test]
    async fn test_ws_auth_ignores_dev_mode() {
        // CRITICAL: DEV_MODE must NOT bypass authentication
        std::env::set_var("DEV_MODE", "true");
        let response = ws_auth_handler(/* ... */).await;
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
        std::env::remove_var("DEV_MODE");
    }
}
```

### 10.4 Backend Testing (Python)

#### 10.4.1 Test Framework

**pytest** with asyncio support.

**Configuration:** `router/pyproject.toml`

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

#### 10.4.2 Running Tests

```bash
cd router

# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Run tests
pytest

# Run tests with verbose output
pytest -v

# Run specific test
pytest tests/test_router.py::test_submit_task
```

#### 10.4.3 Test Examples

**Note:** Python test files are not present in the repository. The following is an expected structure:

```python
import pytest
from src.router import AntiGravityRouter

@pytest.mark.asyncio
async def test_submit_task():
    router = AntiGravityRouter()
    task_id = await router.submit(AgentTask(prompt="Test task"))
    assert task_id is not None

@pytest.mark.asyncio
async def test_get_task():
    router = AntiGravityRouter()
    task_id = await router.submit(AgentTask(prompt="Test task"))
    task = await router.get(task_id)
    assert task.status == TaskStatus.PENDING
```

### 10.5 End-to-End Testing

**WebSocket Communication Tests:**
- Test full WebSocket lifecycle
- Test message serialization/deserialization
- Test reconnection logic
- Test JWT authentication flow

**Not Available in Repository:** E2E test framework (e.g., Playwright, Cypress) is not configured.

### 10.6 Test Coverage

**Current Status:**
- Frontend: Partial coverage (some components tested)
- Rust Daemon: Good coverage (auth, rate limiting tested)
- Python Router: Tests not present in repository

**Recommended Coverage Target:** 80%+ for critical paths

### 10.7 Continuous Integration

**Not Available in Repository:** CI/CD configuration files (e.g., GitHub Actions, GitLab CI) are not present.

**Recommended CI Steps:**
1. Run linters (ESLint, ruff, clippy)
2. Run all tests
3. Build production artifacts
4. Run security scans
5. Deploy on success

---

