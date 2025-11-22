# Docker Quick Start Guide

Get Lit-Rift running in 5 minutes with Docker on **Windows**, **Mac**, or **Linux**.

## Prerequisites (1 minute)

1. **Install Docker Desktop:**
   - **Windows:** [Download here](https://docs.docker.com/desktop/install/windows-install/)
   - **Mac:** [Download here](https://docs.docker.com/desktop/install/mac-install/)
   - **Linux:** [Install Docker Engine](https://docs.docker.com/engine/install/)

2. **Verify Installation:**
   ```bash
   docker --version
   docker compose version
   ```

## Quick Start (3 minutes)

### Method 1: Using Scripts (Recommended)

```bash
# 1. Navigate to project
cd Lit-Rift

# 2. Copy environment file
cp .env.example .env

# 3. Start development environment
./scripts/docker-run.sh start dev
```

### Method 2: Using Docker Compose

```bash
# 1. Navigate to project
cd Lit-Rift

# 2. Copy environment file
cp .env.example .env

# 3. Start services
docker compose -f docker-compose.dev.yml up -d
```

### Method 3: Windows (PowerShell/CMD)

```powershell
# 1. Navigate to project
cd Lit-Rift

# 2. Copy environment file
copy .env.example .env

# 3. Start services
docker compose -f docker-compose.dev.yml up -d
```

## Access the Application

**Development Mode:**
- 🌐 Frontend: http://localhost:3000 (React dev server with hot reload)
- 🔌 Backend API: http://localhost:5000 (Flask with auto-reload)

**Production Mode:**
- 🌐 Application: http://localhost (Nginx)
- 🔌 Backend API: http://localhost:5000

## Common Commands

### Start & Stop

```bash
# Start development
./scripts/docker-run.sh start dev

# Start production
./scripts/docker-run.sh start prod

# Stop services
./scripts/docker-run.sh stop dev

# Restart services
./scripts/docker-run.sh restart dev
```

### View Logs

```bash
# All services
./scripts/docker-run.sh logs dev

# Specific service
./scripts/docker-run.sh logs dev backend
./scripts/docker-run.sh logs dev frontend
```

### Health Check

```bash
# Check if services are healthy
./scripts/docker-health.sh check dev

# Full diagnostics
./scripts/docker-health.sh diagnose dev
```

### Execute Commands

```bash
# Open shell in frontend
./scripts/docker-run.sh exec dev frontend sh

# Run tests in backend
./scripts/docker-run.sh exec dev backend pytest

# Run frontend tests
./scripts/docker-run.sh exec dev frontend npm test
```

### Clean Up

```bash
# Stop and remove containers, networks, volumes
./scripts/docker-run.sh cleanup dev

# Clean up Docker system
docker system prune -a
```

## Platform-Specific Notes

### Windows
```powershell
# Use Git Bash or PowerShell
# Enable WSL 2 in Docker Desktop settings

# Run scripts with bash
bash ./scripts/docker-run.sh start dev

# Or use docker compose directly
docker compose -f docker-compose.dev.yml up -d
```

### Mac (Intel)
```bash
# Standard commands work
./scripts/docker-run.sh start dev
```

### Mac (Apple Silicon M1/M2)
```bash
# Docker Desktop handles architecture automatically
./scripts/docker-run.sh start dev

# Or specify explicitly
export DOCKER_DEFAULT_PLATFORM=linux/arm64
./scripts/docker-run.sh start dev
```

### Linux
```bash
# Add user to docker group (first time only)
sudo usermod -aG docker $USER
newgrp docker

# Then use standard commands
./scripts/docker-run.sh start dev
```

## Troubleshooting

### Port Already in Use

```bash
# Change ports in docker-compose.dev.yml
# Or find and kill the process using the port

# Linux/Mac
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Docker Not Running

- **Windows/Mac:** Start Docker Desktop
- **Linux:** `sudo systemctl start docker`

### Out of Space

```bash
# Clean up unused Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Permission Denied (Linux)

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

## Next Steps

- 📖 Read [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for comprehensive documentation
- 🚀 Deploy to production using `docker-compose.prod.yml`
- 🔧 Customize environment variables in `.env`
- 📊 Monitor with `./scripts/docker-health.sh`

## Need Help?

1. Check [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for detailed information
2. View logs: `./scripts/docker-run.sh logs dev`
3. Run diagnostics: `./scripts/docker-health.sh diagnose dev`
4. Create an issue on GitHub

---

**Development Time:** ~5 minutes
**Production Deployment:** ~10 minutes
**Platforms:** Windows, Mac (Intel & ARM), Linux
**Status:** Production Ready ✅
