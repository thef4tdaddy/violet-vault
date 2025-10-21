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

interface DebtMetrics {
  payoffTimeMonths: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  effectiveAPR: number;
  monthlyInterestCost: number;
  payoffDate: Date;
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

  // Validate balances
  if (currentBalance < 0) {
    errors.balance = "Valid current balance is required";
  }
  if (originalBalance !== null && originalBalance < 0) {
    errors.originalBalance = "Original balance must be positive";
  }
  if (formData.interestRate && (interestRate < 0 || interestRate > 100)) {
    errors.interestRate = "Interest rate must be between 0 and 100";
  }
  if (minimumPayment < 0) {
    errors.minimumPayment = "Valid minimum payment is required";
  }

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
 */
export function calculateDebtMetrics(debtData: DebtFormData): DebtMetrics | null {
  const { balance, interestRate, minimumPayment } = debtData;

  if (!balance || !minimumPayment) {
    return null;
  }

  // Convert annual interest rate to monthly
  const monthlyInterestRate = interestRate / 100 / 12;

  // Calculate payoff time using amortization formula
  let payoffTimeMonths = 0;
  let totalInterestPaid = 0;

  if (monthlyInterestRate === 0) {
    // No interest case
    payoffTimeMonths = balance / minimumPayment;
    totalInterestPaid = 0;
  } else {
    // With interest - use standard loan amortization
    if (minimumPayment <= balance * monthlyInterestRate) {
      // Payment doesn't cover interest - never pays off
      payoffTimeMonths = 999; // Cap at 999 months for UI purposes
      totalInterestPaid = balance * 10; // Rough estimate
    } else {
      payoffTimeMonths =
        -Math.log(1 - (balance * monthlyInterestRate) / minimumPayment) /
        Math.log(1 + monthlyInterestRate);
      totalInterestPaid = minimumPayment * payoffTimeMonths - balance;
    }
  }

  const totalAmountPaid = balance + totalInterestPaid;
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(payoffTimeMonths));

  const effectiveAPR = Math.pow(1 + monthlyInterestRate, 12) - 1;
  const monthlyInterestCost = balance * monthlyInterestRate;

  return {
    payoffTimeMonths: Math.ceil(payoffTimeMonths),
    totalInterestPaid,
    totalAmountPaid,
    effectiveAPR: effectiveAPR * 100,
    monthlyInterestCost,
    payoffDate,
  };
}
