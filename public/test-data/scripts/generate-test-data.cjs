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
  budgetCommits: [],
  budgetChanges: [],
  budget: [],
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

// Helper to generate OFX content
const generateOFX = (transactions) => {
  const header = `OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\nSECURITY:NONE\nENCODING:USASCII\nCHARSET:1252\nCOMPRESSION:NONE\nOLDFILEUID:NONE\nNEWFILEUID:NONE\n\n<OFX>\n<SIGNONMSGSRSV1>\n<SONRS>\n<STATUS>\n<CODE>0\n<SEVERITY>INFO\n</STATUS>\n<DTSERVER>${new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(
      0,
      14
    )}\n<LANGUAGE>ENG\n</SONRS>\n</SIGNONMSGSRSV1>\n<BANKMSGSRSV1>\n<STMTTRNRS>\n<TRNUID>1\n<STATUS>\n<CODE>0\n<SEVERITY>INFO\n</STATUS>\n<STMTRS>\n<CURDEF>USD\n<BANKACCTFROM>\n<BANKID>123456789\n<ACCTID>987654321\n<ACCTTYPE>CHECKING\n</BANKACCTFROM>\n<BANKTRANLIST>\n<DTSTART>${getDateString(30).replace(/-/g, "")}000000\n<DTEND>${getDateString(0).replace(/-/g, "")}000000\n`;

  const txnItems = transactions
    .map((t) => {
      const dateStr = t.date.replace(/-/g, "") + "120000";
      return `<STMTTRN>\n<TRNTYPE>${t.amount < 0 ? "DEBIT" : "CREDIT"}\n<DTPOSTED>${dateStr}\n<TRNAMT>${t.amount}\n<FITID>${t.id}\n<NAME>${t.merchant || t.description}\n<MEMO>${t.description}\n</STMTTRN>\n`;
    })
    .join("");

  const footer = `</BANKTRANLIST>\n<LEDGERBAL>\n<BALAMT>5000.00\n<DTASOF>${getDateString(0).replace(/-/g, "")}000000\n</LEDGERBAL>\n</STMTRS>\n</STMTTRNRS>\n</BANKMSGSRSV1>\n</OFX>`;

  return header + txnItems + footer;
};

/**
 * v2.0 DATA DEFINITION
 */

/**
 * BUDGET METADATA
 */
const budgetMetadata = [];
budgetMetadata.push({
  id: "metadata",
  unassignedCash: 1250.5,
  actualBalance: 15750.5,
  lastModified: Date.now(),
});

const envelopes = [];
const transactions = [];
const budgetCommits = [];
const budgetChanges = [];

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
  {
    id: "env-rent",
    name: "Rent",
    category: "Housing",
    targetAmount: 1800,
    color: "#3b82f6",
    type: "liability",
  },
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

coreEnvelopes.forEach((env, idx) => {
  let variance = 0.8;
  if (idx === 0) variance = 1.2; // Over budget groceries
  if (idx === 4) variance = 0.1; // Mostly empty fun money

  const currentBalance = Math.floor(Math.random() * env.targetAmount * variance);

  envelopes.push({
    ...env,
    type: env.type || "standard",
    archived: false,
    autoAllocate: true,
    currentBalance,
    monthlyBudget: env.targetAmount, // Add monthlyBudget for calculations
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365),
    description: `Standard ${env.name} envelope`,
  });
});

// NEW: Over-budget scenario for UI testing
envelopes.push({
  id: "env-over-budget",
  name: "Excessive Spending",
  category: "Shopping",
  type: "standard",
  archived: false,
  autoAllocate: true,
  currentBalance: 50,
  monthlyBudget: 100, // 50% utilization (realistic)
  color: "#ef4444",
  description: "Envelope with unrealistic percentage (> 100%)",
  lastModified: getTimestamp(0),
  createdAt: getTimestamp(10),
});

// NEW: Bi-weekly need with 0 bills due
envelopes.push({
  id: "env-biweekly-need-demo",
  name: "Biweekly Savings",
  category: "Savings",
  type: "standard",
  archived: false,
  autoAllocate: true,
  currentBalance: 250,
  biweeklyAllocation: 125, // Has biweekly need
  monthlyBudget: 270,
  color: "#8b5cf6",
  description: "Has biweekly need but 0 bills due",
  lastModified: getTimestamp(0),
  createdAt: getTimestamp(30),
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
    expiry: "2026-12-31", // Fixed: Future expiration for 2026
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
    type: "liability",
    balance: 2450,
    minPayment: 85,
    rate: 18.99,
    due: 15,
  },
  {
    id: "debt-student",
    name: "Great Lakes Loan",
    type: "liability",
    balance: 12500,
    minPayment: 150,
    rate: 4.5,
    due: 1,
  },
  {
    id: "debt-auto",
    name: "Ally Car Loan",
    type: "liability",
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
    type: "liability", // Use strict liability for debt
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

// NEW: Flexible envelopes (Stacked behavior)
envelopes.push({
  id: "env-flexible-demo",
  name: "Flexible Spending",
  category: "Other",
  type: "standard",
  archived: false,
  autoAllocate: true,
  currentBalance: 85,
  targetAmount: 200,
  monthlyBudget: 200,
  color: "#f43f5e",
  description: "Flexible envelope for testing amount stacking",
  lastModified: getTimestamp(0),
  createdAt: getTimestamp(5),
});

// 5. Bills -> bill type envelopes
const bills = [
  {
    id: "bill-netflix",
    name: "Netflix",
    amount: 19.99,
    due: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "bill-internet",
    name: "Comcast Xfinity",
    amount: 89.99,
    due: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "bill-electric",
    name: "General Electric",
    amount: 125.5,
    due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "bill-water",
    name: "City Water",
    amount: 45.0,
    due: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }, // Upcoming
  {
    id: "bill-trash",
    name: "Waste Management",
    amount: 30.0,
    due: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }, // Upcoming
  {
    id: "bill-insurance",
    name: "Geico Insurance",
    amount: 120.0,
    due: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }, // Overdue
];

bills.forEach((bill) => {
  envelopes.push({
    id: bill.id,
    name: bill.name,
    category: "Bills & Utilities",
    type: "bill",
    archived: false,
    autoAllocate: true, // NEW: Enabled for viable demo
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
  groceries: [
    "Whole Foods",
    "Trader Joes",
    "Costco",
    "Kroger",
    "Aldi",
    "Publix",
    "Safeway",
    "H-E-B",
    "Wegmans",
    "Lidl",
  ],
  gas: [
    "Shell",
    "Chevron",
    "BP",
    "Exxon",
    "7-Eleven",
    "Arco",
    "Circle K",
    "Valero",
    "Wawa",
    "QuikTrip",
  ],
  entertainment: [
    "Netflix",
    "Spotify",
    "Steam",
    "AMC Theaters",
    "Disney+",
    "Hulu",
    "Apple",
    "Nintendo",
    "PlayStation",
    "Xbox",
    "Audible",
  ],
  restaurants: [
    "Starbucks",
    "Chipotle",
    "McDonalds",
    "Subway",
    "Sweetgreen",
    "Shake Shack",
    "Olive Garden",
    "Panera Bread",
    "Taco Bell",
    "Chick-fil-A",
  ],
  shopping: [
    "Amazon",
    "Target",
    "Walmart",
    "Best Buy",
    "Home Depot",
    "Lowes",
    "TJ Maxx",
    "Marshalls",
  ],
  utilities: ["Verizon", "AT&T", "T-Mobile", "Comcast", "Spectrum", "ConEd", "PG&E", "Duke Energy"],
};

let txnIdCount = 1000;

// Generate 6 months of historical data
for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
  const monthStart = monthsAgo * 30;

  // 25 Random Expenses per month (increased for more variety)
  for (let i = 0; i < 25; i++) {
    const daysAgo = monthStart + Math.floor(Math.random() * 28);
    const categoryType = i % 5;

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
    } else if (categoryType === 4) {
      envId = "env-utilities";
      category = "Shopping";
      merchantList = merchants.shopping;
      desc = "Retail Purchase";
      amount = (Math.random() * 150 + 10).toFixed(2);
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
    const merchantList = ["Rent Management", "General Electric", "Comcast Xfinity"];
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
      description: `Monthly payment: ${merchantList[idx]}`,
      merchant: merchantList[idx],
    });
  });

  // Paycheck History (Populating history)
  [3, 17].forEach((dayOffset) => {
    const daysAgo = monthStart + dayOffset;
    const net = 2500;

    transactions.push({
      id: `txn-pay-${txnIdCount++}`,
      date: getDateString(daysAgo),
      amount: net,
      envelopeId: "unassigned",
      category: "Income",
      type: "income",
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      description: "Biweekly Paycheck",
      merchant: "Acme Corp",
      allocations: {
        "env-rent": 900,
        "env-groceries": 300,
        "env-gas": 150,
      },
    });
  });

  // NEW: Transaction data to trigger Smart Suggestions
  // Lots of Amazon spending without a dedicated Amazon envelope
  if (monthsAgo < 3) {
    for (let j = 0; j < 5; j++) {
      const daysAgo = monthStart + Math.floor(Math.random() * 25);
      transactions.push({
        id: `txn-suggest-${txnIdCount++}`,
        date: getDateString(daysAgo),
        amount: -(Math.random() * 50 + 20).toFixed(2),
        envelopeId: "unassigned", // Not assigned to any envelope
        category: "Shopping",
        type: "expense",
        merchant: "Amazon.com",
        description: "Unassigned Amazon Spending",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
      });
    }
  }
}

// Add some very recent transactions for more "active" feel
[0, 1, 2].forEach((daysAgo) => {
  transactions.push({
    id: `txn-recent-${daysAgo}`,
    date: getDateString(daysAgo),
    amount: -(Math.random() * 25 + 5).toFixed(2),
    envelopeId: "env-groceries",
    category: "Food & Dining",
    type: "expense",
    lastModified: getTimestamp(daysAgo),
    createdAt: getTimestamp(daysAgo),
    description: "Recent Coffee/Snack",
    merchant: merchants.restaurants[Math.floor(Math.random() * merchants.restaurants.length)],
  });
});

// NEW: Add Supplemental Spending for "Last 30 Days" check
// This ensures FSA/HSA cards don't show $0 spending
const supplementalSpending = [
  { envId: "sa-fsa", merchant: "CVS Pharmacy", amount: 45.5, desc: "Prescription Refill" },
  { envId: "sa-hsa", merchant: "City Hospital", amount: 150.0, desc: "Doctor's Visit" },
  { envId: "sa-fsa", merchant: "Walgreens", amount: 22.99, desc: "First Aid Kit" },
];

supplementalSpending.forEach((item, idx) => {
  const daysAgo = Math.floor(Math.random() * 25); // Recent spend
  transactions.push({
    id: `txn-supplemental-${idx}`,
    date: getDateString(daysAgo),
    amount: -item.amount,
    envelopeId: item.envId,
    category: "Health",
    type: "expense",
    lastModified: getTimestamp(daysAgo),
    createdAt: getTimestamp(daysAgo),
    description: item.desc,
    merchant: item.merchant,
  });
});

/**
 * HISTORY GENERATION (Version Control)
 */

const coreEnvIds = ["env-groceries", "env-rent", "env-utilities"];
coreEnvIds.forEach((envId, idx) => {
  const hash = `hash-${idx}-${Date.now()}`;
  budgetCommits.push({
    hash: hash,
    timestamp: getTimestamp(idx + 1),
    message: `Updated budget for ${envId}`,
    author: "Test User",
    changes: idx === 0 ? { currentBalance: 150 } : {},
  });

  budgetChanges.push({
    commitHash: hash,
    entityType: "envelope",
    entityId: envId,
    changeType: "update",
    description: `Manual adjustment of ${envId}`,
    oldValue: { currentBalance: 100 },
    newValue: { currentBalance: 150 },
  });
});

// Sort transactions by date descending
transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

// SPLIT DATA:
// 1. Most recent 20 transactions -> OFX file (for import testing)
// 2. The rest -> Budget JSON (as historical data)
// This ensures the transactions in the OFX are NEW/DIFFERENT from what's in the backup.
const importTxns = transactions.slice(0, 20);
const budgetTxns = transactions.slice(20);

/**
 * ASSEMBLY & OUTPUT
 */

const outputV2 = {
  budget: budgetMetadata,
  envelopes,
  transactions: budgetTxns, // Only historical transactions in backup
  budgetCommits,
  budgetChanges,
  // Meta fields expected by the app
  exportMetadata: {
    appVersion: "2.0.0-beta.1",
    budgetId: "violet-vault-viable-v2",
    exportDate: new Date().toISOString(),
    isV2Schema: true,
    description: "Complete v2.0 Unified Test Data (Envelopes + Transactions + History)",
  },
};

const outputPathList = [
  path.join(__dirname, "../data/violet-vault-budget.json"),
  path.join(__dirname, "../data/violet-vault-transactions.ofx"),
];

// 1. Main Budget Backup (Historical Data)
fs.writeFileSync(outputPathList[0], JSON.stringify(outputV2, null, 2));

// 2. Importable Transactions (New Data not in backup)
const ofxContent = generateOFX(importTxns);
fs.writeFileSync(outputPathList[1], ofxContent);

console.log(`\n🌌 Violet Vault v2.0 "Viable" Data Generated!`);
console.log(`   - Envelopes: ${envelopes.length}`);
console.log(`   - Backup Transactions: ${budgetTxns.length} (Historical data)`);
console.log(`   - Importable Transactions: ${importTxns.length} (New data in OFX)`);
console.log(`   - Schema Level: v2.0.0 (Unified Model)`);
console.log(`   - Output Budget: ${outputPathList[0]}`);
console.log(`   - Output OFX: ${outputPathList[1]}\n`);
