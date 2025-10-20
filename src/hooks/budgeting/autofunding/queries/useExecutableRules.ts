import { useCallback } from "react";
import { shouldRuleExecute } from "@/utils/budgeting/autofunding/conditions";
import logger from "@/utils/common/logger";

interface Rule {
  [key: string]: unknown;
}

interface UseExecutableRulesProps {
  rules: Rule[];
}

/**
 * Hook for executable rule operations
 */
export const useExecutableRules = ({ rules }: UseExecutableRulesProps) => {
  // Get executable rules for a given context
  const getExecutableRules = useCallback(
    (context: Record<string, unknown>) => {
      try {
        return rules.filter((rule) => shouldRuleExecute(rule, context));
      } catch (error) {
        logger.error("Failed to get executable rules", error);
        return [];
      }
    },
    [rules]
  );

  return {
    getExecutableRules,
  };
};
