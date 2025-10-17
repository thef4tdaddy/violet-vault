/**
 * Retry metrics tracking and calculation utilities
 * Provides performance insights for retry operations
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */

/**
 * Create initial retry metrics object
 */
export const createRetryMetrics = () => ({
  totalOperations: 0,
  successfulOperations: 0,
  retriedOperations: 0,
  totalRetries: 0,
  averageRetries: 0,
  errorsByType: {},
  lastOperationTime: null,
});

/**
 * Update metrics after successful operation
 */
export const updateRetryMetrics = (metrics, attempt) => {
  metrics.successfulOperations++;
  metrics.lastOperationTime = Date.now();

  if (attempt > 1) {
    metrics.retriedOperations++;
    metrics.totalRetries += attempt - 1;
    metrics.averageRetries = calculateAverageRetries(metrics);
  }
};

/**
 * Track error by type for analysis
 */
export const trackErrorMetrics = (metrics, errorType) => {
  metrics.errorsByType[errorType] = (metrics.errorsByType[errorType] || 0) + 1;
};

/**
 * Calculate average retries for operations that needed retry
 */
export const calculateAverageRetries = (metrics) => {
  if (metrics.retriedOperations === 0) return 0;
  return Number((metrics.totalRetries / metrics.retriedOperations).toFixed(2));
};

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (metrics) => {
  if (metrics.totalOperations === 0) return "0%";
  const rate = (metrics.successfulOperations / metrics.totalOperations) * 100;
  return rate.toFixed(1) + "%";
};

/**
 * Calculate retry rate percentage
 */
export const calculateRetryRate = (metrics) => {
  if (metrics.totalOperations === 0) return "0%";
  const rate = (metrics.retriedOperations / metrics.totalOperations) * 100;
  return rate.toFixed(1) + "%";
};

/**
 * Format metrics for display/logging
 */
export const formatMetrics = (metrics) => ({
  ...metrics,
  successRate: calculateSuccessRate(metrics),
  retryRate: calculateRetryRate(metrics),
  averageRetries: calculateAverageRetries(metrics),
});

/**
 * Reset metrics to initial state
 */
export const resetMetrics = (metrics) => {
  Object.assign(metrics, createRetryMetrics());
};

export default {
  createRetryMetrics,
  updateRetryMetrics,
  trackErrorMetrics,
  calculateAverageRetries,
  calculateSuccessRate,
  calculateRetryRate,
  formatMetrics,
  resetMetrics,
};
