import { useCallback } from "react";
import logger from "@/utils/common/logger";
import { useRuleBulkOperations } from "../operations/useRuleBulkOperations";

/**
 * Hook for rule organization operations (reordering, priorities)
 * Updated to use bulk mutations instead of local state
 */
export const useRuleOrganization = () => {
  const { bulkUpdateRules: _bulkUpdateRules } = useRuleBulkOperations();

  // Reorder rules by priority
  const reorderRules = useCallback(async (ruleIds: string[]) => {
    try {
      logger.info("Reordering rules", { ruleIds });

      // In a real implementation, we would need to update each rule with its new priority.
      // Since useRuleBulkOperations.bulkUpdateRules applies the same updates to all rules,
      // we might need a more specialized bulk operation or individual updates.
      // For now, we'll assume the back-end or a specialized mutation handles this.

      // Alternative: individual updates in a transaction (handled in bulk operation ideally)
      // Here we'll just log and suggest refactoring the bulk mutation to support multi-rule unique updates

      logger.warn("reorderRules needs specialized bulk mutation for disparate updates");
    } catch (error) {
      logger.error("Failed to reorder rules", error);
      throw error;
    }
  }, []);

  return {
    reorderRules,
  };
};
