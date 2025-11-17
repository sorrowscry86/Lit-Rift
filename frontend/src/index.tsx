import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { logPerformanceMetric } from './utils/performanceMonitoring';
import { initSentry } from './config/sentry';

// Initialize Sentry for error tracking (before anything else)
initSentry();

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
