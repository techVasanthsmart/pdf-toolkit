/**
 * Analytics: Google Analytics 4 (GA4) and SEO-related tracking.
 * Set VITE_GA_MEASUREMENT_ID in your environment to enable GA4.
 */

import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
let isInitialized = false;

/**
 * Initialize analytics (GA4). Safe to call multiple times; only runs if ID is set.
 */
export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof GA_MEASUREMENT_ID !== "string" || !GA_MEASUREMENT_ID.trim()) {
    return;
  }
  if (isInitialized) return;
  try {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    isInitialized = true;
  } catch {
    // ignore init errors (e.g. ad blockers)
  }
}

/**
 * Send a page view to GA4. Call on route change for SPA.
 * @param {string} path - Path (e.g. location.pathname)
 * @param {string} [title] - Optional page title
 */
export function trackPageView(path, title) {
  if (!isInitialized) return;
  try {
    ReactGA.send({
      hitType: "pageview",
      page: path || "/",
      title: title || (typeof document !== "undefined" ? document.title : ""),
    });
  } catch {
    // ignore send errors
  }
}

/**
 * Track a custom event (e.g. button click, tool usage).
 * @param {string} name - Event name
 * @param {Record<string, string | number | boolean>} [params] - Optional parameters
 */
export function trackEvent(name, params) {
  if (!isInitialized) return;
  try {
    ReactGA.event(name, params || {});
  } catch {
    // ignore
  }
}

export { ReactGA };
