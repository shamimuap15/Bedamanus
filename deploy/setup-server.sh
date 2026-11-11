#!/usr/bin/env bash
# One-shot setup for a fresh Ubuntu server. Run as root:
#   curl -fsSL https://raw.githubusercontent.com/shamimuap15/Bedamanus/main/deploy/setup-server.sh | bash
# Optional: ADMIN_PASSWORD='...' ADMIN_USERNAME='...' DOMAIN='example.com' before `bash`.
# Safe to re-run: keeps an existing .env and database.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

APP_DIR=/var/www/bedamanush
REPO=https://github.com/shamimuap15/Bedamanus.git
DB_NAME=bedamanush
DB_USER=bedamanush
DOMAIN="${DOMAIN:-_}"

[ "$(id -u)" = 0 ] || { echo "Run as root."; exit 1; }

echo "==> Installing packages"
apt-get update -y
apt-get install -y curl git nginx postgresql ca-certificates openssl
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

echo "==> Fetching code"
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then git -C "$APP_DIR" pull --ff-only; else git clone "$REPO" "$APP_DIR"; fi
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "==> Creating database and .env"
  DB_PASS="$(openssl rand -hex 16)"
  ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
  ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 12 | tr -d '/+=' | cut -c1-14)}"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';" 2>/dev/null \
    || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE $DB_USER PASSWORD '$DB_PASS';"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
    || sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
  cat > .env <<ENV
DATABASE_URL=postgres://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
AUTH_SECRET=$(openssl rand -hex 32)
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_UPLOAD_MODE=local
ENV
  chmod 600 .env
  echo
  echo "  ADMIN LOGIN  ->  $ADMIN_USERNAME / $ADMIN_PASSWORD   (save this now; it is stored in $APP_DIR/.env)"
  echo
fi

echo "==> Building and starting the app"
mkdir -p public/uploads
bash deploy/deploy.sh

echo "==> Configuring nginx"
cat > /etc/nginx/sites-available/bedamanush <<NGINX
server {
  listen 80 default_server;
  server_name $DOMAIN;
  client_max_body_size 300M;
  location /uploads/ { alias $APP_DIR/public/uploads/; expires 30d; }
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
ln -sf /etc/nginx/sites-available/bedamanush /etc/nginx/sites-enabled/bedamanush
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
pm2 save

echo
echo "Done. Open http://$(curl -s ifconfig.me || echo your-server-ip)/  (admin at /admin)"
