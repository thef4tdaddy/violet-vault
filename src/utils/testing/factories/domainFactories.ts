/**
 * Domain Model Test Factories
 * Factories for generating valid domain model test data
 * Part of Phase 3: Test Schema Factories and Fixtures
 */

import type {
  Envelope,
  EnvelopePartial,
  Bill,
  BillPartial,
  Transaction,
  TransactionPartial,
  SavingsGoal,
  SavingsGoalPartial,
} from "@/domain/schemas";
import {
  generateId,
  generateTimestamp,
  generateAmount,
  generateRecentDate,
  generateFutureDate,
  mergeDefaults,
  pickRandom,
} from "./factoryUtils";

/**
 * Envelope Factory
 * Creates a valid Envelope entity with sensible defaults
 */
export const createEnvelope = (overrides?: Partial<Envelope>): Envelope => {
  const defaults: Envelope = {
    id: generateId(),
    name: `Envelope ${generateId().substring(0, 8)}`,
    category: pickRandom([
      "groceries",
      "utilities",
      "entertainment",
      "transportation",
      "healthcare",
    ]),
    archived: false,
    lastModified: generateTimestamp(),
    createdAt: generateTimestamp(),
    currentBalance: generateAmount(0, 500),
    targetAmount: generateAmount(100, 1000),
    description: "Test envelope description",
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Envelope Partial Factory
 * Creates a partial envelope for update operations
 */
export const createEnvelopePartial = (overrides?: EnvelopePartial): EnvelopePartial => {
  return overrides || { name: "Updated Envelope" };
};

/**
 * Bill Factory
 * Creates a valid Bill entity with sensible defaults
 */
export const createBill = (overrides?: Partial<Bill>): Bill => {
  const defaults: Bill = {
    id: generateId(),
    name: `Bill ${generateId().substring(0, 8)}`,
    dueDate: generateFutureDate(30),
    amount: generateAmount(50, 500),
    category: pickRandom(["utilities", "subscriptions", "insurance", "rent"]),
    isPaid: false,
    isRecurring: false,
    frequency: undefined,
    envelopeId: generateId(),
    lastModified: generateTimestamp(),
    createdAt: generateTimestamp(),
    description: "Test bill description",
    paymentMethod: pickRandom(["credit_card", "debit_card", "bank_transfer", "cash"]),
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Recurring Bill Factory
 * Creates a recurring bill
 */
export const createRecurringBill = (overrides?: Partial<Bill>): Bill => {
  return createBill({
    isRecurring: true,
    frequency: pickRandom(["monthly", "quarterly", "annually"]),
    ...overrides,
  });
};

/**
 * Bill Partial Factory
 * Creates a partial bill for update operations
 */
export const createBillPartial = (overrides?: BillPartial): BillPartial => {
  return overrides || { name: "Updated Bill" };
};

/**
 * Transaction Factory
 * Creates a valid Transaction entity with sensible defaults
 */
export const createTransaction = (overrides?: Partial<Transaction>): Transaction => {
  const defaults: Transaction = {
    id: generateId(),
    date: generateRecentDate(30),
    amount: generateAmount(10, 500),
    envelopeId: generateId(),
    category: pickRandom([
      "groceries",
      "utilities",
      "entertainment",
      "transportation",
      "healthcare",
    ]),
    type: "expense",
    lastModified: generateTimestamp(),
    createdAt: generateTimestamp(),
    description: "Test transaction description",
    merchant: pickRandom(["Walmart", "Target", "Amazon", "Gas Station", "Restaurant"]),
    receiptUrl: "https://example.com/receipt.jpg",
  };

  const merged = mergeDefaults(defaults, overrides);

  // Normalize amount sign based on transaction type after merging
  if (merged.type === "expense") {
    merged.amount = -Math.abs(merged.amount);
  } else if (merged.type === "income") {
    merged.amount = Math.abs(merged.amount);
  }
  // transfer keeps original sign

  return merged;
};

/**
 * Income Transaction Factory
 * Creates an income transaction
 */
export const createIncomeTransaction = (overrides?: Partial<Transaction>): Transaction => {
  const amount =
    overrides?.amount !== undefined ? Math.abs(overrides.amount) : generateAmount(100, 2000);

  return createTransaction({
    type: "income",
    amount: amount,
    category: "income",
    merchant: "Employer",
    ...overrides,
  });
};

/**
 * Transfer Transaction Factory
 * Creates a transfer transaction
 */
export const createTransferTransaction = (overrides?: Partial<Transaction>): Transaction => {
  return createTransaction({
    type: "transfer",
    category: "transfer",
    merchant: "Internal Transfer",
    ...overrides,
  });
};

/**
 * Transaction Partial Factory
 * Creates a partial transaction for update operations
 */
export const createTransactionPartial = (overrides?: TransactionPartial): TransactionPartial => {
  return overrides || { description: "Updated Transaction" };
};

/**
 * Savings Goal Factory
 * Creates a valid SavingsGoal entity with sensible defaults
 */
export const createSavingsGoal = (overrides?: Partial<SavingsGoal>): SavingsGoal => {
  const targetAmount = generateAmount(1000, 10000);
  const currentAmount = Math.floor(targetAmount * (Math.random() * 0.7)); // 0-70% complete

  const defaults: SavingsGoal = {
    id: generateId(),
    name: `Goal ${generateId().substring(0, 8)}`,
    category: pickRandom(["vacation", "emergency", "purchase", "education", "home"]),
    priority: pickRandom(["low", "medium", "high"]),
    targetAmount,
    currentAmount,
    targetDate: generateFutureDate(180),
    isPaused: false,
    isCompleted: false,
    lastModified: generateTimestamp(),
    createdAt: generateTimestamp(),
    description: "Test savings goal description",
    monthlyContribution: Math.floor(targetAmount / 12),
  };

  return mergeDefaults(defaults, overrides);
};

/**
 * Completed Savings Goal Factory
 * Creates a completed savings goal
 */
export const createCompletedSavingsGoal = (overrides?: Partial<SavingsGoal>): SavingsGoal => {
  const targetAmount = generateAmount(1000, 5000);
  return createSavingsGoal({
    currentAmount: targetAmount,
    targetAmount,
    isCompleted: true,
    ...overrides,
  });
};

/**
 * Savings Goal Partial Factory
 * Creates a partial savings goal for update operations
 */
export const createSavingsGoalPartial = (overrides?: SavingsGoalPartial): SavingsGoalPartial => {
  return overrides || { name: "Updated Goal" };
};

/**
 * Batch Envelope Factory
 * Creates an array of envelopes
 */
export const createEnvelopes = (count: number, overrides?: Partial<Envelope>): Envelope[] => {
  return Array.from({ length: count }, () => createEnvelope(overrides));
};

/**
 * Batch Bill Factory
 * Creates an array of bills
 */
export const createBills = (count: number, overrides?: Partial<Bill>): Bill[] => {
  return Array.from({ length: count }, () => createBill(overrides));
};

/**
 * Batch Transaction Factory
 * Creates an array of transactions
 */
export const createTransactions = (
  count: number,
  overrides?: Partial<Transaction>
): Transaction[] => {
  return Array.from({ length: count }, () => createTransaction(overrides));
};

/**
 * Batch Savings Goal Factory
 * Creates an array of savings goals
 */
export const createSavingsGoals = (
  count: number,
  overrides?: Partial<SavingsGoal>
): SavingsGoal[] => {
  return Array.from({ length: count }, () => createSavingsGoal(overrides));
};
