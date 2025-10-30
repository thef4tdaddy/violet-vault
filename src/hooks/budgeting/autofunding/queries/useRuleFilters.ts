import { useCallback } from "react";
import { filterRules, sortRulesByPriority, type AutoFundingRule } from "@/utils/budgeting/autofunding/rules";
import logger from "@/utils/common/logger";

interface UseRuleFiltersProps {
  rules: AutoFundingRule[];
}

/**
 * Hook for rule filtering and sorting operations
 */
export const useRuleFilters = ({ rules }: UseRuleFiltersProps) => {
  // Get rules with filtering and sorting
  const getFilteredRules = useCallback(
    (filters: Record<string, unknown> = {}) => {
      try {
        let filteredRules = filterRules(rules, filters);

        if (filters.sort !== false) {
          filteredRules = sortRulesByPriority(filteredRules);
        }

        return filteredRules;
      } catch (error) {
        logger.error("Failed to filter rules", error);
        return rules;
      }
    },
    [rules]
  );

  return {
    getFilteredRules,
  };
};
