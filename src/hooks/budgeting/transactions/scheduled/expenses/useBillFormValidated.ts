/**
 * useBillFormValidated Hook - Example Implementation
 * Demonstrates the new validation pattern from Issue #987
 *
 * This is an example of how to refactor existing form hooks to use
 * the standardized validation pattern with useValidatedForm
 */

import { useCallback, useEffect } from "react";
import { z } from "zod";
import { useValidatedForm } from "@/hooks/common/validation";
import { BillFormDataMinimalSchema } from "@/domain/schemas/bill";
import type { Bill } from "@/types/bills";
import {
  buildInitialFormData,
  transformFormDataToBill,
  handleBillSubmission,
  handleBillSubmissionError,
  handleBillDeletion,
  updateFormDataFromBill,
} from "./useBillFormValidatedHelpers";

/**
 * Extended schema for bill form with all UI fields
 * This extends the minimal schema to include optional UI state
 */
const BillFormSchema = BillFormDataMinimalSchema.extend({
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  selectedEnvelope: z.string().optional(),
  icon: z.string().optional(),
  // Add other form fields as needed
});

type BillFormSchemaType = z.infer<typeof BillFormSchema>;

interface UseBillFormValidatedOptions {
  editingBill?: Bill | null;
  _availableEnvelopes?: Array<{ id: string; name: string; category: string }>;
  onAddBill?: (bill: Bill) => Promise<void>;
  onUpdateBill?: (bill: Bill) => Promise<void>;
  onDeleteBill?: (billId: string, deleteEnvelope: boolean) => Promise<void>;
  onClose?: () => void;
  onError?: (error: string) => void;
}

/**
 * Example hook using the new validation pattern
 *
 * Key differences from original:
 * 1. Uses useValidatedForm for state and validation
 * 2. Validation is handled automatically by Zod schema
 * 3. Error state is managed consistently
 * 4. Form submission includes automatic validation
 */
export function useBillFormValidated({
  editingBill = null,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onClose,
  onError,
}: UseBillFormValidatedOptions = {}) {
  // Initial form data
  const initialData = buildInitialFormData<BillFormSchemaType>(editingBill);

  // Use the validation hook
  const form = useValidatedForm({
    schema: BillFormSchema,
    initialData,
    validateOnChange: false, // Can enable for real-time validation
    onSubmit: async (data) => {
      try {
        const billData = transformFormDataToBill(data, editingBill);
        await handleBillSubmission(billData, editingBill, {
          onAddBill,
          onUpdateBill,
          onClose,
        });
      } catch (error) {
        handleBillSubmissionError(error, onError);
      }
    },
  });

  // Update form when editing bill changes
  useEffect(() => {
    if (editingBill) {
      const updatedData = updateFormDataFromBill(editingBill);
      form.updateFormData(updatedData);
    }
  }, [editingBill, form]);

  // Delete handler
  const handleDelete = useCallback(
    async (deleteEnvelopeToo: boolean = false) => {
      await handleBillDeletion(editingBill, deleteEnvelopeToo, {
        onDeleteBill,
        onClose,
        onError,
      });
    },
    [editingBill, onDeleteBill, onClose, onError]
  );

  return {
    // Form state from validation hook
    ...form,

    // Additional computed state
    isEditMode: !!editingBill,

    // Additional handlers
    handleDelete,

    // Helper to check if form has required fields
    canSubmit: form.isValid && !form.isSubmitting,
  };
}

/**
 * Migration Guide:
 *
 * 1. Define a Zod schema for your form data
 * 2. Use useValidatedForm instead of manual state management
 * 3. Access form.data, form.errors, form.isDirty, etc.
 * 4. Use form.updateField() or form.updateFormData() to update values
 * 5. Use form.handleSubmit() for submission with automatic validation
 * 6. Errors are automatically managed - no need for manual error state
 *
 * Benefits:
 * - Consistent validation across all forms
 * - Less boilerplate code
 * - Automatic error management
 * - Type-safe with Zod schemas
 * - Built-in dirty tracking and submission state
 */
