/**
 * Analytics Integration
 *
 * Provides analytics tracking for key user events and behaviors.
 * Supports multiple analytics providers (Google Analytics, Plausible, custom).
 *
 * Privacy-first approach: Only tracks anonymous usage data.
 */

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
}

class Analytics {
  private enabled: boolean;
  private userId: string | null = null;

  constructor() {
    // Only enable analytics in production
    this.enabled = process.env.NODE_ENV === 'production' && !!process.env.REACT_APP_GA_MEASUREMENT_ID;
  }

  /**
   * Initialize analytics with user context (anonymous)
   */
  init(userId?: string) {
    if (!this.enabled) return;

    this.userId = userId || null;

    // Initialize Google Analytics if configured
    if (process.env.REACT_APP_GA_MEASUREMENT_ID) {
      this.initGoogleAnalytics();
    }

    // Initialize Plausible if configured
    if (process.env.REACT_APP_PLAUSIBLE_DOMAIN) {
      this.initPlausible();
    }

    console.log('[Analytics] Initialized');
  }

  /**
   * Initialize Google Analytics (gtag.js)
   */
  private initGoogleAnalytics() {
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      anonymize_ip: true, // Privacy-friendly
      send_page_view: false, // We'll send manually
    });
  }

  /**
   * Initialize Plausible Analytics
   */
  private initPlausible() {
    const domain = process.env.REACT_APP_PLAUSIBLE_DOMAIN;
    if (!domain) return;

    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', domain);
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  /**
   * Track page view
   */
  pageView(event: PageViewEvent) {
    if (!this.enabled) {
      console.log('[Analytics] PageView (dev):', event);
      return;
    }

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: event.path,
        page_title: event.title,
        page_referrer: event.referrer,
      });
    }

    // Plausible (auto-tracks page views)
    // No manual tracking needed

    console.log('[Analytics] PageView:', event);
  }

  /**
   * Track custom event
   */
  event(event: AnalyticsEvent) {
    if (!this.enabled) {
      console.log('[Analytics] Event (dev):', event);
      return;
    }

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }

    // Plausible custom events
    if ((window as any).plausible) {
      (window as any).plausible(event.action, {
        props: {
          category: event.category,
          label: event.label,
          ...event.metadata,
        },
      });
    }

    console.log('[Analytics] Event:', event);
  }

  /**
   * Track user signup
   */
  signup(method: string = 'email') {
    this.event({
      category: 'User',
      action: 'signup',
      label: method,
    });
  }

  /**
   * Track user login
   */
  login(method: string = 'email') {
    this.event({
      category: 'User',
      action: 'login',
      label: method,
    });
  }

  /**
   * Track project creation
   */
  projectCreated(projectData: { genre?: string; wordCount?: number }) {
    this.event({
      category: 'Project',
      action: 'create',
      label: projectData.genre,
      value: projectData.wordCount,
    });
  }

  /**
   * Track AI generation usage
   */
  aiGeneration(type: 'scene' | 'character' | 'plot', wordCount?: number) {
    this.event({
      category: 'AI',
      action: 'generate',
      label: type,
      value: wordCount,
    });
  }

  /**
   * Track feature adoption
   */
  featureUsed(featureName: string) {
    this.event({
      category: 'Feature',
      action: 'use',
      label: featureName,
    });
  }

  /**
   * Track errors (for error rate monitoring)
   */
  error(errorType: string, errorMessage?: string) {
    this.event({
      category: 'Error',
      action: errorType,
      label: errorMessage,
    });
  }

  /**
   * Track performance metrics
   */
  performance(metric: string, value: number) {
    this.event({
      category: 'Performance',
      action: metric,
      value: Math.round(value),
    });
  }
}

// Singleton instance
export const analytics = new Analytics();

// Convenience exports
export const trackPageView = (path: string, title?: string) =>
  analytics.pageView({ path, title });

export const trackEvent = (category: string, action: string, label?: string, value?: number) =>
  analytics.event({ category, action, label, value });

export const trackSignup = (method?: string) => analytics.signup(method);
export const trackLogin = (method?: string) => analytics.login(method);
export const trackProjectCreated = (data: any) => analytics.projectCreated(data);
export const trackAIGeneration = (type: 'scene' | 'character' | 'plot', wordCount?: number) =>
  analytics.aiGeneration(type, wordCount);
export const trackFeatureUsed = (feature: string) => analytics.featureUsed(feature);
export const trackError = (type: string, message?: string) => analytics.error(type, message);
export const trackPerformance = (metric: string, value: number) => analytics.performance(metric, value);

export default analytics;
