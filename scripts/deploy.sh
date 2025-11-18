#!/bin/bash

# Lit-Rift Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, staging, production

set -e  # Exit on error

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: ./scripts/deploy.sh [development|staging|production]"
    exit 1
fi

echo_info "Starting deployment for environment: $ENVIRONMENT"

# Check for required tools
command -v node >/dev/null 2>&1 || { echo_error "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo_error "npm is required but not installed."; exit 1; }

# Navigate to project root
cd "$PROJECT_ROOT"

# 1. Run tests
if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
    echo_info "Running tests..."
    cd frontend
    npm test -- --watchAll=false --coverage=false || {
        echo_error "Tests failed. Deployment aborted."
        exit 1
    }
    echo_success "All tests passed"
    cd ..
fi

# 2. Build frontend
echo_info "Building frontend..."
cd frontend
npm run build || {
    echo_error "Frontend build failed"
    exit 1
}
echo_success "Frontend built successfully"
cd ..

# 3. Environment-specific configurations
case "$ENVIRONMENT" in
    development)
        echo_info "Development deployment"
        # No additional steps for development
        ;;

    staging)
        echo_info "Staging deployment"
        # Deploy to staging server
        if [ -f ".env.staging" ]; then
            echo_info "Loading staging environment variables"
            cp .env.staging frontend/.env
        fi
        ;;

    production)
        echo_info "Production deployment"
        # Additional production checks
        if [ ! -f ".env.production" ]; then
            echo_error ".env.production file not found"
            exit 1
        fi

        # Verify environment variables
        echo_info "Verifying production environment variables..."
        if ! grep -q "REACT_APP_API_URL" .env.production; then
            echo_error "REACT_APP_API_URL not found in .env.production"
            exit 1
        fi

        cp .env.production frontend/.env
        echo_success "Production environment configured"
        ;;
esac

# 4. Bundle size check
echo_info "Checking bundle size..."
MAIN_BUNDLE=$(find frontend/build/static/js -name "main.*.js" -exec ls -lh {} \; | awk '{print $5}')
echo_info "Main bundle size: $MAIN_BUNDLE"

# 5. Generate deployment manifest
echo_info "Generating deployment manifest..."
cat > frontend/build/deployment-info.json <<EOF
{
  "environment": "$ENVIRONMENT",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)"
}
EOF
echo_success "Deployment manifest created"

# 6. Success message
echo ""
echo_success "===================================="
echo_success "  Deployment completed successfully!"
echo_success "===================================="
echo ""
echo_info "Environment: $ENVIRONMENT"
echo_info "Build directory: frontend/build/"
echo_info "Main bundle: $MAIN_BUNDLE"
echo ""

# 7. Next steps
case "$ENVIRONMENT" in
    development)
        echo_info "Next steps for development:"
        echo "  1. Test the build: cd frontend && npx serve -s build"
        echo "  2. Deploy to development server"
        ;;

    staging)
        echo_info "Next steps for staging:"
        echo "  1. Upload frontend/build/ to staging server"
        echo "  2. Test at staging URL"
        echo "  3. Run smoke tests"
        ;;

    production)
        echo_info "Next steps for production:"
        echo "  1. Create backup of current deployment"
        echo "  2. Upload frontend/build/ to production server"
        echo "  3. Update DNS if needed"
        echo "  4. Run smoke tests"
        echo "  5. Monitor error logs and analytics"
        ;;
esac

echo ""
echo_success "Deployment script completed!"
