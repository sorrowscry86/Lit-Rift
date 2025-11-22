#!/bin/bash

# Docker Health Check Script for Lit-Rift
# Monitors container health and provides diagnostics

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="lit-rift"

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

print_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

# Check container health
check_container_health() {
    local container=$1

    if docker ps | grep -q "$container"; then
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")

        if [ "$health" = "healthy" ]; then
            print_ok "$container is healthy"
            return 0
        elif [ "$health" = "unhealthy" ]; then
            print_error "$container is unhealthy"
            return 1
        elif [ "$health" = "starting" ]; then
            print_warn "$container is starting..."
            return 2
        else
            print_warn "$container has no health check"
            return 2
        fi
    else
        print_error "$container is not running"
        return 1
    fi
}

# Check all containers
check_all_containers() {
    local env=$1
    print_info "Checking health of all containers in ${env} environment..."

    local containers=$(docker ps --filter "name=${PROJECT_NAME}-${env}" --format "{{.Names}}")

    if [ -z "$containers" ]; then
        print_error "No containers found for ${PROJECT_NAME}-${env}"
        return 1
    fi

    local all_healthy=true

    for container in $containers; do
        if ! check_container_health "$container"; then
            all_healthy=false
        fi
    done

    if $all_healthy; then
        print_ok "All containers are healthy!"
        return 0
    else
        print_error "Some containers have issues"
        return 1
    fi
}

# Show container logs
show_container_logs() {
    local container=$1
    local lines=${2:-50}

    print_info "Last $lines lines of logs for $container:"
    docker logs --tail $lines "$container" 2>&1 | tail -n $lines
}

# Show resource usage
show_resource_usage() {
    local env=$1

    print_info "Resource usage for ${env} environment:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" \
        $(docker ps --filter "name=${PROJECT_NAME}-${env}" --format "{{.Names}}")
}

# Perform diagnostics
run_diagnostics() {
    local env=$1

    print_info "Running diagnostics for ${env} environment..."

    echo ""
    echo "=== Container Status ==="
    docker ps --filter "name=${PROJECT_NAME}-${env}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "=== Health Checks ==="
    check_all_containers $env

    echo ""
    echo "=== Resource Usage ==="
    show_resource_usage $env

    echo ""
    echo "=== Network Configuration ==="
    docker network ls --filter "name=${PROJECT_NAME}"

    echo ""
    echo "=== Volume Information ==="
    docker volume ls --filter "name=${PROJECT_NAME}"
}

# Show help
show_help() {
    cat << EOF
Docker Health Check Script for Lit-Rift

Usage: $0 <command> <environment> [options]

Commands:
    check       Check health of all containers
    logs        Show container logs
    stats       Show resource usage
    diagnose    Run full diagnostics
    help        Show this help message

Environments:
    dev         Development environment
    prod        Production environment

Examples:
    $0 check dev                    # Check health of dev containers
    $0 logs dev backend             # Show backend logs
    $0 stats prod                   # Show production resource usage
    $0 diagnose dev                 # Run full diagnostics

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

    case $command in
        check)
            check_all_containers $environment
            ;;
        logs)
            local service=$3
            if [ -z "$service" ]; then
                print_error "Please specify a service name"
                exit 1
            fi
            show_container_logs "${PROJECT_NAME}-${environment}-${service}-1" ${4:-50}
            ;;
        stats)
            show_resource_usage $environment
            ;;
        diagnose)
            run_diagnostics $environment
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
