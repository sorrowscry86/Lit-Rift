const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let tray = null;
let backendProcess = null;
const BACKEND_PORT = 5000;
const isDev = process.env.NODE_ENV === 'development';

// Backend executable paths for different platforms
function getBackendPath() {
  if (isDev) {
    // In development, run Python directly
    return {
      command: 'python',
      args: [path.join(__dirname, '..', 'backend', 'app.py')],
      cwd: path.join(__dirname, '..', 'backend')
    };
  }

  // In production, use PyInstaller executable
  const platform = process.platform;
  let execPath;

  if (platform === 'win32') {
    execPath = path.join(process.resourcesPath, 'backend', 'lit-rift-backend.exe');
  } else if (platform === 'darwin') {
    execPath = path.join(process.resourcesPath, 'backend', 'lit-rift-backend');
  } else {
    execPath = path.join(process.resourcesPath, 'backend', 'lit-rift-backend');
  }

  return {
    command: execPath,
    args: [],
    cwd: path.dirname(execPath)
  };
}

// Start Flask backend
function startBackend() {
  return new Promise((resolve, reject) => {
    const backend = getBackendPath();

    console.log(`[Backend] Starting: ${backend.command} ${backend.args.join(' ')}`);
    console.log(`[Backend] Working directory: ${backend.cwd}`);

    backendProcess = spawn(backend.command, backend.args, {
      cwd: backend.cwd,
      env: {
        ...process.env,
        PORT: BACKEND_PORT.toString(),
        FLASK_ENV: isDev ? 'development' : 'production',
        PYTHONUNBUFFERED: '1'
      }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      console.error(`[Backend] Failed to start: ${error.message}`);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`[Backend] Exited with code ${code}, signal ${signal}`);
      backendProcess = null;
    });

    // Wait for backend to be ready
    let attempts = 0;
    const maxAttempts = 30;
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:${BACKEND_PORT}/api/health`);
        if (response.ok) {
          clearInterval(checkInterval);
          console.log('[Backend] Ready and healthy');
          resolve();
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('Backend failed to start within timeout'));
        }
      }
    }, 1000);
  });
}

// Stop Flask backend
function stopBackend() {
  if (backendProcess) {
    console.log('[Backend] Stopping...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false, // Don't show until ready
    backgroundColor: '#1a1a1a'
  });

  // Load React app
  const startUrl = isDev
    ? 'http://localhost:3000'  // React dev server
    : `file://${path.join(__dirname, 'build', 'index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Development tools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create system tray
function createTray() {
  const iconPath = path.join(__dirname, 'build', 'tray-icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Lit-Rift',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdates();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Lit-Rift');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

// Auto-updater events
autoUpdater.on('update-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available');
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded');
  }
});

// IPC handlers
ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${BACKEND_PORT}`;
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    console.log('[App] Starting Lit-Rift Desktop...');

    // Start backend first
    await startBackend();

    // Create window and tray
    createWindow();
    createTray();

    // Check for updates (not in development)
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 3000);
    }

    console.log('[App] Lit-Rift Desktop started successfully');
  } catch (error) {
    console.error('[App] Failed to start:', error);
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('window-all-closed', () => {
  // On macOS, keep app running in tray
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  stopBackend();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[App] Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[App] Unhandled rejection:', error);
});
