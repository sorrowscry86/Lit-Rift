#!/bin/bash

# Lit-Rift Rollback Script
# Usage: ./scripts/rollback.sh [environment] [backup-timestamp]
# Example: ./scripts/rollback.sh production 2025-11-18-14-30

set -e

ENVIRONMENT=${1:-production}
BACKUP_TIMESTAMP=$2
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Validate parameters
if [ -z "$BACKUP_TIMESTAMP" ]; then
    echo_error "Backup timestamp required"
    echo "Usage: ./scripts/rollback.sh [environment] [backup-timestamp]"
    echo "Example: ./scripts/rollback.sh production 2025-11-18-14-30"
    exit 1
fi

echo_info "Starting rollback for environment: $ENVIRONMENT"
echo_info "Backup timestamp: $BACKUP_TIMESTAMP"

# Check if backup exists
BACKUP_DIR="$PROJECT_ROOT/backups/$ENVIRONMENT/$BACKUP_TIMESTAMP"
if [ ! -d "$BACKUP_DIR" ]; then
    echo_error "Backup not found: $BACKUP_DIR"
    echo_info "Available backups:"
    ls -1 "$PROJECT_ROOT/backups/$ENVIRONMENT/" 2>/dev/null || echo "  No backups found"
    exit 1
fi

# Confirmation prompt for production
if [ "$ENVIRONMENT" = "production" ]; then
    echo_error "WARNING: You are about to rollback PRODUCTION"
    echo_info "Backup: $BACKUP_TIMESTAMP"
    read -p "Type 'rollback' to confirm: " CONFIRM
    if [ "$CONFIRM" != "rollback" ]; then
        echo_error "Rollback cancelled"
        exit 1
    fi
fi

# Create backup of current state before rollback
CURRENT_TIMESTAMP=$(date +%Y-%m-%d-%H-%M)
CURRENT_BACKUP_DIR="$PROJECT_ROOT/backups/$ENVIRONMENT/before-rollback-$CURRENT_TIMESTAMP"

echo_info "Creating backup of current state..."
mkdir -p "$CURRENT_BACKUP_DIR"
cp -r "$PROJECT_ROOT/frontend/build" "$CURRENT_BACKUP_DIR/" 2>/dev/null || true
echo_success "Current state backed up to: $CURRENT_BACKUP_DIR"

# Perform rollback
echo_info "Restoring from backup..."
rm -rf "$PROJECT_ROOT/frontend/build"
cp -r "$BACKUP_DIR/build" "$PROJECT_ROOT/frontend/"
echo_success "Files restored from backup"

# Verify rollback
if [ -f "$PROJECT_ROOT/frontend/build/deployment-info.json" ]; then
    echo_info "Restored deployment info:"
    cat "$PROJECT_ROOT/frontend/build/deployment-info.json"
fi

echo ""
echo_success "===================================="
echo_success "  Rollback completed successfully!"
echo_success "===================================="
echo ""
echo_info "Environment: $ENVIRONMENT"
echo_info "Restored from: $BACKUP_TIMESTAMP"
echo_info "Current state backed up to: before-rollback-$CURRENT_TIMESTAMP"
echo ""
echo_info "Next steps:"
echo "  1. Redeploy the restored build to server"
echo "  2. Verify application is working"
echo "  3. Monitor error logs"
echo ""
