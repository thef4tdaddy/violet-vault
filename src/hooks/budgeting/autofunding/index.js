/**
 * Auto-funding hooks index
 * Centralized exports for all auto-funding React hooks
 * Created as part of Issue #506 - Auto-funding refactoring
 */

// Main combined hook
export { useAutoFunding } from "./useAutoFunding.js";

// Specialized hooks for specific concerns
export { useAutoFundingRules } from "./useAutoFundingRules.js";
export { useAutoFundingExecution } from "./useAutoFundingExecution.js";
export { useAutoFundingData } from "./useAutoFundingData.js";
export { useAutoFundingHistory } from "./useAutoFundingHistory.js";
