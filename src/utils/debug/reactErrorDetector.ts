/**
 * Runtime React Error #185 Detection System
 *
 * This module provides runtime detection and warnings for patterns that cause
 * React error #185 infinite render loops. Only active in development mode.
 */

import logger from "../common/logger";

// Track store action calls to detect patterns
const storeActionCallCount = new Map<string, number>();
let lastResetTime = Date.now();

/**
 * Monitor for excessive store action calls that might indicate infinite loops
 */
const monitorStoreActions = () => {
  // Reset counters every 5 seconds
  const now = Date.now();
  if (now - lastResetTime > 5000) {
    storeActionCallCount.clear();
    lastResetTime = now;
  }
};

/**
 * Track a store action call and warn if excessive
 */
export const trackStoreAction = (actionName: string, storeName: string = "unknown"): void => {
  if (import.meta?.env?.MODE !== "development") return;

  const key = `${storeName}.${actionName}`;
  const currentCount = storeActionCallCount.get(key) || 0;
  storeActionCallCount.set(key, currentCount + 1);

  // Warn if action called too frequently (potential infinite loop)
  if (currentCount > 10) {
    logger.error(
      `🚨 POTENTIAL REACT ERROR #185: Store action "${key}" called ${currentCount + 1} times in 5 seconds!`,
      {
        actionName,
        storeName,
        callCount: currentCount + 1,
        warning: "This pattern often causes infinite render loops",
        solution: "Check for get() calls in store actions or useEffect dependency issues",
      }
    );
  }

  monitorStoreActions();
};

/**
 * Warn about dangerous useEffect patterns
 */
export const warnDangerousUseEffect = (
  hookName: string,
  dependencies: unknown[]
): void => {
  if (import.meta?.env?.MODE !== "development") return;

  const storeActionDeps = dependencies.filter(
    (dep): dep is { name: string } =>
      typeof dep === "function" &&
      typeof (dep as { name?: string }).name === "string" &&
      /^(set|get|add|remove|update|delete|create|save|load|sync|login|logout|reset)/.test(
        (dep as { name: string }).name
      )
  );

  if (storeActionDeps.length > 0) {
    logger.warn(`🚨 DANGEROUS USEEFFECT PATTERN: Store actions in dependency array detected!`, {
      hookName,
      storeActions: storeActionDeps.map((dep) => dep.name),
      warning: "This pattern causes React error #185",
      solution: "Remove store actions from dependency array - they are stable in Zustand",
    });
  }
};

/**
 * Initialize runtime monitoring
 */
export const initializeReactErrorDetector = (): void => {
  if (import.meta?.env?.MODE !== "development") return;

  logger.info("🛡️ React Error #185 detector initialized - monitoring for dangerous patterns");

  // Monitor render count to detect infinite loops
  let renderCount = 0;
  let lastRenderTime = Date.now();

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const errorMessage = args[0];

    if (typeof errorMessage === "string" && errorMessage.includes("error #185")) {
      logger.error(`🚨 REACT ERROR #185 DETECTED! Infinite render loop in progress`, {
        renderCount,
        timeElapsed: Date.now() - lastRenderTime,
        recentStoreActions: Array.from(storeActionCallCount.entries()),
        troubleshootingTips: [
          "1. Check for get() calls inside store actions",
          "2. Look for store actions in useEffect dependency arrays",
          "3. Search for auto-executing module code",
          "4. Verify no circular store action calls",
        ],
      });
    }

    originalError.apply(console, args);
  };

  // Periodic health check
  setInterval(() => {
    const totalActionCalls = Array.from(storeActionCallCount.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalActionCalls > 50) {
      logger.warn(`🚨 HIGH STORE ACTIVITY: ${totalActionCalls} store actions in last 5 seconds`, {
        breakdown: Object.fromEntries(storeActionCallCount),
        warning: "High activity might indicate infinite loops",
      });
    }
  }, 5000);
};

/**
 * Enhanced store wrapper that adds monitoring
 */
export const wrapStoreForMonitoring = (store, storeName) => {
  if (import.meta?.env?.MODE !== "development") return store;

  return new Proxy(store, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // Monitor function calls (store actions)
      if (typeof value === "function" && typeof prop === "string") {
        return function (...args) {
          trackStoreAction(prop, storeName);
          return value.apply(this, args);
        };
      }

      return value;
    },
  });
};

export default {
  trackStoreAction,
  warnDangerousUseEffect,
  initializeReactErrorDetector,
  wrapStoreForMonitoring,
};
