/**
 * Debt form validation utilities
 * Migrated to use Zod schemas for validation
 */

import { validateDebtFormDataSafe, type DebtFormData } from "@/domain/schemas/debt";

type NumericString = string | number | null | undefined;

type DebtFormParsedData = Omit<
  DebtFormData,
  "currentBalance" | "balance" | "minimumPayment" | "interestRate" | "originalBalance"
> & {
  currentBalance: number;
  balance: number;
  minimumPayment: number;
  interestRate: number;
  originalBalance: number;
};

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  parsedData: DebtFormParsedData;
}

export interface DebtMetrics {
  payoffTimeMonths: number | null;
  monthsToPayoff: number | null; // Alias for payoffTimeMonths
  totalInterestPaid: number | null;
  totalInterest: number | null; // Alias for totalInterestPaid
  totalAmountPaid: number;
  totalPaid: number; // Additional property for total amount already paid
  effectiveAPR: number;
  monthlyInterestCost: number;
  payoffDate: Date;
  paymentToBalanceRatio: number;
  isPaymentSufficient: boolean;
}

const parseNumericInput = (value: NumericString, fallback = 0): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return fallback;
    }

    const numeric = Number.parseFloat(trimmed.replace(/,/g, ""));
    return Number.isNaN(numeric) ? fallback : numeric;
  }

  return fallback;
};

const buildParsedData = (data: DebtFormData): DebtFormParsedData => {
  const currentBalance = parseNumericInput(data.currentBalance ?? data.balance, 0);
  const minimumPayment = parseNumericInput(data.minimumPayment, 0);
  const interestRate = parseNumericInput(data.interestRate, 0);

  const originalBalance =
    data.originalBalance !== undefined &&
    data.originalBalance !== null &&
    data.originalBalance !== ""
      ? parseNumericInput(data.originalBalance, currentBalance)
      : currentBalance;

  return {
    ...(data as Omit<
      DebtFormData,
      "currentBalance" | "balance" | "minimumPayment" | "interestRate" | "originalBalance"
    >),
    currentBalance,
    balance: currentBalance,
    minimumPayment,
    interestRate,
    originalBalance,
  };
};

/**
 * Validate debt form data with financial business rules
 * Now uses Zod schema for validation
 */
export function validateDebtFormData(formData: Record<string, unknown>): ValidationResult {
  const result = validateDebtFormDataSafe(formData);

  if (!result.success) {
    return {
      isValid: false,
      errors: result.errors,
      warnings: [],
      parsedData: {} as DebtFormParsedData,
    };
  }

  const parsedData = buildParsedData(result.data);

  return {
    isValid: true,
    errors: {},
    warnings: result.warnings,
    parsedData,
  };
}

/**
 * Validate debt form fields (for useDebtForm hook)
 * Returns object with field-specific error messages
 * Now uses Zod schema for validation
 */
export function validateDebtFormFields(formData: Record<string, unknown>): Record<string, string> {
  const result = validateDebtFormDataSafe(formData);
  return result.errors;
}

// Helper to calculate payoff metrics with interest
function calculatePayoffMetrics(
  currentBalance: number,
  minimumPayment: number,
  monthlyInterestRate: number
): {
  payoffTimeMonths: number | null;
  totalInterestPaid: number | null;
  isPaymentSufficient: boolean;
} {
  if (monthlyInterestRate === 0) {
    return {
      payoffTimeMonths: currentBalance / minimumPayment,
      totalInterestPaid: 0,
      isPaymentSufficient: true,
    };
  }

  if (minimumPayment <= currentBalance * monthlyInterestRate) {
    return {
      payoffTimeMonths: null,
      totalInterestPaid: null,
      isPaymentSufficient: false,
    };
  }

  const payoffTimeMonths =
    -Math.log(1 - (currentBalance * monthlyInterestRate) / minimumPayment) /
    Math.log(1 + monthlyInterestRate);

  return {
    payoffTimeMonths,
    totalInterestPaid: minimumPayment * payoffTimeMonths - currentBalance,
    isPaymentSufficient: true,
  };
}

/**
 * Calculate debt metrics for display and analysis
 * Supports both 'balance' and 'currentBalance' properties for compatibility
 */
export function calculateDebtMetrics(debtData: {
  balance?: number;
  currentBalance?: number;
  originalBalance?: number;
  interestRate?: number;
  minimumPayment?: number;
  paymentFrequency?: string;
}): DebtMetrics | null {
  const currentBalance = debtData.currentBalance ?? debtData.balance ?? 0;
  const originalBalance = debtData.originalBalance ?? currentBalance;
  const interestRate = debtData.interestRate ?? 0;
  const minimumPayment = debtData.minimumPayment ?? 0;

  if (!currentBalance || !minimumPayment) {
    return null;
  }

  const monthlyInterestRate = interestRate / 100 / 12;
  const { payoffTimeMonths, totalInterestPaid, isPaymentSufficient } = calculatePayoffMetrics(
    currentBalance,
    minimumPayment,
    monthlyInterestRate
  );

  const totalPaid = Math.max(0, originalBalance - currentBalance);
  const paymentToBalanceRatio = minimumPayment / currentBalance;
  const totalAmountPaid = currentBalance + (totalInterestPaid ?? 0);
  const payoffDate = new Date();
  if (payoffTimeMonths !== null) {
    payoffDate.setMonth(payoffDate.getMonth() + Math.ceil(payoffTimeMonths));
  }

  const effectiveAPR = Math.pow(1 + monthlyInterestRate, 12) - 1;
  const monthlyInterestCost = currentBalance * monthlyInterestRate;

  return {
    payoffTimeMonths: payoffTimeMonths !== null ? Math.ceil(payoffTimeMonths) : null,
    monthsToPayoff: payoffTimeMonths !== null ? Math.ceil(payoffTimeMonths) : null, // Alias
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
