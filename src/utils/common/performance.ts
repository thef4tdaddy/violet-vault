// Performance monitoring utilities
import logger from "@/utils/common/logger";

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

interface WindowWithVitePreload extends Window {
  __vitePreload?: (id: string, importer?: string) => Promise<unknown>;
}

export const performanceMonitor = {
  // Track component render times
  measureRender<T>(componentName: string, fn: () => T): T {
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
  debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for performance
  throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memory usage monitoring
  logMemoryUsage(): void {
    if (process.env.NODE_ENV === "development" && "memory" in performance) {
      const memInfo = (performance as ExtendedPerformance).memory;
      if (memInfo) {
        logger.debug("Memory Usage", {
          used: `${Math.round(memInfo.usedJSHeapSize / 1048576)}MB`,
          total: `${Math.round(memInfo.totalJSHeapSize / 1048576)}MB`,
          limit: `${Math.round(memInfo.jsHeapSizeLimit / 1048576)}MB`,
        });
      }
    }
  },

  // Measure async operations
  async measureAsync<T>(operationName: string, asyncFn: () => Promise<T>): Promise<T> {
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
  reportBundleSize(): void {
    if (process.env.NODE_ENV === "development") {
      // This will help track when components are loaded
      const loadedChunks = new Set<string>();
      const windowWithVite = window as WindowWithVitePreload;
      const originalImport = windowWithVite.__vitePreload;

      if (originalImport) {
        windowWithVite.__vitePreload = (id: string, importer?: string) => {
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
export const usePerformanceMonitor = (componentName: string) => {
  const measureRender = <T>(fn: () => T) => performanceMonitor.measureRender(componentName, fn);

  return {
    measureRender,
    debounce: performanceMonitor.debounce,
    throttle: performanceMonitor.throttle,
  };
};
