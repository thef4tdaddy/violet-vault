/**
 * Debt form validation utilities
 * Extracted financial validation logic for debt forms
 */

/**
 * Validate debt form data with financial business rules
 * @param {Object} formData - Raw form data
 * @returns {Object} Validation result with errors and parsed data
 */
export function validateDebtFormData(formData) {
  const errors = {};
  const warnings = [];

  // Basic required field validation
  if (!formData.name?.trim()) {
    errors.name = "Debt name is required";
  }

  if (!formData.creditor?.trim()) {
    errors.creditor = "Creditor name is required";
  }

  // Financial validation
  const currentBalance = parseFloat(formData.currentBalance);
  if (!formData.currentBalance || isNaN(currentBalance) || currentBalance < 0) {
    errors.currentBalance = "Valid current balance is required";
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
      name: formData.name?.trim(),
      creditor: formData.creditor?.trim(),
      type: formData.type,
      currentBalance,
      originalBalance: originalBalance || currentBalance,
      interestRate,
      minimumPayment,
      paymentFrequency: formData.paymentFrequency,
      paymentDueDate: formData.paymentDueDate,
      notes: formData.notes?.trim() || "",
    },
  };
}

/**
 * Calculate debt metrics for display and analysis
 * @param {Object} debtData - Validated debt data
 * @returns {Object} Calculated debt metrics
 */
export function calculateDebtMetrics(debtData) {
  const {
    currentBalance,
    originalBalance,
    interestRate,
    minimumPayment,
    paymentFrequency = "monthly",
  } = debtData;

  if (!currentBalance || !minimumPayment) {
    return null;
  }

  // Convert annual interest rate to appropriate period rate
  let periodsPerYear = 12; // default to monthly
  switch (paymentFrequency) {
    case "weekly":
      periodsPerYear = 52;
      break;
    case "biweekly":
      periodsPerYear = 26;
      break;
    case "monthly":
      periodsPerYear = 12;
      break;
    case "quarterly":
      periodsPerYear = 4;
      break;
    case "annually":
      periodsPerYear = 1;
      break;
  }

  const periodInterestRate = interestRate / 100 / periodsPerYear;

  // Calculate basic metrics
  const totalPaid = originalBalance - currentBalance;
  const paymentToBalanceRatio = minimumPayment / currentBalance;

  // Simple payoff calculation (assumes minimum payments only)
  let monthsToPayoff = null;
  let totalInterest = null;

  if (periodInterestRate > 0) {
    // Formula: n = -log(1 - (r * P) / A) / log(1 + r)
    // Where: P = principal, A = payment, r = period interest rate
    const ratio = (periodInterestRate * currentBalance) / minimumPayment;

    if (ratio < 1) {
      // Payment is sufficient to pay off debt
      monthsToPayoff = -Math.log(1 - ratio) / Math.log(1 + periodInterestRate);
      totalInterest = monthsToPayoff * minimumPayment - currentBalance;

      // Convert periods back to months for consistency
      if (paymentFrequency !== "monthly") {
        monthsToPayoff = monthsToPayoff * (12 / periodsPerYear);
      }
    } else {
      // Payment is not sufficient (only covers interest)
      monthsToPayoff = Infinity;
      totalInterest = Infinity;
    }
  } else {
    // No interest case
    monthsToPayoff = currentBalance / minimumPayment;
    totalInterest = 0;
  }

  return {
    totalPaid,
    paymentToBalanceRatio,
    monthsToPayoff: monthsToPayoff === Infinity ? null : Math.ceil(monthsToPayoff),
    totalInterest: totalInterest === Infinity ? null : Math.max(0, totalInterest),
    isPaymentSufficient: monthsToPayoff !== Infinity,
    monthlyInterestCost: currentBalance * (interestRate / 100 / 12),
  };
}

/**
 * Format debt metrics for display
 * @param {Object} metrics - Calculated debt metrics
 * @returns {Object} Formatted strings for display
 */
export function formatDebtMetrics(metrics) {
  if (!metrics) {
    return null;
  }

  const { monthsToPayoff, totalInterest, isPaymentSufficient, monthlyInterestCost } = metrics;

  let payoffTimeDisplay = "Unable to calculate";
  if (isPaymentSufficient && monthsToPayoff) {
    const years = Math.floor(monthsToPayoff / 12);
    const months = monthsToPayoff % 12;

    if (years > 0) {
      payoffTimeDisplay = `${years} year${years > 1 ? "s" : ""}${months > 0 ? ` ${months} month${months > 1 ? "s" : ""}` : ""}`;
    } else {
      payoffTimeDisplay = `${months} month${months > 1 ? "s" : ""}`;
    }
  } else if (!isPaymentSufficient) {
    payoffTimeDisplay = "Payment insufficient (covers interest only)";
  }

  return {
    payoffTime: payoffTimeDisplay,
    totalInterest: totalInterest ? `$${totalInterest.toFixed(2)}` : "N/A",
    monthlyInterest: `$${monthlyInterestCost.toFixed(2)}`,
    isPaymentSufficient,
  };
}
