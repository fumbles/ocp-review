FROM nginxinc/nginx-unprivileged:alpine

# Copy site assets
COPY index.html /usr/share/nginx/html/index.html
COPY css/        /usr/share/nginx/html/css/
COPY js/         /usr/share/nginx/html/js/

# Custom nginx config (port 8080 for OpenShift non-root SCC)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
