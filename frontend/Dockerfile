# Multi-stage Dockerfile for Wallet Frontend Service
# This file creates optimized Docker images for both development and production

# Accept build arguments for API configuration
ARG VITE_API_URL=http://localhost:3000
ARG VITE_API_TIMEOUT=30000
ARG VITE_ENABLE_MOCK_API=false

# Base stage - Common setup for all stages
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
# - curl: for health checks
# - dumb-init: for proper signal handling
RUN apk add --no-cache curl dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files for dependency installation
COPY package*.json ./

# Development stage - Used for local development with Vite dev server
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application source code
COPY . .

# Set environment variables for development
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_ENABLE_MOCK_API=$VITE_ENABLE_MOCK_API

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose Vite development server port
EXPOSE 5173

# Configure Vite to listen on all interfaces (required for Docker)
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# Use dumb-init and start Vite dev server
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# Build stage - Build the application for production
FROM base AS build

# Install all dependencies needed for building
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_ENABLE_MOCK_API=$VITE_ENABLE_MOCK_API

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la dist/

# Production stage - Serve built application with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy environment-specific configuration script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create non-root user for nginx
RUN addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Expose HTTP port
EXPOSE 80

# Health check for nginx
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Use custom entrypoint for environment variable injection
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
