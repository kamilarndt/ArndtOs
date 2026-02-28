
---
**Previous:** [13-development-roadmap.md](../13-development-roadmap.md) | 

## 14. Contact and Support

### 14.1 Project Information

**Project Name:** ZeroClaw OS Dashboard  
**Version:** 0.1.0  
**License:** Not specified in repository  
**Repository:** Not specified in repository

### 14.2 Support Channels

**Not Available in Repository:** Contact information, support channels, and community resources are not present in the repository.

**Recommended Support Channels:**

1. **GitHub Issues:** If repository is public
2. **Discord/Slack:** Community chat (if configured)
3. **Email:** Direct contact with maintainers
4. **Documentation:** Review existing documentation in `docs/` directory

### 14.3 Contributing

**Contribution Guidelines:**

- Fork the repository
- Create a feature branch
- Follow the development workflow in `AGENTS.md`
- Write tests for all changes (TDD)
- Ensure all tests pass
- Submit a pull request with clear description

**Code Style:**

- Follow existing code patterns
- Use TypeScript for frontend code
- Use Rust for daemon code
- Use Python for router code
- Write clear commit messages

### 14.4 Acknowledgments

**Not Available in Repository:** No acknowledgments or credits section exists in the repository.

**Acknowledgments (Based on Dependencies):**

- **Next.js Team:** For the excellent React framework
- **Rust Community:** For tokio, axum, and other crates
- **Python Community:** For FastAPI, Pydantic, and other libraries
- **TLDraw Team:** For the interactive canvas library
- **Zustand Team:** For the state management library
- **Prometheus & Grafana Teams:** For observability tools
- **Tailscale Team:** For secure mesh networking

### 14.5 License

**Not Available in Repository:** License information is not present in the repository.

**Typical Open Source Licenses:**
- MIT License
- Apache License 2.0
- GPL License

**Note:** Users should verify the license before using or contributing to the project.

### 14.6 Additional Resources

**Internal Documentation:**

- `AGENTS.md`: Development guide (this project)
- `docs/Architektura Systemu.md`: System architecture (Polish)
- `docs/Product Requirements Document.md`: Product requirements (Polish)
- `docs/Plan Implementacji.md`: Implementation plan (Polish)

**External Documentation:**

- **Next.js:** https://nextjs.org/docs
- **Rust:** https://doc.rust-lang.org/
- **Axum:** https://docs.rs/axum
- **FastAPI:** https://fastapi.tiangolo.com/
- **TLDraw:** https://tldraw.dev/
- **Zustand:** https://github.com/pmndrs/zustand
- **Prometheus:** https://prometheus.io/docs/
- **Grafana:** https://grafana.com/docs/
- **Tailscale:** https://tailscale.com/kb/

---

## Appendix A: Quick Reference

### A.1 Useful Commands

```bash
# Development
npm run dev              # Start web-ui dev server
cargo run               # Start daemon dev server
pytest                  # Run Python tests

# Building
npm run build           # Build web-ui
cargo build --release   # Build daemon release
pip install -e .        # Install router

# Testing
npm test                # Run frontend tests
cargo test              # Run Rust tests
pytest                  # Run Python tests

# Docker
docker-compose up -d    # Start all services
docker-compose down      # Stop all services
docker-compose logs -f  # View logs

# Monitoring
curl http://localhost:8080/health  # Check daemon health
```

### A.2 Default Ports

| Service | Port | Description |
|---------|------|-------------|
| Web UI (Dev) | 3000 | Next.js dev server |
| Web UI (Docker) | 3003 | Next.js container |
| ZeroClaw Daemon | 8080/8081 | WebSocket/HTTP |
| Prometheus | 9090 | Metrics |
| Grafana | 3001 | Metrics visualization |

### A.3 Environment Variables

```bash
JWT_SECRET                  # JWT secret for authentication
TELEGRAM_BOT_TOKEN         # Telegram bot token
TELEGRAM_ALLOWED_USER       # Allowed Telegram user ID
GRAFANA_ADMIN_USER          # Grafana admin username
GRAFANA_ADMIN_PASSWORD      # Grafana admin password
DEV_MODE                    # Enable dev mode (true/false)

# LLM Provider Keys
NVIDIA_API_KEY              # NVIDIA API key
OPENROUTER_API_KEY          # OpenRouter API key
MISTRAL_API_KEY             # Mistral API key
```

### A.4 File Locations

```
Configuration: .env
Logs: docker-compose logs <service>
Build artifacts: target/ (Rust), .next/ (Next.js)
Test files: **/*.test.tsx, **/*.test.rs, tests/
Documentation: docs/
```

---

**Document End**

*This documentation was generated based on analysis of the ZeroClaw OS Dashboard project repository. Some sections marked as "Not Available in Repository" indicate that specific files or information were not present in the analyzed codebase.*