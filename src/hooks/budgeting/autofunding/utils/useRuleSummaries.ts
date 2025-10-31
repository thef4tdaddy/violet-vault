import { useCallback } from "react";
import type { AutoFundingRule, RuleSummary } from "@/utils/budgeting/autofunding/rules";
import logger from "@/utils/common/logger";

interface UseRuleSummariesProps {
  rules: AutoFundingRule[];
}

/**
 * Hook for rule summary operations
 */
export const useRuleSummaries = ({ rules }: UseRuleSummariesProps) => {
  // Create rule summaries for display
  const getRuleSummaries = useCallback(
    (ruleIds: string[] | null = null) => {
      try {
        const rulesToSummarize = ruleIds
          ? rules.filter((rule) => ruleIds.includes(rule.id))
          : rules;

        return rulesToSummarize.map(
          (rule): RuleSummary => ({
            id: rule.id,
            name: rule.name,
            enabled: rule.enabled,
            priority: rule.priority,
            type: rule.type,
            trigger: rule.trigger,
            description: rule.description,
            targetDescription: `${rule.config.targetType}: ${rule.config.targetId || "multiple"}`,
          })
        );
      } catch (error) {
        logger.error("Failed to create rule summaries", error);
        return [];
      }
    },
    [rules]
  );

  return {
    getRuleSummaries,
  };
};
