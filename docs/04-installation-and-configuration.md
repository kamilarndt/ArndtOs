
---
**Previous:** [03-system-requirements.md](../03-system-requirements.md) | **Next:** [05-project-structure.md](../05-project-structure.md)

## 4. Installation and Configuration

### 4.1 Prerequisites

Before installation, ensure you have:

1. **Git** installed
2. **Docker** and **Docker Compose** installed
3. **Tailscale** account and client installed
4. **Node.js** (18.x or 20.x)
5. **Rust** toolchain (for daemon development)
6. **Python 3.10+** (for router)

### 4.2 Cloning the Repository

```bash
# Clone the repository
git clone <repository-url> ArndtOs
cd ArndtOs

# Initialize Antigravity System (if needed)
powershell -ExecutionPolicy Bypass -File bootstrap-antigravity.ps1
```

### 4.3 Environment Configuration

Create the environment file for Docker:

```bash
# Copy example environment file
cp docker/.env.example docker/.env

# Edit with your values
nano docker/.env
```

Required environment variables:

```bash
# JWT Secret for WebSocket authentication
# Generate a strong random secret in production
JWT_SECRET=your-strong-random-secret-here

# Telegram Bot Token (optional, for "Red Phone" feature)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Telegram User ID allowed to send commands
TELEGRAM_ALLOWED_USER=your-telegram-user-id

# Grafana Admin Credentials
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=change-this-password

# Daemon Configuration
DEV_MODE=false  # Set to 'true' only for development
```

### 4.4 Building Components

#### 4.4.1 Building the Web UI

```bash
cd web-ui

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

#### 4.4.2 Building the ZeroClaw Daemon

```bash
cd daemon

# Run development daemon
cargo run

# Build release binary
cargo build --release

# Run tests
cargo test
```

#### 4.4.3 Building the AntiGravity Router

```bash
cd router

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Run router
python -m src.router

# Run tests
pytest
```

### 4.5 Docker Deployment

```bash
# Navigate to docker directory
cd docker

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v
```

### 4.6 Tailscale VPN Configuration

1. **Install Tailscale on both nodes:**
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. **Login and authenticate:**
   ```bash
   sudo tailscale up
   ```

3. **Configure ACL (Access Control Lists) in Tailscale Admin Console:**
   ```json
   {
     "acls": [
       {
         "action": "accept",
         "src": ["tag:private-node"],
         "dst": ["tag:public-node:80", "tag:public-node:443"]
       },
       {
         "action": "accept",
         "src": ["tag:public-node"],
         "dst": ["tag:private-node:8080", "tag:private-node:*"]
       }
     ]
   }
   ```

4. **Assign tags to nodes:**
   ```bash
   # On public node
   sudo tailscale up --tag=public-node
   
   # On private node
   sudo tailscale up --tag=private-node
   ```

### 4.7 Nginx Configuration (Public Node)

Create Nginx configuration for reverse proxy:

```nginx
# /etc/nginx/sites-available/zeroclaw
server {
    listen 80;
    server_name your-domain.com;

    # Basic Auth or OIDC configuration here
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy to daemon via Tailscale
    location /ws {
        proxy_pass http://<private-node-tailscale-ip>:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/zeroclaw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

