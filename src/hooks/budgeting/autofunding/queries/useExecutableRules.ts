import { useCallback } from "react";
import {
  shouldRuleExecute,
  type Rule,
  type ExecutionContext,
} from "@/utils/budgeting/autofunding/conditions";
import logger from "@/utils/common/logger";

interface UseExecutableRulesProps<T extends Rule> {
  rules: T[];
}

/**
 * Hook for executable rule operations
 */
export const useExecutableRules = <T extends Rule>({ rules }: UseExecutableRulesProps<T>) => {
  // Get executable rules for a given context
  const getExecutableRules = useCallback(
    (context: ExecutionContext): T[] => {
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
