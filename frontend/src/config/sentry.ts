/**
 * Sentry Configuration
 *
 * Production-ready error tracking and performance monitoring.
 *
 * Setup Instructions:
 * 1. Sign up at https://sentry.io (free tier available)
 * 2. Create a new React project
 * 3. Copy your DSN from Project Settings > Client Keys
 * 4. Add to .env file:
 *    REACT_APP_SENTRY_DSN=your_dsn_here
 *    REACT_APP_SENTRY_ENVIRONMENT=development|staging|production
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry(): void {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  const environment = process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  // Skip initialization if no DSN is provided (optional in development)
  if (!dsn) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Sentry DSN not configured. Error tracking is disabled.');
    } else {
      console.log('Sentry DSN not configured. Running without error tracking.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Use default integrations for error tracking
    // Additional integrations can be added as needed

    // Performance Monitoring (optional)
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Session Replay (optional - requires additional setup)
    // replaysSessionSampleRate: 0.1,
    // replaysOnErrorSampleRate: 1.0

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Filter out certain errors
      const error = hint.originalException;

      // Ignore network errors that are expected
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (message.includes('network error') || message.includes('fetch failed')) {
          // Still log but with lower priority
          event.level = 'warning';
        }
      }

      // Remove sensitive data from URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/([?&]token=)[^&]+/, '$1[REDACTED]');
        event.request.url = event.request.url.replace(/([?&]password=)[^&]+/, '$1[REDACTED]');
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Random plugins/extensions
      'atomicFindClose',
      // Facebook garbage
      'fb_xd_fragment',
      // ISP injected content
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Chrome extensions
      'chrome-extension://',
      'moz-extension://',
    ],

    // Don't report errors from certain URLs
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^resource:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  console.log(`✅ Sentry initialized in ${environment} mode`);
}

/**
 * Manually capture an exception to Sentry
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}
