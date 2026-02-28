# ZeroClaw OS Dashboard - Documentation Index

Welcome to the ZeroClaw OS Dashboard documentation. This is organized into modular sections for easy navigation and reference.

## Quick Start

1. **New to ZeroClaw?** Start with [01-Project Overview](01-project-overview.md)
2. **Ready to install?** Jump to [04-Installation and Configuration](04-installation-and-configuration.md)
3. **Need help?** Check [12-Troubleshooting](12-troubleshooting.md)

## Documentation Sections

### 1. [Project Overview](01-project-overview.md)
- Purpose and functionality
- Key characteristics
- Split-Brain architecture introduction

### 2. [System Architecture](02-system-architecture.md)
- High-level architecture diagrams
- Split-Brain model details
- Communication flows
- Plugin architecture

### 3. [System Requirements](03-system-requirements.md)
- Hardware requirements (Public/Private nodes)
- Software requirements
- Network requirements

### 4. [Installation and Configuration](04-installation-and-configuration.md)
- Prerequisites
- Cloning the repository
- Environment configuration
- Building components
- Docker deployment
- Tailscale VPN setup
- Nginx configuration

### 5. [Project Structure](05-project-structure.md)
- Root directory structure
- Web UI structure
- Daemon structure (Rust)
- Router structure (Python)
- Docker structure
- Documentation structure

### 6. [Technologies and Tools](06-technologies-and-tools.md)
- Frontend technologies
- Backend technologies
- Security technologies
- Observability technologies
- Testing technologies
- Development tools
- LLM integration

### 7. [Features](07-features.md)
- Core features (Dashboard, Plugin System, State Management, WebSocket)
- Advanced features (TLDraw, Telegram, AntiGravity Router, Observability)
- Security features
- Developer features

### 8. [API and Endpoints](08-api-and-endpoints.md)
- WebSocket endpoints
- HTTP endpoints
- Message types
- AntiGravity Router API

### 9. [Database](09-database.md)
- Current database architecture
- Memory MCP module
- Prometheus metrics
- Future database plans

### 10. [Testing](10-testing.md)
- Testing strategy (TDD)
- Frontend testing (Vitest)
- Backend testing (Rust, Python)
- End-to-end testing
- Test coverage
- Continuous integration

### 11. [Deployment](11-deployment.md)
- Docker deployment
- Manual deployment
- AWS EC2 deployment
- Monitoring stack
- Environment-specific configurations
- Backup and recovery

### 12. [Troubleshooting](12-troubleshooting.md)
- Common issues and solutions
- Debugging tools
- Getting help

### 13. [Development Roadmap](13-development-roadmap.md)
- Planned features
- Known issues
- Feature branch: `feature/dashboard-plan`

### 14. [Contact and Support](14-contact-and-support.md)
- Project information
- Support channels
- Contributing guidelines
- Acknowledgments
- License
- Additional resources

## Appendix

### [Quick Reference](14-contact-and-support.md#appendix-a-quick-reference)
- Useful commands
- Default ports
- Environment variables
- File locations

## Archive

Historical documentation has been moved to the [archive/](archive/) folder:
- Architektura Systemu.md (Polish)
- Brainstorm_Session.md
- Plan Implementacji.md (Polish)
- Product Requirements Document.md (Polish)
- plans/
- reports/

## Getting Help

If you can't find what you're looking for:
1. Check the [Troubleshooting](12-troubleshooting.md) section
2. Search the documentation for keywords
3. Contact support (see [Contact and Support](14-contact-and-support.md))

---

**Version:** 0.1.0  
**Last Updated:** February 28, 2026
