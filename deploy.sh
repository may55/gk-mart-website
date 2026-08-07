#!/usr/bin/env bash
set -euo pipefail

VM_USER="${VM_USER:-ubuntu}"
VM_HOST="${VM_HOST:-15.252.148.214}"
SSH_KEY="${SSH_KEY:-${HOME}/.ssh/laptop-mac.pem}"
NGINX_SERVER_NAME="${NGINX_SERVER_NAME:-gkmart.co.in www.gkmart.co.in}"
VM_BASE_DIR="${VM_BASE_DIR:-/home/${VM_USER}/gkmart}"
VM_BACKEND_DIR="${VM_BACKEND_DIR:-${VM_BASE_DIR}/backend}"
VM_FRONTEND_DIR="${VM_FRONTEND_DIR:-/var/www/gkmart}"
VITE_API_URL="${VITE_API_URL:-https://${NGINX_SERVER_NAME%% *}}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

# SSH/SCP helpers that always use the configured key
vm_ssh() { ssh -i "${SSH_KEY}" "${VM_USER}@${VM_HOST}" "$@"; }
vm_scp() { scp -i "${SSH_KEY}" "$@"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

need_cmd npm
need_cmd bun
need_cmd ssh
need_cmd scp

if [[ ! -f "${SSH_KEY}" ]]; then
  echo "SSH key not found: ${SSH_KEY}" >&2
  echo "Set SSH_KEY=/path/to/your.pem before deploying." >&2
  exit 1
fi

if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  echo "backend/.env is missing. Create it before deploying." >&2
  exit 1
fi

echo "=========================================="
echo "Starting GK Mart Deployment"
echo "=========================================="

echo
echo ">>> Building Frontend locally..."
echo "=========================================="
cd "${FRONTEND_DIR}"
bun install
VITE_API_URL="${VITE_API_URL}" bun run build
cd "${ROOT_DIR}"
echo "Frontend build completed!"

echo
echo ">>> Building Backend locally..."
echo "=========================================="
cd "${BACKEND_DIR}"
npm ci
npm run build
cd "${ROOT_DIR}"
echo "Backend build completed!"

echo
echo ">>> Preparing remote directories..."
echo "=========================================="
vm_ssh bash <<EOF
set -euo pipefail
mkdir -p "${VM_BACKEND_DIR}/dist"
sudo mkdir -p "${VM_FRONTEND_DIR}"
sudo chown -R "${VM_USER}:${VM_USER}" "${VM_FRONTEND_DIR}" || true
EOF
echo "Remote directories ready!"

echo
echo ">>> Deploying Frontend to VM..."
echo "=========================================="
vm_scp -r "${FRONTEND_DIR}/dist/." "${VM_USER}@${VM_HOST}:${VM_FRONTEND_DIR}/"
echo "Frontend files copied!"

echo
echo ">>> Deploying Backend to VM..."
echo "=========================================="
vm_scp -r "${BACKEND_DIR}/dist" "${VM_USER}@${VM_HOST}:${VM_BACKEND_DIR}/"
vm_scp "${BACKEND_DIR}/package.json" "${VM_USER}@${VM_HOST}:${VM_BACKEND_DIR}/"
vm_scp "${BACKEND_DIR}/package-lock.json" "${VM_USER}@${VM_HOST}:${VM_BACKEND_DIR}/"
vm_scp "${BACKEND_DIR}/.env" "${VM_USER}@${VM_HOST}:${VM_BACKEND_DIR}/.env"
# ensure CORS origin matches where the frontend is actually served from
vm_ssh "sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=http://${NGINX_SERVER_NAME%% *}|' '${VM_BACKEND_DIR}/.env'"
echo "Backend files copied!"

echo
echo ">>> Configuring nginx..."
echo "=========================================="
vm_ssh "sudo tee /etc/nginx/sites-available/gkmart >/dev/null" <<EOF
server {
  listen 80;
  server_name ${NGINX_SERVER_NAME};

  root ${VM_FRONTEND_DIR};
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

vm_ssh bash <<EOF
set -euo pipefail
# increase bucket size to accommodate long hostnames (e.g. AWS EC2 public DNS)
echo 'server_names_hash_bucket_size 128;' | sudo tee /etc/nginx/conf.d/bucket_size.conf >/dev/null
sudo ln -sfn /etc/nginx/sites-available/gkmart /etc/nginx/sites-enabled/gkmart
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
EOF
echo "nginx configured!"

echo
echo ">>> Installing backend dependencies and restarting PM2..."
echo "=========================================="
vm_ssh bash <<EOF
set -euo pipefail
cd "${VM_BACKEND_DIR}"

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

npm ci --omit=dev

if pm2 describe gkmart-backend >/dev/null 2>&1; then
  pm2 restart gkmart-backend --update-env
else
  pm2 start dist/index.js --name gkmart-backend --update-env
fi

pm2 save
chmod 600 .env
EOF

echo
echo ">>> Provisioning SSL certificate..."
echo "=========================================="
vm_ssh bash <<'SSLEOF'
set -euo pipefail
if ! command -v certbot >/dev/null 2>&1; then
  sudo apt-get install -y certbot python3-certbot-nginx
fi
SSLEOF
# build -d flags from space-separated NGINX_SERVER_NAME
CERTBOT_DOMAINS=""
for d in ${NGINX_SERVER_NAME}; do CERTBOT_DOMAINS="${CERTBOT_DOMAINS} -d ${d}"; done
vm_ssh "sudo certbot --nginx -n --agree-tos --email admin@${NGINX_SERVER_NAME%% *} ${CERTBOT_DOMAINS} --redirect"
echo "SSL configured!"

echo
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo "Backend:  http://${VM_HOST}:3001"
echo "Frontend: https://${NGINX_SERVER_NAME%% *}/"
