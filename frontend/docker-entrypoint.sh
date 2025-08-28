#!/bin/sh
# Docker entrypoint script for Wallet Frontend
# Handles runtime environment variable injection for production builds

set -e

# Function to log messages with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [FRONTEND] $1"
}

log "Starting Wallet Frontend container..."

# Inject runtime environment variables into the built application
# This allows changing configuration without rebuilding the Docker image
inject_env_vars() {
    local html_file="/usr/share/nginx/html/index.html"
    
    if [ -f "$html_file" ]; then
        log "Injecting runtime environment variables..."
        
        # Create a temporary file with environment variables
        cat > /tmp/env-config.js << EOF
window.ENV = {
  VITE_API_URL: '${VITE_API_URL:-http://localhost:3000}',
  VITE_API_TIMEOUT: '${VITE_API_TIMEOUT:-30000}',
  VITE_ENABLE_MOCK_API: '${VITE_ENABLE_MOCK_API:-false}'
};
EOF
        
        # Copy the environment configuration to the web root
        cp /tmp/env-config.js /usr/share/nginx/html/
        
        # Inject the script tag into index.html if not already present
        if ! grep -q "env-config.js" "$html_file"; then
            sed -i 's|</head>|  <script src="/env-config.js"></script>\n  </head>|' "$html_file"
            log "Environment configuration injected into index.html"
        else
            log "Environment configuration already present in index.html"
        fi
        
        log "Runtime environment variables:"
        log "  VITE_API_URL: ${VITE_API_URL:-http://localhost:3000}"
        log "  VITE_API_TIMEOUT: ${VITE_API_TIMEOUT:-30000}"
        log "  VITE_ENABLE_MOCK_API: ${VITE_ENABLE_MOCK_API:-false}"
    else
        log "Warning: index.html not found at $html_file"
    fi
}

# Only inject environment variables in production mode
if [ "${NODE_ENV:-production}" = "production" ]; then
    inject_env_vars
fi

# Set proper permissions for nginx
chown -R nginx:nginx /usr/share/nginx/html 2>/dev/null || true

log "Frontend container initialization complete"

# Execute the main command (nginx)
exec "$@"
