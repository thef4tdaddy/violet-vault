import { useState, useEffect, useCallback } from "react";
import {
  createDefaultEnvelopeForm,
  validateEnvelopeForm,
  calculateEnvelopeAmounts,
  transformFormToEnvelope,
  transformEnvelopeToForm,
  validateEnvelopeTypeChange,
} from "../../utils/budgeting/envelopeFormUtils";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

interface UseEnvelopeFormProps {
  envelope?: Record<string, unknown> | null;
  existingEnvelopes?: Record<string, unknown>[];
  onSave: (data: unknown) => Promise<void>;
  onClose: () => void;
  currentUser?: { userName: string };
}

/**
 * Custom hook for managing envelope form state and operations
 * Handles form validation, calculations, and envelope transformations
 */
const useEnvelopeForm = ({
  envelope = null,
  existingEnvelopes = [],
  onSave,
  onClose,
  currentUser = { userName: "User" },
}: UseEnvelopeFormProps) => {
  // Form state
  const [formData, setFormData] = useState(createDefaultEnvelopeForm());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data when envelope changes
  useEffect(() => {
    if (envelope) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formDataFromEnvelope = transformEnvelopeToForm(envelope as any);
      setFormData(formDataFromEnvelope);
      setIsDirty(false);
    } else {
      setFormData(createDefaultEnvelopeForm());
      setIsDirty(false);
    }
    setErrors({});
  }, [envelope]);

  // Form field update handler
  const updateFormField = useCallback(
    (field: string, value: unknown) => {
      setFormData((prev) => {
        if (prev[field as keyof typeof prev] !== value) {
          setIsDirty(true);
        }
        const newData = { ...prev, [field]: value };
        if (errors[field as keyof typeof errors]) {
          setErrors((prevErrors) => {
            const { [field]: _removed, ...remainingErrors } = prevErrors as Record<string, unknown>;
            return remainingErrors;
          });
        }
        if (field === "envelopeType") {
          const compatibility = validateEnvelopeTypeChange(
            String(value),
            envelope as Record<string, unknown>
          );
          if (!compatibility.isValid) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              envelopeType: compatibility.errors[0],
            }));
          } else if (compatibility.warnings.length > 0) {
            compatibility.warnings.forEach((warning) => {
              globalToast.showWarning(warning, "Type Change Warning", 6000);
            });
          }
        }
        return newData;
      });
    },
    [errors, envelope]
  );

  // Batch form update
  const updateFormData = useCallback((updates: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const validation = validateEnvelopeForm(
      formData,
      existingEnvelopes as Record<string, unknown>[],
      envelope?.id as string | undefined
    );
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData, existingEnvelopes, envelope?.id]);

  // Reset form
  const resetForm = useCallback(() => {
    if (envelope) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData(transformEnvelopeToForm(envelope as any));
    } else {
      setFormData(createDefaultEnvelopeForm());
    }
    setErrors({});
    setIsDirty(false);
  }, [envelope]);

  // Get calculated amounts
  const calculatedAmounts = calculateEnvelopeAmounts(formData);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      // Validate form
      if (!validateForm()) {
        globalToast.showError("Please fix the form errors before saving", "Validation Error", 8000);
        return false;
      }

      // Transform form data to envelope object
      const envelopeData = transformFormToEnvelope(formData, {
        editingId: envelope?.id as string | undefined,
        createdBy: currentUser.userName,
      });

      // Call the save handler
      await onSave(envelopeData);

      // Reset dirty state on successful save
      setIsDirty(false);
      return true;
    } catch (error) {
      logger.error("Error saving envelope", { error });
      const errorMessage = error instanceof Error ? error.message : "Failed to save envelope";
      globalToast.showError(errorMessage, "Save Error", 8000);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, envelope?.id, currentUser.userName, onSave, validateForm]);

  // Handle form close with unsaved changes check
  const handleClose = useCallback(() => {
    if (isDirty) {
      // Show warning toast about unsaved changes - let the UI handle confirmation
      globalToast.showError(
        "You have unsaved changes that will be lost if you close now.",
        "Unsaved Changes Warning"
      );
      // For now, prevent closing - the component should handle this with proper confirmation modal
      return;
    }

    resetForm();
    onClose();
  }, [isDirty, resetForm, onClose]);

  // Check if form has required fields
  const hasRequiredFields =
    Boolean(formData.name?.trim()) && Boolean(formData.category && formData.category.trim());

  // Check if form is submittable (has required fields and no errors)
  const canSubmit = hasRequiredFields && Object.keys(errors).length === 0 && !isLoading;

  return {
    // Form state
    formData,
    errors,
    isLoading,
    isDirty,
    canSubmit,
    hasRequiredFields,

    // Calculated values
    calculatedAmounts,

    // Form actions
    updateFormField,
    updateFormData,
    validateForm,
    resetForm,
    handleSubmit,
    handleClose,

    // Form utilities
    isEditing: Boolean(envelope),
    envelopeId: envelope?.id || null,
  };
};

export default useEnvelopeForm;
