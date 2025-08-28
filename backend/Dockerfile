# Multi-stage Dockerfile for Wallet Backend Service
# This file creates optimized Docker images for both development and production

# Base stage - Common setup for all stages
FROM node:18-alpine AS base

# Set working directory inside container
WORKDIR /app

# Install system dependencies required for native modules
# - curl: for health checks
# - dumb-init: for proper signal handling in containers
RUN apk add --no-cache curl dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files for dependency installation
COPY package*.json ./

# Development stage - Used for local development with hot reload
FROM base AS development

# Install all dependencies (including devDependencies for development)
RUN npm ci

# Copy application source code
COPY . .

# Change ownership of app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3000

# Use dumb-init to handle signals properly and start with nodemon for hot reload
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Production dependencies stage - Install only production dependencies
FROM base AS prod-deps

# Set NODE_ENV to production to skip devDependencies
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage - Optimized for production deployment
FROM base AS production

# Set environment to production
ENV NODE_ENV=production

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Remove development-only files and directories
RUN rm -rf \
    .env.example \
    .gitignore \
    README.md \
    *.md \
    tests/ \
    docs/ \
    .git/

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user for security
USER nodejs

# Expose application port
EXPOSE 3000

# Health check to monitor application status
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Use dumb-init for proper signal handling and start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
