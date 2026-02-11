/**
 * useDebtForm hook - Extracted from AddDebtModal.jsx
 * Handles form state, validation, and submission logic for debt management
 */

import { useState, useEffect } from "react";
import { DEBT_TYPES, PAYMENT_FREQUENCIES } from "@/constants/debts";
import logger from "@/utils/core/common/logger";
import { validateDebtFormFields } from "@/utils/domain/debts/debtFormValidation";
import type {
  DebtAccount,
  DebtType,
  PaymentFrequency,
  DebtStatus,
  CompoundFrequency,
} from "@/types/debt";

// Define form state interface (using strings for numeric inputs)
export interface DebtFormState {
  name: string;
  creditor: string;
  type: DebtType;
  status: DebtStatus;
  currentBalance: string;
  originalBalance: string;
  interestRate: string;
  minimumPayment: string;
  creditLimit: string;
  paymentFrequency: PaymentFrequency;
  compoundFrequency: CompoundFrequency;
  paymentDueDate: string;
  notes: string;
  // Connection fields
  paymentMethod: string; // "create_new" or "connect_existing_bill"
  createBill: boolean;
  envelopeId: string;
  existingBillId: string;
  newEnvelopeName: string;
}

export interface ConnectedBill {
  id: string;
  [key: string]: unknown;
}

export interface ConnectedEnvelope {
  id: string;
  [key: string]: unknown;
}

export interface DebtSubmissionData extends Omit<
  DebtFormState,
  "currentBalance" | "interestRate" | "minimumPayment" | "originalBalance" | "creditLimit"
> {
  currentBalance: number;
  balance: number; // Alias for currentBalance
  interestRate: number;
  minimumPayment: number;
  originalBalance: number;
  creditLimit: number;
  connectionData: {
    paymentMethod: string;
    createBill: boolean;
    envelopeId: string;
    existingBillId: string;
    newEnvelopeName: string;
  };
}

const initialFormState: DebtFormState = {
  name: "",
  creditor: "",
  type: DEBT_TYPES.PERSONAL as DebtType,
  status: "active" as DebtStatus,
  currentBalance: "",
  originalBalance: "",
  interestRate: "",
  minimumPayment: "",
  creditLimit: "",
  paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY as PaymentFrequency,
  compoundFrequency: "monthly" as CompoundFrequency,
  paymentDueDate: "",
  notes: "",
  // Connection fields
  paymentMethod: "create_new", // "create_new" or "connect_existing_bill"
  createBill: true, // Don't auto-create bill when editing
  envelopeId: "", // Envelope to fund payments from
  existingBillId: "", // For connecting to existing bill
  newEnvelopeName: "",
};

const determinePaymentMethod = (connectedBill: ConnectedBill | null): string => {
  return connectedBill ? "connect_existing_bill" : "create_new";
};

const safeToString = (value: unknown): string => value?.toString() || "";

const getEnvelopeId = (
  debt: Partial<DebtAccount>,
  connectedEnvelope: ConnectedEnvelope | null
): string => {
  // Check if debt has envelopeId (custom property not in DebtAccount yet but might be there at runtime)
  const debtWithEnvelope = debt as { envelopeId?: string };
  return debtWithEnvelope.envelopeId || connectedEnvelope?.id || "";
};

const getExistingBillId = (connectedBill: ConnectedBill | null): string => connectedBill?.id || "";

const formatDateInput = (value: unknown): string => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return value;
  }
  return "";
};

const buildBaseFormData = (debt: Partial<DebtAccount>) => ({
  name: debt.name || "",
  creditor: debt.creditor || "",
  type: debt.type || (DEBT_TYPES.PERSONAL as DebtType),
  status: debt.status || "active",
  paymentDueDate: formatDateInput(debt.nextPaymentDate),
  notes: debt.notes || "",
});

const buildFinancialFormData = (debt: Partial<DebtAccount>) => ({
  currentBalance: safeToString(debt.currentBalance ?? debt.balance),
  originalBalance: safeToString(debt.originalBalance),
  interestRate: safeToString(debt.interestRate),
  minimumPayment: safeToString(debt.minimumPayment),
  creditLimit: safeToString(debt.creditLimit),
  paymentFrequency: debt.paymentFrequency || (PAYMENT_FREQUENCIES.MONTHLY as PaymentFrequency),
  compoundFrequency: debt.compoundFrequency || "monthly",
});

const buildConnectionFormData = (
  debt: Partial<DebtAccount>,
  connectedBill: ConnectedBill | null,
  connectedEnvelope: ConnectedEnvelope | null
) => ({
  paymentMethod: determinePaymentMethod(connectedBill),
  createBill: false,
  envelopeId: getEnvelopeId(debt, connectedEnvelope),
  existingBillId: getExistingBillId(connectedBill),
  newEnvelopeName: "",
});

const buildEditFormData = (
  debt: DebtAccount,
  connectedBill: ConnectedBill | null,
  connectedEnvelope: ConnectedEnvelope | null
): DebtFormState => ({
  ...initialFormState,
  ...buildBaseFormData(debt),
  ...buildFinancialFormData(debt),
  ...buildConnectionFormData(debt, connectedBill, connectedEnvelope),
});

const buildNewFormData = (): DebtFormState => ({
  ...initialFormState,
  createBill: true,
});

export const useDebtForm = (
  debt: DebtAccount | null = null,
  isOpen = false,
  connectedBill: ConnectedBill | null = null,
  connectedEnvelope: ConnectedEnvelope | null = null
) => {
  const isEditMode = !!debt;
  const [formData, setFormData] = useState<DebtFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when debt prop changes
  useEffect(() => {
    if (debt) {
      setFormData(buildEditFormData(debt, connectedBill, connectedEnvelope));
    } else if (!debt && isOpen) {
      setFormData(buildNewFormData());
    }
  }, [debt, isOpen, connectedBill, connectedEnvelope]);

  const checkFormValidity = (): boolean => {
    // Cast to any because validation might expect different types, or update validation to accept DebtFormState
    const newErrors = validateDebtFormFields(formData as unknown as Record<string, unknown>);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmissionData = (formData: DebtFormState): DebtSubmissionData => {
    const paymentDueDate =
      formData.paymentDueDate && !Number.isNaN(Date.parse(formData.paymentDueDate))
        ? new Date(formData.paymentDueDate).toISOString()
        : "";

    return {
      ...formData,
      currentBalance: parseFloat(formData.currentBalance),
      balance: parseFloat(formData.currentBalance),
      interestRate: parseFloat(formData.interestRate) || 0,
      minimumPayment: parseFloat(formData.minimumPayment),
      originalBalance: formData.originalBalance
        ? parseFloat(formData.originalBalance)
        : parseFloat(formData.currentBalance), // Default to current balance if not specified
      creditLimit: parseFloat(formData.creditLimit) || 0,
      paymentDueDate,
      // Include connection data for the parent component to handle
      connectionData: {
        paymentMethod: formData.paymentMethod,
        createBill: formData.createBill,
        envelopeId: formData.envelopeId || "",
        existingBillId: formData.existingBillId || "",
        newEnvelopeName: formData.newEnvelopeName || "",
      },
    };
  };

  const handleSubmit = async (
    onSubmitCallback: (
      data: DebtSubmissionData | string,
      updateData?: DebtSubmissionData
    ) => Promise<void>
  ) => {
    if (!checkFormValidity()) return false;

    setIsSubmitting(true);

    try {
      const debtData = prepareSubmissionData(formData);

      if (isEditMode && debt) {
        // For edit mode, pass debt ID and updates
        await onSubmitCallback(debt.id, debtData);
      } else {
        // For add mode, just pass the debt data
        await onSubmitCallback(debtData);
      }

      if (!isEditMode) {
        resetForm(); // Only reset form when adding new debt
      }

      return true;
    } catch (error) {
      logger.error(`Error ${isEditMode ? "updating" : "creating"} debt:`, error);
      setErrors({
        submit: `Failed to ${isEditMode ? "update" : "create"} debt. Please try again.`,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      createBill: true,
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const updateFormData = (updates: Partial<DebtFormState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear related errors when updating
    if (Object.keys(updates).some((key) => errors[key])) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete newErrors[key];
        });
        return newErrors;
      });
    }
  };

  return {
    formData,
    setFormData: updateFormData,
    errors,
    isSubmitting,
    isEditMode,
    validateForm: checkFormValidity,
    handleSubmit,
    resetForm,
  };
};
