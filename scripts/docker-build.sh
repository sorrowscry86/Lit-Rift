#!/bin/bash

# Docker Build Script for Lit-Rift
# Supports multi-platform builds for Windows, Mac, and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PLATFORMS="linux/amd64,linux/arm64"
IMAGE_REGISTRY=${IMAGE_REGISTRY:-"ghcr.io"}
IMAGE_NAMESPACE=${IMAGE_NAMESPACE:-"litrift"}
VERSION=${VERSION:-"latest"}

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_info "Docker version: $(docker --version)"
}

# Check if buildx is available
check_buildx() {
    if ! docker buildx version &> /dev/null; then
        print_error "Docker buildx is not available. Please update Docker."
        exit 1
    fi
    print_info "Docker buildx available"
}

# Create buildx builder
setup_builder() {
    print_info "Setting up multi-platform builder..."

    # Check if builder exists
    if docker buildx ls | grep -q "litrift-builder"; then
        print_info "Builder 'litrift-builder' already exists"
    else
        docker buildx create --name litrift-builder --use
        print_info "Created builder 'litrift-builder'"
    fi

    docker buildx inspect --bootstrap
}

# Build backend
build_backend() {
    local env=$1
    print_info "Building backend for ${env} environment..."

    docker buildx build \
        --platform ${PLATFORMS} \
        --file Dockerfile.backend \
        --target ${env} \
        --tag ${IMAGE_REGISTRY}/${IMAGE_NAMESPACE}/backend:${VERSION}-${env} \
        --tag ${IMAGE_REGISTRY}/${IMAGE_NAMESPACE}/backend:${env} \
        ${BUILD_PUSH:+--push} \
        ${BUILD_LOAD:+--load} \
        .

    print_info "Backend build completed"
}

# Build frontend
build_frontend() {
    local env=$1
    print_info "Building frontend for ${env} environment..."

    docker buildx build \
        --platform ${PLATFORMS} \
        --file Dockerfile.frontend \
        --target ${env} \
        --tag ${IMAGE_REGISTRY}/${IMAGE_NAMESPACE}/frontend:${VERSION}-${env} \
        --tag ${IMAGE_REGISTRY}/${IMAGE_NAMESPACE}/frontend:${env} \
        ${BUILD_PUSH:+--push} \
        ${BUILD_LOAD:+--load} \
        .

    print_info "Frontend build completed"
}

# Build desktop
build_desktop() {
    print_info "Building desktop application..."

    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --file Dockerfile.desktop \
        --tag ${IMAGE_REGISTRY}/${IMAGE_NAMESPACE}/desktop:${VERSION} \
        --tag ${IMAGE_REGISTRY}/${IMAGE_NAMESPACE}/desktop:latest \
        ${BUILD_PUSH:+--push} \
        ${BUILD_LOAD:+--load} \
        .

    print_info "Desktop build completed"
}

# Main function
main() {
    local component=$1
    local environment=${2:-"production"}

    print_info "Starting Docker build process..."
    print_info "Component: ${component:-all}"
    print_info "Environment: ${environment}"
    print_info "Platforms: ${PLATFORMS}"
    print_info "Version: ${VERSION}"

    check_docker
    check_buildx
    setup_builder

    case $component in
        backend)
            build_backend $environment
            ;;
        frontend)
            build_frontend $environment
            ;;
        desktop)
            build_desktop
            ;;
        all)
            build_backend $environment
            build_frontend $environment
            ;;
        *)
            print_error "Invalid component: $component"
            echo "Usage: $0 {backend|frontend|desktop|all} {development|production}"
            exit 1
            ;;
    esac

    print_info "Build process completed successfully!"
}

# Run main function
main "$@"
