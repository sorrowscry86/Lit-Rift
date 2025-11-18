#!/bin/bash

# Lit-Rift Backup Script
# Usage: ./scripts/create-backup.sh [environment]

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y-%m-%d-%H-%M)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups/$ENVIRONMENT/$TIMESTAMP"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

echo_info "Creating backup for environment: $ENVIRONMENT"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup frontend build
if [ -d "$PROJECT_ROOT/frontend/build" ]; then
    cp -r "$PROJECT_ROOT/frontend/build" "$BACKUP_DIR/"
    echo_success "Frontend build backed up"
fi

# Backup environment files
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    cp "$PROJECT_ROOT/frontend/.env" "$BACKUP_DIR/.env.backup"
    echo_success "Environment file backed up"
fi

# Create backup manifest
cat > "$BACKUP_DIR/backup-info.json" <<EOF
{
  "environment": "$ENVIRONMENT",
  "timestamp": "$TIMESTAMP",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF

echo_success "Backup created: $BACKUP_DIR"

# Clean old backups (keep last 10)
echo_info "Cleaning old backups..."
cd "$PROJECT_ROOT/backups/$ENVIRONMENT"
ls -t | tail -n +11 | xargs -r rm -rf
echo_success "Old backups cleaned"

echo_success "Backup completed successfully!"
