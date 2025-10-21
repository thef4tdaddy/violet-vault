import React, { useCallback } from "react";
import { createDefaultRule, validateRule } from "@/utils/budgeting/autofunding/rules";
import logger from "@/utils/common/logger";

interface Rule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastExecuted?: string | null;
  executionCount: number;
  updatedAt?: string;
  [key: string]: unknown;
}

interface UseRuleOperationsProps {
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
}

/**
 * Hook for basic rule operations (CRUD)
 */
export const useRuleOperations = ({ rules, setRules }: UseRuleOperationsProps) => {
  // Add new rule
  const addRule = useCallback((ruleConfig: Partial<Rule>) => {
    try {
      const validation = validateRule(ruleConfig);
      if (!validation.isValid) {
        throw new Error(`Invalid rule configuration: ${validation.errors.join(", ")}`);
      }

      const newRule: Rule = {
        ...createDefaultRule(),
        ...ruleConfig,
      } as Rule;

      setRules((prevRules) => [...prevRules, newRule]);

      logger.info("Auto-funding rule added", {
        ruleId: newRule.id,
        name: newRule.name,
        type: newRule.type,
      });

      return newRule;
    } catch (error) {
      logger.error("Failed to add auto-funding rule", error);
      throw error;
    }
  }, [setRules]);

  // Update existing rule
  const updateRule = useCallback(
    (ruleId: string, updates: Partial<Rule>) => {
      try {
        setRules((prevRules) => {
          const ruleIndex = prevRules.findIndex((rule) => rule.id === ruleId);
          if (ruleIndex === -1) {
            throw new Error(`Rule not found: ${ruleId}`);
          }

          const updatedRule: Rule = {
            ...prevRules[ruleIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          } as Rule;

          const validation = validateRule(updatedRule);
          if (!validation.isValid) {
            throw new Error(`Invalid rule configuration: ${validation.errors.join(", ")}`);
          }

          const newRules = [...prevRules];
          newRules[ruleIndex] = updatedRule;
          return newRules;
        });

        logger.info("Auto-funding rule updated", {
          ruleId,
          updates: Object.keys(updates),
        });

        return rules.find((rule) => rule.id === ruleId);
      } catch (error) {
        logger.error("Failed to update auto-funding rule", error);
        throw error;
      }
    },
    [rules, setRules]
  );

  // Delete rule
  const deleteRule = useCallback((ruleId: string) => {
    try {
      setRules((prevRules) => {
        const ruleExists = prevRules.some((rule) => rule.id === ruleId);
        if (!ruleExists) {
          return prevRules;
        }

        return prevRules.filter((rule) => rule.id !== ruleId);
      });

      logger.info("Auto-funding rule deleted", { ruleId });
      return true;
    } catch (error) {
      logger.error("Failed to delete auto-funding rule", error);
      throw error;
    }
  }, [setRules]);

  // Duplicate rule
  const duplicateRule = useCallback(
    (ruleId: string) => {
      try {
        const rule = rules.find((r) => r.id === ruleId);
        if (!rule) {
          throw new Error(`Rule not found: ${ruleId}`);
        }

        const duplicatedRule: Partial<Rule> = {
          ...rule,
          name: `${rule.name} (Copy)`,
          enabled: false, // Disable copies by default
          lastExecuted: null,
          executionCount: 0,
        };

        return addRule(duplicatedRule);
      } catch (error) {
        logger.error("Failed to duplicate auto-funding rule", error);
        throw error;
      }
    },
    [rules, addRule]
  );

  return {
    addRule,
    updateRule,
    deleteRule,
    duplicateRule,
  };
};
