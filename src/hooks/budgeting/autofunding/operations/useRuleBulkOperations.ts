import { useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import logger from "@/utils/common/logger";
import type { AutoFundingRule } from "@/db/types";

/**
 * Hook for bulk rule operations
 */
export const useRuleBulkOperations = () => {
  const queryClient = useQueryClient();

  // Bulk update mutation
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

  // Bulk delete mutation
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

  // Bulk toggle mutation (convenience wrapper around bulkUpdate)
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
    bulkUpdateRules: bulkUpdateMutation.mutateAsync,
    bulkDeleteRules: bulkDeleteMutation.mutateAsync,
    bulkToggleRules: bulkToggleMutation.mutateAsync,
    isBulkPending:
      bulkUpdateMutation.isPending || bulkDeleteMutation.isPending || bulkToggleMutation.isPending,
  };
};
