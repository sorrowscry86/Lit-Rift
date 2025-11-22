#!/bin/bash

# Docker Run Script for Lit-Rift
# Manages Docker Compose operations for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="lit-rift"
ENV_FILE="${ENV_FILE:-.env}"

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed or not available as 'docker compose'"
        exit 1
    fi

    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        print_warn "Environment file not found at $ENV_FILE"
        print_info "Using default environment variables"
    fi

    print_info "Prerequisites check passed"
}

# Start services
start_services() {
    local env=$1
    local compose_file="docker-compose.${env}.yml"

    print_step "Starting services in ${env} mode..."

    if [ ! -f "$compose_file" ]; then
        print_error "Compose file not found: $compose_file"
        exit 1
    fi

    docker compose -f $compose_file -p ${PROJECT_NAME}-${env} up -d

    print_info "Services started successfully"
    print_info "Access the application at:"
    if [ "$env" = "dev" ]; then
        print_info "  - Frontend: http://localhost:3000"
        print_info "  - Backend: http://localhost:5000"
    else
        print_info "  - Frontend: http://localhost"
        print_info "  - Backend: http://localhost:5000"
    fi
}

# Stop services
stop_services() {
    local env=$1
    local compose_file="docker-compose.${env}.yml"

    print_step "Stopping services in ${env} mode..."

    docker compose -f $compose_file -p ${PROJECT_NAME}-${env} down

    print_info "Services stopped successfully"
}

# Restart services
restart_services() {
    local env=$1
    print_step "Restarting services..."
    stop_services $env
    start_services $env
}

# View logs
view_logs() {
    local env=$1
    local service=$2
    local compose_file="docker-compose.${env}.yml"

    print_step "Viewing logs for ${service:-all services}..."

    if [ -z "$service" ]; then
        docker compose -f $compose_file -p ${PROJECT_NAME}-${env} logs -f
    else
        docker compose -f $compose_file -p ${PROJECT_NAME}-${env} logs -f $service
    fi
}

# Show status
show_status() {
    local env=$1
    local compose_file="docker-compose.${env}.yml"

    print_step "Service status:"
    docker compose -f $compose_file -p ${PROJECT_NAME}-${env} ps
}

# Execute command in container
exec_command() {
    local env=$1
    local service=$2
    shift 2
    local compose_file="docker-compose.${env}.yml"

    print_step "Executing command in ${service}..."
    docker compose -f $compose_file -p ${PROJECT_NAME}-${env} exec $service "$@"
}

# Clean up
cleanup() {
    local env=$1
    local compose_file="docker-compose.${env}.yml"

    print_step "Cleaning up ${env} environment..."

    docker compose -f $compose_file -p ${PROJECT_NAME}-${env} down -v --remove-orphans

    print_info "Cleanup completed"
}

# Show help
show_help() {
    cat << EOF
Docker Run Script for Lit-Rift

Usage: $0 <command> <environment> [options]

Commands:
    start       Start services
    stop        Stop services
    restart     Restart services
    logs        View logs
    status      Show service status
    exec        Execute command in container
    cleanup     Stop services and remove volumes
    help        Show this help message

Environments:
    dev         Development environment (hot reload enabled)
    prod        Production environment (optimized builds)

Examples:
    $0 start dev                    # Start development environment
    $0 stop prod                    # Stop production environment
    $0 logs dev backend             # View backend logs in dev
    $0 exec dev frontend sh         # Open shell in frontend container
    $0 cleanup dev                  # Clean up development environment

EOF
}

# Main function
main() {
    local command=$1
    local environment=${2:-"dev"}

    # Validate environment
    if [ "$environment" != "dev" ] && [ "$environment" != "prod" ]; then
        print_error "Invalid environment: $environment"
        echo "Valid environments: dev, prod"
        exit 1
    fi

    check_prerequisites

    case $command in
        start)
            start_services $environment
            ;;
        stop)
            stop_services $environment
            ;;
        restart)
            restart_services $environment
            ;;
        logs)
            view_logs $environment $3
            ;;
        status)
            show_status $environment
            ;;
        exec)
            exec_command $environment $3 "${@:4}"
            ;;
        cleanup)
            cleanup $environment
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Invalid command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
