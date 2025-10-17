import { useState, useCallback } from "react";
import {
  createDefaultRule,
  validateRule,
  sortRulesByPriority,
  filterRules,
  getRuleStatistics,
  createRuleSummary,
} from "../../../utils/budgeting/autofunding/rules.ts";
import { shouldRuleExecute } from "../../../utils/budgeting/autofunding/conditions.ts";
import logger from "../../../utils/common/logger";

/**
 * Hook for managing auto-funding rules (CRUD operations, validation, filtering)
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingRules = (initialRules = []) => {
  const [rules, setRules] = useState(initialRules);

  // Add new rule
  const addRule = useCallback((ruleConfig) => {
    try {
      const validation = validateRule(ruleConfig);
      if (!validation.isValid) {
        throw new Error(`Invalid rule configuration: ${validation.errors.join(", ")}`);
      }

      const newRule = {
        ...createDefaultRule(),
        ...ruleConfig,
      };

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
  }, []);

  // Update existing rule
  const updateRule = useCallback(
    (ruleId, updates) => {
      try {
        setRules((prevRules) => {
          const ruleIndex = prevRules.findIndex((rule) => rule.id === ruleId);
          if (ruleIndex === -1) {
            throw new Error(`Rule not found: ${ruleId}`);
          }

          const updatedRule = {
            ...prevRules[ruleIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };

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
    [rules]
  );

  // Delete rule
  const deleteRule = useCallback((ruleId) => {
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
  }, []);

  // Toggle rule enabled status
  const toggleRule = useCallback(
    (ruleId) => {
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

  // Duplicate rule
  const duplicateRule = useCallback(
    (ruleId) => {
      try {
        const rule = rules.find((r) => r.id === ruleId);
        if (!rule) {
          throw new Error(`Rule not found: ${ruleId}`);
        }

        const duplicatedRule = {
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

  // Get rules with filtering and sorting
  const getFilteredRules = useCallback(
    (filters = {}) => {
      try {
        let filteredRules = filterRules(rules, filters);

        if (filters.sort !== false) {
          filteredRules = sortRulesByPriority(filteredRules);
        }

        return filteredRules;
      } catch (error) {
        logger.error("Failed to filter rules", error);
        return rules;
      }
    },
    [rules]
  );

  // Get executable rules for a given context
  const getExecutableRules = useCallback(
    (context) => {
      try {
        return rules.filter((rule) => shouldRuleExecute(rule, context));
      } catch (error) {
        logger.error("Failed to get executable rules", error);
        return [];
      }
    },
    [rules]
  );

  // Get rule by ID
  const getRuleById = useCallback(
    (ruleId) => {
      return rules.find((rule) => rule.id === ruleId);
    },
    [rules]
  );

  // Get rules by type
  const getRulesByType = useCallback(
    (type) => {
      return rules.filter((rule) => rule.type === type);
    },
    [rules]
  );

  // Get rules by trigger
  const getRulesByTrigger = useCallback(
    (trigger) => {
      return rules.filter((rule) => rule.trigger === trigger);
    },
    [rules]
  );

  // Create rule summaries for display
  const getRuleSummaries = useCallback(
    (ruleIds = null) => {
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

  // Reorder rules by priority
  const reorderRules = useCallback((ruleIds) => {
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
  }, []);

  // Get statistics about the rules
  const getRulesStatistics = useCallback(() => {
    try {
      return getRuleStatistics(rules);
    } catch (error) {
      logger.error("Failed to get rule statistics", error);
      return {
        total: 0,
        enabled: 0,
        disabled: 0,
        byType: {},
        byTrigger: {},
        totalExecutions: 0,
        lastExecuted: null,
      };
    }
  }, [rules]);

  // Bulk operations
  const bulkUpdateRules = useCallback((ruleIds, updates) => {
    try {
      setRules((prevRules) =>
        prevRules.map((rule) =>
          ruleIds.includes(rule.id)
            ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
            : rule
        )
      );

      logger.info("Bulk rule update completed", {
        ruleIds,
        updates: Object.keys(updates),
      });
    } catch (error) {
      logger.error("Failed to bulk update rules", error);
      throw error;
    }
  }, []);

  const bulkDeleteRules = useCallback((ruleIds) => {
    try {
      setRules((prevRules) => prevRules.filter((rule) => !ruleIds.includes(rule.id)));

      logger.info("Bulk rule deletion completed", { ruleIds });
    } catch (error) {
      logger.error("Failed to bulk delete rules", error);
      throw error;
    }
  }, []);

  const bulkToggleRules = useCallback(
    (ruleIds, enabled) => {
      try {
        bulkUpdateRules(ruleIds, { enabled });

        logger.info("Bulk rule toggle completed", { ruleIds, enabled });
      } catch (error) {
        logger.error("Failed to bulk toggle rules", error);
        throw error;
      }
    },
    [bulkUpdateRules]
  );

  // Reset rules to initial state
  const resetRules = useCallback(() => {
    setRules(initialRules);
    logger.info("Rules reset to initial state");
  }, [initialRules]);

  // Replace all rules
  const setAllRules = useCallback((newRules) => {
    try {
      // Validate all new rules
      const validation = newRules.every((rule) => validateRule(rule).isValid);
      if (!validation) {
        throw new Error("Some rules in the new set are invalid");
      }

      setRules(newRules);
      logger.info("All rules replaced", { count: newRules.length });
    } catch (error) {
      logger.error("Failed to set all rules", error);
      throw error;
    }
  }, []);

  return {
    // State
    rules,

    // CRUD operations
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    duplicateRule,

    // Querying and filtering
    getFilteredRules,
    getExecutableRules,
    getRuleById,
    getRulesByType,
    getRulesByTrigger,
    getRuleSummaries,

    // Validation
    validateAllRules,

    // Organization
    reorderRules,
    getRulesStatistics,

    // Bulk operations
    bulkUpdateRules,
    bulkDeleteRules,
    bulkToggleRules,

    // State management
    resetRules,
    setAllRules,
  };
};
