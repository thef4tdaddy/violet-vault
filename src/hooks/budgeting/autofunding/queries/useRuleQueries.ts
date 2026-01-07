import { useQuery } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import logger from "@/utils/common/logger";

import { autoFundingPersistenceService } from "@/services/budget/autoFundingPersistenceService";

/**
 * Migration helper to move data from localStorage to Dexie
 */
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
 * Hook for fetching all auto-funding rules
 */
export const useRulesQuery = () => {
  return useQuery({
    queryKey: queryKeys.autoFunding.rules(),
    queryFn: async () => {
      // Check for migration on first load if needed
      if (!autoFundingPersistenceService.isMigrationComplete()) {
        await migrateFromLocalStorage();
      }

      const rules = await budgetDb.autoFundingRules.toArray();
      // Sort by priority (lower number = higher priority)
      return rules.sort((a, b) => (a.priority || 100) - (b.priority || 100));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook for fetching a single auto-funding rule by ID
 */
export const useRuleByIdQuery = (ruleId: string | null) => {
  return useQuery({
    queryKey: queryKeys.autoFunding.rule(ruleId!),
    queryFn: async () => {
      if (!ruleId) return null;
      return budgetDb.autoFundingRules.get(ruleId);
    },
    enabled: !!ruleId,
  });
};

/**
 * Hook for fetching auto-funding execution history
 */
export const useExecutionHistoryQuery = (limit = 50) => {
  return useQuery({
    queryKey: queryKeys.autoFunding.history(limit),
    queryFn: async () => {
      return budgetDb.autoFundingHistory.orderBy("executedAt").reverse().limit(limit).toArray();
    },
  });
};
