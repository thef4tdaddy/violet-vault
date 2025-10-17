/**
 * Auto-funding hooks index
 * Centralized exports for all auto-funding React hooks
 * Created as part of Issue #506 - Auto-funding refactoring
 */

// Main combined hook
export { useAutoFunding } from "./useAutoFunding.ts";

// Specialized hooks for specific concerns
export { useAutoFundingRules } from "./useAutoFundingRules.ts";
export { useAutoFundingExecution } from "./useAutoFundingExecution.ts";
export { useAutoFundingData } from "./useAutoFundingData.ts";
export { useAutoFundingHistory } from "./useAutoFundingHistory.ts";
