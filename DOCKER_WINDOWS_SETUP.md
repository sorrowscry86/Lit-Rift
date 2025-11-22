# Docker Setup Guide for Windows

Complete guide for setting up and running Lit-Rift with Docker on Windows.

## Prerequisites Installation

### Step 1: Install WSL 2 (Windows Subsystem for Linux)

**Required for Docker Desktop on Windows**

1. **Open PowerShell as Administrator**

2. **Enable WSL:**
   ```powershell
   wsl --install
   ```

3. **Restart your computer**

4. **Set WSL 2 as default:**
   ```powershell
   wsl --set-default-version 2
   ```

5. **Verify installation:**
   ```powershell
   wsl --list --verbose
   ```

### Step 2: Enable Virtualization in BIOS

**Required if WSL installation fails**

1. Restart computer and enter BIOS (usually F2, F10, or DEL key)
2. Find "Virtualization Technology" or "Intel VT-x" or "AMD-V"
3. Enable it
4. Save and exit BIOS

### Step 3: Install Docker Desktop

1. **Download Docker Desktop:**
   - Visit: https://docs.docker.com/desktop/install/windows-install/
   - Download "Docker Desktop for Windows"

2. **Run the installer:**
   - Double-click `Docker Desktop Installer.exe`
   - Follow installation wizard
   - Keep "Use WSL 2 instead of Hyper-V" checked

3. **Restart your computer**

4. **Start Docker Desktop:**
   - Search for "Docker Desktop" in Start Menu
   - Launch the application
   - Wait for Docker to start (icon in system tray turns green)

5. **Verify installation:**
   ```powershell
   docker --version
   docker compose version
   ```

### Step 4: Configure Docker Desktop

1. **Open Docker Desktop Settings** (gear icon)

2. **Resources → WSL Integration:**
   - Enable integration with WSL 2 distros
   - Toggle on your Ubuntu/Debian distro

3. **Resources → Advanced:**
   - CPUs: 4 (or 2 minimum)
   - Memory: 4 GB (or 2 GB minimum)
   - Swap: 1 GB
   - Disk image size: 64 GB

4. **Apply & Restart**

## Getting Started

### Method 1: Using PowerShell/CMD (Recommended for Windows)

```powershell
# 1. Open PowerShell or Command Prompt
# Press Win+R, type "powershell", press Enter

# 2. Navigate to project
cd C:\path\to\Lit-Rift

# 3. Copy environment file
copy .env.example .env

# 4. Start development environment
docker-run.bat start dev

# Or use docker compose directly:
docker compose -f docker-compose.dev.yml up -d
```

### Method 2: Using Git Bash

```bash
# 1. Open Git Bash
# Right-click in project folder → "Git Bash Here"

# 2. Copy environment file
cp .env.example .env

# 3. Use bash scripts
./scripts/docker-run.sh start dev
```

### Method 3: Using WSL 2 Terminal

```bash
# 1. Open WSL 2 terminal
wsl

# 2. Navigate to project (Windows drives are at /mnt/)
cd /mnt/c/path/to/Lit-Rift

# 3. Use Linux commands
./scripts/docker-run.sh start dev
```

## Access the Application

**Development Mode:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Production Mode:**
- Application: http://localhost
- Backend: http://localhost:5000

## Common Windows-Specific Commands

### Using Windows Batch Script

```powershell
# Start services
docker-run.bat start dev

# Stop services
docker-run.bat stop dev

# View logs
docker-run.bat logs dev

# View specific service logs
docker-run.bat logs dev backend

# Check status
docker-run.bat status dev

# Execute commands
docker-run.bat exec dev frontend sh

# Clean up
docker-run.bat cleanup dev
```

### Using Docker Compose Directly

```powershell
# Start development
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker compose -f docker-compose.dev.yml logs -f backend

# Execute command
docker compose -f docker-compose.dev.yml exec frontend sh
```

## Troubleshooting Windows Issues

### Issue 1: "WSL 2 installation is incomplete"

**Solution:**
1. Download and install WSL 2 kernel update:
   https://aka.ms/wsl2kernel

2. Restart Docker Desktop

### Issue 2: "Docker Desktop starting..." forever

**Solutions:**

**Option A: Reset Docker Desktop**
1. Right-click Docker icon in system tray
2. Select "Troubleshoot"
3. Click "Reset to factory defaults"

**Option B: Restart WSL**
```powershell
# As Administrator
wsl --shutdown
# Wait 10 seconds
# Restart Docker Desktop
```

**Option C: Restart Hyper-V (if using Hyper-V backend)**
```powershell
# As Administrator
bcdedit /set hypervisorlaunchtype auto
# Restart computer
```

### Issue 3: "An error occurred mounting one of your file systems"

**Solution:**
```powershell
# As Administrator
wsl --shutdown
# Wait 10 seconds
wsl
# Docker Desktop should now work
```

### Issue 4: Port already in use

**Find process using port:**
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Or change port in docker-compose.yml:**
```yaml
ports:
  - "3001:3000"  # Changed from 3000:3000
```

### Issue 5: Slow performance

**Solutions:**

**1. Use WSL 2 file system:**
```bash
# In WSL terminal, clone project to WSL home
cd ~
git clone <repository>
cd Lit-Rift
./scripts/docker-run.sh start dev
```

**2. Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase CPU and Memory
- Apply & Restart

**3. Disable antivirus scanning of Docker folders:**
- Add exclusions for:
  - `C:\ProgramData\Docker`
  - `C:\Users\<username>\.docker`
  - WSL 2 file locations

### Issue 6: "The system cannot find the file specified"

**Solution:**
```powershell
# Ensure you're in the correct directory
cd C:\path\to\Lit-Rift

# Verify files exist
dir docker-compose.dev.yml
dir scripts\docker-run.bat

# Use full paths if needed
docker compose -f C:\path\to\Lit-Rift\docker-compose.dev.yml up -d
```

### Issue 7: Line ending issues (CRLF vs LF)

**Solution:**
```bash
# In Git Bash or WSL
# Convert line endings for scripts
dos2unix scripts/*.sh

# Or configure git to handle it
git config --global core.autocrlf true
```

## Performance Optimization

### 1. Use Named Volumes

Already configured in `docker-compose.dev.yml`:
```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules  # Named volume for better performance
```

### 2. Run from WSL 2 File System

**Better performance when project is in WSL 2:**
```bash
# In WSL terminal
cd ~
git clone <repository>
cd Lit-Rift
./scripts/docker-run.sh start dev
```

### 3. Configure Docker Desktop

**Settings → Resources:**
- CPUs: 4-8 (more is better)
- Memory: 4-8 GB
- Swap: 1-2 GB

**Settings → Docker Engine:**
```json
{
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
```

### 4. Disable Unnecessary Services

```powershell
# Stop unnecessary Windows services
# Services → Disable:
# - Superfetch
# - Windows Search (if not needed)
```

## File Locations

### Docker Desktop Data
- **Settings:** `%APPDATA%\Docker`
- **Virtual disk:** `%LOCALAPPDATA%\Docker\wsl\data\ext4.vhdx`
- **Containers:** In WSL 2 distro

### Project Files
- **Windows:** `C:\Users\<username>\Projects\Lit-Rift`
- **WSL 2:** `/mnt/c/Users/<username>/Projects/Lit-Rift`
- **WSL 2 Home:** `/home/<username>/Lit-Rift` (faster)

## Development Workflow (Windows)

### Option 1: PowerShell/CMD

```powershell
# Open PowerShell in project directory
cd C:\path\to\Lit-Rift

# Start development
docker-run.bat start dev

# Make code changes in VS Code/editor
# Changes auto-reload in browser

# View logs
docker-run.bat logs dev

# Stop when done
docker-run.bat stop dev
```

### Option 2: Git Bash

```bash
# Open Git Bash in project directory
cd /c/path/to/Lit-Rift

# Use bash scripts
./scripts/docker-run.sh start dev

# Make code changes
# Changes auto-reload

# View logs
./scripts/docker-run.sh logs dev

# Stop when done
./scripts/docker-run.sh stop dev
```

### Option 3: WSL 2 + VS Code

```bash
# 1. Install VS Code with WSL extension
# 2. In WSL terminal:
cd ~/Lit-Rift
code .

# 3. VS Code opens in WSL mode
# 4. Use integrated terminal:
./scripts/docker-run.sh start dev
```

## Best Practices for Windows

✅ **Use WSL 2 Backend**
- Better performance than Hyper-V
- Native Linux compatibility

✅ **Keep Project in WSL 2 File System**
- Significantly faster I/O
- Better Docker performance

✅ **Use Docker Desktop Dashboard**
- Easy visualization of containers
- One-click logs and terminals
- Resource monitoring

✅ **Configure Antivirus Exclusions**
- Exclude Docker directories
- Exclude project directory (if needed)

✅ **Regular Docker Cleanup**
```powershell
# Weekly cleanup
docker system prune -a
```

✅ **Monitor Resources**
- Docker Desktop → Dashboard → Resources
- Task Manager → Performance tab

## Quick Reference

### Start Development
```powershell
docker-run.bat start dev
# or
docker compose -f docker-compose.dev.yml up -d
```

### View Logs
```powershell
docker-run.bat logs dev
# or
docker compose -f docker-compose.dev.yml logs -f
```

### Stop Services
```powershell
docker-run.bat stop dev
# or
docker compose -f docker-compose.dev.yml down
```

### Execute Commands
```powershell
docker-run.bat exec dev frontend sh
# or
docker compose -f docker-compose.dev.yml exec frontend sh
```

## Getting Help

### Check Docker Status
```powershell
# Docker version
docker --version

# Docker info
docker info

# Running containers
docker ps

# All containers
docker ps -a
```

### Docker Desktop Logs
```
%LOCALAPPDATA%\Docker\log.txt
```

### WSL Status
```powershell
# List WSL distros
wsl --list --verbose

# WSL version
wsl --version
```

### Support Resources
- Docker Desktop Troubleshooting: Right-click tray icon → Troubleshoot
- Docker Documentation: https://docs.docker.com/desktop/windows/
- WSL Documentation: https://docs.microsoft.com/en-us/windows/wsl/

---

**Platform:** Windows 10/11 (64-bit)
**Docker Desktop Version:** 4.0+
**WSL Version:** 2
**Status:** Production Ready ✅
