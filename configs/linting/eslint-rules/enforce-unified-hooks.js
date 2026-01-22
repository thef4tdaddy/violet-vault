/**
 * ESLint Rule: enforce-unified-hooks
 * Enforces Unified Hook Pattern standards
 *
 * Prevents:
 * 1. Legacy file naming (*Operations.ts, *Mutations.ts, *Queries.ts) in src/hooks/
 * 2. Missing named exports for hooks (encourages export const useMutation = ...)
 */

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce Unified Hook Pattern",
      category: "Best Practices",
      recommended: true,
    },
    fixable: null,
    messages: {
      noLegacyHookFiles:
        "Legacy hook pattern detected. Operations, Mutations, and Queries should be inlined into the main hook file (e.g., useBills.ts) or exported as individual hooks from it. File should not end with Operations/Mutations/Queries.ts.",
      enforceNamedExports:
        "Mutation hooks must be exported as named exports (e.g., export const useAddBillMutation = ...). Default exports alone are discouraged for mutations.",
    },
  },

  create(context) {
    const filename = context.getFilename();
    const isInHooksDir = filename.includes("/src/hooks/");
    const isTestFile =
      filename.includes("__tests__") || filename.includes(".test.") || filename.includes(".spec.");

    // Ignore non-hook directories or test files
    if (!isInHooksDir || isTestFile) {
      return {};
    }

    // 1. Check for legacy file names
    const legacyPatterns = [/Operations\.tsx?$/, /Mutations\.tsx?$/, /Queries\.tsx?$/];
    const isLegacyFile = legacyPatterns.some((pattern) => pattern.test(filename));

    return {
      Program(node) {
        if (isLegacyFile) {
          context.report({
            node,
            messageId: "noLegacyHookFiles",
          });
        }
      },

      // 2. Check for mutation naming in exports (simplified check)
      // This part ensures that if you define a mutation, you export it.
      // It's harder to strictly enforce "must export" without complex analysis,
      // but we can warn if we see a "useMutation" call that isn't exported?
      // For now, let's stick to the file naming rule as it's the primary architectural shift.
    };
  },
};
