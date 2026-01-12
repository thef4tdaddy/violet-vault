/**
 * Test Fixtures
 * Predefined test data sets for common testing scenarios
 * Part of Phase 3: Test Schema Factories and Fixtures
 */

import type { Envelope, Bill, Transaction, SavingsGoal } from "@/domain/schemas";
import {
  createEnvelope,
  createBill,
  createRecurringBill,
  createTransaction,
  createIncomeTransaction,
  createSavingsGoal,
  createCompletedSavingsGoal,
} from "./domainFactories";

/**
 * Standard Budget Envelopes
 * Common budget categories for testing
 */
export const standardEnvelopes: Envelope[] = [
  createEnvelope({
    name: "Groceries",
    category: "groceries",
    currentBalance: 250,
    targetAmount: 500,
  }),
  createEnvelope({
    name: "Gas",
    category: "transportation",
    currentBalance: 80,
    targetAmount: 200,
  }),
  createEnvelope({
    name: "Entertainment",
    category: "entertainment",
    currentBalance: 50,
    targetAmount: 150,
  }),
  createEnvelope({
    name: "Utilities",
    category: "utilities",
    currentBalance: 100,
    targetAmount: 300,
  }),
  createEnvelope({
    name: "Healthcare",
    category: "healthcare",
    currentBalance: 75,
    targetAmount: 200,
  }),
];

/**
 * Standard Bills
 * Common recurring bills for testing
 */
export const standardBills: Bill[] = [
  createRecurringBill({
    name: "Electric Bill",
    description: "Electric Bill",
    amount: 150,
    category: "utilities",
  }),
  createRecurringBill({
    name: "Internet",
    description: "Internet",
    amount: 79.99,
    category: "utilities",
  }),
  createRecurringBill({
    name: "Netflix",
    description: "Netflix",
    amount: 15.99,
    category: "subscriptions",
  }),
  createBill({
    name: "Car Insurance",
    description: "Car Insurance",
    amount: 125,
    category: "insurance",
    isPaid: true,
  }),
];

/**
 * Sample Transactions
 * Mix of income, expenses, and transfers
 */
export const sampleTransactions: Transaction[] = [
  createIncomeTransaction({
    description: "Monthly Salary",
    amount: 5000,
    merchant: "Employer Inc.",
  }),
  createTransaction({
    description: "Grocery Shopping",
    amount: 87.42,
    category: "groceries",
    merchant: "Walmart",
  }),
  createTransaction({
    description: "Gas Station",
    amount: 45.0,
    category: "transportation",
    merchant: "Shell",
  }),
  createTransaction({
    description: "Movie Tickets",
    amount: 28.5,
    category: "entertainment",
    merchant: "AMC Theaters",
  }),
  createTransaction({
    description: "Restaurant Dinner",
    amount: 65.0,
    category: "dining",
    merchant: "Local Restaurant",
  }),
];

/**
 * Sample Savings Goals
 * Mix of active and completed goals
 */
export const sampleSavingsGoals: SavingsGoal[] = [
  createSavingsGoal({
    name: "Emergency Fund",
    category: "emergency",
    targetAmount: 10000,
    currentAmount: 5000,
    priority: "high",
  }),
  createSavingsGoal({
    name: "Vacation to Hawaii",
    category: "vacation",
    targetAmount: 3000,
    currentAmount: 1200,
    priority: "medium",
  }),
  createSavingsGoal({
    name: "New Laptop",
    category: "purchase",
    targetAmount: 1500,
    currentAmount: 800,
    priority: "low",
  }),
  createCompletedSavingsGoal({
    name: "Completed Goal",
    category: "purchase",
    targetAmount: 500,
    currentAmount: 500,
  }),
];

/**
 * Empty Budget State
 * For testing initial/empty states
 */
export const emptyBudgetState = {
  envelopes: [] as Envelope[],
  bills: [] as Bill[],
  transactions: [] as Transaction[],
  savingsGoals: [] as SavingsGoal[],
  unassignedCash: 0,
};

/**
 * Full Budget State
 * Complete budget with all data types
 */
export const fullBudgetState = {
  envelopes: standardEnvelopes,
  bills: standardBills,
  transactions: sampleTransactions,
  savingsGoals: sampleSavingsGoals,
  unassignedCash: 1250.5,
};

/**
 * Large Dataset for Performance Testing
 * Generates large datasets for testing pagination, virtualization, etc.
 */
export const generateLargeDataset = (size: {
  envelopes?: number;
  bills?: number;
  transactions?: number;
  savingsGoals?: number;
}) => {
  return {
    envelopes: Array.from({ length: size.envelopes || 0 }, (_, i) =>
      createEnvelope({ name: `Envelope ${i + 1}` })
    ),
    bills: Array.from({ length: size.bills || 0 }, (_, i) =>
      createBill({ name: `Bill ${i + 1}`, description: `Bill ${i + 1}` })
    ),
    transactions: Array.from({ length: size.transactions || 0 }, (_, i) =>
      createTransaction({ description: `Transaction ${i + 1}` })
    ),
    savingsGoals: Array.from({ length: size.savingsGoals || 0 }, (_, i) =>
      createSavingsGoal({ name: `Goal ${i + 1}` })
    ),
  };
};

/**
 * Budget Scenario: New User
 * First-time user with minimal data
 */
export const newUserScenario = {
  envelopes: [
    createEnvelope({ name: "Groceries", currentBalance: 0, targetAmount: 400 }),
    createEnvelope({ name: "Gas", currentBalance: 0, targetAmount: 150 }),
  ],
  bills: [],
  transactions: [],
  savingsGoals: [],
  unassignedCash: 0,
};

/**
 * Budget Scenario: Active User
 * User with active budget and recent transactions
 */
export const activeUserScenario = {
  envelopes: standardEnvelopes,
  bills: standardBills,
  transactions: sampleTransactions,
  savingsGoals: sampleSavingsGoals.filter((g) => !g.isCompleted),
  unassignedCash: 850.25,
};

/**
 * Budget Scenario: Over Budget
 * User with negative balances and overdue bills
 */
export const overBudgetScenario = {
  envelopes: [
    createEnvelope({ name: "Groceries", currentBalance: -50, targetAmount: 400 }),
    createEnvelope({ name: "Entertainment", currentBalance: -25, targetAmount: 100 }),
  ],
  bills: [
    createBill({
      name: "Overdue Bill",
      description: "Overdue Bill",
      isPaid: false,
      dueDate: new Date("2023-01-01"),
    }),
    createBill({ name: "Upcoming Bill", description: "Upcoming Bill", isPaid: false }),
  ],
  transactions: sampleTransactions,
  savingsGoals: [],
  unassignedCash: -100,
};
