const { app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');
const { Logger } = require('./logger');
const { EnvManager } = require('./env-manager');

// Initialize logger and environment manager
const logger = new Logger('Main');
const envManager = new EnvManager();

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
    const backendLogger = new Logger('Backend');

    backendLogger.info(`Starting: ${backend.command} ${backend.args.join(' ')}`);
    backendLogger.debug(`Working directory: ${backend.cwd}`);

    // Load and validate environment before starting backend
    envManager.load();
    const validation = envManager.validate();

    if (!validation.valid && !isDev) {
      backendLogger.warn('Missing required environment variables', { missing: validation.missing });
    }

    backendProcess = spawn(backend.command, backend.args, {
      cwd: backend.cwd,
      env: envManager.getBackendEnv()
    });

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      backendLogger.info(output);
    });

    backendProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      // Flask logs to stderr by default, so only log as error if it looks like an error
      if (output.toLowerCase().includes('error') || output.toLowerCase().includes('exception')) {
        backendLogger.error(output);
      } else {
        backendLogger.info(output);
      }
    });

    backendProcess.on('error', (error) => {
      backendLogger.error('Failed to start', error);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      backendLogger.info(`Exited with code ${code}, signal ${signal}`);
      backendProcess = null;

      // Auto-restart in development if crashed unexpectedly
      if (isDev && code !== 0 && code !== null) {
        backendLogger.warn('Backend crashed, restarting in 3 seconds...');
        setTimeout(() => {
          if (!backendProcess) {
            startBackend().catch(err => backendLogger.error('Restart failed', err));
          }
        }, 3000);
      }
    });

    // Wait for backend to be ready
    let attempts = 0;
    const maxAttempts = 30;
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:${BACKEND_PORT}/api/health`);
        if (response.ok) {
          clearInterval(checkInterval);
          backendLogger.info('Ready and healthy');
          resolve();
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          backendLogger.error('Failed to start within timeout');
          reject(new Error('Backend failed to start within timeout'));
        }
      }
    }, 1000);
  });
}

// Stop Flask backend
function stopBackend() {
  if (backendProcess) {
    logger.info('Stopping backend...');
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

    // Hot reload support - reload on F5
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F5') {
        mainWindow.reload();
      } else if (input.key === 'F12') {
        mainWindow.webContents.toggleDevTools();
      }
    });

    logger.debug('Development mode: Hot reload enabled (F5 to reload, F12 for DevTools)');
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

  // Handle crashes
  mainWindow.webContents.on('crashed', () => {
    logger.error('Renderer process crashed');
    const options = {
      type: 'error',
      title: 'Application Crashed',
      message: 'The application has crashed. Would you like to reload it?',
      buttons: ['Reload', 'Quit']
    };

    dialog.showMessageBox(options).then(result => {
      if (result.response === 0) {
        mainWindow.reload();
      } else {
        app.quit();
      }
    });
  });

  // Handle unresponsive window
  mainWindow.on('unresponsive', () => {
    logger.warn('Window became unresponsive');
    const options = {
      type: 'warning',
      title: 'Application Not Responding',
      message: 'The application is not responding. Would you like to wait?',
      buttons: ['Wait', 'Force Quit']
    };

    dialog.showMessageBox(options).then(result => {
      if (result.response === 1) {
        app.quit();
      }
    });
  });

  mainWindow.on('responsive', () => {
    logger.info('Window became responsive again');
  });
}

// Open settings dialog
async function openSettings() {
  const validation = envManager.validate();
  const envPath = envManager.getEnvPath();

  const message = validation.valid
    ? `Configuration file: ${envPath}\n\nAll required settings are configured.`
    : `Configuration file: ${envPath}\n\nMissing required settings:\n${validation.missing.join('\n')}\n\nPlease edit the .env file to configure these values.`;

  const options = {
    type: validation.valid ? 'info' : 'warning',
    title: 'Lit-Rift Settings',
    message: 'Application Settings',
    detail: message,
    buttons: validation.valid ? ['OK', 'Open Config File'] : ['Open Config File', 'Cancel'],
    defaultId: 0
  };

  const result = await dialog.showMessageBox(mainWindow, options);

  if ((validation.valid && result.response === 1) || (!validation.valid && result.response === 0)) {
    // Open config file in default editor
    shell.openPath(envPath);
  }
}

// Open logs directory
function openLogs() {
  const { logDir } = require('./logger');
  shell.openPath(logDir);
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
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: openSettings
    },
    {
      label: 'View Logs',
      click: openLogs
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        logger.info('Manually checking for updates...');
        autoUpdater.checkForUpdates();
      },
      enabled: !isDev
    },
    {
      label: 'Reload App',
      click: () => {
        if (mainWindow) {
          mainWindow.reload();
        }
      },
      visible: isDev
    },
    {
      label: 'DevTools',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.toggleDevTools();
        }
      },
      visible: isDev
    },
    { type: 'separator' },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Quit Lit-Rift',
      click: () => {
        logger.info('User requested quit from tray');
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Lit-Rift - Novel Writing Assistant');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
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

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-env-config', () => {
  const validation = envManager.validate();
  return {
    configPath: envManager.getEnvPath(),
    isValid: validation.valid,
    missing: validation.missing
  };
});

ipcMain.handle('open-settings', async () => {
  await openSettings();
});

ipcMain.handle('open-logs', () => {
  openLogs();
});

ipcMain.handle('show-error-dialog', async (event, { title, message }) => {
  const options = {
    type: 'error',
    title: title || 'Error',
    message: message || 'An error occurred',
    buttons: ['OK']
  };
  await dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('show-info-dialog', async (event, { title, message }) => {
  const options = {
    type: 'info',
    title: title || 'Information',
    message: message || '',
    buttons: ['OK']
  };
  await dialog.showMessageBox(mainWindow, options);
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    logger.info(`Starting Lit-Rift Desktop v${app.getVersion()}...`);
    logger.info(`Platform: ${process.platform} ${process.arch}`);
    logger.info(`Node: ${process.versions.node}, Electron: ${process.versions.electron}`);
    logger.info(`Mode: ${isDev ? 'Development' : 'Production'}`);

    // Load environment configuration
    envManager.load();
    const validation = envManager.validate();

    if (!validation.valid) {
      logger.warn('Missing required environment variables', { missing: validation.missing });

      // Create .env from template if it doesn't exist
      if (!isDev) {
        envManager.createFromTemplate();
      }
    }

    // Start backend first
    await startBackend();

    // Create window and tray
    createWindow();
    createTray();

    // Check for updates (not in development)
    if (!isDev) {
      setTimeout(() => {
        logger.info('Checking for updates...');
        autoUpdater.checkForUpdatesAndNotify();
      }, 3000);
    }

    logger.info('Lit-Rift Desktop started successfully');
  } catch (error) {
    logger.error('Failed to start application', error);

    // Show error dialog
    dialog.showErrorBox(
      'Startup Error',
      `Lit-Rift failed to start:\n\n${error.message}\n\nPlease check the logs for more details.`
    );

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
  logger.error('Uncaught exception', error);

  dialog.showErrorBox(
    'Unexpected Error',
    `An unexpected error occurred:\n\n${error.message}\n\nThe application will continue running, but you may want to restart it.`
  );
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', error);
});
