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
import type { BudgetCommit, BudgetChange } from "@/domain/schemas";

/**
 * Standard Budget Envelopes
 * Common budget categories for testing
 */
export const standardEnvelopes: Envelope[] = [
  createEnvelope({
    name: "Groceries",
    category: "groceries",
    currentBalance: 125,
    targetAmount: 500,
    monthlyBudget: 500,
    autoAllocate: true,
  } as unknown as Envelope),
  createEnvelope({
    name: "Gas",
    category: "transportation",
    currentBalance: 45,
    targetAmount: 200,
    monthlyBudget: 200,
    autoAllocate: true,
  } as unknown as Envelope),
  createEnvelope({
    name: "Bi-weekly Bills",
    category: "utilities",
    type: "liability",
    currentBalance: 200,
    biweeklyAllocation: 150,
    autoAllocate: true,
  } as unknown as Envelope),
  createEnvelope({
    name: "Entertainment",
    category: "entertainment",
    currentBalance: 30,
    targetAmount: 150,
    monthlyBudget: 150,
  } as unknown as Envelope),
  createEnvelope({
    name: "Credit Card Debt",
    category: "debt",
    type: "liability",
    currentBalance: 2450,
    minimumPayment: 85,
    interestRate: 18.99,
  } as unknown as Envelope),
  createEnvelope({
    name: "Healthcare",
    category: "healthcare",
    currentBalance: 150,
    targetAmount: 200,
  }),
  createEnvelope({
    name: "Rent",
    category: "housing",
    type: "liability",
    currentBalance: 0,
    targetAmount: 1200,
    monthlyBudget: 1200,
    autoAllocate: true,
  } as unknown as Envelope),
];

/**
 * Standard Bills
 * Common recurring bills for testing
 */
export const standardBills: Bill[] = [
  createRecurringBill({
    description: "Electric Bill",
    amount: 150,
    category: "utilities",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
  }),
  createRecurringBill({
    description: "Internet",
    amount: 79.99,
    category: "utilities",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue by 2 days
  }),
  createRecurringBill({
    description: "Netflix",
    amount: 15.99,
    category: "subscriptions",
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due in 15 days
  }),
  createBill({
    description: "Car Insurance",
    amount: 125,
    category: "insurance",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Due in 10 days
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
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  }),
  createTransaction({
    description: "Grocery Shopping",
    amount: 87.42,
    category: "groceries",
    merchant: "Walmart",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  }),
  createTransaction({
    description: "Weekly Groceries",
    amount: 42.15,
    category: "groceries",
    merchant: "Trader Joe's",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  }),
  createTransaction({
    description: "Gas Station",
    amount: 45.0,
    category: "transportation",
    merchant: "Shell",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }),
  createTransaction({
    description: "Movie Tickets",
    amount: 28.5,
    category: "entertainment",
    merchant: "AMC Theaters",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  }),
  createTransaction({
    description: "Coffee Shop",
    amount: 5.5,
    category: "dining",
    merchant: "Starbucks",
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
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
 * Sample Budget History
 * Commits and changes for testing history views
 */
export const sampleBudgetCommits: BudgetCommit[] = [
  {
    hash: "commit-1",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    message: "Monthly budget adjustment",
    author: "Test User",
    deviceFingerprint: "browser-test-1",
  },
  {
    hash: "commit-2",
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    message: "New groceries envelope created",
    author: "Test User",
  },
];

export const sampleBudgetChanges: BudgetChange[] = [
  {
    commitHash: "commit-1",
    entityType: "envelope",
    entityId: standardEnvelopes[0].id,
    changeType: "update",
    description: "Increased target amount",
    oldValue: { targetAmount: 400 },
    newValue: { targetAmount: 500 },
  },
  {
    commitHash: "commit-2",
    entityType: "envelope",
    entityId: "new-env-123",
    changeType: "create",
    description: "Initial creation",
  },
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
  commits: sampleBudgetCommits,
  changes: sampleBudgetChanges,
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
      createBill({ description: `Bill ${i + 1}` })
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
    createEnvelope({
      name: "Excessive Groceries",
      category: "groceries",
      currentBalance: -50,
      monthlyBudget: 200, // Negative balance implies overspending
    }),
    createEnvelope({
      name: "Impulse Dining",
      category: "dining",
      currentBalance: -120,
      monthlyBudget: 50, // Negative balance implies overspending
    }),
  ],
  bills: [
    createBill({
      description: "Overdue Bill",
      date: new Date("2023-01-01"),
    }),
    createBill({ description: "Upcoming Bill" }),
  ],
  transactions: sampleTransactions,
  savingsGoals: [],
  unassignedCash: -100,
};

/**
 * Budget Scenario: Smart Suggestions
 * Many unassigned transactions for a specific merchant
 */
export const smartSuggestionScenario = {
  envelopes: standardEnvelopes,
  bills: standardBills,
  transactions: [
    ...sampleTransactions,
    ...Array.from({ length: 5 }, (_, i) =>
      createTransaction({
        description: `Amazon Purchase ${i + 1}`,
        merchant: "Amazon.com",
        envelopeId: "unassigned",
        amount: 45.99,
        category: "Shopping",
        date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
      })
    ),
  ],
  savingsGoals: sampleSavingsGoals,
  unassignedCash: 1000,
};
