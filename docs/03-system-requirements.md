
---
**Previous:** [02-system-architecture.md](../02-system-architecture.md) | **Next:** [04-installation-and-configuration.md](../04-installation-and-configuration.md)

## 3. System Requirements

### 3.1 Hardware Requirements

**Public Node (AWS EC2)**
- **CPU:** 2+ vCPUs
- **RAM:** 4GB minimum
- **Storage:** 20GB SSD
- **Network:** Public IP address

**Private Node (Home PC)**
- **CPU:** 4+ cores (modern processor recommended)
- **RAM:** 16GB minimum, 32GB+ recommended for LLM workloads
- **Storage:** 100GB+ SSD
- **Network:** Stable internet connection with Tailscale support

### 3.2 Software Requirements

**Public Node**
- **OS:** Ubuntu 22.04 LTS or equivalent
- **Runtime:** Node.js 18.x or 20.x
- **Web Server:** Nginx 1.18+
- **VPN:** Tailscale client
- **Container:** Docker 20.10+, Docker Compose 2.0+

**Private Node**
- **OS:** Ubuntu 22.04 LTS, macOS 12+, or Windows 11 with WSL2
- **Runtime:** 
  - Rust 1.70+ (for daemon)
  - Python 3.10+ (for router)
  - Node.js 18.x or 20.x (for MCP Memory)
- **Container:** Docker 20.10+, Docker Compose 2.0+
- **Process Manager:** systemd or PM2
- **VPN:** Tailscale client

**Development Environment**
- **IDE:** VS Code with Rust, Python, and TypeScript extensions
- **Git:** Version control
- **Optional:** Ollama for local LLM fallback

### 3.3 Network Requirements

- **Tailscale Account:** For secure VPN mesh network
- **Firewall Rules:**
  - Public Node: Allow 80/443 inbound, outbound to Tailscale
  - Private Node: Allow Tailscale ports, outbound to internet
  - WebSocket: Port 8080 (exposed via Tailscale)
  - Observability: Ports 3001 (Grafana), 9090 (Prometheus)

---

