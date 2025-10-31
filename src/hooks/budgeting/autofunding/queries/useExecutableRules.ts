import { useCallback } from "react";
import {
  shouldRuleExecute,
  type Rule,
  type ExecutionContext,
} from "@/utils/budgeting/autofunding/conditions";
import logger from "@/utils/common/logger";

interface UseExecutableRulesProps {
  rules: Rule[];
}

/**
 * Hook for executable rule operations
 */
export const useExecutableRules = ({ rules }: UseExecutableRulesProps) => {
  // Get executable rules for a given context
  const getExecutableRules = useCallback(
    (context: ExecutionContext) => {
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
