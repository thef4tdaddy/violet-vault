import { useState } from "react";
import { useRuleOperations } from "./operations/useRuleOperations";
import { useRuleToggles } from "./operations/useRuleToggles";
import { useRuleBulkOperations } from "./operations/useRuleBulkOperations";
import { useRuleQueries } from "./queries/useRuleQueries";
import { useRuleFilters } from "./queries/useRuleFilters";
import { useExecutableRules } from "./queries/useExecutableRules";
import { useRuleValidation } from "./utils/useRuleValidation";
import { useRuleStatistics } from "./utils/useRuleStatistics";
import { useRuleOrganization } from "./utils/useRuleOrganization";
import { useRuleSummaries } from "./utils/useRuleSummaries";
import type { AutoFundingRule } from "@/utils/budgeting/autofunding/rules";

/**
 * Hook for managing auto-funding rules (CRUD operations, validation, filtering)
 * Composes focused sub-hooks for better maintainability and testability
 */
export const useAutoFundingRules = (initialRules: AutoFundingRule[] = []) => {
  const [rules, setRules] = useState(initialRules);

  // Extract operation hooks
  const operations = useRuleOperations({ rules, setRules });
  const toggles = useRuleToggles({ rules, updateRule: operations.updateRule });
  const bulkOps = useRuleBulkOperations({ setRules });

  // Extract query hooks
  const queries = useRuleQueries({ rules });
  const filters = useRuleFilters({ rules });
  const executables = useExecutableRules({
    rules: rules as unknown as import("@/utils/budgeting/autofunding/conditions").Rule[],
  });

  // Extract utility hooks
  const validation = useRuleValidation({ rules });
  const statistics = useRuleStatistics({ rules });
  const organization = useRuleOrganization({ setRules });
  const summaries = useRuleSummaries({ rules });

  // State management functions
  const resetRules = () => {
    setRules(initialRules);
  };

  const setAllRules = (newRules: AutoFundingRule[]) => {
    setRules(newRules);
  };

  return {
    // State
    rules,

    // CRUD operations
    addRule: operations.addRule,
    updateRule: operations.updateRule,
    deleteRule: operations.deleteRule,
    toggleRule: toggles.toggleRule,
    duplicateRule: operations.duplicateRule,

    // Querying and filtering
    getFilteredRules: filters.getFilteredRules,
    getExecutableRules: executables.getExecutableRules,
    getRuleById: queries.getRuleById,
    getRulesByType: queries.getRulesByType,
    getRulesByTrigger: queries.getRulesByTrigger,
    getRuleSummaries: summaries.getRuleSummaries,

    // Validation
    validateAllRules: validation.validateAllRules,

    // Organization
    reorderRules: organization.reorderRules,
    getRulesStatistics: statistics.getRulesStatistics,

    // Bulk operations
    bulkUpdateRules: bulkOps.bulkUpdateRules,
    bulkDeleteRules: bulkOps.bulkDeleteRules,
    bulkToggleRules: bulkOps.bulkToggleRules,

    // State management
    resetRules,
    setAllRules,
  };
};
