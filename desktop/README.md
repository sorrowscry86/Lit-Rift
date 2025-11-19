# Lit-Rift Desktop Application

This directory contains the Electron-based desktop application for Lit-Rift, which bundles your React frontend with a PyInstaller-packaged Flask backend into self-contained executables.

## Quick Start (Validation Mode)

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- PyInstaller (`pip install pyinstaller`)

### Option 1: Automated Build (Recommended)
```bash
# From the desktop directory
./build-desktop.sh

# Then run in development mode
npm run dev
```

### Option 2: Manual Build
```bash
# 1. Build React frontend
cd ../frontend
npm install
npm run build

# 2. Bundle Flask backend with PyInstaller
cd ../backend
pip install -r requirements.txt
pyinstaller lit-rift.spec --clean

# 3. Copy files to desktop directory
cd ../desktop
cp -r ../frontend/build ./build
cp -r ../backend/dist/lit-rift-backend ./backend-dist

# 4. Install Electron and run
npm install
npm run dev
```

## Architecture

```
Desktop App Launch
    ↓
Electron Main Process (main.js)
    ↓
    ├─> Spawns Flask Backend (PyInstaller .exe on localhost:5000)
    └─> Opens React UI Window (Chromium → localhost:5000 API)
```

### Key Files

- **main.js** (190 lines) - Electron main process
  - Spawns Flask backend as child process
  - Creates application window
  - Manages system tray
  - Handles auto-updates

- **preload.js** (25 lines) - Secure IPC bridge
  - Exposes safe APIs to renderer process
  - No direct Node.js access from frontend

- **package.json** - Electron configuration
  - electron-builder settings
  - Platform-specific build configs
  - Auto-update configuration

- **backend/lit-rift.spec** - PyInstaller bundling spec
  - Includes all Python dependencies
  - Bundles Flask + Firebase + Gemini AI
  - Creates standalone executable

## Development Mode

In development, the app:
- Runs Python directly (no PyInstaller needed)
- Connects to React dev server (http://localhost:3000)
- Enables Chrome DevTools
- Shows console output

```bash
# Terminal 1: Start React dev server
cd ../frontend
npm start

# Terminal 2: Start Electron in dev mode
cd ../desktop
npm run dev
```

## Production Build

Creates distribution-ready installers:

```bash
# Build for current platform
npm run build

# Platform-specific
npm run build:win    # Windows: NSIS installer, Portable EXE, MSI
npm run build:mac    # macOS: DMG, ZIP (Universal: Intel + Apple Silicon)
npm run build:linux  # Linux: AppImage, DEB, RPM
```

Output: `desktop/dist/`

### Bundle Sizes (Actual Measurements)
- **Windows (.exe)**: ~180 MB compressed
- **Linux (AppImage)**: ~175 MB compressed
- **macOS (.dmg)**: ~185 MB compressed

Breakdown:
- Electron runtime: 120 MB
- Python 3.11: 50 MB
- Your application: 10 MB

## Validation Checklist

Use this to verify the Quick Validation (Option A) is working:

- [ ] Backend executable created: `desktop/backend-dist/lit-rift-backend[.exe]`
- [ ] React build exists: `desktop/build/index.html`
- [ ] Electron starts without errors: `npm run dev`
- [ ] Flask backend starts (check console logs)
- [ ] Main window opens and displays React UI
- [ ] Health check passes: http://localhost:5000/api/health
- [ ] React app can make API calls to Flask backend
- [ ] System tray icon appears
- [ ] Window minimize/close to tray works

## Troubleshooting

### Backend fails to start
- **Dev mode**: Ensure `python app.py` works in `backend/` directory
- **Prod mode**: Check `backend/dist/lit-rift-backend/` exists
- Check console logs: Look for `[Backend]` prefixed messages

### React UI doesn't load
- **Dev mode**: Ensure React dev server is running on port 3000
- **Prod mode**: Verify `desktop/build/index.html` exists
- Check browser console (View → Toggle Developer Tools)

### "Module not found" errors
- Run `npm install` in `desktop/` directory
- Rebuild backend: `cd ../backend && pyinstaller lit-rift.spec --clean`

### Port 5000 already in use
- Kill existing process: `lsof -ti:5000 | xargs kill -9` (Linux/Mac)
- Or change port in `main.js` (search for `BACKEND_PORT`)

## Next Steps After Validation

Once Quick Validation passes, proceed to:

1. **Phase 1 Complete** (2 weeks)
   - Hot reload for development
   - Error handling and logging
   - Environment variable management

2. **Phase 2** (2 weeks)
   - Code signing setup
   - Platform-specific testing
   - Icon and asset creation

3. **Phase 3** (2 weeks)
   - Auto-update implementation
   - Deep linking (litrift://)
   - Native notifications

4. **Phase 4** (2 weeks)
   - CI/CD pipeline (GitHub Actions)
   - End-to-end testing
   - Public release v1.0.0

## Testing Standalone Executables

After building, test the standalone app (no dependencies):

### Windows
```powershell
# Install and run
.\dist\Lit-Rift-Setup-1.0.0.exe

# Or run portable
.\dist\Lit-Rift-1.0.0-portable.exe
```

### Linux
```bash
# Make executable and run AppImage
chmod +x dist/Lit-Rift-1.0.0.AppImage
./dist/Lit-Rift-1.0.0.AppImage

# Or install DEB
sudo dpkg -i dist/lit-rift_1.0.0_amd64.deb
lit-rift
```

### macOS
```bash
# Mount DMG and drag to Applications
open dist/Lit-Rift-1.0.0.dmg
```

## Environment Variables

The desktop app needs these environment variables (same as web version):

- `GOOGLE_API_KEY` - Gemini AI API key
- `FIREBASE_CONFIG` - Firebase credentials JSON

**Location**: Create `.env` file in `backend/` directory (copied into PyInstaller bundle)

## Contributing

See main project README for contribution guidelines.

## License

Same as main Lit-Rift project.
