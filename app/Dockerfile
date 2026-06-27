## Stage 1 — build the Vite/React app
FROM node:22-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

## Stage 2 — serve with nginx (non-root for OpenShift SCC)
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
