# ArndtOS & ZeroClaw Agent

ArndtOS is a development environment integrated with the **ZeroClaw** framework, providing a powerful AI assistant capable of performing complex coding tasks, monitoring Z.AI usage, and managing workspace operations.

## Key Features

- **ZeroClaw Integration**: A robust framework for AI agents to interact with the system via terminal, REST, and WebSockets.
- **Claude Code Integration**: Leverage the power of `claude` CLI for advanced code generation, refactoring, and algorithm design.
- **Z.AI Token Monitoring**: Built-in safety mechanism to monitor token usage and prevent exceeding 85% of the allocated limit.
- **Proactive Workspace Management**: Watchers and recommendations to keep the workspace clean and efficient.

## Project Structure

- `src/`: Core logic, memory systems (SQLite, Graph, Evolving), and tools.
- `config.toml`: Central configuration for project security and settings.
- `zeroclaw.Dockerfile`: Environment definition for the ZeroClaw runtime.
- `z_token_monitor.py`: Python script for real-time Z.AI quota monitoring.
- `SOUL.md`: System consciousness and operating principles for the AI agent.

## Getting Started

1. **Configure Environment**: Ensure `.env` and `config.toml` are correctly set up.
2. **Start ZeroClaw**: Use `docker compose up -d` to launch the runtime.
3. **Usage Monitoring**: Check Z.AI usage with `claude -p "/glm-plan-usage:usage-query"`.

## Development

- Clean code (DRY, early returns).
- TypeScript for core logic.
- Modular memory and tool architecture.
