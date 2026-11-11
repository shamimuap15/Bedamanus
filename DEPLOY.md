# Deploying to your own server (Ubuntu + pm2 + nginx)

One-time setup on the server (use an SSH key, not the root password):

```bash
# Node 20+, git, pm2, nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs git nginx
npm install -g pm2

git clone https://github.com/shamimuap15/Bedamanus.git /var/www/bedamanush
cd /var/www/bedamanush
cp .env.example .env && nano .env    # DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET
# local uploads (no Vercel Blob): add NEXT_PUBLIC_UPLOAD_MODE=local to .env
bash deploy/deploy.sh
pm2 startup && pm2 save              # restart on reboot
```

nginx (`/etc/nginx/sites-available/bedamanush`), then `certbot --nginx -d yourdomain.com`:

```nginx
server {
  server_name yourdomain.com;
  client_max_body_size 300M;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Every later update: `cd /var/www/bedamanush && bash deploy/deploy.sh`.

`npm run db:setup` is additive: it creates the `pages` table / `page_id` columns and puts existing
sections, products and orders on a "Home" page. Back up the database before the first run.
