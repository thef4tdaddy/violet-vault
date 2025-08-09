// Debt tracking constants and configurations

// Debt types for classification
export const DEBT_TYPES = {
  MORTGAGE: "mortgage",
  AUTO: "auto",
  CREDIT_CARD: "credit_card",
  CHAPTER13: "chapter13",
  STUDENT: "student",
  PERSONAL: "personal",
  BUSINESS: "business",
  OTHER: "other",
};

// Default debt type for new debts
export const DEFAULT_DEBT_TYPE = DEBT_TYPES.PERSONAL;

// Debt status options
export const DEBT_STATUS = {
  ACTIVE: "active",
  PAID_OFF: "paid_off",
  DEFERRED: "deferred",
  DEFAULT: "default",
};

// Payment frequencies
export const PAYMENT_FREQUENCIES = {
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  ANNUALLY: "annually",
};

// Interest compound frequencies
export const COMPOUND_FREQUENCIES = {
  DAILY: "daily",
  MONTHLY: "monthly",
  ANNUALLY: "annually",
};

// Debt type configurations with properties
export const DEBT_TYPE_CONFIG = {
  [DEBT_TYPES.MORTGAGE]: {
    name: "Mortgage",
    description:
      "Home loan with principal, interest, and potentially PMI/escrow",
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
export const AUTO_CLASSIFY_DEBT_TYPE = (creditorName, debtName) => {
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
    return DEBT_TYPES.MORTGAGE;
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
    return DEBT_TYPES.AUTO;
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
    return DEBT_TYPES.CREDIT_CARD;
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
    return DEBT_TYPES.CHAPTER13;
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
    return DEBT_TYPES.STUDENT;
  }

  // Default to personal loan
  return DEBT_TYPES.PERSONAL;
};

// Calculate debt statistics
export const calculateDebtStats = (debts = []) => {
  if (!debts.length) {
    return {
      totalDebt: 0,
      totalMonthlyPayments: 0,
      averageInterestRate: 0,
      debtsByType: {},
      totalInterestPaid: 0,
    };
  }

  const activeDebts = debts.filter(
    (debt) => debt.status === DEBT_STATUS.ACTIVE,
  );

  const totalDebt = activeDebts.reduce(
    (sum, debt) => sum + (debt.currentBalance || 0),
    0,
  );

  const totalMonthlyPayments = activeDebts.reduce((sum, debt) => {
    const payment = debt.minimumPayment || 0;
    // Convert payment to monthly if needed
    switch (debt.paymentFrequency) {
      case PAYMENT_FREQUENCIES.WEEKLY:
        return sum + (payment * 52) / 12;
      case PAYMENT_FREQUENCIES.BIWEEKLY:
        return sum + (payment * 26) / 12;
      case PAYMENT_FREQUENCIES.QUARTERLY:
        return sum + payment / 3;
      case PAYMENT_FREQUENCIES.ANNUALLY:
        return sum + payment / 12;
      default: // monthly
        return sum + payment;
    }
  }, 0);

  const weightedInterestSum = activeDebts.reduce((sum, debt) => {
    return sum + (debt.interestRate || 0) * (debt.currentBalance || 0);
  }, 0);

  const averageInterestRate =
    totalDebt > 0 ? weightedInterestSum / totalDebt : 0;

  const debtsByType = activeDebts.reduce((acc, debt) => {
    const type = debt.type || DEBT_TYPES.OTHER;
    if (!acc[type]) {
      acc[type] = { count: 0, balance: 0, payments: 0 };
    }
    acc[type].count += 1;
    acc[type].balance += debt.currentBalance || 0;
    acc[type].payments += debt.minimumPayment || 0;
    return acc;
  }, {});

  const totalInterestPaid = debts.reduce((sum, debt) => {
    return (
      sum +
      (debt.paymentHistory || []).reduce((historySum, payment) => {
        return historySum + (payment.interestAmount || 0);
      }, 0)
    );
  }, 0);

  return {
    totalDebt,
    totalMonthlyPayments,
    averageInterestRate,
    debtsByType,
    totalInterestPaid,
    activeDebtCount: activeDebts.length,
    totalDebtCount: debts.length,
  };
};
