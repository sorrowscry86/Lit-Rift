/**
 * Error logging utility
 *
 * Provides centralized error logging with different levels and contexts
 * Integrates with Sentry for production error tracking
 */

import * as Sentry from '@sentry/react';

export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  userId?: string;
  projectId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

class ErrorLogger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Log an error with context
   */
  log(
    error: Error | string,
    level: ErrorLevel = ErrorLevel.ERROR,
    context?: ErrorContext
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message: errorMessage,
      stack: errorStack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Console logging (always in development)
    if (this.isDevelopment) {
      const consoleMethod = level === ErrorLevel.ERROR || level === ErrorLevel.CRITICAL
        ? console.error
        : level === ErrorLevel.WARNING
        ? console.warn
        : console.log;

      consoleMethod(`[${level.toUpperCase()}]`, errorMessage);
      if (errorStack) {
        console.error('Stack:', errorStack);
      }
      if (context) {
        console.log('Context:', context);
      }
    }

    // Production error tracking
    if (!this.isDevelopment && (level === ErrorLevel.ERROR || level === ErrorLevel.CRITICAL)) {
      // Send to error tracking service
      this.sendToErrorTracking(logData);
    }

    // Store in local storage for debugging (last 10 errors)
    this.storeLocalError(logData);
  }

  /**
   * Log an API error
   */
  logApiError(
    endpoint: string,
    error: Error | any,
    context?: ErrorContext
  ): void {
    this.log(
      error,
      ErrorLevel.ERROR,
      {
        ...context,
        type: 'API_ERROR',
        endpoint,
        status: error.response?.status,
        statusText: error.response?.statusText,
      }
    );
  }

  /**
   * Log a React error (from Error Boundary)
   */
  logReactError(
    error: Error,
    errorInfo: React.ErrorInfo,
    context?: ErrorContext
  ): void {
    this.log(
      error,
      ErrorLevel.CRITICAL,
      {
        ...context,
        type: 'REACT_ERROR',
        componentStack: errorInfo.componentStack,
      }
    );
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: ErrorContext): void {
    this.log(message, ErrorLevel.WARNING, context);
  }

  /**
   * Log informational message
   */
  info(message: string, context?: ErrorContext): void {
    this.log(message, ErrorLevel.INFO, context);
  }

  /**
   * Send error to tracking service (Sentry)
   */
  private sendToErrorTracking(logData: any): void {
    try {
      // Set context for Sentry
      if (logData.context) {
        Sentry.setContext('error_context', logData.context);
      }

      // Set tags for filtering in Sentry
      Sentry.setTag('error_level', logData.level);
      if (logData.context?.type) {
        Sentry.setTag('error_type', logData.context.type);
      }
      if (logData.context?.component) {
        Sentry.setTag('component', logData.context.component);
      }

      // Convert ErrorLevel to Sentry SeverityLevel
      const sentryLevel = this.mapToSentryLevel(logData.level);

      // Capture the error
      if (logData.stack) {
        // If we have a real Error object with stack trace
        const error = new Error(logData.message);
        error.stack = logData.stack;
        Sentry.captureException(error, {
          level: sentryLevel,
        });
      } else {
        // Just a message
        Sentry.captureMessage(logData.message, sentryLevel);
      }
    } catch (error) {
      // Don't let Sentry errors break the app
      console.error('Failed to send error to Sentry:', error);
    }
  }

  /**
   * Map ErrorLevel to Sentry SeverityLevel
   */
  private mapToSentryLevel(level: ErrorLevel): Sentry.SeverityLevel {
    switch (level) {
      case ErrorLevel.INFO:
        return 'info';
      case ErrorLevel.WARNING:
        return 'warning';
      case ErrorLevel.ERROR:
        return 'error';
      case ErrorLevel.CRITICAL:
        return 'fatal';
      default:
        return 'error';
    }
  }

  /**
   * Store error in local storage for debugging
   */
  private storeLocalError(logData: any): void {
    try {
      const stored = localStorage.getItem('error_logs');
      const errors = stored ? JSON.parse(stored) : [];
      errors.unshift(logData);

      // Keep only last 10 errors
      const trimmed = errors.slice(0, 10);
      localStorage.setItem('error_logs', JSON.stringify(trimmed));
    } catch (e) {
      // Ignore storage errors
      console.error('Failed to store error log:', e);
    }
  }

  /**
   * Get stored errors from local storage
   */
  getStoredErrors(): any[] {
    try {
      const stored = localStorage.getItem('error_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    localStorage.removeItem('error_logs');
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (error: Error | string, context?: ErrorContext) =>
  errorLogger.log(error, ErrorLevel.ERROR, context);

export const logWarning = (message: string, context?: ErrorContext) =>
  errorLogger.warn(message, context);

export const logInfo = (message: string, context?: ErrorContext) =>
  errorLogger.info(message, context);

export const logApiError = (endpoint: string, error: any, context?: ErrorContext) =>
  errorLogger.logApiError(endpoint, error, context);

export const logReactError = (error: Error, errorInfo: React.ErrorInfo, context?: ErrorContext) =>
  errorLogger.logReactError(error, errorInfo, context);
