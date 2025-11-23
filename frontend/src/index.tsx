import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { logPerformanceMetric } from './utils/performanceMonitoring';
import { initSentry } from './config/sentry';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';
import { analytics } from './utils/analytics';

// Initialize Sentry for error tracking (before anything else)
initSentry();

// Initialize Analytics
analytics.init();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Track Web Vitals (LCP, FID, CLS, FCP, TTFB)
// Logs to console in development, sends to analytics in production
reportWebVitals(logPerformanceMetric);

// Register service worker for offline support (production only)
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('[SW] Content is cached for offline use.');
  },
  onUpdate: () => {
    console.log('[SW] New content is available; please refresh.');
    // Could show a toast notification here to prompt user to refresh
  },
});
