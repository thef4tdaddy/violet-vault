// Performance monitoring utilities
import logger from "./logger";

export const performanceMonitor = {
  // Track component render times
  measureRender: (componentName, fn) => {
    if (process.env.NODE_ENV === "development") {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      logger.debug(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  // Debounce function for performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for performance
  throttle: (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memory usage monitoring
  logMemoryUsage: () => {
    if (process.env.NODE_ENV === "development" && "memory" in performance) {
      const memInfo = performance.memory;
      logger.debug("Memory Usage", {
        used: `${Math.round(memInfo.usedJSHeapSize / 1048576)}MB`,
        total: `${Math.round(memInfo.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memInfo.jsHeapSizeLimit / 1048576)}MB`,
      });
    }
  },

  // Measure async operations
  measureAsync: async (operationName, asyncFn) => {
    if (process.env.NODE_ENV === "development") {
      const start = performance.now();
      const result = await asyncFn();
      const end = performance.now();
      logger.debug(`${operationName} took: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return await asyncFn();
  },

  // Bundle size reporter (development only)
  reportBundleSize: () => {
    if (process.env.NODE_ENV === "development") {
      // This will help track when components are loaded
      const loadedChunks = new Set();
      const originalImport = window.__vitePreload;

      if (originalImport) {
        window.__vitePreload = (id, importer) => {
          if (!loadedChunks.has(id)) {
            logger.debug(`Loading chunk: ${id}`);
            loadedChunks.add(id);
          }
          return originalImport(id, importer);
        };
      }
    }
  },
};

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const measureRender = (fn) => performanceMonitor.measureRender(componentName, fn);

  return {
    measureRender,
    debounce: performanceMonitor.debounce,
    throttle: performanceMonitor.throttle,
  };
};
