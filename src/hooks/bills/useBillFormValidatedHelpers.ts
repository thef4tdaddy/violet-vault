/**
 * Helper functions for useBillFormValidated hook
 * Extracted to reduce complexity
 */
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/common/logger";
import type { Bill } from "@/types/bills";

/**
 * Build initial form data from editing bill
 */
export const buildInitialFormData = <
  T extends {
    name: string;
    amount: string;
    dueDate: string;
    category: string;
    notes?: string;
    isRecurring: boolean;
    selectedEnvelope?: string;
    icon?: string;
  },
>(
  editingBill: Bill | null
): T => {
  return {
    name: editingBill?.name || "",
    amount: editingBill?.amount?.toString() || "",
    dueDate: editingBill?.dueDate?.toString() || "",
    category: editingBill?.category || "",
    notes: editingBill?.notes || "",
    isRecurring: (editingBill?.frequency && editingBill.frequency !== "once") || false,
    selectedEnvelope: "",
    icon: "",
  } as T;
};

/**
 * Transform form data to bill object
 */
export const transformFormDataToBill = (
  data: {
    name: string;
    amount: string;
    dueDate: string;
    category: string;
    notes?: string;
    isRecurring: boolean;
    selectedEnvelope?: string;
  },
  editingBill: Bill | null
): Bill => {
  return {
    id: editingBill?.id || uuidv4(),
    name: data.name,
    amount: parseFloat(data.amount),
    dueDate: data.dueDate,
    category: data.category,
    notes: data.notes,
    frequency: data.isRecurring ? editingBill?.frequency || "monthly" : "once",
    isPaid: editingBill?.isPaid,
    envelopeId: data.selectedEnvelope || undefined,
    color: editingBill?.color || "#6366f1",
    createdAt: editingBill?.createdAt || new Date().toISOString(),
  };
};

/**
 * Handle bill submission (add or update)
 */
export const handleBillSubmission = async (
  billData: Bill,
  editingBill: Bill | null,
  callbacks: {
    onAddBill?: (bill: Bill) => Promise<void>;
    onUpdateBill?: (bill: Bill) => Promise<void>;
    onClose?: () => void;
  }
): Promise<void> => {
  if (editingBill) {
    logger.debug("Updating bill", { billId: billData.id });
    await callbacks.onUpdateBill?.(billData);
  } else {
    logger.debug("Adding new bill", { billId: billData.id });
    await callbacks.onAddBill?.(billData);
  }

  callbacks.onClose?.();
};

/**
 * Handle bill submission errors
 */
export const handleBillSubmissionError = (
  error: unknown,
  onError?: (error: string) => void
): never => {
  const errorMsg = error instanceof Error ? error.message : "Failed to save bill";
  logger.error("Bill submission error", error);
  onError?.(errorMsg);
  throw error; // Re-throw to let useValidatedForm handle state
};

/**
 * Handle bill deletion
 */
export const handleBillDeletion = async (
  editingBill: Bill | null,
  deleteEnvelopeToo: boolean,
  callbacks: {
    onDeleteBill?: (billId: string, deleteEnvelope: boolean) => Promise<void>;
    onClose?: () => void;
    onError?: (error: string) => void;
  }
): Promise<void> => {
  if (!editingBill) return;

  try {
    await callbacks.onDeleteBill?.(editingBill.id, deleteEnvelopeToo);
    callbacks.onClose?.();
  } catch (error) {
    logger.error("Error deleting bill", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to delete bill";
    callbacks.onError?.(errorMsg);
  }
};

/**
 * Update form data when editing bill changes
 */
export const updateFormDataFromBill = (
  editingBill: Bill
): {
  name: string;
  amount: string;
  dueDate: string;
  category: string;
  notes?: string;
  isRecurring: boolean;
} => {
  return {
    name: editingBill.name || "",
    amount: editingBill.amount?.toString() || "",
    dueDate: editingBill.dueDate?.toString() || "",
    category: editingBill.category || "",
    notes: editingBill.notes || "",
    isRecurring: (editingBill.frequency && editingBill.frequency !== "once") || false,
  };
};
