#!/usr/bin/env bash
# Run on the server from the project folder:  bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "Missing .env — copy .env.example to .env and fill it in first."; exit 1; }

git pull --ff-only
npm ci
npm run db:setup          # adds new tables/columns and backfills the home page (additive, keeps data)
npm run build

if pm2 describe bedamanush >/dev/null 2>&1; then
  pm2 restart bedamanush --update-env
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi
echo "Deployed. App is listening on port 3000."
