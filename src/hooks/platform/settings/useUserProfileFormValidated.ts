/**
 * useUserProfileFormValidated Hook
 * Standardized validation pattern for user profile form management
 * Part of Issue #987 - Comprehensive Zod Schema Implementation (Phase 3)
 *
 * This implements a standardized pattern using useValidatedForm and
 * UserProfileFormSchema from Zod.
 */

import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/platform/common/validation";
import { UserProfileFormSchema, type UserProfileFormData } from "@/domain/schemas/auth";
import type { UserData } from "@/types/auth";
import logger from "@/utils/common/logger";

interface UseUserProfileFormValidatedOptions {
  currentUser?: UserData | null;
  isOpen?: boolean;
  onSubmit?: (data: UserProfileFormData) => Promise<void>;
}

/**
 * Hook for validated user profile form management
 * Uses the standardized useValidatedForm pattern with UserProfileFormSchema
 */
export function useUserProfileFormValidated({
  currentUser = null,
  isOpen = false,
  onSubmit,
}: UseUserProfileFormValidatedOptions = {}) {
  // Build initial form data
  const buildInitialData = useCallback((): UserProfileFormData => {
    if (currentUser) {
      return {
        userName: currentUser.userName || "",
        userColor: currentUser.userColor || "#3B82F6",
      };
    } else {
      return {
        userName: "",
        userColor: "#3B82F6",
      };
    }
  }, [currentUser]);

  // Initialize form with validation
  const form = useValidatedForm({
    schema: UserProfileFormSchema,
    initialData: buildInitialData(),
    validateOnChange: false,
    onSubmit: async (validatedData) => {
      if (!onSubmit) {
        logger.warn("No onSubmit handler provided to useUserProfileFormValidated");
        return;
      }

      try {
        // Submit validated data
        await onSubmit(validatedData);
      } catch (error) {
        logger.error("Error updating user profile:", error);
        throw error; // Re-throw to let useValidatedForm handle state
      }
    },
  });

  // Update form when current user changes
  useEffect(() => {
    if (isOpen) {
      const newData = buildInitialData();
      form.updateFormData(newData);
    }
  }, [currentUser, isOpen, buildInitialData, form]);

  return {
    // Form state from validation hook
    ...form,

    // Helper to check if form can be submitted
    canSubmit: form.isValid && !form.isSubmitting,
  };
}

/**
 * Usage Example:
 *
 * ```tsx
 * const profileForm = useUserProfileFormValidated({
 *   currentUser: user,
 *   isOpen: isModalOpen,
 *   onSubmit: async (data) => {
 *     await updateUserProfile(data);
 *   },
 * });
 *
 * // Access form state
 * const { data, errors, isValid, updateField, handleSubmit } = profileForm;
 *
 * // Update a field
 * updateField('userName', 'John Doe');
 *
 * // Submit form
 * await handleSubmit();
 * ```
 */
