import React, { useCallback } from "react";
import logger from "@/utils/common/logger";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";

interface UseRuleOrganizationProps {
  setRules: React.Dispatch<React.SetStateAction<AutoFundingRule[]>>;
}

/**
 * Hook for rule organization operations (reordering, priorities)
 */
export const useRuleOrganization = ({ setRules }: UseRuleOrganizationProps) => {
  // Reorder rules by priority
  const reorderRules = useCallback(
    (ruleIds: string[]) => {
      try {
        setRules((prevRules) => {
          const reorderedRules = [...prevRules];

          // Update priorities based on position in the array
          ruleIds.forEach((ruleId, index) => {
            const ruleIndex = reorderedRules.findIndex((rule) => rule.id === ruleId);
            if (ruleIndex !== -1) {
              reorderedRules[ruleIndex] = {
                ...reorderedRules[ruleIndex],
                priority: (index + 1) * 10, // Space priorities by 10
              };
            }
          });

          return reorderedRules;
        });

        logger.info("Rules reordered", { ruleIds });
      } catch (error) {
        logger.error("Failed to reorder rules", error);
        throw error;
      }
    },
    [setRules]
  );

  return {
    reorderRules,
  };
};
