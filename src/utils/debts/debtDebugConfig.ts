/**
 * Debug configuration for systematically isolating debt TDZ errors
 * Enable/disable debt components and features step by step
 */

import logger from "@/utils/common/logger";

// Main feature toggles - disable entire sections
export const DEBT_DEBUG_CONFIG = {
  // Core debt functionality
  ENABLE_DEBT_MANAGEMENT_HOOK: true, // useDebtManagement hook
  ENABLE_DEBT_DASHBOARD: true, // Main DebtDashboard component (RE-ENABLED)

  // Debt dashboard sections - TESTING SUMMARY CARDS
  ENABLE_DEBT_SUMMARY_CARDS: true, // DebtSummaryCards component (TESTING)
  ENABLE_DEBT_LIST: true, // DebtList component (TESTING)
  ENABLE_DEBT_FILTERS: true, // DebtFilters component (TESTING)
  ENABLE_DEBT_MODALS: true, // Add/Edit/Detail modals (TDZ FIXED!)

  // Debt calculations
  ENABLE_DEBT_STATS_CALC: true, // debtStats calculations
  ENABLE_PAYOFF_CALCULATIONS: true, // payoff projections
  ENABLE_INTEREST_CALCULATIONS: true, // interest calculations
  ENABLE_NEXT_PAYMENT_CALC: true, // next payment dates

  // Debt enrichment
  ENABLE_DEBT_ENRICHMENT: true, // enrichDebt function
  ENABLE_DEBT_SORTING: true, // debt filtering/sorting
  ENABLE_UPCOMING_PAYMENTS: true, // upcoming payments feature

  // Individual components - TDZ FIXED, RE-ENABLING ALL
  ENABLE_DEBT_DETAIL_MODAL: true, // DebtDetailModal (ENABLED)
  ENABLE_ADD_DEBT_MODAL: true, // AddDebtModal (TDZ FIXED)
  ENABLE_DEBT_STRATEGIES: true, // DebtStrategies (RE-ENABLED - fixed stub component)
};

/**
 * Check if a debt feature is enabled
 * @param {string} feature - Feature key from DEBT_DEBUG_CONFIG
 * @returns {boolean} Whether feature is enabled
 */
export function isDebtFeatureEnabled(feature: keyof typeof DEBT_DEBUG_CONFIG): boolean {
  return DEBT_DEBUG_CONFIG[feature] === true;
}

/**
 * Disable a debt feature for testing
 * @param {string} feature - Feature key to disable
 */
export function disableDebtFeature(feature: keyof typeof DEBT_DEBUG_CONFIG): void {
  DEBT_DEBUG_CONFIG[feature] = false;
  logger.debug(`[DEBT DEBUG] Disabled feature: ${feature}`, { feature });
}

/**
 * Enable a debt feature for testing
 * @param {string} feature - Feature key to enable
 */
export function enableDebtFeature(feature: keyof typeof DEBT_DEBUG_CONFIG): void {
  DEBT_DEBUG_CONFIG[feature] = true;
  logger.debug(`[DEBT DEBUG] Enabled feature: ${feature}`, { feature });
}

/**
 * Get current debug configuration status
 * @returns {Object} Current feature states
 */
export function getDebtDebugStatus() {
  return { ...DEBT_DEBUG_CONFIG };
}
