#!/bin/bash
set -e

echo "=== DriveX Motors Deployment ==="

# --- 1. System Updates ---
echo "[1/8] Updating system..."
sudo apt-get update -y
sudo apt-get upgrade -y

# --- 2. Install Docker ---
echo "[2/8] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# --- 3. Generate Secrets ---
echo "[3/8] Generating secrets..."
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)
echo "JWT_SECRET=$JWT_SECRET" > .env.production
echo "DB_PASSWORD=$DB_PASSWORD" >> .env.production
echo "Generated JWT_SECRET and DB_PASSWORD (saved to .env.production)"

# --- 4. Create .env for backend ---
echo "[4/8] Creating backend environment..."
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

# --- 5. Create .env for database ---
echo "[5/8] Creating database environment..."
cat > database/.env << EOF
POSTGRES_DB=drivemotors
POSTGRES_USER=drivex
POSTGRES_PASSWORD=$DB_PASSWORD
EOF

# --- 6. Configure docker-compose for single instance ---
echo "[6/8] Configuring docker-compose..."
cat > docker-compose.prod.yml << 'COMPOSEEOF'
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
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    depends_on:
      - nginx

volumes:
  pgdata:
COMPOSEEOF

# --- 7. Create Nginx config ---
echo "[7/8] Creating Nginx config..."
cat > nginx.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

# --- 8. Build and Start ---
echo "[8/8] Building and starting services..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Wait for database
echo "Waiting for database..."
sleep 10

# Seed the database
echo "Seeding database..."
docker compose -f docker-compose.prod.yml exec -T backend node src/utils/seed.js

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://YOUR_IP"
echo "Backend API: http://YOUR_IP/api/health"
echo ""
echo "Admin login: admin@drivex.com / admin123"
echo "Customer login: customer@example.com / customer123"
echo ""
echo "Secrets saved to .env.production"
echo ""
echo "For SSL, run:"
echo "  sudo certbot certonly --webroot -w /var/www/certbot -d YOUR_DOMAIN"
echo "  Then update nginx.conf with your domain and restart nginx"
