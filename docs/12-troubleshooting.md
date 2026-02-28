
---
**Previous:** [11-deployment.md](../11-deployment.md) | **Next:** [13-development-roadmap.md](../13-development-roadmap.md)

## 12. Troubleshooting

### 12.1 Common Issues

#### 12.1.1 WebSocket Connection Failed

**Symptoms:**
- Dashboard shows "disconnected" status
- Console shows WebSocket connection errors
- "JWT token required" error in logs

**Solutions:**

1. **Check daemon is running:**
   ```bash
   # Check if daemon is listening
   curl http://localhost:8080/health
   ```

2. **Verify JWT token:**
   - Ensure token is passed as query parameter
   - Check token is not expired
   - Validate JWT_SECRET matches between client and server

3. **Check network connectivity:**
   ```bash
   # Test WebSocket endpoint
   wscat -c "ws://localhost:8080/ws?token=<jwt>"
   ```

4. **Review logs:**
   ```bash
   # Daemon logs
   docker-compose logs zeroclaw
   # or
   journalctl -u zeroclaw-daemon -f
   ```

#### 12.1.2 WebSocket Auto-Reconnect Issues

**Symptoms:**
- Connection drops and doesn't reconnect
- Multiple connection attempts in logs

**Solutions:**

1. **Check WebSocket URL:**
   - Verify `WS_URL` in `web-ui/src/services/websocket.ts`
   - Ensure port matches daemon configuration (default: 8080)

2. **Check rate limiting:**
   - If rate limit exceeded, wait for cooldown
   - Adjust rate limiter configuration if needed

3. **Verify daemon health:**
   ```bash
   curl http://localhost:8080/health
   ```

#### 12.1.3 Plugin Loading Failed

**Symptoms:**
- Plugin appears in registry but fails to load
- Error boundary catches plugin errors
- Plugin shows "error" status

**Solutions:**

1. **Check plugin manifest:**
   - Ensure `manifest.json` is valid JSON
   - Verify `entry` path is correct
   - Check `enabled` field is set to `true`

2. **Check plugin dependencies:**
   - Review plugin imports
   - Ensure dependencies are installed

3. **Review console errors:**
   - Open browser DevTools
   - Check Console tab for specific errors

4. **Test in isolation:**
   - Use sandbox to test plugin independently
   ```bash
   ./scripts/create-sandbox.sh my-plugin
   ```

#### 12.1.4 Authentication Failed (401 Unauthorized)

**Symptoms:**
- WebSocket connection rejected with 401
- "Invalid token" error message
- Connection fails immediately

**Solutions:**

1. **Generate new JWT token:**
   - Ensure token is generated correctly
   - Check token expiration time

2. **Verify JWT_SECRET:**
   - Ensure JWT_SECRET is set in environment
   - Check for typos in secret value

3. **Check dev mode:**
   - If using dev mode, ensure `DEV_MODE=true`
   - Ensure connection is from localhost

4. **Validate token format:**
   - Token should be in format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Three parts separated by dots

#### 12.1.5 Rate Limit Exceeded (429)

**Symptoms:**
- Requests rejected with 429 status
- Too many connection attempts

**Solutions:**

1. **Wait for rate limit reset:**
   - Rate limit resets periodically (default: 1 second per request)
   - Wait before retrying

2. **Adjust rate limiter:**
   - Modify rate limiter configuration in `daemon/src/rate_limiter.rs`
   - Increase burst capacity or refill rate

3. **Check for connection loops:**
   - Ensure reconnection logic doesn't create rapid reconnections
   - Add exponential backoff to reconnection logic

#### 12.1.6 Docker Container Won't Start

**Symptoms:**
- Container exits immediately
- `docker-compose up` shows errors
- Service status is "Exited"

**Solutions:**

1. **Check container logs:**
   ```bash
   docker-compose logs <service-name>
   ```

2. **Check environment variables:**
   - Ensure `.env` file exists
   - Verify all required variables are set
   - Check for syntax errors

3. **Check port conflicts:**
   - Verify ports are not already in use
   ```bash
   # Check port usage
   netstat -tulpn | grep <port>
   ```

4. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

#### 12.1.7 Telegram Bot Not Responding

**Symptoms:**
- Bot doesn't respond to commands
- No messages in Telegram
- Logs show Telegram connection errors

**Solutions:**

1. **Verify bot token:**
   - Ensure `TELEGRAM_BOT_TOKEN` is set correctly
   - Test token via curl:
     ```bash
     curl https://api.telegram.org/bot<TOKEN>/getMe
     ```

2. **Check user ID:**
   - Ensure `TELEGRAM_ALLOWED_USER` is set to your Telegram user ID
   - Get your ID by messaging @userinfobot

3. **Review daemon logs:**
   ```bash
   docker-compose logs zeroclaw | grep telegram
   ```

4. **Start Telegram bot manually:**
   - Ensure bot is started in daemon
   - Check `daemon/src/main.rs` for bot initialization

#### 12.1.8 LLM Provider Failures

**Symptoms:**
- Tasks stuck in "running" status
- All providers fail
- Router logs show provider errors

**Solutions:**

1. **Check API keys:**
   - Ensure API keys are set for all providers
   - Verify keys are valid and have sufficient credits

2. **Test provider endpoints:**
   ```bash
   # Test NVIDIA API
   curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \
     -H "Authorization: Bearer <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"model":"meta/llama-3.1-405b-instruct","messages":[{"role":"user","content":"test"}]}'
   ```

3. **Check provider availability:**
   - Verify provider services are operational
   - Check for service outages

4. **Enable Ollama fallback:**
   - Install and run Ollama locally
   - Configure Ollama as last fallback
   ```bash
   ollama run llama3
   ```

#### 12.1.9 State Not Persisting

**Symptoms:**
- UI state lost on page refresh
- Settings reset after reload
- Zustand store returns to defaults

**Solutions:**

1. **Check localStorage:**
   - Open browser DevTools
   - Application tab > Local Storage
   - Verify `zeroclaw-ui`, `zeroclaw-agent` keys exist

2. **Clear storage and reload:**
   - Clear localStorage
   - Refresh page
   - Check if state persists

3. **Check persist middleware:**
   - Ensure `persist` is configured in stores
   - Check storage key names match

4. **Verify browser settings:**
   - Ensure localStorage is enabled
   - Check for privacy extensions blocking storage

#### 12.1.10 Tailscale Connection Issues

**Symptoms:**
- Nodes cannot communicate
- "Connection refused" errors
- Tailscale status shows offline

**Solutions:**

1. **Check Tailscale status:**
   ```bash
   sudo tailscale status
   ```

2. **Verify node is logged in:**
   ```bash
   sudo tailscale up
   ```

3. **Check ACL configuration:**
   - Review ACL in Tailscale admin console
   - Ensure tags are assigned correctly
   - Verify allow rules are present

4. **Test connectivity:**
   ```bash
   # Ping remote node by Tailscale IP
   ping <remote-node-tailscale-ip>
   ```

### 12.2 Debugging Tools

#### 12.2.1 Browser DevTools

**Console:**
- View JavaScript errors
- Debug WebSocket connections
- Monitor network requests

**Network Tab:**
- Inspect WebSocket frames
- Check HTTP requests
- View request/response headers

**Application Tab:**
- Check localStorage state
- Inspect cookies (if any)
- View IndexedDB (if used)

#### 12.2.2 Docker Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f zeroclaw

# Execute command in container
docker-compose exec zeroclaw sh

# View resource usage
docker stats

# Inspect container
docker inspect <container-id>
```

#### 12.2.3 Systemd Commands

```bash
# View service status
sudo systemctl status zeroclaw-daemon

# View logs
sudo journalctl -u zeroclaw-daemon -f

# Restart service
sudo systemctl restart zeroclaw-daemon

# Enable service on boot
sudo systemctl enable zeroclaw-daemon
```

#### 12.2.4 Monitoring

**Prometheus:**
- Access metrics at `http://localhost:9090`
- Query metrics in "Graph" tab
- Example queries:
  - `rate(zeroclaw_request_latency_seconds[5m])`
  - `zeroclaw_active_connections`

**Grafana:**
- Access dashboard at `http://localhost:3001`
- Configure Prometheus datasource
- Create custom dashboards

### 12.3 Getting Help

If you encounter issues not covered here:

1. **Check logs thoroughly** for error messages
2. **Review configuration** for typos or missing values
3. **Consult the documentation** in the `docs/` directory
4. **Check GitHub issues** if repository is public
5. **Contact support** (see Section 14)

---

