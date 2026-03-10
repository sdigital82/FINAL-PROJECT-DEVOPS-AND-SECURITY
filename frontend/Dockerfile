FROM nginx:1.27.3-alpine

# Copy custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy site content
COPY html/ /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/

# Create ALL temp dirs nginx may need + give nginx user ownership
RUN mkdir -p \
      /var/cache/nginx/client_temp \
      /var/cache/nginx/proxy_temp \
      /var/cache/nginx/fastcgi_temp \
      /var/cache/nginx/uwsgi_temp \
      /var/cache/nginx/scgi_temp \
      /var/log/nginx \
      /var/run \
 && chown -R nginx:nginx \
      /var/cache/nginx \
      /var/log/nginx \
      /var/run \
      /usr/share/nginx/html \
      /etc/nginx \
 && chmod -R 755 \
      /var/cache/nginx \
      /var/log/nginx \
      /var/run \
      /usr/share/nginx/html

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
