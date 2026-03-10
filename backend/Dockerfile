# STAGE 1: Build Stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY server.js .

# STAGE 2: Final Runtime Stage, but patching the alphine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Updating OS packages to patch libcrypto3, busybox, and more, addressing  the vulnerabilities

RUN apk update && apk upgrade --no-cache

# Copy only the essentials from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./server.js

# Create a dedicated non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs -g nodejs nodejs

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Run as non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Starting the app
CMD ["node", "server.js"]
