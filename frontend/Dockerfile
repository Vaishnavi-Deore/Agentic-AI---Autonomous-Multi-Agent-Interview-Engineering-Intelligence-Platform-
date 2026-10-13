# ==============================================================================
# PrepMind AI - Production Frontend Dockerfile
# Multi-Stage Build: Node.js (Vite Build) -> Nginx (Alpine Production Serving)
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with caching layer
COPY package.json ./
RUN npm install

# Copy application source code
COPY . ./

# Build production bundle
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine AS runner

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
