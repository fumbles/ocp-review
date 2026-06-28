## Single stage — serve pre-built dist with nginx (non-root for OpenShift SCC)
## The Vite build runs locally (npm run build inside app/) before docker buildx.
## This avoids QEMU segfaults when cross-compiling node:alpine for amd64 on ARM hosts.
FROM nginxinc/nginx-unprivileged:alpine

COPY app/dist /usr/share/nginx/html
COPY app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
