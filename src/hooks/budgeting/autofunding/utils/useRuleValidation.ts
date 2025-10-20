import { useCallback } from "react";
import { validateRule } from "@/utils/budgeting/autofunding/rules";

interface Rule {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface UseRuleValidationProps {
  rules: Rule[];
}

/**
 * Hook for rule validation operations
 */
export const useRuleValidation = ({ rules }: UseRuleValidationProps) => {
  // Validate all rules
  const validateAllRules = useCallback(() => {
    const validationResults = rules.map((rule) => ({
      ruleId: rule.id,
      ruleName: rule.name,
      ...validateRule(rule),
    }));

    return {
      allValid: validationResults.every((result) => result.isValid),
      results: validationResults,
      invalidRules: validationResults.filter((result) => !result.isValid),
    };
  }, [rules]);

  return {
    validateAllRules,
  };
};
