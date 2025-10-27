/**
 * Debt form validation utilities
 * Extracted financial validation logic for debt forms
 */

import type { DebtFormData, DebtFormErrors } from "../../types/debt";

interface ValidationResult {
  isValid: boolean;
  errors: DebtFormErrors;
  warnings: string[];
  parsedData: DebtFormData;
}

export interface DebtMetrics {
  payoffTimeMonths: number;
  monthsToPayoff: number; // Alias for payoffTimeMonths
  totalInterestPaid: number;
  totalInterest: number; // Alias for totalInterestPaid
  totalAmountPaid: number;
  totalPaid: number; // Additional property for total amount already paid
  effectiveAPR: number;
  monthlyInterestCost: number;
  payoffDate: Date;
  paymentToBalanceRatio: number;
  isPaymentSufficient: boolean;
}

// Helper to parse and validate numeric fields
const parseNumericField = (value: unknown): number | null => {
  if (!value) return null;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? null : parsed;
};

// Helper to add payment ratio warnings
const addPaymentRatioWarnings = (
  currentBalance: number,
  minimumPayment: number,
  warnings: string[]
) => {
  if (currentBalance <= 0 || minimumPayment <= 0) return;

  const paymentPercent = (minimumPayment / currentBalance) * 100;
  if (paymentPercent < 1) {
    warnings.push(
      "Minimum payment is less than 1% of balance - this will take very long to pay off"
    );
  } else if (paymentPercent > 50) {
    warnings.push("Minimum payment is more than 50% of balance - verify this is correct");
  }
};

// Helper to add interest rate warnings
const addInterestRateWarnings = (interestRate: number, warnings: string[]) => {
  if (interestRate > 25) {
    warnings.push("Interest rate is very high - consider debt consolidation options");
  }
};

// Helper to add balance comparison warnings
const addBalanceComparisonWarnings = (
  currentBalance: number,
  originalBalance: number | null,
  warnings: string[]
) => {
  if (originalBalance !== null && currentBalance > originalBalance) {
    warnings.push(
      "Current balance is higher than original balance - interest and fees may have accrued"
    );
  }
};

/**
 * Validate debt form data with financial business rules
 */
export function validateDebtFormData(formData: Record<string, unknown>): ValidationResult {
  const errors: DebtFormErrors = {};
  const warnings: string[] = [];

  // Basic validation
  checkRequiredTextField(formData.name, "name", errors);
  checkRequiredTextField(formData.creditor, "creditor", errors);

  // Parse numeric fields
  const currentBalance = parseNumericField(formData.currentBalance || formData.balance) ?? -1;
  const originalBalance = parseNumericField(formData.originalBalance);
  const interestRate = parseNumericField(formData.interestRate) ?? 0;
  const minimumPayment = parseNumericField(formData.minimumPayment) ?? -1;

  // Validate numeric fields
  validateNumericFields(
    { currentBalance, originalBalance, interestRate, minimumPayment },
    formData,
    errors
  );

  // Add warnings
  addPaymentRatioWarnings(currentBalance, minimumPayment, warnings);
  addInterestRateWarnings(interestRate, warnings);
  addBalanceComparisonWarnings(currentBalance, originalBalance, warnings);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    parsedData: {
      name: formData.name?.trim() || "",
      creditor: formData.creditor?.trim() || "",
      type: formData.type,
      balance: currentBalance,
      currentBalance, // Add alias for compatibility
      originalBalance: originalBalance ?? currentBalance,
      interestRate,
      minimumPayment,
      status: formData.status,
      paymentFrequency: formData.paymentFrequency,
      compoundFrequency: formData.compoundFrequency,
      notes: formData.notes?.trim() || "",
      specialTerms: formData.specialTerms,
    } as DebtFormData,
  };
}

// Helper to validate numeric fields
const validateNumericFields = (
  fields: {
    currentBalance: number;
    originalBalance: number | null;
    interestRate: number;
    minimumPayment: number;
  },
  formData: Record<string, unknown>,
  errors: DebtFormErrors
) => {
  if (fields.currentBalance < 0) {
    errors.balance = "Valid current balance is required";
    errors.currentBalance = "Valid current balance is required"; // Alias for compatibility
  }
  if (fields.originalBalance !== null && fields.originalBalance < 0) {
    errors.originalBalance = "Original balance must be positive";
  }
  if (formData.interestRate && (fields.interestRate < 0 || fields.interestRate > 100)) {
    errors.interestRate = "Interest rate must be between 0 and 100";
  }
  if (fields.minimumPayment < 0) {
    errors.minimumPayment = "Valid minimum payment is required";
  }
};

// Helper functions to reduce complexity
const isValidNumber = (value: unknown): boolean => {
  const num = parseFloat(String(value));
  return !isNaN(num) && num >= 0;
};

const checkRequiredTextField = (
  value: unknown,
  fieldName: string,
  errors: Record<string, string>
) => {
  if (!value || typeof value !== "string" || !value.trim()) {
    errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
  }
};

const checkBalanceField = (
  value: unknown,
  fieldName: string,
  required: boolean,
  errors: Record<string, string>
) => {
  if (required) {
    if (!value || !isValidNumber(value)) {
      errors[fieldName] = `Valid ${fieldName.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
    }
  } else if (value) {
    const num = parseFloat(String(value));
    if (isNaN(num) || num < 0) {
      errors[fieldName] =
        `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be positive`;
    }
  }
};

const checkInterestRate = (value: unknown, errors: Record<string, string>) => {
  if (value) {
    const rate = parseFloat(String(value));
    if (isNaN(rate) || rate < 0 || rate > 100) {
      errors.interestRate = "Interest rate must be between 0 and 100";
    }
  }
};

const checkPaymentMethodFields = (
  formData: Record<string, unknown>,
  errors: Record<string, string>
) => {
  if (formData.paymentMethod === "connect_existing" && !formData.existingBillId) {
    errors.existingBillId = "Please select a bill to connect";
  }

  if (formData.paymentMethod === "create_new" && formData.createBill && !formData.envelopeId) {
    errors.envelopeId = "Please select an envelope for payment funding";
  }
};

/**
 * Validate debt form fields (for useDebtForm hook)
 * Returns object with field-specific error messages
 */
export function validateDebtFormFields(formData: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  checkRequiredTextField(formData.name, "name", errors);
  checkRequiredTextField(formData.creditor, "creditor", errors);
  checkBalanceField(formData.currentBalance, "currentBalance", true, errors);
  checkBalanceField(formData.originalBalance, "originalBalance", false, errors);
  checkInterestRate(formData.interestRate, errors);
  checkBalanceField(formData.minimumPayment, "minimumPayment", true, errors);
  checkPaymentMethodFields(formData, errors);

  return errors;
}

/**
 * Calculate debt metrics for display and analysis
 * Supports both 'balance' and 'currentBalance' properties for compatibility
 */
export function calculateDebtMetrics(
  debtData: {
    balance?: number;
    currentBalance?: number;
    originalBalance?: number;
    interestRate?: number;
    minimumPayment?: number;
    paymentFrequency?: string;
  }
): DebtMetrics | null {
  // Support both balance and currentBalance properties
  const currentBalance = debtData.currentBalance ?? debtData.balance ?? 0;
  const originalBalance = debtData.originalBalance ?? currentBalance;
  const interestRate = debtData.interestRate ?? 0;
  const minimumPayment = debtData.minimumPayment ?? 0;

  if (!currentBalance || !minimumPayment) {
    return null;
  }

  // Calculate total paid (difference between original and current balance)
  const totalPaid = Math.max(0, originalBalance - currentBalance);

  // Calculate payment to balance ratio
  const paymentToBalanceRatio = minimumPayment / currentBalance;

  // Convert annual interest rate to monthly
  const monthlyInterestRate = interestRate / 100 / 12;

  // Calculate payoff time using amortization formula
  let payoffTimeMonths = 0;
  let totalInterestPaid = 0;
  let isPaymentSufficient = true;

  if (monthlyInterestRate === 0) {
    // No interest case
    payoffTimeMonths = currentBalance / minimumPayment;
    totalInterestPaid = 0;
    isPaymentSufficient = true;
  } else {
    // With interest - use standard loan amortization
    if (minimumPayment <= currentBalance * monthlyInterestRate) {
      // Payment doesn't cover interest - never pays off
      payoffTimeMonths = 999; // Cap at 999 months for UI purposes
      totalInterestPaid = currentBalance * 10; // Rough estimate
      isPaymentSufficient = false;
    } else {
      payoffTimeMonths =
        -Math.log(1 - (currentBalance * monthlyInterestRate) / minimumPayment) /
        Math.log(1 + monthlyInterestRate);
      totalInterestPaid = minimumPayment * payoffTimeMonths - currentBalance;
      isPaymentSufficient = true;
    }
  }

  const totalAmountPaid = currentBalance + totalInterestPaid;
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(payoffTimeMonths));

  const effectiveAPR = Math.pow(1 + monthlyInterestRate, 12) - 1;
  const monthlyInterestCost = currentBalance * monthlyInterestRate;

  return {
    payoffTimeMonths: Math.ceil(payoffTimeMonths),
    monthsToPayoff: Math.ceil(payoffTimeMonths), // Alias
    totalInterestPaid,
    totalInterest: totalInterestPaid, // Alias
    totalAmountPaid,
    totalPaid,
    effectiveAPR: effectiveAPR * 100,
    monthlyInterestCost,
    payoffDate,
    paymentToBalanceRatio,
    isPaymentSufficient,
  };
}

/**
 * Format debt metrics for display
 */
export function formatDebtMetrics(
  metrics: {
    monthsToPayoff?: number | null;
    totalInterest?: number | null;
    monthlyInterestCost?: number;
    isPaymentSufficient?: boolean;
  } | null
): {
  payoffTime: string;
  totalInterest: string;
  monthlyInterest: string;
  isPaymentSufficient: boolean;
} | null {
  if (!metrics) {
    return null;
  }

  const { monthsToPayoff, totalInterest, monthlyInterestCost, isPaymentSufficient } = metrics;

  // Format payoff time
  let payoffTime: string;
  if (!isPaymentSufficient || monthsToPayoff === null) {
    payoffTime = "Payment insufficient (covers interest only)";
  } else {
    const years = Math.floor(monthsToPayoff / 12);
    const months = monthsToPayoff % 12;

    if (years === 0) {
      payoffTime = `${months} month${months !== 1 ? "s" : ""}`;
    } else if (months === 0) {
      payoffTime = `${years} year${years !== 1 ? "s" : ""}`;
    } else {
      payoffTime = `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
    }
  }

  // Format currency values
  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return `$${value.toFixed(2)}`;
  };

  return {
    payoffTime,
    totalInterest: formatCurrency(totalInterest),
    monthlyInterest: formatCurrency(monthlyInterestCost),
    isPaymentSufficient,
  };
}
