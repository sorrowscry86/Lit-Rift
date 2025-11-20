const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Logger configuration
const isDev = process.env.NODE_ENV === 'development';
const logDir = isDev
  ? path.join(__dirname, 'logs')
  : path.join(app.getPath('userData'), 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file paths
const logFile = path.join(logDir, `lit-rift-${new Date().toISOString().split('T')[0]}.log`);
const errorFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);

// Format log message
function formatMessage(level, source, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] [${source}] ${message}\n`;
}

// Write to file
function writeToFile(file, message) {
  try {
    fs.appendFileSync(file, message);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Logger class
class Logger {
  constructor(source = 'App') {
    this.source = source;
  }

  log(level, message, data = null) {
    const formattedMessage = formatMessage(level, this.source, message);

    // Console output (with color in dev mode)
    if (isDev) {
      const colors = {
        ERROR: '\x1b[31m',  // Red
        WARN: '\x1b[33m',   // Yellow
        INFO: '\x1b[36m',   // Cyan
        DEBUG: '\x1b[90m'   // Gray
      };
      console.log(`${colors[level]}${formattedMessage.trim()}\x1b[0m`);
      if (data) {
        console.log(data);
      }
    } else {
      console.log(formattedMessage.trim());
    }

    // File output
    writeToFile(logFile, formattedMessage);
    if (data) {
      writeToFile(logFile, JSON.stringify(data, null, 2) + '\n');
    }

    // Error file (errors only)
    if (level === LOG_LEVELS.ERROR) {
      writeToFile(errorFile, formattedMessage);
      if (data) {
        writeToFile(errorFile, JSON.stringify(data, null, 2) + '\n');
      }
    }
  }

  error(message, error = null) {
    this.log(LOG_LEVELS.ERROR, message, error ? {
      message: error.message,
      stack: error.stack,
      ...error
    } : null);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    if (isDev) {
      this.log(LOG_LEVELS.DEBUG, message, data);
    }
  }
}

// Cleanup old logs (keep last 7 days)
function cleanupOldLogs() {
  try {
    const files = fs.readdirSync(logDir);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
  }
}

// Run cleanup on startup
cleanupOldLogs();

module.exports = { Logger, LOG_LEVELS, logDir };
