/**
 * Performance Monitoring Utility
 *
 * Tracks Core Web Vitals and other performance metrics:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial render
 * - TTFB (Time to First Byte) - Server response time
 *
 * In production, this would integrate with analytics services like:
 * - Google Analytics
 * - Plausible
 * - Mixpanel
 * - Custom analytics endpoint
 */

import { Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
  timestamp: number;
}

/**
 * Performance thresholds based on Google's Core Web Vitals
 * https://web.dev/vitals/
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },        // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte (ms)
};

/**
 * Get rating for a metric value
 */
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Get color for console logging based on rating
 */
function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '#0CCE6B';
    case 'needs-improvement':
      return '#FFA400';
    case 'poor':
      return '#FF4E42';
    default:
      return '#000000';
  }
}

/**
 * Log performance metric
 */
export function logPerformanceMetric(metric: Metric): void {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: (metric as any).navigationType || 'navigate',
    timestamp: Date.now(),
  };

  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    const color = getRatingColor(performanceMetric.rating);
    const emoji = {
      'good': '✅',
      'needs-improvement': '⚠️',
      'poor': '❌',
    }[performanceMetric.rating];

    console.log(
      `%c${emoji} Web Vitals: ${performanceMetric.name}`,
      `color: ${color}; font-weight: bold; font-size: 12px;`,
      `\n  Value: ${Math.round(performanceMetric.value)}ms`,
      `\n  Rating: ${performanceMetric.rating}`,
      `\n  Navigation: ${performanceMetric.navigationType}`
    );
  }

  // Production analytics integration
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(performanceMetric);
  }

  // Store metrics in sessionStorage for debugging
  storeMetric(performanceMetric);
}

/**
 * Send metric to analytics service
 */
function sendToAnalytics(metric: PerformanceMetric): void {
  // In production, send to analytics service
  // Example with Google Analytics:
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.value),
  //     event_category: 'Web Vitals',
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }

  // Example with custom endpoint:
  // fetch('/api/analytics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // });

  // Placeholder for now
  console.log('[Analytics] Would send metric:', metric.name, metric.value);
}

/**
 * Store metric in sessionStorage for debugging
 */
function storeMetric(metric: PerformanceMetric): void {
  try {
    const stored = sessionStorage.getItem('web_vitals');
    const metrics = stored ? JSON.parse(stored) : [];

    // Update or add metric (only keep latest value for each metric type)
    const existingIndex = metrics.findIndex((m: PerformanceMetric) => m.name === metric.name);
    if (existingIndex >= 0) {
      metrics[existingIndex] = metric;
    } else {
      metrics.push(metric);
    }

    sessionStorage.setItem('web_vitals', JSON.stringify(metrics));
  } catch (e) {
    // Ignore storage errors
    console.error('Failed to store performance metric:', e);
  }
}

/**
 * Get all stored metrics
 */
export function getStoredMetrics(): PerformanceMetric[] {
  try {
    const stored = sessionStorage.getItem('web_vitals');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Clear stored metrics
 */
export function clearStoredMetrics(): void {
  sessionStorage.removeItem('web_vitals');
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  overall: 'good' | 'needs-improvement' | 'poor';
  metrics: PerformanceMetric[];
} {
  const metrics = getStoredMetrics();

  // Core Web Vitals only (LCP, FID, CLS)
  const coreMetrics = metrics.filter(m => ['LCP', 'FID', 'CLS'].includes(m.name));

  // Overall rating is worst of the core metrics
  let overall: 'good' | 'needs-improvement' | 'poor' = 'good';
  for (const metric of coreMetrics) {
    if (metric.rating === 'poor') {
      overall = 'poor';
      break;
    } else if (metric.rating === 'needs-improvement') {
      overall = 'needs-improvement';
    }
  }

  return { overall, metrics };
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary(): void {
  const summary = getPerformanceSummary();

  console.group('📊 Web Vitals Summary');
  console.log(`Overall Rating: ${summary.overall}`);
  summary.metrics.forEach(metric => {
    const emoji = {
      'good': '✅',
      'needs-improvement': '⚠️',
      'poor': '❌',
    }[metric.rating];
    console.log(`${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
  });
  console.groupEnd();
}
