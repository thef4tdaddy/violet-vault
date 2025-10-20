import { useCallback } from "react";
import { createRuleSummary } from "@/utils/budgeting/autofunding/rules";
import logger from "@/utils/common/logger";

interface Rule {
  id: string;
  [key: string]: unknown;
}

interface UseRuleSummariesProps {
  rules: Rule[];
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

        return rulesToSummarize.map((rule) => createRuleSummary(rule));
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
