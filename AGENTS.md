# AGENTS.md - ZeroClaw OS Dashboard Development Guide

## Project Overview
ZeroClaw OS Dashboard is a modular UI system built on Next.js/React that serves as a visual operating system for autonomous AI agents. The architecture follows a "Split-Brain" model separating lightweight web interface from heavy computation.

## Core Principles
- **Plugin-First Architecture**: All features must be implemented as isolated modules in `web-ui/src/plugins/`
- **Error Isolation**: Components must be wrapped in React Error Boundaries to prevent cascade failures
- **State Persistence**: Use Zustand with persist middleware to prevent state loss on refresh
- **Test-Driven Development (TDD)**: No feature is considered complete without passing automated tests
- **Security by Default**: Tailscale ACL with deny-by-default policy

## Build, Lint, and Test Commands

Since this is not a traditional npm project, testing follows the TDD protocol:

### Running Tests
```bash
# Before declaring any module complete, run tests:
# For Rust components:
cargo test

# For TypeScript/JavaScript components:
npm test

# For Python components:
pytest
```

### Testing Protocol
1. **Never declare work complete without test logs**
2. **Tests must pass before committing**
3. **End-to-end tests required for WebSocket communication**
4. **Sandbox isolation tests for all plugins**

## Code Style Guidelines

### TypeScript/JavaScript (Next.js Components)
- **Import Style**: Use absolute imports from the project root
- **Component Structure**: Functional components with TypeScript types
- **State Management**: Zustand stores with TypeScript interfaces
- **Error Boundaries**: Wrap all external components and plugins

```typescript
// Example: Plugin component structure
import { useStore } from '@/store/agentStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PluginComponent: React.FC<{ data: PluginData }> = ({ data }) => {
  const { updateState } = useStore();
  
  return (
    <ErrorBoundary fallback={<PluginError />}>
      {/* Component implementation */}
    </ErrorBoundary>
  );
};
```

### Rust (ZeroClaw Daemon)
- **Error Handling**: Use Result<T, E> for all operations
- **Async Patterns**: tokio for async operations
- **Logging**: Structured JSON logging
- **WebSocket Security**: JWT verification on handshake

### Communication Patterns
- **WebSocket Events**: Use structured TypeScript interfaces for all messages
- **Event Naming**: PascalCase for event types (e.g., "CanvasUpdate")
- **State Updates**: Immer-style immutable updates

```typescript
// WebSocket message interface
interface WebSocketMessage<T> {
  type: string;
  payload: T;
  timestamp: number;
  version: string;
}
```

### File Organization
```
web-ui/
├── src/
│   ├── components/     # Reusable UI components
│   ├── plugins/        # Feature plugins (isolated)
│   ├── services/       # API/WebSocket services
│   ├── store/          # Zustand stores
│   └── types/          # TypeScript definitions
├── public/             # Static assets
└── tests/              # Test files
```

### Plugin Development Rules
1. **Isolation**: Each plugin must be self-contained
2. **Sandbox**: Create with `scripts/create-sandbox.sh`
3. **Error Boundaries**: Mandatory for all plugins
4. **Testing**: Each plugin requires its own test suite

### WebSocket Communication
- **Connection**: JWT-secured WebSocket to ZeroClaw daemon
- **Message Format**: Structured TypeScript interfaces
- **Error Handling**: Graceful degradation on disconnect
- **Rate Limiting**: Implement on both client and server

### Security Guidelines
- **Token Management**: Secure JWT storage and transmission
- **Input Validation**: Validate all external inputs
- **CORS**: Configure appropriately for deployment
- **Environment Variables**: Never commit sensitive values

### Commit Guidelines
- **TDD Verification**: Tests must pass before commit
- **Atomic Commits**: One logical change per commit
- **Clear Messages**: Explain the "why" not just "what"
- **No Breaking Changes**: Without proper versioning

### Anti-Patterns to Avoid
- **No Type Suppression**: Never use `@ts-ignore` or `as any`
- **No Empty Catches**: Always handle or log errors
- **No Global State**: Use Zustand stores instead
- **No Direct DOM**: Use React refs and state

## Development Workflow
1. Create plugin in sandbox
2. Write tests before implementation
3. Implement with TypeScript
4. Test with WebSocket integration
5. Verify with E2E tests
6. Deploy only when all tests pass

## Performance Guidelines
- **Code Splitting**: Dynamic imports for heavy components
- **Memoization**: React.memo for expensive components
- **Virtualization**: For long lists
- **Bundle Analysis**: Monitor bundle size regularly

## ANTI-GRAVITY INTEGRATION

Ten projekt używa Antigravity System do orkiestracji zadań.

**Główna dokumentacja:** `D:\_WorkSpaces\antigravity-system\AGENTS.md`

### Dostępne funkcje:
- **Signal Pipeline:** `.signals/` — zadania dla workerów
- **Daemon:** WebSocket na porcie 8080
- **Router:** LLM fallback (NVIDIA → OpenRouter → Mistral → Ollama)

### Komendy:
```bash
# Status daemon
D:\_WorkSpaces\antigravity-system\daemon\cargo run -- --status

# Router chat
D:\_WorkSpaces\antigravity-system\router\python main.py --chat "prompt"

# Doctor check
D:\_WorkSpaces\antigravity-system\router\python main.py --doctor
```