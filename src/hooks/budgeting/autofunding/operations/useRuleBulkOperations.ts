import React, { useCallback } from "react";
import logger from "@/utils/common/logger";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";

interface UseRuleBulkOperationsProps {
  setRules: React.Dispatch<React.SetStateAction<AutoFundingRule[]>>;
}

/**
 * Hook for bulk rule operations
 */
export const useRuleBulkOperations = ({ setRules }: UseRuleBulkOperationsProps) => {
  // Bulk update rules
  const bulkUpdateRules = useCallback(
    (ruleIds: string[], updates: Partial<AutoFundingRule>) => {
      try {
        setRules((prevRules) =>
          prevRules.map((rule) =>
            ruleIds.includes(rule.id)
              ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
              : rule
          )
        );

        logger.info("Bulk rule update completed", {
          ruleIds,
          updates: Object.keys(updates),
        });
      } catch (error) {
        logger.error("Failed to bulk update rules", error);
        throw error;
      }
    },
    [setRules]
  );

  // Bulk delete rules
  const bulkDeleteRules = useCallback(
    (ruleIds: string[]) => {
      try {
        setRules((prevRules) => prevRules.filter((rule) => !ruleIds.includes(rule.id)));

        logger.info("Bulk rule deletion completed", { ruleIds });
      } catch (error) {
        logger.error("Failed to bulk delete rules", error);
        throw error;
      }
    },
    [setRules]
  );

  // Bulk toggle rules
  const bulkToggleRules = useCallback(
    (ruleIds: string[], enabled: boolean) => {
      try {
        bulkUpdateRules(ruleIds, { enabled });

        logger.info("Bulk rule toggle completed", { ruleIds, enabled });
      } catch (error) {
        logger.error("Failed to bulk toggle rules", error);
        throw error;
      }
    },
    [bulkUpdateRules]
  );

  return {
    bulkUpdateRules,
    bulkDeleteRules,
    bulkToggleRules,
  };
};
