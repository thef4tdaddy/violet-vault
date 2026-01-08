/**
 * useSavingsGoalFormValidated Hook
 * Standardized validation pattern for savings goal form management
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * This implements a standardized pattern using useValidatedForm and
 * SavingsGoalFormSchema from Zod.
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/common/validation";
import {
  SavingsGoalFormSchema,
  type SavingsGoalFormData,
  type SavingsGoal,
} from "@/domain/schemas/savings-goal";
import logger from "@/utils/common/logger";

interface UseSavingsGoalFormValidatedOptions {
  goal?: SavingsGoal | null;
  isOpen?: boolean;
  onSubmit?: (goalId: string | null, data: SavingsGoalFormData) => Promise<void>;
}

/**
 * Hook for validated savings goal form management
 * Uses the standardized useValidatedForm pattern with SavingsGoalFormSchema
 */
export function useSavingsGoalFormValidated({
  goal = null,
  isOpen = false,
  onSubmit,
}: UseSavingsGoalFormValidatedOptions = {}) {
  const isEditMode = !!goal;

  // Build initial form data
  const buildInitialData = useCallback((): SavingsGoalFormData => {
    if (goal) {
      // Edit mode - populate from existing goal
      // Extended type for runtime fields not in schema
      type SavingsGoalWithExtras = SavingsGoal & { color?: string };
      const extendedGoal = goal as unknown as SavingsGoalWithExtras;
      return {
        name: goal.name || "",
        targetAmount: goal.targetAmount?.toString() || "",
        currentAmount: goal.currentAmount?.toString() || "0",
        targetDate: goal.targetDate
          ? typeof goal.targetDate === "string"
            ? goal.targetDate
            : new Date(goal.targetDate).toISOString().split("T")[0]
          : "",
        category: goal.category || "",
        color: extendedGoal.color || "#3B82F6",
        description: goal.description || "",
        priority: goal.priority || "medium",
      };
    } else {
      // Add mode - empty form with defaults
      return {
        name: "",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
        category: "",
        color: "#3B82F6",
        description: "",
        priority: "medium",
      };
    }
  }, [goal]);

  // Initialize form with validation
  const form = useValidatedForm({
    schema: SavingsGoalFormSchema,
    initialData: buildInitialData(),
    validateOnChange: false,
    onSubmit: async (validatedData) => {
      if (!onSubmit) {
        logger.warn("No onSubmit handler provided to useSavingsGoalFormValidated");
        return;
      }

      try {
        // Submit validated data
        await onSubmit(goal?.id || null, validatedData);
      } catch (error) {
        logger.error(`Error ${isEditMode ? "updating" : "creating"} savings goal:`, error);
        throw error; // Re-throw to let useValidatedForm handle state
      }
    },
  });

  // Update form when goal changes
  useEffect(() => {
    if (isOpen) {
      const newData = buildInitialData();
      form.updateFormData(newData);
    }
    // We only want to update when input data changes, not the form object itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, isOpen, buildInitialData, form.updateFormData]);

  return {
    // Form state from validation hook
    ...form,

    // Additional computed state
    isEditMode,

    // Helper to check if form can be submitted
    canSubmit: form.isValid && !form.isSubmitting,
  };
}

/**
 * Usage Example:
 *
 * ```tsx
 * const goalForm = useSavingsGoalFormValidated({
 *   goal: editingGoal,
 *   isOpen: isModalOpen,
 *   onSubmit: async (goalId, data) => {
 *     if (goalId) {
 *       await updateSavingsGoal(goalId, data);
 *     } else {
 *       await createSavingsGoal(data);
 *     }
 *   },
 * });
 *
 * // Access form state
 * const { data, errors, isValid, updateField, handleSubmit } = goalForm;
 *
 * // Update a field
 * updateField('name', 'Emergency Fund');
 *
 * // Submit form
 * await handleSubmit();
 * ```
 */
