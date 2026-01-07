import { useCallback } from "react";
import { useRuleOperations } from "./operations/useRuleOperations";
import { useRuleToggles } from "./operations/useRuleToggles";
import { useRuleBulkOperations } from "./operations/useRuleBulkOperations";
import { useRulesQuery } from "./queries/useRuleQueries";
import { useRuleFilters } from "./queries/useRuleFilters";
import { useExecutableRules } from "./queries/useExecutableRules";
import { useRuleValidation } from "./utils/useRuleValidation";
import { useRuleStatistics } from "./utils/useRuleStatistics";
import { useRuleSummaries } from "./utils/useRuleSummaries";
import { useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import type { AutoFundingRule } from "@/db/types";
import type { AutoFundingRule as LegacyRule } from "@/utils/budgeting/autofunding/rules";

/**
 * Hook for managing auto-funding rules (CRUD operations, validation, filtering)
 * Synchronized with Dexie and TanStack Query
 */
export const useAutoFundingRules = () => {
  // Main query
  const { data: rules = [], isLoading, isError } = useRulesQuery();

  // Operation hooks
  const operations = useRuleOperations();
  const bulkOps = useRuleBulkOperations();

  // Toggle hook (adapted for new operations)
  const toggles = useRuleToggles({
    rules: rules as unknown as LegacyRule[],
    updateRule: (async (id: string, updates: Partial<AutoFundingRule>) => {
      return operations.updateRule({ ruleId: id, updates: updates as Partial<AutoFundingRule> });
    }) as unknown as (
      ruleId: string,
      updates: Partial<LegacyRule>
    ) => Promise<LegacyRule | undefined>,
  });

  // Extract utility hooks
  const filters = useRuleFilters({ rules: rules as unknown as LegacyRule[] });
  const executables = useExecutableRules({
    rules,
  });

  // Utility hooks
  const validation = useRuleValidation({ rules: rules as unknown as LegacyRule[] });
  const statistics = useRuleStatistics({ rules: rules as unknown as LegacyRule[] });
  const summaries = useRuleSummaries({ rules: rules as unknown as LegacyRule[] });

  const queryClient = useQueryClient();

  // Specialized reorder that uses a transaction
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

      // Invalidate the cache to trigger a refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.rules() });
    },
    [queryClient]
  );

  return {
    // State
    rules,
    isLoading,
    isError,

    // CRUD operations
    addRule: operations.addRule,
    updateRule: (ruleId: string, updates: Partial<AutoFundingRule>) =>
      operations.updateRule({ ruleId, updates }),
    deleteRule: operations.deleteRule,
    toggleRule: toggles.toggleRule,
    duplicateRule: operations.duplicateRule,

    // Querying and filtering
    getFilteredRules: filters.getFilteredRules,
    getExecutableRules: executables.getExecutableRules,
    getRuleById: (id: string) => rules.find((r) => r.id === id),
    getRulesByType: (type: string) => rules.filter((r) => r.type === type),
    getRulesByTrigger: (trigger: string) => rules.filter((r) => r.trigger === trigger),
    getRuleSummaries: summaries.getRuleSummaries,

    // Validation
    validateAllRules: validation.validateAllRules,

    // Organization
    reorderRules,
    getRulesStatistics: statistics.getRulesStatistics,

    // Bulk operations
    bulkUpdateRules: bulkOps.bulkUpdateRules,
    bulkDeleteRules: bulkOps.bulkDeleteRules,
    bulkToggleRules: bulkOps.bulkToggleRules,

    // Status
    isPending: operations.isPending || bulkOps.isBulkPending,
  };
};
