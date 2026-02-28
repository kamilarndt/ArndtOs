
---
**Previous:** [10-testing.md](../10-testing.md) | **Next:** [12-troubleshooting.md](../12-troubleshooting.md)

## 11. Deployment

### 11.1 Docker Deployment

#### 11.1.1 Using Docker Compose

The recommended deployment method is using Docker Compose.

**Prerequisites:**
- Docker installed
- Docker Compose installed
- Environment variables configured

**Steps:**

```bash
# Navigate to docker directory
cd docker

# Copy and configure environment file
cp .env.example .env
nano .env  # Add your values

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 11.1.2 Service Details

**Services Defined in `docker-compose.yml`:**

| Service | Port | Description |
|---------|------|-------------|
| web-ui | 3003 | Next.js frontend |
| zeroclaw | 8081 | ZeroClaw daemon (WebSocket) |
| prometheus | 9090 | Metrics collection |
| grafana | 3001 | Metrics visualization |

**Health Checks:**

All services include health checks:

- **web-ui:** HTTP GET to `http://127.0.0.1:3000`
- **zeroclaw:** HTTP GET to `http://localhost:8080/health`
- **prometheus/grafana:** Container-level health checks

**Restart Policy:** `unless-stopped` (auto-restart on failure)

#### 11.1.3 Production Build

**For web-ui:**
```bash
cd web-ui
npm run build
```

**For daemon:**
```bash
cd daemon
cargo build --release
```

**For router:**
```bash
cd router
pip install -e .
```

### 11.2 Manual Deployment

#### 11.2.1 Web UI Deployment

**PM2 Process Manager:**

```bash
# Install PM2
npm install -g pm2

# Start web-ui
cd web-ui
npm run build
pm2 start npm --name "web-ui" -- start

# View logs
pm2 logs web-ui

# Monitor
pm2 monit
```

**systemd Service:**

```ini
# /etc/systemd/system/web-ui.service
[Unit]
Description=ZeroClaw Web UI
After=network.target

[Service]
Type=simple
User=zeroclaw
WorkingDirectory=/opt/zeroclaw/web-ui
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable web-ui
sudo systemctl start web-ui
```

#### 11.2.2 Daemon Deployment

**systemd Service:**

```ini
# /etc/systemd/system/zeroclaw-daemon.service
[Unit]
Description=ZeroClaw Daemon
After=network.target

[Service]
Type=simple
User=zeroclaw
WorkingDirectory=/opt/zeroclaw/daemon
ExecStart=/opt/zeroclaw/daemon/target/release/zeroclaw-daemon
Restart=always
RestartSec=10
Environment="JWT_SECRET=your-secret-here"
Environment="TELEGRAM_BOT_TOKEN=your-bot-token"
Environment="TELEGRAM_ALLOWED_USER=your-user-id"

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable zeroclaw-daemon
sudo systemctl start zeroclaw-daemon

# View logs
sudo journalctl -u zeroclaw-daemon -f
```

#### 11.2.3 Router Deployment

**systemd Service:**

```ini
# /etc/systemd/system/zeroclaw-router.service
[Unit]
Description=ZeroClaw Router
After=network.target

[Service]
Type=simple
User=zeroclaw
WorkingDirectory=/opt/zeroclaw/router
Environment="PATH=/opt/zeroclaw/router/venv/bin"
ExecStart=/opt/zeroclaw/router/venv/bin/python -m src.router
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable zeroclaw-router
sudo systemctl start zeroclaw-router
```

### 11.3 AWS EC2 Deployment (Public Node)

#### 11.3.1 EC2 Instance Setup

**Recommended Instance Type:** `t3.medium` (2 vCPU, 4GB RAM)

**Security Groups:**
- Inbound: HTTP (80), HTTPS (443)
- Outbound: All traffic (for Tailscale)

#### 11.3.2 Nginx Configuration

See Section 4.7 for detailed Nginx configuration.

#### 11.3.3 SSL/TLS Setup

**Using Let's Encrypt:**

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 11.4 Monitoring Stack Deployment

**Observability Stack is included in `docker-compose.yml`:**

```bash
cd docker
docker-compose up -d prometheus grafana
```

**Access Dashboards:**
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (admin/admin)

**Configure Prometheus Datasource in Grafana:**

1. Login to Grafana
2. Navigate to Configuration > Data Sources
3. Add Prometheus
4. URL: `http://prometheus:9090`
5. Save & Test

### 11.5 Environment-Specific Configurations

#### 11.5.1 Development

```bash
# docker/.env
DEV_MODE=true
JWT_SECRET=dev-secret
```

**Features:**
- Bypass JWT for localhost connections
- Verbose logging
- Hot reload enabled

#### 11.5.2 Staging

```bash
# docker/.env
DEV_MODE=false
JWT_SECRET=staging-secret-here
```

**Features:**
- JWT required
- Reduced logging
- Production-like environment

#### 11.5.3 Production

```bash
# docker/.env
DEV_MODE=false
JWT_SECRET=<strong-random-secret>
TELEGRAM_BOT_TOKEN=<production-token>
TELEGRAM_ALLOWED_USER=<authorized-user-id>
```

**Features:**
- Strict JWT validation
- Optimized logging (JSON format)
- Health checks enabled
- Rate limiting enforced

### 11.6 Backup and Recovery

**Not Available in Repository:** Backup scripts or automated backup solutions are not present.

**Recommended Backup Strategy:**
1. **Environment Variables:** Secure storage (e.g., AWS Secrets Manager)
2. **Configuration Files:** Git repository
3. **Data Volumes:** Periodic snapshots
4. **Logs:** Centralized logging (e.g., Loki, CloudWatch)

---

