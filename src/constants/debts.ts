// Debt tracking constants and configurations
import logger from "@/utils/core/common/logger";
import type { DebtType, DebtTypeConfig, DebtAccount, DebtStats } from "../types/debt";

// Re-export enums as constants for backward compatibility
export const DEBT_TYPES = {
  MORTGAGE: "mortgage" as const,
  AUTO: "auto" as const,
  CREDIT_CARD: "credit_card" as const,
  CHAPTER13: "chapter13" as const,
  STUDENT: "student" as const,
  PERSONAL: "personal" as const,
  BUSINESS: "business" as const,
  OTHER: "other" as const,
} as const;

// Default debt type for new debts
export const DEFAULT_DEBT_TYPE = DEBT_TYPES.PERSONAL;

// Debt status options
export const DEBT_STATUS = {
  ACTIVE: "active" as const,
  PAID_OFF: "paid_off" as const,
  DEFERRED: "deferred" as const,
  DEFAULT: "default" as const,
} as const;

// Payment frequencies
export const PAYMENT_FREQUENCIES = {
  WEEKLY: "weekly" as const,
  BIWEEKLY: "biweekly" as const,
  MONTHLY: "monthly" as const,
  QUARTERLY: "quarterly" as const,
  ANNUALLY: "annually" as const,
} as const;

// Interest compound frequencies
export const COMPOUND_FREQUENCIES = {
  DAILY: "daily" as const,
  MONTHLY: "monthly" as const,
  ANNUALLY: "annually" as const,
} as const;

// Debt type configurations with properties
export const DEBT_TYPE_CONFIG: Record<string, DebtTypeConfig> = {
  [DEBT_TYPES.MORTGAGE]: {
    name: "Mortgage",
    description: "Home loan with principal, interest, and potentially PMI/escrow",
    color: "blue",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: "Home",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: true,
    specialFields: ["pmi", "escrowPayment"],
  },
  [DEBT_TYPES.AUTO]: {
    name: "Auto Loan",
    description: "Vehicle financing with fixed payments",
    color: "green",
    borderColor: "border-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    icon: "Car",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: false,
  },
  [DEBT_TYPES.CREDIT_CARD]: {
    name: "Credit Card",
    description: "Revolving credit with minimum payments",
    color: "red",
    borderColor: "border-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    icon: "CreditCard",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.DAILY,
    hasSpecialTerms: true,
    specialFields: ["creditLimit", "cashAdvanceLimit"],
  },
  [DEBT_TYPES.CHAPTER13]: {
    name: "Chapter 13 Bankruptcy",
    description: "Court-ordered payment plan with trustee payments",
    color: "purple",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    icon: "Scale",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: true,
    specialFields: ["planDuration", "trusteePayment", "priorityAmount"],
  },
  [DEBT_TYPES.STUDENT]: {
    name: "Student Loan",
    description: "Educational debt with various repayment options",
    color: "indigo",
    borderColor: "border-indigo-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    icon: "GraduationCap",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: false,
  },
  [DEBT_TYPES.PERSONAL]: {
    name: "Personal Loan",
    description: "Fixed-term personal debt",
    color: "orange",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    icon: "User",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: false,
  },
  [DEBT_TYPES.BUSINESS]: {
    name: "Business Loan",
    description: "Commercial debt obligations",
    color: "teal",
    borderColor: "border-teal-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    icon: "Building",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: false,
  },
  [DEBT_TYPES.OTHER]: {
    name: "Other Debt",
    description: "Other installment debt (appliances, phones, etc.)",
    color: "gray",
    borderColor: "border-gray-500",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    icon: "DollarSign",
    defaultPaymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
    defaultCompoundFrequency: COMPOUND_FREQUENCIES.MONTHLY,
    hasSpecialTerms: false,
  },
};

// Auto-classify debt type based on creditor/name patterns
export const AUTO_CLASSIFY_DEBT_TYPE = (creditorName: string, debtName: string): DebtType => {
  const text = `${creditorName} ${debtName}`.toLowerCase();

  // Mortgage patterns
  const mortgagePatterns = [
    "mortgage",
    "home",
    "house",
    "quicken",
    "rocket mortgage",
    "wells fargo home",
    "chase home",
    "bank of america home",
    "pnc mortgage",
    "us bank home",
  ];
  if (mortgagePatterns.some((pattern) => text.includes(pattern))) {
    return DEBT_TYPES.MORTGAGE as DebtType;
  }

  // Auto loan patterns
  const autoPatterns = [
    "auto",
    "car",
    "vehicle",
    "ford credit",
    "gm financial",
    "toyota financial",
    "honda financial",
    "nissan motor",
    "subaru financial",
    "bmw financial",
  ];
  if (autoPatterns.some((pattern) => text.includes(pattern))) {
    return DEBT_TYPES.AUTO as DebtType;
  }

  // Credit card patterns
  const creditCardPatterns = [
    "visa",
    "mastercard",
    "discover",
    "american express",
    "amex",
    "capital one",
    "chase freedom",
    "citi",
    "credit card",
    "card",
  ];
  if (creditCardPatterns.some((pattern) => text.includes(pattern))) {
    return DEBT_TYPES.CREDIT_CARD as DebtType;
  }

  // Chapter 13 patterns
  const bankruptcyPatterns = [
    "chapter 13",
    "bankruptcy",
    "trustee",
    "bankruptcy court",
    "plan payment",
  ];
  if (bankruptcyPatterns.some((pattern) => text.includes(pattern))) {
    return DEBT_TYPES.CHAPTER13 as DebtType;
  }

  // Student loan patterns
  const studentLoanPatterns = [
    "student",
    "education",
    "sallie mae",
    "navient",
    "great lakes",
    "fedloan",
    "nelnet",
    "edfinancial",
    "mohela",
  ];
  if (studentLoanPatterns.some((pattern) => text.includes(pattern))) {
    return DEBT_TYPES.STUDENT as DebtType;
  }

  // Default to personal loan
  return DEBT_TYPES.PERSONAL as DebtType;
};

// Calculate debt statistics
export const calculateDebtStats = (debts: DebtAccount[] = []): DebtStats => {
  if (!debts.length) {
    return {
      totalDebt: 0,
      totalMonthlyPayments: 0,
      averageInterestRate: 0,
      debtsByType: {} as Record<DebtType, DebtAccount[]>,
      totalInterestPaid: 0,
      activeDebtCount: 0,
      totalDebtCount: 0,
      dueSoonAmount: 0,
      dueSoonCount: 0,
    };
  }

  // Debug debt statuses to understand filtering
  logger.debug("🔍 calculateDebtStats input:", {
    totalDebts: debts.length,
    debtStatuses: debts.map((d) => ({
      name: d.name,
      status: d.status,
    })),
  });

  // Filter active debts only
  const activeDebts = debts.filter((debt) => debt.status === DEBT_STATUS.ACTIVE);

  logger.debug("🔍 calculateDebtStats filtered:", {
    activeDebts: activeDebts.length,
    statuses: activeDebts.map((d) => d.status),
  });

  const totalDebt = activeDebts.reduce(
    (sum, debt) =>
      sum + ((debt as unknown as Record<string, number>).currentBalance || debt.balance || 0),
    0
  );
  const totalMonthlyPayments = activeDebts.reduce(
    (sum, debt) => sum + (debt.minimumPayment || 0),
    0
  );

  // Calculate weighted average interest rate
  const balance = (debt: DebtAccount) =>
    (debt as unknown as Record<string, number>).currentBalance || debt.balance || 0;
  const weightedInterestSum = activeDebts.reduce(
    (sum, debt) => sum + (debt.interestRate || 0) * balance(debt),
    0
  );
  const averageInterestRate = totalDebt > 0 ? weightedInterestSum / totalDebt : 0;

  // Group debts by type
  const debtsByType = activeDebts.reduce(
    (acc, debt) => {
      if (!acc[debt.type as DebtType]) {
        acc[debt.type as DebtType] = [];
      }
      acc[debt.type as DebtType].push(debt);
      return acc;
    },
    {} as Record<DebtType, DebtAccount[]>
  );

  // Calculate total interest paid (this would need transaction history)
  const totalInterestPaid = 0; // Placeholder - would require transaction analysis

  // Calculate debts due soon (within 7 days)
  // Normalize to midnight to avoid timezone issues
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dueSoonDebts = activeDebts.filter((debt) => {
    if (!debt.nextPaymentDate) return false;
    const dueDate = new Date(debt.nextPaymentDate);
    dueDate.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
    return dueDate >= today && dueDate <= nextWeek;
  });

  const dueSoonAmount = dueSoonDebts.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0);
  const dueSoonCount = dueSoonDebts.length;

  return {
    totalDebt,
    totalMonthlyPayments,
    averageInterestRate,
    debtsByType,
    totalInterestPaid,
    activeDebtCount: activeDebts.length,
    totalDebtCount: debts.length,
    dueSoonAmount,
    dueSoonCount,
  };
};
