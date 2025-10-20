import { useCallback } from "react";
import logger from "@/utils/common/logger";

interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  [key: string]: unknown;
}

interface UseRuleTogglesProps {
  rules: Rule[];
  updateRule: (ruleId: string, updates: Partial<Rule>) => Rule | undefined;
}

/**
 * Hook for rule toggle operations (enable/disable)
 */
export const useRuleToggles = ({ rules, updateRule }: UseRuleTogglesProps) => {
  // Toggle rule enabled status
  const toggleRule = useCallback(
    (ruleId: string) => {
      try {
        const rule = rules.find((r) => r.id === ruleId);
        if (!rule) {
          throw new Error(`Rule not found: ${ruleId}`);
        }

        return updateRule(ruleId, { enabled: !rule.enabled });
      } catch (error) {
        logger.error("Failed to toggle auto-funding rule", error);
        throw error;
      }
    },
    [rules, updateRule]
  );

  return {
    toggleRule,
  };
};
