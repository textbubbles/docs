# NOTE: The Nextra build currently has a _meta validation issue.
# This Dockerfile uses a pre-built out/ directory until that is fixed.
# Once fixed, uncomment the builder stage and use it instead.

# # ---------- build ----------
# FROM node:20-alpine AS builder
# RUN apk add --no-cache git
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN git config --global user.email "build@docker" && git config --global user.name "build" && \
#     git init && git add -A && git commit -m "build"
# RUN npm run build

# ---------- production ----------
FROM nginx:alpine
COPY out/ /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 3002;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
