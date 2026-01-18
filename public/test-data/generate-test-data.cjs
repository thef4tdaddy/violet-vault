#!/usr/bin/env node

/**
 * Generate Unified v2.0 Test Data for Violet Vault
 * Migrates legacy data formats to the Unified Model (Envelopes & Transactions)
 *
 * DESIGN PRINCIPLES:
 * 1. Unified Model: Everything is an Envelope or a Transaction.
 * 2. Viable Data: Realistic merchants, amounts, and connections.
 * 3. Future-Proof: Includes v2.0 specific fields like allocations and scheduled flags.
 */

const fs = require("fs");
const path = require("path");

// Load base static data if it exists, otherwise use a minimal base
let baseData = {
  envelopes: [],
  transactions: [],
  savingsGoals: [],
  supplementalAccounts: [],
  debts: [],
};
try {
  baseData = require("./violet-vault-test-budget.json");
} catch (e) {
  console.warn("Base violet-vault-test-budget.json not found, starting fresh.");
}

// Helper to generate timestamps
const getTimestamp = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.getTime();
};

const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

/**
 * v2.0 DATA DEFINITION
 */

const envelopes = [];
const transactions = [];

// 1. Core Budget Envelopes
const coreEnvelopes = [
  {
    id: "env-groceries",
    name: "Groceries",
    category: "Food & Dining",
    targetAmount: 600,
    color: "#10b981",
  },
  {
    id: "env-gas",
    name: "Gas & Fuel",
    category: "Transportation",
    targetAmount: 300,
    color: "#f59e0b",
  },
  { id: "env-rent", name: "Rent", category: "Housing", targetAmount: 1800, color: "#3b82f6" },
  {
    id: "env-utilities",
    name: "Utilities",
    category: "Bills & Utilities",
    targetAmount: 250,
    color: "#6366f1",
  },
  {
    id: "env-entertainment",
    name: "Fun Money",
    category: "Entertainment",
    targetAmount: 200,
    color: "#ec4899",
  },
  {
    id: "env-emergency",
    name: "Emergency Fund",
    category: "Emergency",
    targetAmount: 10000,
    color: "#f43f5e",
  },
];

coreEnvelopes.forEach((env) => {
  envelopes.push({
    ...env,
    type: "standard",
    archived: false,
    currentBalance: Math.floor(Math.random() * env.targetAmount * 0.8),
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365),
    description: `Standard ${env.name} envelope`,
  });
});

// 2. Savings Goals -> goal envelopes
const savingsGoals = [
  {
    id: "goal-wedding",
    name: "Summer Wedding",
    targetAmount: 15000,
    current: 4500,
    date: "2026-08-15",
    priority: "high",
  },
  {
    id: "goal-tesla",
    name: "Tesla Model 3",
    targetAmount: 45000,
    current: 8000,
    date: "2027-12-01",
    priority: "medium",
  },
  {
    id: "goal-europe",
    name: "Euro Trip 2026",
    targetAmount: 5000,
    current: 1200,
    date: "2026-06-01",
    priority: "low",
  },
];

savingsGoals.forEach((goal) => {
  envelopes.push({
    id: goal.id,
    name: goal.name,
    category: "Savings",
    type: "goal",
    archived: false,
    currentBalance: goal.current,
    targetAmount: goal.targetAmount,
    targetDate: goal.date,
    priority: goal.priority,
    isPaused: false,
    isCompleted: false,
    monthlyContribution: Math.floor(goal.targetAmount / 24),
    color: "#8b5cf6",
    description: `Saving for ${goal.name}`,
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
  });
});

// 3. Supplemental Accounts -> supplemental envelopes
const supplementalAccounts = [
  { id: "sa-hsa", name: "HSA Savings", type: "HSA", balance: 3450, contribution: 3850 },
  {
    id: "sa-fsa",
    name: "FSA (Use it/Lose it)",
    type: "FSA",
    balance: 850,
    contribution: 3050,
    expiry: "2025-12-31",
  },
];

supplementalAccounts.forEach((sa) => {
  envelopes.push({
    id: sa.id,
    name: sa.name,
    category: "Supplemental",
    type: "supplemental",
    accountType: sa.type,
    archived: false,
    currentBalance: sa.balance,
    annualContribution: sa.contribution,
    expirationDate: sa.expiry || null,
    isActive: true,
    color: "#0d9488",
    description: sa.name,
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365),
  });
});

// 4. Debts/Liabilities -> liability envelopes
const liabilities = [
  {
    id: "debt-chase",
    name: "Chase Freedom",
    type: "credit_card",
    balance: 2450,
    minPayment: 85,
    rate: 18.99,
    due: 15,
  },
  {
    id: "debt-student",
    name: "Great Lakes Loan",
    type: "student",
    balance: 12500,
    minPayment: 150,
    rate: 4.5,
    due: 1,
  },
  {
    id: "debt-auto",
    name: "Ally Car Loan",
    type: "auto",
    balance: 18400,
    minPayment: 425,
    rate: 5.2,
    due: 22,
  },
];

liabilities.forEach((debt) => {
  envelopes.push({
    id: debt.id,
    name: debt.name,
    category: "Debt",
    type: debt.type,
    status: "active",
    archived: false,
    currentBalance: debt.balance,
    interestRate: debt.rate,
    minimumPayment: debt.minPayment,
    dueDate: debt.due,
    creditor: debt.name.split(" ")[0],
    color: "#475569",
    description: debt.name,
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365),
  });
});

// 5. Bills -> bill type envelopes
const bills = [
  { id: "bill-netflix", name: "Netflix", amount: 19.99, due: 15 },
  { id: "bill-internet", name: "Comcast Xfinity", amount: 89.99, due: 10 },
  { id: "bill-electric", name: "General Electric", amount: 125.5, due: 5 },
];

bills.forEach((bill) => {
  envelopes.push({
    id: bill.id,
    name: bill.name,
    category: "Bills & Utilities",
    type: "bill",
    archived: false,
    currentBalance: 0,
    targetAmount: bill.amount,
    dueDate: bill.due,
    isPaid: false,
    isRecurring: true,
    frequency: "monthly",
    color: "#475569",
    description: `${bill.name} monthly bill`,
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365),
  });
});

/**
 * TRANSACTION GENERATION
 */

const merchants = {
  groceries: ["Whole Foods", "Trader Joes", "Costco", "Kroger", "Aldi", "Publix", "Safeway"],
  gas: ["Shell", "Chevron", "BP", "Exxon", "7-Eleven", "Arco", "Circle K"],
  entertainment: [
    "Netflix",
    "Spotify",
    "Steam",
    "AMC Theaters",
    "Disney+",
    "Hulu",
    "Apple",
    "Nintendo",
  ],
  restaurants: [
    "Starbucks",
    "Chipotle",
    "McDonalds",
    "Subway",
    "Sweetgreen",
    "Shake Shack",
    "Olive Garden",
  ],
};

let txnIdCount = 1000;

// Generate 6 months of historical data
for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
  const monthStart = monthsAgo * 30;

  // 15 Random Expenses per month
  for (let i = 0; i < 15; i++) {
    const daysAgo = monthStart + Math.floor(Math.random() * 28);
    const categoryType = i % 4;

    let envId = "env-groceries";
    let category = "Food & Dining";
    let merchantList = merchants.groceries;
    let desc = "Grocery shopping";
    let amount = (Math.random() * 80 + 20).toFixed(2);

    if (categoryType === 1) {
      envId = "env-gas";
      category = "Transportation";
      merchantList = merchants.gas;
      desc = "Fuel";
      amount = (Math.random() * 50 + 30).toFixed(2);
    } else if (categoryType === 2) {
      envId = "env-entertainment";
      category = "Entertainment";
      merchantList = merchants.entertainment;
      desc = "Subscription/Entertainment";
      amount = (Math.random() * 30 + 5).toFixed(2);
    } else if (categoryType === 3) {
      envId = "env-groceries";
      category = "Food & Dining";
      merchantList = merchants.restaurants;
      desc = "Dining Out";
      amount = (Math.random() * 40 + 10).toFixed(2);
    }

    transactions.push({
      id: `txn-${txnIdCount++}`,
      date: getDateString(daysAgo),
      amount: -parseFloat(amount),
      envelopeId: envId,
      category: category,
      type: "expense",
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      description: desc,
      merchant: merchantList[Math.floor(Math.random() * merchantList.length)],
    });
  }

  // Monthly Big Payments (Rent, Utilities, Internet)
  [2, 5, 10].forEach((dayOffset, idx) => {
    const daysAgo = monthStart + dayOffset;
    const billsList = ["env-rent", "bill-electric", "bill-internet"];
    const amounts = [1800, 125.5, 89.99];

    transactions.push({
      id: `txn-${txnIdCount++}`,
      date: getDateString(daysAgo),
      amount: -amounts[idx],
      envelopeId: billsList[idx],
      category: idx === 0 ? "Housing" : "Bills & Utilities",
      type: "expense",
      isScheduled: true,
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      description: `Monthly payment: ${billsList[idx]}`,
    });
  });

  // Biweekly Paychecks (The core of "Viable" data)
  [3, 17].forEach((dayOffset) => {
    const daysAgo = monthStart + dayOffset;
    const gross = 3500;
    const net = 2500;

    transactions.push({
      id: `txn-${txnIdCount++}`,
      date: getDateString(daysAgo),
      amount: net,
      envelopeId: "unassigned",
      category: "Income",
      type: "income",
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      description: "Biweekly Paycheck (Net)",
      merchant: "Acme Corp",
      // Detailed v2.0 Allocations
      allocations: {
        "env-rent": 900,
        "env-groceries": 300,
        "env-gas": 150,
        "env-emergency": 500,
        "goal-tesla": 250,
        "debt-chase": 100,
        "goal-wedding": 300,
      },
      unassignedCashBefore: 120,
      unassignedCashAfter: 120, // After allocations, unassigned often remains same or increases
      actualBalanceBefore: 4500,
      actualBalanceAfter: 4500 + net,
    });
  });
}

// Sort transactions by date descending
transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

/**
 * ASSEMBLY & OUTPUT
 */

const outputV2 = {
  envelopes,
  transactions,
  // Meta fields expected by the app
  exportMetadata: {
    appVersion: "2.0.0-beta.1",
    budgetId: "violet-vault-viable-v2",
    exportDate: new Date().toISOString(),
    isV2Schema: true,
    description: "Complete v2.0 Unified Test Data (Envelopes + Transactions + Wealth)",
  },
};

const outputPathList = [
  path.join(__dirname, "violet-vault-test-budget-enhanced.json"),
  path.join(__dirname, "violet-vault-transactions-recent.json"),
];

// Main export file
fs.writeFileSync(outputPathList[0], JSON.stringify(outputV2, null, 2));

// Snippet of recent data
const recentData = {
  generatedAt: new Date().toISOString(),
  transactions: transactions.slice(0, 20),
};
fs.writeFileSync(outputPathList[1], JSON.stringify(recentData, null, 2));

console.log(`\n🌌 Violet Vault v2.0 "Viable" Data Generated!`);
console.log(
  `   - Envelopes: ${envelopes.length} (Standard, Savings Goals, Supplemental, Liabilities, Bills)`
);
console.log(
  `   - Transactions: ${transactions.length} (Income with allocations, Scheduled expenses, History)`
);
console.log(`   - Schema Level: v2.0.0 (Dexie Unified Model)`);
console.log(`   - Output: ${outputPathList[0]}\n`);
