import { useCallback } from "react";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";

interface UseRuleQueriesProps {
  rules: AutoFundingRule[];
}

/**
 * Hook for basic rule querying operations
 */
export const useRuleQueries = ({ rules }: UseRuleQueriesProps) => {
  // Get rule by ID
  const getRuleById = useCallback(
    (ruleId: string) => {
      return rules.find((rule) => rule.id === ruleId);
    },
    [rules]
  );

  // Get rules by type
  const getRulesByType = useCallback(
    (type: string) => {
      return rules.filter((rule) => rule.type === type);
    },
    [rules]
  );

  // Get rules by trigger
  const getRulesByTrigger = useCallback(
    (trigger: string) => {
      return rules.filter((rule) => rule.trigger === trigger);
    },
    [rules]
  );

  return {
    getRuleById,
    getRulesByType,
    getRulesByTrigger,
  };
};
