Step 1: Launch the EC2 Instance
In the AWS Console:
- AMI: Ubuntu 24.04 LTS
- Instance type: t3.small (2 vCPU, 2 GB RAM) — $15/mo
- Key pair: Create or select one (you'll need the .pem file)
- Security Group: Open these ports:
Port	Source	Purpose
22	Your IP only	SSH
80	0.0.0.0/0	HTTP
443	0.0.0.0/0	HTTPS
- Storage: 30 GB gp3
- IAM Role: None needed
Step 2: Connect via SSH
# From your local machine
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
Step 3: Run these commands on the server
# ============================================
# 1. UPDATE SYSTEM
# ============================================
sudo apt-get update -y
sudo apt-get upgrade -y

# ============================================
# 2. INSTALL DOCKER
# ============================================
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) \
signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y

sudo apt-get install -y docker-ce docker-ce-cli \
  containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# ============================================
# 3. INSTALL OTHER TOOLS
# ============================================
sudo apt-get install -y git

# ============================================
# 4. LOG OUT AND BACK IN (for docker group)
# ============================================
exit
# SSH back in
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# ============================================
# 5. CLONE THE REPO
# ============================================
git clone https://github.com/YOUR_USERNAME/drivemotors.git
cd drivemotors

# ============================================
# 6. GENERATE SECRETS
# ============================================
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)

# Save secrets
echo "JWT_SECRET=$JWT_SECRET" > .env.production
echo "DB_PASSWORD=$DB_PASSWORD" >> .env.production

# ============================================
# 7. CREATE BACKEND ENV FILE
# ============================================
cat > backend/.env << EOF
PORT=5000
DB_HOST=database
DB_PORT=5432
DB_NAME=drivemotors
DB_USER=drivex
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=*
EOF

# ============================================
# 8. CREATE DATABASE ENV FILE
# ============================================
cat > database/.env << EOF
POSTGRES_DB=drivemotors
POSTGRES_USER=drivex
POSTGRES_PASSWORD=$DB_PASSWORD
EOF

# ============================================
# 9. CREATE NGINX CONFIG
# ============================================
cat > nginx.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# ============================================
# 10. UPDATE DOCKER-COMPOSE FOR SINGLE INSTANCE
# ============================================
cat > docker-compose.yml << 'COMPOSEEOF'
version: "3.9"

services:
  database:
    build: ./database
    env_file: ./database/.env
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U drivex -d drivemotors"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "127.0.0.1:5000:5000"
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  pgdata:
COMPOSEEOF

# ============================================
# 11. BUILD AND START EVERYTHING
# ============================================
docker compose build

docker compose up -d

# ============================================
# 12. WAIT FOR DATABASE TO BE READY
# ============================================
echo "Waiting for database..."
sleep 15

# ============================================
# 13. SEED THE DATABASE
# ============================================
docker compose exec -T backend node src/utils/seed.js

# ============================================
# 14. VERIFY IT'S RUNNING
# ============================================
docker compose ps
curl -s http://localhost/api/health | python3 -m json.tool

# ============================================
# 15. CHECK LOGS IF ANYTHING IS WRONG
# ============================================
# docker compose logs -f backend
# docker compose logs -f frontend
# docker compose logs -f database
# docker compose logs -f nginx
Step 4: Test it
Open your browser:
http://YOUR_EC2_PUBLIC_IP
You should see the DriveX homepage. Login with:
- Admin: admin@drivex.com / admin123
- Customer: customer@example.com / customer123
Step 5: Add SSL (optional, for domain)
# Only if you have a domain pointing to this IP

# Install certbot
sudo apt-get install -y certbot

# Get certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com

# Update nginx.conf with SSL block
cat > nginx.conf << 'NGINXEOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINXEOF

# Restart nginx to pick up SSL
docker compose restart nginx
Architecture on the Instance
Internet (port 80/443)
   │
   ▼
┌──── Nginx Container ─────────────────────┐
│  /api/*  → backend:5000                  │
│  /*      → frontend:80                   │
└──────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌── Backend ──────┐  ┌── Frontend ──┐
│  Node.js/Express │  │  Nginx+React  │
│  Port 5000       │  │  Port 3000    │
└────────┬─────────┘  └──────────────┘
         │
         ▼
┌── Database ─────┐
│  PostgreSQL 16   │
│  (internal only) │
└──────────────────┘
- Backend and database are only reachable from inside Docker — not exposed to the internet
- Only Nginx (port 80/443) is public
- Total cost: ~$15/mo** for the instance + **~$3/mo for EBS storage