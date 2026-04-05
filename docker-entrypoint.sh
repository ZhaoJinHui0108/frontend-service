#!/bin/sh
set -e

BACKEND_HOST=${BACKEND_HOST:-localhost}
BACKEND_PORT=${BACKEND_PORT:-8000}

cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT}/services/user/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

exec "$@"