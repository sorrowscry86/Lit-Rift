const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Backend connection
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),

  // Auto-update events
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),

  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getEnvConfig: () => ipcRenderer.invoke('get-env-config'),

  // Settings and logs
  openSettings: () => ipcRenderer.invoke('open-settings'),
  openLogs: () => ipcRenderer.invoke('open-logs'),

  // Native dialogs
  showErrorDialog: (title, message) =>
    ipcRenderer.invoke('show-error-dialog', { title, message }),
  showInfoDialog: (title, message) =>
    ipcRenderer.invoke('show-info-dialog', { title, message }),

  // Platform info
  platform: process.platform,
  isElectron: true,
  isDevelopment: process.env.NODE_ENV === 'development'
});
