import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/core/common/queryClient";
import logger from "@/utils/core/common/logger";
import {
  createDefaultRule,
  validateRule,
  getRuleStatistics,
  filterRules,
  sortRulesByPriority,
  type AutoFundingRule as LegacyRule,
  type RuleSummary,
} from "@/utils/domain/budgeting/autofunding/rules";
import {
  shouldRuleExecute,
  type ExecutionContext,
} from "@/utils/domain/budgeting/autofunding/conditions";
import { autoFundingPersistenceService } from "@/services/budget/autoFundingPersistenceService";
import type { AutoFundingRule } from "@/db/types";

// Migration helper to move data from localStorage to Dexie
const migrateFromLocalStorage = async () => {
  if (autoFundingPersistenceService.isMigrationComplete()) return;

  try {
    const legacyData = autoFundingPersistenceService.getLegacyData();
    const legacyRules = legacyData?.rules;

    if (Array.isArray(legacyRules) && legacyRules.length > 0) {
      logger.info("Migrating auto-funding rules to Dexie", { count: legacyRules.length });

      await budgetDb.transaction("rw", budgetDb.autoFundingRules, async () => {
        for (const rule of legacyRules) {
          const exists = await budgetDb.autoFundingRules.get(rule.id);
          if (!exists) {
            await budgetDb.autoFundingRules.add({
              ...rule,
              lastModified: Date.now(),
            });
          }
        }
      });
    }

    autoFundingPersistenceService.setMigrationComplete();
  } catch (error) {
    logger.error("Migration from localStorage failed", error);
  }
};

/**
 * Unified hook for managing auto-funding rules
 */
// Separate hooks for better organization and reduced file size
const useAutoFundingQueries = () => {
  return useQuery({
    queryKey: queryKeys.autoFunding.rules(),
    queryFn: async () => {
      if (!autoFundingPersistenceService.isMigrationComplete()) {
        await migrateFromLocalStorage();
      }
      const rules = await budgetDb.autoFundingRules.toArray();
      return rules.sort((a, b) => (a.priority || 100) - (b.priority || 100));
    },
    staleTime: 1000 * 60 * 5,
  });
};

const useAutoFundingMutations = () => {
  const queryClient = useQueryClient();
  const addRuleMutation = useMutation({
    mutationFn: async (ruleConfig: Partial<AutoFundingRule>) => {
      const validation = validateRule(ruleConfig as LegacyRule);
      if (!validation.isValid) {
        throw new Error(`Invalid rule configuration: ${validation.errors.join(", ")}`);
      }

      const newRule: AutoFundingRule = {
        ...createDefaultRule(),
        ...ruleConfig,
        lastModified: Date.now(),
      } as AutoFundingRule;

      await budgetDb.autoFundingRules.add(newRule);
      return newRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
      logger.info("Auto-funding rule added");
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({
      ruleId,
      updates,
    }: {
      ruleId: string;
      updates: Partial<AutoFundingRule>;
    }) => {
      const existing = await budgetDb.autoFundingRules.get(ruleId);
      if (!existing) throw new Error(`Rule not found: ${ruleId}`);

      const updatedRule = {
        ...existing,
        ...updates,
        lastModified: Date.now(),
      };

      const validation = validateRule(updatedRule as LegacyRule);
      if (!validation.isValid) {
        throw new Error(`Invalid rule configuration: ${validation.errors.join(", ")}`);
      }

      await budgetDb.autoFundingRules.put(updatedRule);
      return updatedRule;
    },
    onMutate: async ({ ruleId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.autoFunding.rules() });
      const previousRules = queryClient.getQueryData<AutoFundingRule[]>(
        queryKeys.autoFunding.rules()
      );
      if (previousRules) {
        queryClient.setQueryData<AutoFundingRule[]>(
          queryKeys.autoFunding.rules(),
          previousRules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
        );
      }
      return { previousRules };
    },
    onError: (err, _variables, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(queryKeys.autoFunding.rules(), context.previousRules);
      }
      logger.error("Failed to update auto-funding rule", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      await budgetDb.autoFundingRules.delete(ruleId);
      return ruleId;
    },
    onMutate: async (ruleId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.autoFunding.rules() });
      const previousRules = queryClient.getQueryData<AutoFundingRule[]>(
        queryKeys.autoFunding.rules()
      );
      if (previousRules) {
        queryClient.setQueryData<AutoFundingRule[]>(
          queryKeys.autoFunding.rules(),
          previousRules.filter((r) => r.id !== ruleId)
        );
      }
      return { previousRules };
    },
    onError: (err, _ruleId, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(queryKeys.autoFunding.rules(), context.previousRules);
      }
      logger.error("Failed to delete auto-funding rule", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
    },
  });

  const duplicateRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const rule = await budgetDb.autoFundingRules.get(ruleId);
      if (!rule) throw new Error(`Rule not found: ${ruleId}`);

      const duplicatedRule: AutoFundingRule = {
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${rule.name} (Copy)`,
        enabled: false,
        lastExecuted: null,
        executionCount: 0,
        lastModified: Date.now(),
        createdAt: new Date().toISOString(),
      };

      await budgetDb.autoFundingRules.add(duplicatedRule);
      return duplicatedRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
      logger.info("Auto-funding rule duplicated");
    },
  });

  return {
    addRuleMutation,
    updateRuleMutation,
    deleteRuleMutation,
    duplicateRuleMutation,
  };
};

const useAutoFundingBulkMutations = () => {
  const queryClient = useQueryClient();
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      ruleIds,
      updates,
    }: {
      ruleIds: string[];
      updates: Partial<AutoFundingRule>;
    }) => {
      return budgetDb.transaction("rw", budgetDb.autoFundingRules, async () => {
        const rules = await budgetDb.autoFundingRules.where("id").anyOf(ruleIds).toArray();
        const updatedRules = rules.map((rule) => ({
          ...rule,
          ...updates,
          lastModified: Date.now(),
        }));
        await budgetDb.autoFundingRules.bulkPut(updatedRules);
        return updatedRules;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
      logger.info("Bulk rule update completed");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ruleIds: string[]) => {
      await budgetDb.autoFundingRules.bulkDelete(ruleIds);
      return ruleIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
      logger.info("Bulk rule deletion completed");
    },
  });

  const bulkToggleMutation = useMutation({
    mutationFn: async ({ ruleIds, enabled }: { ruleIds: string[]; enabled: boolean }) => {
      return budgetDb.transaction("rw", budgetDb.autoFundingRules, async () => {
        const rules = await budgetDb.autoFundingRules.where("id").anyOf(ruleIds).toArray();
        const updatedRules = rules.map((rule) => ({
          ...rule,
          enabled,
          lastModified: Date.now(),
        }));
        await budgetDb.autoFundingRules.bulkPut(updatedRules);
        return updatedRules;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
    },
  });

  return {
    bulkUpdateMutation,
    bulkDeleteMutation,
    bulkToggleMutation,
  };
};

/**
 * Unified hook for managing auto-funding rules
 */
export const useAutoFundingRules = () => {
  const queryClient = useQueryClient();

  // --- Queries ---
  const { data: rules = [], isLoading, isError } = useAutoFundingQueries();

  // --- Mutations ---
  const { addRuleMutation, updateRuleMutation, deleteRuleMutation, duplicateRuleMutation } =
    useAutoFundingMutations();

  // --- Bulk Mutations ---
  const { bulkUpdateMutation, bulkDeleteMutation, bulkToggleMutation } =
    useAutoFundingBulkMutations();

  const toggleRule = useCallback(
    async (ruleId: string) => {
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) throw new Error(`Rule not found: ${ruleId}`);
      return updateRuleMutation.mutateAsync({
        ruleId,
        updates: { enabled: !rule.enabled },
      });
    },
    [rules, updateRuleMutation]
  );

  const reorderRules = useCallback(
    async (ruleIds: string[]) => {
      await budgetDb.transaction("rw", budgetDb.autoFundingRules, async () => {
        for (let i = 0; i < ruleIds.length; i++) {
          await budgetDb.autoFundingRules.update(ruleIds[i], {
            priority: (i + 1) * 10,
            lastModified: Date.now(),
          });
        }
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
    },
    [queryClient]
  );

  // --- Utilities ---

  const getFilteredRules = useCallback(
    (filters: Record<string, unknown> = {}) => {
      try {
        let filteredRules = filterRules(rules as unknown as LegacyRule[], filters);
        if (filters.sort !== false) {
          filteredRules = sortRulesByPriority(filteredRules);
        }
        return filteredRules as unknown as AutoFundingRule[];
      } catch (error) {
        logger.error("Failed to filter rules", error);
        return rules;
      }
    },
    [rules]
  );

  const getExecutableRules = useCallback(
    (context: ExecutionContext): AutoFundingRule[] => {
      try {
        return (rules as unknown as AutoFundingRule[]).filter((rule) =>
          shouldRuleExecute(
            rule as unknown as import("@/utils/domain/budgeting/autofunding/conditions.ts").Rule,
            context
          )
        );
      } catch (error) {
        logger.error("Failed to get executable rules", error);
        return [];
      }
    },
    [rules]
  );

  const getRulesStatistics = useCallback(() => {
    try {
      return getRuleStatistics(rules as unknown as LegacyRule[]);
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

  const validateAllRules = useCallback(() => {
    const validationResults = (rules as unknown as LegacyRule[]).map((rule) => ({
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
    // State
    rules,
    isLoading,
    isError,

    // CRUD operations
    addRule: addRuleMutation.mutateAsync,
    updateRule: (ruleId: string, updates: Partial<AutoFundingRule>) =>
      updateRuleMutation.mutateAsync({ ruleId, updates }),
    deleteRule: deleteRuleMutation.mutateAsync,
    toggleRule,
    duplicateRule: duplicateRuleMutation.mutateAsync,

    // Querying and filtering
    getFilteredRules,
    getExecutableRules,
    getRuleById: (id: string) => rules.find((r) => r.id === id),
    getRulesByType: (type: string) => rules.filter((r) => r.type === type),
    getRulesByTrigger: (trigger: string) => rules.filter((r) => r.trigger === trigger),
    getRuleSummaries,

    // Validation
    validateAllRules,

    // Organization
    reorderRules,
    getRulesStatistics,

    // Bulk operations
    bulkUpdateRules: bulkUpdateMutation.mutateAsync,
    bulkDeleteRules: bulkDeleteMutation.mutateAsync,
    bulkToggleRules: bulkToggleMutation.mutateAsync,

    // Status
    isPending:
      addRuleMutation.isPending ||
      updateRuleMutation.isPending ||
      deleteRuleMutation.isPending ||
      duplicateRuleMutation.isPending ||
      bulkUpdateMutation.isPending ||
      bulkDeleteMutation.isPending ||
      bulkToggleMutation.isPending,
  };
};
