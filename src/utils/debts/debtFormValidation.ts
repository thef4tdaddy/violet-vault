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

/**
 * Validate debt form data with financial business rules
 */
export function validateDebtFormData(formData: any): ValidationResult {
  const errors: DebtFormErrors = {};
  const warnings: string[] = [];

  // Basic required field validation
  if (!formData.name?.trim()) {
    errors.name = "Debt name is required";
  }

  if (!formData.creditor?.trim()) {
    errors.creditor = "Creditor name is required";
  }

  // Financial validation
  const currentBalance = parseFloat(formData.currentBalance || formData.balance);
  if (
    (!formData.currentBalance && !formData.balance) ||
    isNaN(currentBalance) ||
    currentBalance < 0
  ) {
    errors.balance = "Valid current balance is required";
  }

  const originalBalance = formData.originalBalance ? parseFloat(formData.originalBalance) : null;
  if (originalBalance !== null && (isNaN(originalBalance) || originalBalance < 0)) {
    errors.originalBalance = "Original balance must be positive";
  }

  // Interest rate validation
  const interestRate = formData.interestRate ? parseFloat(formData.interestRate) : 0;
  if (formData.interestRate && (isNaN(interestRate) || interestRate < 0 || interestRate > 100)) {
    errors.interestRate = "Interest rate must be between 0 and 100";
  }

  // Minimum payment validation
  const minimumPayment = parseFloat(formData.minimumPayment);
  if (!formData.minimumPayment || isNaN(minimumPayment) || minimumPayment < 0) {
    errors.minimumPayment = "Valid minimum payment is required";
  }

  // Business logic warnings
  if (currentBalance > 0 && minimumPayment > 0) {
    const minimumPaymentPercent = (minimumPayment / currentBalance) * 100;

    if (minimumPaymentPercent < 1) {
      warnings.push(
        "Minimum payment is less than 1% of balance - this will take very long to pay off"
      );
    } else if (minimumPaymentPercent > 50) {
      warnings.push("Minimum payment is more than 50% of balance - verify this is correct");
    }
  }

  // Interest rate warnings
  if (interestRate > 25) {
    warnings.push("Interest rate is very high - consider debt consolidation options");
  }

  // Original vs current balance warnings
  if (originalBalance !== null && currentBalance > originalBalance) {
    warnings.push(
      "Current balance is higher than original balance - interest and fees may have accrued"
    );
  }

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

/**
 * Calculate debt metrics for display and analysis
 */
export function calculateDebtMetrics(debtData: DebtFormData): DebtMetrics | null {
  const { balance, interestRate, minimumPayment, paymentFrequency = "monthly" } = debtData;

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

  // Calculate effective APR (accounting for payment frequency)
  const paymentsPerYear =
    paymentFrequency === "weekly"
      ? 52
      : paymentFrequency === "biweekly"
        ? 26
        : paymentFrequency === "quarterly"
          ? 4
          : paymentFrequency === "annually"
            ? 1
            : 12;

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
