# Docker Guide for Lit-Rift

## Overview

Lit-Rift provides comprehensive Docker support for cross-platform deployment on **Windows**, **Mac**, and **Linux**. This guide covers everything from quick start to production deployment.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Multi-Platform Builds](#multi-platform-builds)
- [Management Scripts](#management-scripts)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Quick Start

### Start Development Environment (5 minutes)

```bash
# 1. Clone and navigate to project
cd Lit-Rift

# 2. Copy environment file
cp .env.example .env

# 3. Start development environment
./scripts/docker-run.sh start dev
```

**Access:**
- Frontend: http://localhost:3000 (with hot reload)
- Backend: http://localhost:5000 (with hot reload)

### Start Production Environment

```bash
# Start production environment
./scripts/docker-run.sh start prod

# Access at http://localhost
```

---

## Prerequisites

### Required Software

**All Platforms (Windows, Mac, Linux):**

1. **Docker Desktop** (recommended) or **Docker Engine**
   - Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - Mac: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

2. **Docker Compose**
   - Included with Docker Desktop
   - Linux: Install separately if using Docker Engine

3. **Git** (for cloning repository)

### Verify Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.0.0 or higher

# Check Docker is running
docker ps
# Should list running containers (or empty list)
```

### Platform-Specific Notes

**Windows:**
- Enable WSL 2 backend in Docker Desktop settings
- Ensure virtualization is enabled in BIOS
- PowerShell or Git Bash recommended for running scripts

**Mac:**
- Docker Desktop for M1/M2 (Apple Silicon) and Intel both supported
- Grant Docker Desktop necessary permissions

**Linux:**
- Add your user to docker group: `sudo usermod -aG docker $USER`
- Log out and back in for group changes to take effect

---

## Architecture

### Multi-Stage Docker Builds

Lit-Rift uses multi-stage builds for optimal image size and security:

#### Backend (Python/Flask)
```
Stage 1: base        → System dependencies
Stage 2: dependencies → Python packages
Stage 3: development  → Dev tools + hot reload
Stage 4: production   → Optimized runtime
```

#### Frontend (React/TypeScript)
```
Stage 1: base         → Node.js base
Stage 2: dependencies → npm packages
Stage 3: builder      → Build React app
Stage 4: development  → Dev server with hot reload
Stage 5: production   → Nginx serving static files
```

#### Desktop (Electron)
```
Stage 1: base         → Node.js + Electron deps
Stage 2: dependencies → npm packages
Stage 3: builder      → Build desktop app
Stage 4: runtime      → Production runtime
```

### Supported Platforms

All Docker images support:
- **linux/amd64** (Intel/AMD 64-bit)
- **linux/arm64** (ARM 64-bit, including Apple M1/M2)

---

## Development Environment

### Starting Development

```bash
# Start all services
./scripts/docker-run.sh start dev

# Or use docker compose directly
docker compose -f docker-compose.dev.yml up -d
```

### Features

✅ **Hot Reload**
- Frontend: React hot module replacement (HMR)
- Backend: Flask auto-reload on file changes

✅ **Volume Mounting**
- Source code mounted for instant updates
- No rebuild needed for code changes

✅ **Development Tools**
- Frontend: React DevTools, debugging enabled
- Backend: Flask debug mode, detailed error messages

### Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React development server |
| Backend | http://localhost:5000 | Flask API with debug mode |

### Development Workflow

```bash
# 1. Start services
./scripts/docker-run.sh start dev

# 2. Make code changes
# Changes are automatically reflected (hot reload)

# 3. View logs
./scripts/docker-run.sh logs dev
./scripts/docker-run.sh logs dev backend  # Specific service

# 4. Check health
./scripts/docker-health.sh check dev

# 5. Execute commands in containers
./scripts/docker-run.sh exec dev frontend npm test
./scripts/docker-run.sh exec dev backend pytest

# 6. Stop services
./scripts/docker-run.sh stop dev
```

### Environment Variables (Development)

Create `.env` file:

```bash
# Backend Configuration
FLASK_ENV=development
FLASK_DEBUG=1
GOOGLE_API_KEY=your_api_key_here
FIREBASE_CONFIG=your_firebase_config

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

---

## Production Environment

### Starting Production

```bash
# Build and start production services
./scripts/docker-run.sh start prod
```

### Features

✅ **Optimized Builds**
- Multi-stage builds minimize image size
- Only production dependencies included
- Source maps disabled

✅ **Security**
- Non-root users in containers
- Minimal attack surface
- Health checks enabled

✅ **Performance**
- Nginx caching for frontend
- Gunicorn with multiple workers for backend
- Resource limits configured

### Production Configuration

Create `.env.production`:

```bash
# Backend Configuration
FLASK_ENV=production
GOOGLE_API_KEY=your_production_key
FIREBASE_CONFIG=your_production_config
GUNICORN_WORKERS=4
GUNICORN_TIMEOUT=120

# Frontend Configuration
REACT_APP_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Health Checks

All production containers include health checks:

```bash
# Check health status
./scripts/docker-health.sh check prod

# Run full diagnostics
./scripts/docker-health.sh diagnose prod
```

### Resource Monitoring

```bash
# View resource usage
./scripts/docker-health.sh stats prod

# Or use Docker stats directly
docker stats
```

---

## Multi-Platform Builds

### Building for Multiple Platforms

Lit-Rift supports building images for different CPU architectures:

```bash
# Build for all platforms
./scripts/docker-build.sh all production

# Build specific component
./scripts/docker-build.sh frontend production
./scripts/docker-build.sh backend production

# Build for specific platform
PLATFORMS=linux/amd64 ./scripts/docker-build.sh frontend production
```

### Supported Platforms

| Platform | Description | Use Case |
|----------|-------------|----------|
| linux/amd64 | Intel/AMD 64-bit | Most cloud providers, Intel Macs, Windows |
| linux/arm64 | ARM 64-bit | Apple M1/M2, ARM-based cloud instances |

### Platform-Specific Builds

**For Intel/AMD (Windows, Linux, older Macs):**
```bash
export BUILDPLATFORM=linux/amd64
export TARGETPLATFORM=linux/amd64
./scripts/docker-build.sh all production
```

**For Apple Silicon (M1/M2 Macs):**
```bash
export BUILDPLATFORM=linux/arm64
export TARGETPLATFORM=linux/arm64
./scripts/docker-build.sh all production
```

### Docker Buildx

Multi-platform builds use Docker buildx:

```bash
# Create builder (if not exists)
docker buildx create --name litrift-builder --use

# Inspect builder
docker buildx inspect litrift-builder --bootstrap

# Build and push to registry
BUILD_PUSH=1 ./scripts/docker-build.sh all production
```

---

## Management Scripts

### docker-build.sh

Build Docker images with multi-platform support.

**Usage:**
```bash
./scripts/docker-build.sh <component> <environment>
```

**Examples:**
```bash
# Build all components for production
./scripts/docker-build.sh all production

# Build frontend for development
./scripts/docker-build.sh frontend development

# Build backend only
./scripts/docker-build.sh backend production

# Build desktop app
./scripts/docker-build.sh desktop
```

**Options:**
- `BUILD_PUSH=1` - Push images to registry
- `BUILD_LOAD=1` - Load images to local Docker
- `PLATFORMS=linux/amd64,linux/arm64` - Target platforms
- `VERSION=v1.0.0` - Image version tag

### docker-run.sh

Manage Docker Compose services.

**Usage:**
```bash
./scripts/docker-run.sh <command> <environment> [options]
```

**Commands:**

| Command | Description | Example |
|---------|-------------|---------|
| start | Start services | `./scripts/docker-run.sh start dev` |
| stop | Stop services | `./scripts/docker-run.sh stop dev` |
| restart | Restart services | `./scripts/docker-run.sh restart prod` |
| logs | View logs | `./scripts/docker-run.sh logs dev backend` |
| status | Show status | `./scripts/docker-run.sh status dev` |
| exec | Execute command | `./scripts/docker-run.sh exec dev frontend sh` |
| cleanup | Remove all | `./scripts/docker-run.sh cleanup dev` |

**Examples:**
```bash
# View all logs
./scripts/docker-run.sh logs dev

# View backend logs only
./scripts/docker-run.sh logs dev backend

# Execute shell in frontend container
./scripts/docker-run.sh exec dev frontend sh

# Run tests in backend
./scripts/docker-run.sh exec dev backend pytest

# Clean up development environment
./scripts/docker-run.sh cleanup dev
```

### docker-health.sh

Monitor container health and diagnostics.

**Usage:**
```bash
./scripts/docker-health.sh <command> <environment> [options]
```

**Commands:**

| Command | Description | Example |
|---------|-------------|---------|
| check | Check health | `./scripts/docker-health.sh check dev` |
| logs | Show logs | `./scripts/docker-health.sh logs dev backend` |
| stats | Resource usage | `./scripts/docker-health.sh stats prod` |
| diagnose | Full diagnostics | `./scripts/docker-health.sh diagnose dev` |

**Examples:**
```bash
# Check health of all containers
./scripts/docker-health.sh check prod

# Show last 100 lines of backend logs
./scripts/docker-health.sh logs prod backend 100

# Monitor resource usage
./scripts/docker-health.sh stats dev

# Run complete diagnostics
./scripts/docker-health.sh diagnose prod
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** `Error: port 3000 is already allocated`

**Solution:**
```bash
# Find process using port
# Mac/Linux:
lsof -i :3000
# Windows PowerShell:
netstat -ano | findstr :3000

# Kill process or change port in docker-compose.yml
```

#### 2. Docker Desktop Not Running

**Problem:** `Cannot connect to Docker daemon`

**Solution:**
- **Windows/Mac:** Start Docker Desktop application
- **Linux:** `sudo systemctl start docker`

#### 3. Permission Denied

**Problem:** `Permission denied while trying to connect to Docker`

**Solution (Linux):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
```

#### 4. Out of Disk Space

**Problem:** `No space left on device`

**Solution:**
```bash
# Clean up Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

#### 5. Build Fails on Apple Silicon

**Problem:** Build errors on M1/M2 Macs

**Solution:**
```bash
# Use ARM64 platform explicitly
export DOCKER_DEFAULT_PLATFORM=linux/arm64
./scripts/docker-build.sh all production
```

#### 6. Container Unhealthy

**Problem:** Container shows as "unhealthy"

**Solution:**
```bash
# Check health check logs
./scripts/docker-health.sh diagnose dev

# View container logs
./scripts/docker-run.sh logs dev backend

# Restart container
./scripts/docker-run.sh restart dev
```

### Debug Mode

Enable detailed logging:

```bash
# View all container logs
docker compose -f docker-compose.dev.yml logs -f

# Follow specific service logs
docker compose -f docker-compose.dev.yml logs -f backend

# Check container inspect
docker inspect <container_name>
```

### Getting Help

```bash
# Show script help
./scripts/docker-run.sh help
./scripts/docker-build.sh --help
./scripts/docker-health.sh help

# Docker Compose help
docker compose --help
docker compose up --help
```

---

## Best Practices

### Development

✅ **Use Development Compose File**
- Hot reload enabled
- Debug mode active
- Volume mounting for instant updates

✅ **Keep Images Updated**
```bash
# Pull latest base images
docker pull node:18-alpine
docker pull python:3.11-slim
docker pull nginx:alpine
```

✅ **Regular Cleanup**
```bash
# Weekly cleanup recommended
docker system prune -f
```

### Production

✅ **Use Production Compose File**
- Optimized builds
- Health checks enabled
- Resource limits set

✅ **Monitor Health**
```bash
# Regular health checks
./scripts/docker-health.sh check prod

# Monitor resources
./scripts/docker-health.sh stats prod
```

✅ **Backup Volumes**
```bash
# Backup important data
docker run --rm -v litrift_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

✅ **Use Environment Files**
- Never commit `.env` files
- Use `.env.example` as template
- Different files for dev/prod

✅ **Enable Logging**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Security

✅ **Non-Root Users**
- All containers run as non-root users
- Implemented in all Dockerfiles

✅ **Minimal Base Images**
- Alpine Linux for smaller attack surface
- Slim variants for Python

✅ **No Secrets in Images**
- Use environment variables
- Use Docker secrets in Swarm
- Use mounted config files

✅ **Regular Updates**
```bash
# Update base images regularly
docker pull python:3.11-slim
docker pull node:18-alpine
./scripts/docker-build.sh all production
```

### Performance

✅ **Multi-Stage Builds**
- Reduces final image size
- Faster deployment
- Better caching

✅ **Layer Caching**
- Copy package files before source code
- Leverage build cache
- Use `.dockerignore`

✅ **Resource Limits**
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      memory: 512M
```

---

## Platform-Specific Notes

### Windows

**Docker Desktop Settings:**
- Enable WSL 2 backend
- Allocate sufficient resources (CPU/Memory)
- Enable file sharing for project directory

**Running Scripts:**
```powershell
# Use Git Bash or PowerShell
bash ./scripts/docker-run.sh start dev

# Or convert to PowerShell
docker compose -f docker-compose.dev.yml up -d
```

### macOS

**Docker Desktop Settings:**
- Enable VirtioFS for better performance (M1/M2)
- Allocate CPU/Memory in preferences
- Enable Kubernetes (optional)

**File Performance:**
- Use Docker volumes for node_modules
- Avoid mounting entire file system
- Consider using named volumes

### Linux

**Permissions:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker ps
```

**Resource Management:**
- No Docker Desktop overhead
- Better native performance
- Direct access to Docker daemon

---

## Quick Reference

### Common Commands

```bash
# Start development
./scripts/docker-run.sh start dev

# Start production
./scripts/docker-run.sh start prod

# View logs
./scripts/docker-run.sh logs dev

# Check health
./scripts/docker-health.sh check dev

# Build images
./scripts/docker-build.sh all production

# Clean up
./scripts/docker-run.sh cleanup dev
docker system prune -a
```

### Useful Docker Commands

```bash
# List containers
docker ps

# List images
docker images

# Remove container
docker rm <container_id>

# Remove image
docker rmi <image_id>

# View logs
docker logs <container_name>

# Execute command
docker exec -it <container_name> sh

# Inspect container
docker inspect <container_name>

# View resource usage
docker stats
```

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Docker Documentation](https://docs.docker.com/)
3. Create an issue on GitHub
4. Consult project README.md

---

**Last Updated:** 2025-11-20
**Docker Version:** 20.10+
**Docker Compose Version:** v2.0+
**Status:** Production Ready ✅
