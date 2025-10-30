import { useCallback } from "react";
import { getRuleStatistics, type AutoFundingRule } from "@/utils/budgeting/autofunding/rules";
import logger from "@/utils/common/logger";

interface UseRuleStatisticsProps {
  rules: AutoFundingRule[];
}

/**
 * Hook for rule statistics operations
 */
export const useRuleStatistics = ({ rules }: UseRuleStatisticsProps) => {
  // Get statistics about the rules
  const getRulesStatistics = useCallback(() => {
    try {
      return getRuleStatistics(rules);
    } catch (error) {
      logger.error("Failed to get rule statistics", error);
      return {
        total: 0,
        enabled: 0,
        disabled: 0,
        byType: {},
        byTrigger: {},
        totalExecutions: 0,
        lastExecuted: null,
      };
    }
  }, [rules]);

  return {
    getRulesStatistics,
  };
};
