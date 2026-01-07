import { useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import logger from "@/utils/common/logger";
import {
  createDefaultRule,
  validateRule,
  type AutoFundingRule as LegacyRule,
} from "@/utils/budgeting/autofunding/rules";
import type { AutoFundingRule } from "@/db/types";

/**
 * Hook for single rule operations
 */
export const useRuleOperations = () => {
  const queryClient = useQueryClient();

  // Add rule mutation
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

  // Delete rule mutation
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

  // Duplicate rule mutation
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
    addRule: addRuleMutation.mutateAsync,
    updateRule: updateRuleMutation.mutateAsync,
    deleteRule: deleteRuleMutation.mutateAsync,
    duplicateRule: duplicateRuleMutation.mutateAsync,
    isPending:
      addRuleMutation.isPending ||
      updateRuleMutation.isPending ||
      deleteRuleMutation.isPending ||
      duplicateRuleMutation.isPending,
  };
};
