
---
**Previous:** [08-api-and-endpoints.md](../08-api-and-endpoints.md) | **Next:** [10-testing.md](../10-testing.md)

## 9. Database

### 9.1 Database Architecture

**Current State:** ZeroClaw OS Dashboard does not use a traditional relational database (e.g., PostgreSQL, MySQL). The system relies on:

- **In-memory State:** Zustand stores with localStorage persistence
- **Task Storage:** In-memory maps in AntiGravity Router
- **Metrics:** Prometheus time-series database
- **Logs:** Loki (disabled) or structured logs

### 9.2 Memory MCP Module

**Not Available in Repository:** The MCP Memory module is referenced in the architecture but not implemented in the current codebase.

**Expected Functionality (based on documentation):**
- Graph-based or vector-based memory storage
- Short-term and long-term memory
- Integration with agents for memory persistence

### 9.3 Prometheus Metrics

Prometheus acts as a time-series database for metrics:

**Metrics Storage:**
- Stored in `prometheus_data` volume (Docker)
- Default retention: 15 days (configurable)
- Scraped every 15 seconds

**Key Metrics:**
- Connection metrics
- Request latency
- Error rates
- Provider-specific metrics

### 9.4 Future Database Plans

**Potential Integrations:**
- PostgreSQL for persistent task storage
- Redis for caching and pub/sub
- Vector database (e.g., Pinecone, Weaviate) for semantic search

**Not Implemented:** These are planned features and not available in the current repository.

---

