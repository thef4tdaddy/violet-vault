// Debt domain types and interfaces
// Based on existing constants and usage patterns

// Debt type literals for better compatibility with existing JS code
export type DebtType =
  | "mortgage"
  | "auto"
  | "credit_card"
  | "chapter13"
  | "student"
  | "personal"
  | "business"
  | "other";

export type DebtStatus = "active" | "paid_off" | "deferred" | "default";

export type PaymentFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

export type CompoundFrequency = "daily" | "monthly" | "annually";

// Debt strategy types
export type DebtStrategy = "avalanche" | "snowball" | "custom";

// Base debt account interface
export interface DebtAccount {
  id: string;
  name: string;
  creditor: string;
  balance: number;
  currentBalance?: number; // Alias for balance (used in DB schema)
  interestRate: number;
  minimumPayment: number;

  // Type and status
  type: DebtType;
  status: DebtStatus;

  // Payment details
  paymentFrequency: PaymentFrequency;
  compoundFrequency: CompoundFrequency;
  nextPaymentDate?: string | Date;

  // Optional fields
  originalBalance?: number;
  creditLimit?: number;
  notes?: string;

  // Special terms based on debt type
  specialTerms?: DebtSpecialTerms;

  // Calculated fields (added by enrichment)
  payoffInfo?: PayoffProjection;
  relatedBill?: unknown; // TODO: Type when bills are converted
  relatedEnvelope?: unknown; // TODO: Type when envelopes are converted
  relatedTransactions?: unknown[]; // TODO: Type when transactions are converted

  // Metadata
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Specialized terms for different debt types
export interface DebtSpecialTerms {
  // Mortgage specific
  pmi?: number;
  escrowPayment?: number;

  // Credit Card specific
  creditLimit?: number;
  cashAdvanceLimit?: number;

  // Chapter 13 specific
  planDuration?: number;
  trusteePayment?: number;
  priorityAmount?: number;

  // Other debt specific terms
  [key: string]: unknown;
}

// Debt type configuration
export interface DebtTypeConfig {
  name: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  icon: string;
  defaultPaymentFrequency: PaymentFrequency;
  defaultCompoundFrequency: CompoundFrequency;
  hasSpecialTerms: boolean;
  specialFields?: string[];
}

// Payoff projection interface
export interface PayoffProjection {
  totalMonths: number;
  totalInterest: number;
  monthlyBreakdown: PayoffMonth[];
  payoffDate: string | Date;
}

export interface PayoffMonth {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

// Debt statistics interface
export interface DebtStats {
  totalDebt: number;
  totalMonthlyPayments: number;
  averageInterestRate: number;
  debtsByType: Record<DebtType, DebtAccount[]>;
  totalInterestPaid: number;
  activeDebtCount: number;
  totalDebtCount: number;
  dueSoonAmount: number;
  dueSoonCount: number;
}

// Debt strategy results
export interface DebtStrategyResult {
  strategy: DebtStrategy;
  totalMonths: number;
  totalInterest: number;
  totalPayment: number;
  monthlyBreakdown: StrategyMonth[];
  debtPayoffOrder: string[]; // debt IDs in payoff order
}

export interface StrategyMonth {
  month: number;
  totalPayment: number;
  debts: Array<{
    debtId: string;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>;
}

// Strategy comparison interface
export interface StrategyComparison {
  extraPayment: number;
  strategies: {
    avalanche: DebtStrategyResult;
    snowball: DebtStrategyResult;
  };
  recommendation: {
    bestForInterest: DebtStrategy;
    bestForTime: DebtStrategy;
    bestForMotivation: DebtStrategy;
  };
  comparison: {
    interestDifference: number;
    timeDifference: number;
    savingsWithAvalanche: number;
    timeWithSnowball: number;
  };
}

// Form validation interfaces
export interface DebtFormData {
  name: string;
  creditor: string;
  balance: number;
  currentBalance?: number; // Alias for balance to support legacy usage
  originalBalance?: number;
  interestRate: number;
  minimumPayment: number;
  type: DebtType;
  status: DebtStatus;
  paymentFrequency: PaymentFrequency;
  compoundFrequency: CompoundFrequency;
  notes?: string;
  specialTerms?: DebtSpecialTerms;
}

export interface DebtFormErrors {
  name?: string;
  creditor?: string;
  balance?: string;
  currentBalance?: string; // Alias for balance
  originalBalance?: string;
  interestRate?: string;
  minimumPayment?: string;
  type?: string;
  [key: string]: string | undefined;
}
