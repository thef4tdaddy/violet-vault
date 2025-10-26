/**
 * Helper functions for bill form operations
 * Extracted to reduce complexity in useBillForm
 */
import type { BillFormData, Bill, BillFrequency, CalculationFrequency } from "../../../types/bills";
import { toMonthly } from "../../../utils/common/frequencyCalculations";
import { convertToBiweekly } from "../../../constants/frequency";
import {
  getBillIcon,
  getIconNameForStorage,
} from "../../../utils/common/billIcons";
import logger from "../../../utils/common/logger";

/**
 * Get initial form data for a bill
 */
export const getInitialFormData = (bill: Bill | null = null): BillFormData => {
  if (bill) {
    return {
      name: bill.name || bill.provider || "",
      amount: bill.amount?.toString() || "",
      frequency: bill.frequency || "monthly",
      dueDate: bill.dueDate || "",
      category: bill.category || "Bills",
      color: bill.color || "#3B82F6",
      notes: bill.notes || "",
      createEnvelope: false,
      selectedEnvelope: bill.envelopeId || "",
      customFrequency: bill.customFrequency?.toString() || "",
      iconName:
        bill.iconName ||
        getIconNameForStorage(
          bill.icon ||
            getBillIcon(bill.name || bill.provider || "", bill.notes || "", bill.category || "")
        ),
    };
  }
  return {
    name: "",
    amount: "",
    frequency: "monthly",
    dueDate: "",
    category: "Bills",
    color: "#3B82F6",
    notes: "",
    createEnvelope: false,
    selectedEnvelope: "",
    customFrequency: "",
    iconName: "FileText",
  };
};
export const calculateMonthlyAmountHelper = (
  amount: string | number,
  frequency: BillFrequency,
  _customFrequency = 1
): number => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const calcFrequency: CalculationFrequency = frequency === "once" ? "monthly" : frequency;
  return toMonthly(numAmount, calcFrequency);
};

/**
 * Calculate biweekly amount from bill data
 */
export const calculateBiweeklyAmountHelper = (
  amount: string | number,
  frequency: BillFrequency,
  customFrequency = 1
): number => {
  const monthlyAmount = calculateMonthlyAmountHelper(amount, frequency, customFrequency);
  return convertToBiweekly(monthlyAmount);
};

/**
 * Get next due date based on frequency
 */
export const getNextDueDateHelper = (frequency: BillFrequency, dueDate: string): string => {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  const now = new Date();

  if (date <= now) {
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "biweekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  }

  return date.toISOString().split("T")[0];
};

/**
 * Normalize date format
 */
export const normalizeDateFormatHelper = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const dateMatch = dateString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  } catch (error) {
    logger.warn("Date normalization failed:", { dateString, error: String(error) });
    return dateString;
  }
};

/**
 * Build bill data object from form data
 */
export const buildBillData = (
  formData: BillFormData,
  editingBill: Bill | null,
  suggestedIconName: string
): Bill => {
  const normalizedDueDate = normalizeDateFormatHelper(formData.dueDate);
  const monthlyAmount = calculateMonthlyAmountHelper(
    formData.amount,
    formData.frequency,
    parseInt(formData.customFrequency) || 1
  );
  const biweeklyAmount = calculateBiweeklyAmountHelper(
    formData.amount,
    formData.frequency,
    parseInt(formData.customFrequency) || 1
  );

  return {
    id: editingBill?.id || "",
    name: formData.name.trim(),
    amount: parseFloat(formData.amount),
    monthlyAmount,
    biweeklyAmount,
    frequency: formData.frequency,
    customFrequency: parseInt(formData.customFrequency) || 1,
    dueDate: normalizedDueDate,
    nextDue: getNextDueDateHelper(formData.frequency, normalizedDueDate),
    category: formData.category,
    color: formData.color,
    notes: formData.notes,
    iconName: formData.iconName || suggestedIconName,
    envelopeId: formData.selectedEnvelope,
    isPaid: editingBill?.isPaid || false,
    createdAt: editingBill?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
