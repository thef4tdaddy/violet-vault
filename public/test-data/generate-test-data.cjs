#!/usr/bin/env node

/**
 * Generate comprehensive test data for Violet Vault
 * Creates 100+ transactions over 6 months with proper connections
 * Connections: Debt → Bill → Envelope → Transactions
 */

const fs = require("fs");
const path = require("path");

const envelopeColorPalette = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#6366f1",
  "#ef4444",
  "#22c55e",
  "#9333ea",
];

// Load base data
const baseData = require("./violet-vault-test-budget.json");

// Helper to generate timestamps
// Uses current date so test data is always recent when generated
const getTimestamp = (daysAgo) => {
  const now = new Date(); // Always uses current date when script runs
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.getTime();
};

const getDateString = (daysAgo) => {
  const now = new Date(); // Always uses current date when script runs
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

const formatMonthLabel = (dateString) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

// Merchant lists for realistic transactions
const merchants = {
  groceries: ["Kroger", "Whole Foods", "Trader Joes", "Costco", "Walmart", "Aldi", "Safeway"],
  gas: ["Shell", "Chevron", "BP", "Exxon", "76 Gas", "Arco", "Circle K"],
  entertainment: [
    "AMC Theaters",
    "Netflix",
    "Spotify",
    "Steam",
    "PlayStation Store",
    "Regal Cinemas",
    "Amazon Prime",
  ],
  restaurants: [
    "Chipotle",
    "Olive Garden",
    "Starbucks",
    "McDonalds",
    "Panera Bread",
    "Subway",
    "Taco Bell",
  ],
  healthcare: ["Walgreens", "CVS Pharmacy", "Rite Aid", "Urgent Care Clinic", "Dr. Smith Office"],
  petcare: ["PetSmart", "Petco", "Chewy.com", "VCA Animal Hospital"],
  personal: ["Great Clips", "Target", "Ulta Beauty", "Sephora"],
  gifts: ["Amazon", "Target", "Best Buy", "Etsy", "Hallmark"],
  shopping: ["Amazon", "Target", "Best Buy", "HomeDepot", "Lowes", "IKEA"],
};

const ENVELOPE_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#10b981", // emerald
  "#14b8a6", // teal
  "#0ea5e9", // sky
  "#6366f1", // indigo
  "#ec4899", // pink
  "#22d3ee", // cyan
  "#64748b", // slate
  "#fb7185", // rose
  "#facc15", // yellow
];

// Add 4 debt payment envelopes
const debtEnvelopes = [
  {
    id: "env-debt-001-cc",
    name: "Credit Card Payment",
    category: "Debt Payment",
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 85.0,
    targetAmount: 85.0,
    description: "Chase Freedom Credit Card monthly payment",
    billId: "bill-debt-001-cc",
    debtId: "debt-001-credit-card",
    color: "#ef4444",
    metadata: {
      preserveBalance: true,
      lender: "Chase Bank",
    },
  },
  {
    id: "env-debt-002-student",
    name: "Student Loan Payment",
    category: "Debt Payment",
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 150.0,
    targetAmount: 150.0,
    description: "Federal Student Loan monthly payment",
    billId: "bill-debt-002-student",
    debtId: "debt-002-student-loan",
    color: "#0ea5e9",
    metadata: {
      preserveBalance: true,
      lender: "US Department of Education",
    },
  },
  {
    id: "env-debt-003-auto",
    name: "Auto Loan Payment",
    category: "Debt Payment",
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 285.0,
    targetAmount: 285.0,
    description: "Honda Civic auto loan monthly payment",
    billId: "bill-debt-003-auto",
    debtId: "debt-003-car-loan",
    color: "#10b981",
    metadata: {
      preserveBalance: true,
      lender: "Ally Financial",
    },
  },
  {
    id: "env-debt-004-personal",
    name: "Personal Loan Payment",
    category: "Debt Payment",
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 125.0,
    targetAmount: 125.0,
    description: "LendingClub personal loan monthly payment",
    billId: "bill-debt-004-personal",
    debtId: "debt-004-personal-loan",
    color: "#f59e0b",
    metadata: {
      preserveBalance: true,
      lender: "LendingClub",
    },
  },
];

const serviceEnvelopes = [
  {
    id: "env-011-connectivity",
    name: "Internet & Streaming",
    category: "Bills & Utilities",
    archived: false,
    lastModified: getTimestamp(45),
    createdAt: getTimestamp(220),
    currentBalance: 135.5,
    targetAmount: 140,
    monthlyAmount: 140,
    description: "Home internet, Wi-Fi, and streaming bundles",
    color: "#4c1d95",
    metadata: {
      icon: "Wifi",
      preserveBalance: true,
    },
  },
  {
    id: "env-012-mobile-plan",
    name: "Mobile Service",
    category: "Bills & Utilities",
    archived: false,
    lastModified: getTimestamp(30),
    createdAt: getTimestamp(220),
    currentBalance: 98.75,
    targetAmount: 110,
    monthlyAmount: 110,
    description: "Family mobile data and device protection plan",
    color: "#4338ca",
    metadata: {
      icon: "Smartphone",
      preserveBalance: true,
    },
  },
  {
    id: "env-013-insurance",
    name: "Insurance Premiums",
    category: "Insurance",
    archived: false,
    lastModified: getTimestamp(12),
    createdAt: getTimestamp(260),
    currentBalance: 285.0,
    targetAmount: 300,
    monthlyAmount: 300,
    description: "Auto, renters, and umbrella insurance premiums",
    color: "#2563eb",
    metadata: {
      icon: "Shield",
      preserveBalance: true,
    },
  },
  {
    id: "env-014-home-services",
    name: "Home & Security",
    category: "Home",
    archived: false,
    lastModified: getTimestamp(20),
    createdAt: getTimestamp(210),
    currentBalance: 170.0,
    targetAmount: 185,
    monthlyAmount: 185,
    description: "Home security, pest control, and maintenance plans",
    color: "#0f766e",
    metadata: {
      icon: "Home",
      preserveBalance: true,
    },
  },
  {
    id: "env-015-childcare",
    name: "Childcare & Activities",
    category: "Family",
    archived: false,
    lastModified: getTimestamp(10),
    createdAt: getTimestamp(210),
    currentBalance: 210.0,
    targetAmount: 250,
    monthlyAmount: 250,
    description: "After-school programs, daycare, and lessons",
    color: "#dc2626",
    metadata: {
      icon: "Users",
      preserveBalance: true,
    },
  },
];

// Add 4 debt payment bills with current due dates
// NOTE: getDateString with negative offset means FUTURE dates (e.g., -3 = 3 days from now)
const debtBills = [
  {
    id: "bill-debt-001-cc",
    name: "Credit Card Payment",
    dueDate: getDateString(-3), // Due in 3 days (DUE SOON)
    amount: 85.0,
    category: "Debt Payment",
    isPaid: false,
    isRecurring: true,
    frequency: "monthly",
    envelopeId: "env-debt-001-cc",
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: "Chase Freedom minimum payment",
    paymentMethod: "Auto-pay",
    debtId: "debt-001-credit-card",
  },
  {
    id: "bill-debt-002-student",
    name: "Student Loan Payment",
    dueDate: getDateString(-5), // Due in 5 days (DUE SOON)
    amount: 150.0,
    category: "Debt Payment",
    isPaid: false,
    isRecurring: true,
    frequency: "monthly",
    envelopeId: "env-debt-002-student",
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: "Federal Student Loan monthly payment",
    paymentMethod: "Auto-pay",
    debtId: "debt-002-student-loan",
  },
  {
    id: "bill-debt-003-auto",
    name: "Auto Loan Payment",
    dueDate: getDateString(-15), // Due in 15 days
    amount: 285.0,
    category: "Debt Payment",
    isPaid: false,
    isRecurring: true,
    frequency: "monthly",
    envelopeId: "env-debt-003-auto",
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: "Honda Civic monthly payment",
    paymentMethod: "Auto-pay",
    debtId: "debt-003-car-loan",
  },
  {
    id: "bill-debt-004-personal",
    name: "Personal Loan Payment",
    dueDate: getDateString(-20), // Due in 20 days
    amount: 125.0,
    category: "Debt Payment",
    isPaid: false,
    isRecurring: true,
    frequency: "monthly",
    envelopeId: "env-debt-004-personal",
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: "LendingClub monthly payment",
    paymentMethod: "Bank Transfer",
    debtId: "debt-004-personal-loan",
  },
];

// Update debts to include envelopeId and current dates
const enhancedDebts = baseData.debts.map((debt, index) => {
  const debtEnvMap = {
    "debt-001-credit-card": "env-debt-001-cc",
    "debt-002-student-loan": "env-debt-002-student",
    "debt-003-car-loan": "env-debt-003-auto",
    "debt-004-personal-loan": "env-debt-004-personal",
  };

  // Spread due dates: some due soon (2-7 days), some later (15-25 days)
  const daysUntilDue = index < 2 ? index * 2 + 3 : index * 5 + 15; // [3, 5, 15, 20 days]
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  const nextPaymentDate = new Date(dueDate);

  return {
    ...debt,
    envelopeId: debtEnvMap[debt.id],
    dueDate: dueDate.toISOString().split("T")[0],
    nextPaymentDate: nextPaymentDate.toISOString().split("T")[0],
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365), // Created a year ago
  };
});

// Helper to properly format transaction amount based on type
const formatTransactionAmount = (amount, type) => {
  const numAmount = parseFloat(amount);
  // Expenses should be negative, income should be positive
  return type === "expense" ? -Math.abs(numAmount) : Math.abs(numAmount);
};

// Generate 100+ transactions over 6 months (Aug 2024 - Jan 2025)
const generateTransactions = () => {
  const transactions = [];
  let txnCounter = 13; // Continue from existing txn-012

  // Generate transactions for each month going back 6 months
  for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
    const daysInMonth = 30;
    const startDay = monthsAgo * daysInMonth;

    // Groceries - 2-3x per week (8-12 per month)
    for (let week = 0; week < 4; week++) {
      const count = Math.floor(Math.random() * 2) + 2; // 2-3 per week
      for (let i = 0; i < count; i++) {
        const daysAgo = startDay + week * 7 + Math.floor(Math.random() * 7);
        const amount = (Math.random() * 100 + 30).toFixed(2);
        transactions.push({
          id: `txn-${String(txnCounter++).padStart(3, "0")}`,
          date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, "expense"),
          envelopeId: "env-001-groceries",
          category: "Food & Dining",
          type: "expense",
          lastModified: getTimestamp(daysAgo),
          createdAt: getTimestamp(daysAgo),
          description: "Grocery shopping",
          merchant: merchants.groceries[Math.floor(Math.random() * merchants.groceries.length)],
        });
      }
    }

    // Gas - 1-2x per week (4-8 per month)
    for (let week = 0; week < 4; week++) {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 per week
      for (let i = 0; i < count; i++) {
        const daysAgo = startDay + week * 7 + Math.floor(Math.random() * 7);
        const amount = (Math.random() * 30 + 30).toFixed(2);
        transactions.push({
          id: `txn-${String(txnCounter++).padStart(3, "0")}`,
          date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, "expense"),
          envelopeId: "env-002-gas",
          category: "Transportation",
          type: "expense",
          lastModified: getTimestamp(daysAgo),
          createdAt: getTimestamp(daysAgo),
          description: "Gas fill-up",
          merchant: merchants.gas[Math.floor(Math.random() * merchants.gas.length)],
        });
      }
    }

    // Restaurants/Dining - 1-2x per week (4-8 per month)
    for (let week = 0; week < 4; week++) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const daysAgo = startDay + week * 7 + Math.floor(Math.random() * 7);
        const amount = (Math.random() * 40 + 10).toFixed(2);
        transactions.push({
          id: `txn-${String(txnCounter++).padStart(3, "0")}`,
          date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, "expense"),
          envelopeId: "env-001-groceries",
          category: "Food & Dining",
          type: "expense",
          lastModified: getTimestamp(daysAgo),
          createdAt: getTimestamp(daysAgo),
          description: "Dining out",
          merchant: merchants.restaurants[Math.floor(Math.random() * merchants.restaurants.length)],
        });
      }
    }

    // Entertainment - 2-3x per month
    const entertainmentCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < entertainmentCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 50 + 10).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, "0")}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, "expense"),
        envelopeId: "env-005-entertainment",
        category: "Entertainment",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: "Entertainment",
        merchant:
          merchants.entertainment[Math.floor(Math.random() * merchants.entertainment.length)],
      });
    }

    // Healthcare - 1-2x per month
    const healthcareCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < healthcareCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 100 + 15).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, "0")}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, "expense"),
        envelopeId: "env-006-healthcare",
        category: "Health & Medical",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: "Medical expense",
        merchant: merchants.healthcare[Math.floor(Math.random() * merchants.healthcare.length)],
      });
    }

    // Pet Care - 2-3x per month
    const petCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < petCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 60 + 20).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, "0")}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, "expense"),
        envelopeId: "env-007-pet-care",
        category: "Pets",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: "Pet supplies",
        merchant: merchants.petcare[Math.floor(Math.random() * merchants.petcare.length)],
      });
    }

    // Personal Care - 2x per month
    for (let i = 0; i < 2; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 40 + 15).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, "0")}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, "expense"),
        envelopeId: "env-009-personal-care",
        category: "Personal Care",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: "Personal care",
        merchant: merchants.personal[Math.floor(Math.random() * merchants.personal.length)],
      });
    }

    // Shopping/Gifts - 1-2x per month
    const giftCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < giftCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 80 + 20).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, "0")}`,
        date: getDateString(daysAgo),
        amount: parseFloat(amount),
        envelopeId: "env-010-gifts",
        category: "Gifts & Donations",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: "Gift purchase",
        merchant: merchants.gifts[Math.floor(Math.random() * merchants.gifts.length)],
      });
    }

    // Debt payments - once per month for each debt
    const debtPaymentDay = 15 + Math.floor(Math.random() * 5);

    // Credit card payment
    const creditPaymentDate = getDateString(startDay + debtPaymentDay);
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, "0")}`,
      date: creditPaymentDate,
      amount: 85.0,
      envelopeId: "env-debt-001-cc",
      category: "Debt Payment",
      type: "bill",
      lastModified: getTimestamp(startDay + debtPaymentDay),
      createdAt: getTimestamp(startDay + debtPaymentDay),
      description: `Chase Freedom Payment • ${formatMonthLabel(creditPaymentDate)}`,
      billId: "bill-debt-001-cc",
      merchant: "Chase Bank",
    });

    // Student loan payment
    const studentPaymentDate = getDateString(startDay + debtPaymentDay - 5);
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, "0")}`,
      date: studentPaymentDate,
      amount: 150.0,
      envelopeId: "env-debt-002-student",
      category: "Debt Payment",
      type: "bill",
      lastModified: getTimestamp(startDay + debtPaymentDay - 5),
      createdAt: getTimestamp(startDay + debtPaymentDay - 5),
      description: `Federal Student Loan Payment • ${formatMonthLabel(studentPaymentDate)}`,
      billId: "bill-debt-002-student",
      merchant: "Dept of Education",
    });

    // Auto loan payment
    const autoPaymentDate = getDateString(startDay + debtPaymentDay + 5);
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, "0")}`,
      date: autoPaymentDate,
      amount: 285.0,
      envelopeId: "env-debt-003-auto",
      category: "Debt Payment",
      type: "bill",
      lastModified: getTimestamp(startDay + debtPaymentDay + 5),
      createdAt: getTimestamp(startDay + debtPaymentDay + 5),
      description: `Auto Loan Payment • ${formatMonthLabel(autoPaymentDate)}`,
      billId: "bill-debt-003-auto",
      merchant: "Ally Financial",
    });

    // Personal loan payment
    const personalPaymentDate = getDateString(startDay + debtPaymentDay + 10);
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, "0")}`,
      date: personalPaymentDate,
      amount: 125.0,
      envelopeId: "env-debt-004-personal",
      category: "Debt Payment",
      type: "bill",
      lastModified: getTimestamp(startDay + debtPaymentDay + 10),
      createdAt: getTimestamp(startDay + debtPaymentDay + 10),
      description: `Personal Loan Payment • ${formatMonthLabel(personalPaymentDate)}`,
      billId: "bill-debt-004-personal",
      merchant: "LendingClub",
    });

    // Income - 2x per month (biweekly paychecks)
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, "0")}`,
      date: getDateString(startDay + 3),
      amount: 2500.0,
      envelopeId: "env-008-emergency",
      category: "Income",
      type: "income",
      lastModified: getTimestamp(startDay + 3),
      createdAt: getTimestamp(startDay + 3),
      description: "Biweekly paycheck",
      merchant: "Acme Corporation",
    });

    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, "0")}`,
      date: getDateString(startDay + 17),
      amount: 2500.0,
      envelopeId: "env-008-emergency",
      category: "Income",
      type: "income",
      lastModified: getTimestamp(startDay + 17),
      createdAt: getTimestamp(startDay + 17),
      description: "Biweekly paycheck",
      merchant: "Acme Corporation",
    });
  }

  return transactions;
};

const createRecurringBillCandidates = () => {
  const providers = [
    {
      merchant: "Brightstream Broadband",
      descriptionBase: "Brightstream Broadband Invoice",
      amount: 79.99,
      startDaysAgo: 12,
      intervalDays: 31,
      occurrences: 5,
    },
    {
      merchant: "Evergreen Water Services",
      descriptionBase: "Evergreen Water Statement",
      amount: 42.5,
      startDaysAgo: 18,
      intervalDays: 30,
      occurrences: 4,
    },
    {
      merchant: "Metro City Waste Mgmt",
      descriptionBase: "Metro City Waste Mgmt Billing",
      amount: 33.25,
      startDaysAgo: 20,
      intervalDays: 31,
      occurrences: 4,
    },
  ];

  const transactions = [];

  providers.forEach((provider, providerIndex) => {
    for (let i = 0; i < provider.occurrences; i++) {
      const daysAgo = provider.startDaysAgo + i * provider.intervalDays;

      transactions.push({
        id: `txn-recurring-${providerIndex + 1}-${i + 1}`,
        date: getDateString(daysAgo),
        amount: -Math.abs(provider.amount),
        envelopeId: "",
        category: "",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: `${provider.descriptionBase} #${String(i + 1).padStart(2, "0")}`,
        merchant: provider.merchant,
        metadata: {
          discoveryCandidate: true,
        },
      });
    }
  });

  return transactions;
};

const createUncategorizedTransactionClusters = () => {
  const clusters = [
    {
      merchant: "Starbucks Coffee",
      descriptionBase: "Starbucks Coffee Store",
      startDaysAgo: 4,
      amounts: [-12.45, -9.8, -11.25, -13.1, -10.9, -12.05],
    },
    {
      merchant: "Amazon Marketplace",
      descriptionBase: "Amazon Marketplace Order",
      startDaysAgo: 7,
      amounts: [-64.55, -52.35, -71.8, -58.25, -67.4],
    },
    {
      merchant: "Fresh Harvest Grocers",
      descriptionBase: "Fresh Harvest Grocers",
      startDaysAgo: 9,
      amounts: [-48.9, -52.1, -45.75, -50.05, -47.8],
    },
  ];

  const transactions = [];

  clusters.forEach((cluster, clusterIndex) => {
    cluster.amounts.forEach((amount, idx) => {
      const daysAgo = cluster.startDaysAgo + idx * 6 + clusterIndex;

      transactions.push({
        id: `txn-uncat-${clusterIndex + 1}-${idx + 1}`,
        date: getDateString(daysAgo),
        amount: -Math.abs(amount),
        envelopeId: "",
        category: "",
        type: "expense",
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: `${cluster.descriptionBase} ${100 + clusterIndex * 10 + idx}`,
        merchant: cluster.merchant,
        metadata: {
          uncategorizedCluster: true,
        },
      });
    });
  });

  return transactions;
};

// Update base transactions to have recent dates (last 30 days) and correct amounts
const updateBaseTransactions = () => {
  return baseData.transactions.map((txn, index) => {
    const daysAgo = Math.floor(Math.random() * 30) + 1; // Random day in last 30 days
    return {
      ...txn,
      date: getDateString(daysAgo),
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      // Ensure expenses are negative
      amount: txn.type === "expense" ? -Math.abs(txn.amount) : Math.abs(txn.amount),
    };
  });
};

// Update base bills to have current/upcoming due dates
const updateBaseBills = () => {
  const curatedBillTemplates = [
    {
      id: "bill-housing-rent",
      name: "Maple Street Apartments",
      provider: "Maple Street Properties",
      category: "Housing",
      amount: 1650,
      envelopeId: "env-003-rent",
      dueInDays: 3,
      frequency: "monthly",
      autopay: true,
      description: "Monthly rent for Unit 3B at Maple Street Apartments",
      supportPhone: "(555) 739-1120",
      accountNumber: "APT-3B-2025",
    },
    {
      id: "bill-utilities-electric",
      name: "Northwind Electric Service",
      provider: "Northwind Power & Light",
      category: "Utilities",
      amount: 96.42,
      envelopeId: "env-004-utilities",
      dueInDays: 6,
      frequency: "monthly",
      autopay: true,
      description: "Residential electric service - 15% renewable mix",
      supportPhone: "(555) 118-4420",
      accountNumber: "ELEC-54821-09",
    },
    {
      id: "bill-utilities-water",
      name: "Evergreen Water & Sewer",
      provider: "Evergreen Municipal Utilities",
      category: "Utilities",
      amount: 58.37,
      envelopeId: "env-004-utilities",
      dueInDays: 12,
      frequency: "monthly",
      autopay: false,
      description: "Water, sewer, and storm services",
      supportPhone: "(555) 664-7721",
      accountNumber: "H2O-090-334",
    },
    {
      id: "bill-connectivity-internet",
      name: "Brightstream Fiber 1G",
      provider: "Brightstream Communications",
      category: "Bills & Utilities",
      amount: 84.99,
      envelopeId: "env-011-connectivity",
      dueInDays: 2,
      frequency: "monthly",
      autopay: true,
      description: "Gigabit fiber internet with WholeHome Wi-Fi",
      supportPhone: "(555) 220-8888",
      accountNumber: "BST-801-112-AX",
    },
    {
      id: "bill-mobile-family-plan",
      name: "Nimbus Mobile Unlimited",
      provider: "Nimbus Wireless",
      category: "Bills & Utilities",
      amount: 128.15,
      envelopeId: "env-012-mobile-plan",
      dueInDays: 9,
      frequency: "monthly",
      autopay: true,
      description: "Family mobile plan with four lines and device protection",
      supportPhone: "(555) 403-4450",
      accountNumber: "MBL-44810-55",
    },
    {
      id: "bill-insurance-auto",
      name: "ShieldSure Auto Insurance",
      provider: "ShieldSure Insurance Group",
      category: "Insurance",
      amount: 212.6,
      envelopeId: "env-013-insurance",
      dueInDays: 18,
      frequency: "monthly",
      autopay: false,
      description: "Auto insurance premium for two vehicles",
      supportPhone: "(555) 900-2212",
      accountNumber: "AUTO-INS-8810",
    },
    {
      id: "bill-subscription-streaming",
      name: "Cinematic+ Annual Bundle",
      provider: "Cinematic Media Group",
      category: "Entertainment",
      amount: 139.99,
      envelopeId: "env-011-connectivity",
      dueInDays: -2,
      frequency: "annual",
      autopay: true,
      description: "Annual streaming bundle with sports and originals",
      supportPhone: "(555) 660-1250",
      accountNumber: "STRM-2025-338",
      isPaid: true,
      paidDateOffset: 1,
    },
    {
      id: "bill-home-security",
      name: "Sentinel Home Security",
      provider: "Sentinel Secure",
      category: "Home",
      amount: 54.5,
      envelopeId: "env-014-home-services",
      dueInDays: 25,
      frequency: "monthly",
      autopay: false,
      description: "Smart home monitoring and equipment lease",
      supportPhone: "(555) 784-9900",
      accountNumber: "SEC-7765-20",
    },
    {
      id: "bill-childcare-activities",
      name: "Little Explorers Learning",
      provider: "Little Explorers Academy",
      category: "Family",
      amount: 235.0,
      envelopeId: "env-015-childcare",
      dueInDays: 4,
      frequency: "biweekly",
      autopay: false,
      description: "After-school program and enrichment classes",
      supportPhone: "(555) 415-7830",
      accountNumber: "LEA-204-119",
    },
    {
      id: "bill-health-gym",
      name: "PulseFit Athletic Club",
      provider: "PulseFit Wellness Group",
      category: "Health & Fitness",
      amount: 49.99,
      envelopeId: "env-006-healthcare",
      dueInDays: 11,
      frequency: "monthly",
      autopay: true,
      description: "Full access gym membership with group training add-on",
      supportPhone: "(555) 302-4422",
      accountNumber: "GYM-8843-21",
    },
    {
      id: "bill-pet-insurance",
      name: "HappyPaws Wellness Plan",
      provider: "HappyPaws Veterinary Network",
      category: "Pet Care",
      amount: 37.5,
      envelopeId: "env-007-pet-care",
      dueInDays: 7,
      frequency: "monthly",
      autopay: true,
      description: "Preventative care plan and accident coverage for two pets",
      supportPhone: "(555) 901-7744",
      accountNumber: "PET-INS-2051",
    },
    {
      id: "bill-education-platform",
      name: "BrightMinds Learning Portal",
      provider: "BrightMinds Education Inc.",
      category: "Education",
      amount: 68.5,
      envelopeId: "env-015-childcare",
      dueInDays: 14,
      frequency: "monthly",
      autopay: false,
      description: "Online tutoring and enrichment subscription for two students",
      supportPhone: "(555) 782-1123",
      accountNumber: "EDU-6754-88",
    },
  ];

  return curatedBillTemplates.map((bill, index) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + bill.dueInDays);

    const statementDate = new Date(dueDate);
    statementDate.setDate(statementDate.getDate() - 20);

    const lastPaidDate =
      typeof bill.paidDateOffset === "number"
        ? getDateString(bill.paidDateOffset)
        : getDateString(35);

    return {
      id: bill.id || `bill-curated-${index + 1}`,
      name: bill.name,
      provider: bill.provider,
      amount: Number(bill.amount.toFixed(2)),
      category: bill.category,
      dueDate: dueDate.toISOString().split("T")[0],
      createdAt: getTimestamp(120),
      lastModified: getTimestamp(0),
      envelopeId: bill.envelopeId,
      frequency: bill.frequency || "monthly",
      paymentMethod: bill.autopay ? "Auto-pay" : "Manual",
      isRecurring: true,
      isPaid: Boolean(bill.isPaid),
      paidDate: bill.isPaid ? lastPaidDate : null,
      lastStatementDate: statementDate.toISOString().split("T")[0],
      autopay: bill.autopay,
      description: bill.description,
      contactPhone: bill.supportPhone,
      accountNumber: bill.accountNumber,
      metadata: {
        serviceWindow: bill.serviceWindow || "08:00 - 18:00",
        website: bill.website || null,
        notes: bill.notes || "",
        preserveBalance: true,
      },
    };
  });
};

// Update envelopes to have recent timestamps and proper amounts
const updateBaseEnvelopes = () => {
  const healthOverrides = {
    "env-001-groceries": {
      monthlyAmount: 750,
      currentBalance: 110,
      spendingHistory: [{ amount: 220 }, { amount: 205 }, { amount: 198 }],
    },
    "env-002-gas": {
      monthlyAmount: 220,
      currentBalance: 35,
      spendingHistory: [{ amount: 70 }, { amount: 65 }, { amount: 60 }],
    },
    "env-003-rent": {
      monthlyAmount: 1600,
      currentBalance: 1650,
      spendingHistory: [{ amount: 1600 }],
    },
    "env-004-utilities": {
      monthlyAmount: 260,
      currentBalance: 140,
      spendingHistory: [{ amount: 95 }, { amount: 120 }],
    },
    "env-005-entertainment": {
      monthlyAmount: 180,
      currentBalance: 20,
      spendingHistory: [{ amount: 90 }, { amount: 85 }],
    },
    "env-008-emergency": {
      monthlyAmount: 500,
      currentBalance: 2600,
      spendingHistory: [{ amount: 0 }],
    },
  };

  let colorIndex = 0;

  return baseData.envelopes.map((env) => {
    const override = healthOverrides[env.id] || {};
    const assignedColor =
      env.color || envelopeColorPalette[colorIndex % envelopeColorPalette.length];
    colorIndex += 1;

    return {
      ...env,
      lastModified: getTimestamp(0),
      createdAt: getTimestamp(180),
      currentBalance: env.currentBalance ?? override.currentBalance ?? 0,
      targetAmount: env.targetAmount || env.currentBalance || 100,
      monthlyAmount: override.monthlyAmount ?? env.monthlyAmount ?? env.targetAmount ?? 0,
      color: assignedColor,
      spendingHistory: override.spendingHistory || env.spendingHistory || [],
    };
  });
};

// Update savings goals to have current amounts and recent dates
const updateBaseSavingsGoals = () => {
  return baseData.savingsGoals.map((goal) => {
    const currentAmount = goal.currentAmount || 0;
    const targetAmount = goal.targetAmount || 1000;

    return {
      ...goal,
      currentAmount,
      targetAmount,
      lastModified: getTimestamp(0),
      createdAt: getTimestamp(180),
      targetDate:
        goal.targetDate ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
  });
};

// Update paycheck history to match component interface and have recent dates
// Generate realistic biweekly paycheck pattern (most recent at top)
const updateBasePaycheckHistory = () => {
  // Generate 6 recent paychecks on a biweekly schedule
  const paychecks = [];

  for (let i = 0; i < 6; i++) {
    const daysAgo = i * 14; // Biweekly = every 14 days
    const paycheckDate = getDateString(daysAgo);
    const totalAllocated = 2100; // Realistic allocation amount
    const amount = 2500;

    paychecks.push({
      id: `paycheck-${String(i + 1).padStart(3, "0")}`,
      payerName: "Acme Corporation",
      processedAt: paycheckDate,
      processedBy: "System",
      allocationMode: "allocate",
      amount: amount,
      totalAllocated: totalAllocated,
      remainingAmount: amount - totalAllocated,
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      allocations: [
        { envelopeId: "env-003-rent", envelopeName: "Rent", amount: 750 },
        { envelopeId: "env-004-utilities", envelopeName: "Utilities", amount: 125 },
        { envelopeId: "env-001-groceries", envelopeName: "Groceries", amount: 300 },
        { envelopeId: "env-002-gas", envelopeName: "Gas/Transportation", amount: 150 },
        { envelopeId: "env-008-emergency", envelopeName: "Emergency Fund", amount: 250 },
        { envelopeId: "env-005-entertainment", envelopeName: "Entertainment", amount: 100 },
        { envelopeId: "env-006-healthcare", envelopeName: "Health & Medical", amount: 100 },
        { envelopeId: "env-007-pet-care", envelopeName: "Pet Care", amount: 75 },
        { envelopeId: "env-009-personal-care", envelopeName: "Personal Care", amount: 50 },
        { envelopeId: "env-010-gifts", envelopeName: "Gifts & Donations", amount: 75 },
        { envelopeId: "env-debt-001-cc", envelopeName: "Credit Card Payment", amount: 85 },
        { envelopeId: "env-debt-002-student", envelopeName: "Student Loan Payment", amount: 40 },
      ],
    });
  }

  return paychecks;
};

// Build enhanced data with updated dates
const newTransactions = generateTransactions();
const updatedBaseTransactions = updateBaseTransactions();
const updatedBaseBills = updateBaseBills();
const updatedBaseEnvelopes = updateBaseEnvelopes();
const updatedBaseSavingsGoals = updateBaseSavingsGoals();
const updatedBasePaycheckHistory = updateBasePaycheckHistory();
const recurringBillTransactions = createRecurringBillCandidates();
const uncategorizedClusterTransactions = createUncategorizedTransactionClusters();

const updateSupplementalAccounts = () => {
  const templates = [
    [
      { daysAgo: 5, amount: -85.5, merchant: "Walgreens Pharmacy" },
      { daysAgo: 12, amount: -45.25, merchant: "CVS Minute Clinic" },
      { daysAgo: 18, amount: -120.0, merchant: "Urgent Care Copay" },
      { daysAgo: 26, amount: 200.0, merchant: "Employer Contribution" },
      { daysAgo: 34, amount: -68.75, merchant: "Specialist Visit" },
    ],
    [
      { daysAgo: 3, amount: -60.0, merchant: "Transit Pass" },
      { daysAgo: 8, amount: -32.5, merchant: "City Parking Garage" },
      { daysAgo: 16, amount: -45.0, merchant: "Commute Shuttle" },
      { daysAgo: 24, amount: 150.0, merchant: "Employer Contribution" },
      { daysAgo: 29, amount: -25.0, merchant: "Metro Card Reload" },
    ],
    [
      { daysAgo: 7, amount: -95.0, merchant: "Dental Cleaning" },
      { daysAgo: 14, amount: -40.0, merchant: "Optometrist Visit" },
      { daysAgo: 21, amount: -130.0, merchant: "Therapy Session" },
      { daysAgo: 28, amount: 250.0, merchant: "Employer Contribution" },
      { daysAgo: 36, amount: -55.0, merchant: "Lab Tests" },
    ],
  ];

  return baseData.supplementalAccounts.map((account, index) => {
    const sample = templates[index % templates.length];
    const transactions = sample.map((entry, idx) => ({
      id: `${account.id}-txn-${idx + 1}`,
      date: getDateString(entry.daysAgo),
      amount: parseFloat(entry.amount.toFixed(2)),
      merchant: entry.merchant,
      description: entry.merchant,
      type: entry.amount >= 0 ? "contribution" : "spending",
      lastModified: getTimestamp(entry.daysAgo),
      createdAt: getTimestamp(entry.daysAgo),
    }));

    return {
      ...account,
      transactions,
    };
  });
};

const allEnvelopes = [...updatedBaseEnvelopes, ...serviceEnvelopes, ...debtEnvelopes];
const allBills = [...updatedBaseBills, ...debtBills];
const allTransactions = [
  ...updatedBaseTransactions,
  ...newTransactions,
  ...recurringBillTransactions,
  ...uncategorizedClusterTransactions,
];
const updatedSupplementalAccounts = updateSupplementalAccounts();

const buildAllTransactions = () => {
  const billPayments = allBills
    .filter((b) => b.isPaid)
    .map((bill) => ({
      id: `${bill.id}-payment`,
      date: bill.dueDate,
      amount: -Math.abs(bill.amount),
      envelopeId: bill.envelopeId,
      category: bill.category,
      type: "bill",
      lastModified: bill.lastModified,
      createdAt: bill.createdAt,
      description: bill.name,
      billId: bill.id,
      merchant: bill.paymentMethod || "Payment",
    }));

  return [...allTransactions, ...billPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

const buildEnvelopeSpendingHistory = (transactions) => {
  const monthMap = {};

  transactions.forEach((txn) => {
    if (!txn || !txn.envelopeId || typeof txn.amount !== "number" || txn.amount >= 0) {
      return;
    }

    const monthKey = new Date(txn.date).toISOString().slice(0, 7);
    if (!monthMap[txn.envelopeId]) {
      monthMap[txn.envelopeId] = {};
    }

    monthMap[txn.envelopeId][monthKey] =
      (monthMap[txn.envelopeId][monthKey] || 0) + Math.abs(Number(txn.amount));
  });

  return Object.entries(monthMap).reduce((acc, [envelopeId, monthlyTotals]) => {
    acc[envelopeId] = Object.entries(monthlyTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, amount]) => ({ month, amount: Number(amount.toFixed(2)) }));
    return acc;
  }, {});
};

const generateFallbackHistory = (monthlyAmount) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toISOString().slice(0, 7),
      amount: Number((monthlyAmount * (0.65 + Math.random() * 0.45)).toFixed(2)),
    });
  }
  return months;
};

const envelopeSpendingHistory = buildEnvelopeSpendingHistory(allTransactions);

const enhanceEnvelopesForAnalytics = (envelopes) => {
  return envelopes.map((env, index) => {
    const paletteColor = ENVELOPE_COLORS[index % ENVELOPE_COLORS.length];
    const baseMonthlyAmount =
      typeof env.monthlyAmount === "number" && Number.isFinite(env.monthlyAmount)
        ? env.monthlyAmount
        : env.targetAmount || 250;
    const history = envelopeSpendingHistory[env.id]?.length
      ? envelopeSpendingHistory[env.id]
      : generateFallbackHistory(baseMonthlyAmount);

    const hasExplicitBalance =
      typeof env.currentBalance === "number" && Number.isFinite(env.currentBalance);
    const preserveBalance =
      (env.metadata && env.metadata.preserveBalance === true) || hasExplicitBalance;

    let adjustedBalance = hasExplicitBalance ? env.currentBalance : baseMonthlyAmount * 0.9;

    if (!preserveBalance) {
      switch (index % 4) {
        case 0:
          adjustedBalance = baseMonthlyAmount * 0.25;
          break;
        case 1:
          adjustedBalance = baseMonthlyAmount * 1.45;
          break;
        case 2:
          adjustedBalance = baseMonthlyAmount * 0.6;
          break;
        default:
          adjustedBalance = baseMonthlyAmount * (0.85 + Math.random() * 0.1);
      }
    }

    return {
      ...env,
      color: env.color || paletteColor,
      monthlyAmount: Number(baseMonthlyAmount.toFixed(2)),
      currentBalance: Number((adjustedBalance ?? 0).toFixed(2)),
      spendingHistory: history,
      metadata: {
        ...(env.metadata || {}),
        analytics: {
          paletteIndex: index % ENVELOPE_COLORS.length,
        },
      },
    };
  });
};

const enhancedEnvelopes = enhanceEnvelopesForAnalytics(allEnvelopes);

// Construct final export object
const builtAllTransactions = buildAllTransactions();

const enhancedData = {
  envelopes: enhancedEnvelopes,
  bills: allBills,
  transactions: allTransactions,
  allTransactions: builtAllTransactions,
  savingsGoals: updatedBaseSavingsGoals,
  supplementalAccounts: updatedSupplementalAccounts,
  debts: enhancedDebts,
  paycheckHistory: updatedBasePaycheckHistory,
  auditLog: baseData.auditLog,
  unassignedCash: baseData.unassignedCash,
  biweeklyAllocation: baseData.biweeklyAllocation,
  actualBalance: baseData.actualBalance,
  isActualBalanceManual: baseData.isActualBalanceManual,
  exportMetadata: {
    ...baseData.exportMetadata,
    exportDate: new Date().toISOString(),
    note: "Enhanced test data with 100+ transactions and full entity connections",
  },
  _dataGuide: {
    ...baseData._dataGuide,
    fixtures: {
      recurringBillCandidates: {
        description: "Synthetic recurring merchants used to populate Discover Bills modal",
        merchants: Array.from(new Set(recurringBillTransactions.map((txn) => txn.merchant))),
      },
      uncategorizedClusters: {
        description: "High-volume merchants without categories for smart suggestion testing",
        merchants: Array.from(new Set(uncategorizedClusterTransactions.map((txn) => txn.merchant))),
      },
      envelopeSpendingHistory: {
        description: "Monthly spending snapshots used for health scores and trends",
        sample: enhancedEnvelopes.slice(0, 3).map((env) => ({
          envelope: env.name,
          monthlyAmount: env.monthlyAmount,
          currentBalance: env.currentBalance,
          history: env.spendingHistory,
        })),
      },
    },
    connections: {
      "Debt → Envelope": "debts have envelopeId field",
      "Debt → Bill": "bills have debtId field pointing to debt",
      "Bill → Envelope": "bills have envelopeId field",
      "Envelope → Bill": "envelopes have billId field",
      "Envelope → Debt": "envelopes have debtId field",
      "Transaction → Envelope": "transactions have envelopeId field",
      "Transaction → Bill": "bill payment transactions have billId field",
    },
    stats: {
      envelopes: enhancedEnvelopes.length,
      bills: allBills.length,
      transactions: allTransactions.length,
      allTransactions: builtAllTransactions.length,
      debts: enhancedDebts.length,
      savingsGoals: baseData.savingsGoals.length,
      supplementalAccounts: updatedSupplementalAccounts.length,
      paycheckHistory: baseData.paycheckHistory.length,
    },
  },
};

// Write to file
const outputPath = path.join(__dirname, "violet-vault-test-budget-enhanced.json");
fs.writeFileSync(outputPath, JSON.stringify(enhancedData, null, 2));

console.log("✅ Enhanced test data generated!");
console.log(`📊 Stats:`);
console.log(`   - Envelopes: ${enhancedEnvelopes.length} (added 4 debt payment envelopes)`);
console.log(`   - Bills: ${allBills.length} (added 4 debt payment bills)`);
console.log(
  `   - Transactions: ${allTransactions.length} (generated ${newTransactions.length} base + ${recurringBillTransactions.length} discovery + ${uncategorizedClusterTransactions.length} suggestion samples)`
);
console.log(`   - All Transactions: ${builtAllTransactions.length}`);
console.log(`   - Debts: ${enhancedDebts.length} (updated with envelope connections)`);
console.log(`\n📁 Saved to: ${outputPath}`);
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 180);

console.log(`\n🔗 Connections:`);
console.log(`   - Each debt is connected to a dedicated envelope`);
console.log(`   - Each debt has a recurring bill for monthly payments`);
console.log(`   - Debt payment bills are connected to debt payment envelopes`);
console.log(
  `   - Transactions span 6 months (${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]})`
);
console.log(`   - Multiple pages of transactions for testing pagination`);
console.log(`   - Data generated on: ${endDate.toISOString()}`);

const sanitizeOfxText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>]/g, "")
    .replace(/&/g, "and")
    .trim();
};

const formatOfxDate = (dateString) => {
  if (!dateString) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, "") + "000000";
  }
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}000000`;
};

const buildOfxContent = (transactions) => {
  const header = [
    "OFXHEADER:100",
    "DATA:OFXSGML",
    "VERSION:102",
    "SECURITY:NONE",
    "ENCODING:USASCII",
    "CHARSET:1252",
    "COMPRESSION:NONE",
    "OLDFILEUID:NONE",
    "NEWFILEUID:NONE",
    "",
    "<OFX>",
    "  <SIGNONMSGSRSV1>",
    "    <SONRS>",
    "      <STATUS>",
    "        <CODE>0",
    "        <SEVERITY>INFO",
    "      </STATUS>",
    `      <DTSERVER>${formatOfxDate(new Date().toISOString())}`,
    "      <LANGUAGE>ENG",
    "      <FI>",
    "        <ORG>VIOLETVAULT",
    "        <FID>999999999",
    "      </FI>",
    "    </SONRS>",
    "  </SIGNONMSGSRSV1>",
    "  <BANKMSGSRSV1>",
    "    <STMTTRNRS>",
    "      <TRNUID>1",
    "      <STATUS>",
    "        <CODE>0",
    "        <SEVERITY>INFO",
    "      </STATUS>",
    "      <STMTRS>",
    "        <CURDEF>USD",
    "        <BANKACCTFROM>",
    "          <BANKID>999999999",
    "          <ACCTID>VVTEST001",
    "          <ACCTTYPE>CHECKING",
    "        </BANKACCTFROM>",
    "        <BANKTRANLIST>",
  ];

  const footer = [
    "        </BANKTRANLIST>",
    "        <LEDGERBAL>",
    "          <BALAMT>0.00",
    `          <DTASOF>${formatOfxDate(new Date().toISOString())}`,
    "        </LEDGERBAL>",
    "      </STMTRS>",
    "    </STMTTRNRS>",
    "  </BANKMSGSRSV1>",
    "</OFX>",
    "",
  ];

  const stmtTransactions = transactions.map((txn, index) => {
    const amount = Number(txn.amount || 0);
    const trnType = amount >= 0 ? "CREDIT" : "DEBIT";
    const postedDate = formatOfxDate(txn.date || txn.createdAt);
    const fitId = sanitizeOfxText(txn.id || `VV-${index + 1}`);
    const description =
      sanitizeOfxText(txn.description || txn.merchant || txn.category || "Transaction") ||
      `Transaction ${index + 1}`;
    const memo = sanitizeOfxText(
      txn.envelopeId
        ? `${txn.envelopeId}${txn.billId ? ` • ${txn.billId}` : ""}`
        : txn.metadata?.note || txn.notes || ""
    );

    return [
      "          <STMTTRN>",
      `            <TRNTYPE>${trnType}`,
      `            <DTPOSTED>${postedDate}`,
      `            <TRNAMT>${amount.toFixed(2)}`,
      `            <FITID>${fitId}`,
      `            <NAME>${description}`,
      memo ? `            <MEMO>${memo}` : "",
      "          </STMTTRN>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [...header, ...stmtTransactions, ...footer].join("\n");
};

const ofxSampleTransactions = builtAllTransactions
  .filter((txn) => txn && typeof txn.amount === "number" && txn.date)
  .slice(0, 120);

const ofxOutputPath = path.join(__dirname, "violet-vault-transactions-sample.ofx");
fs.writeFileSync(ofxOutputPath, buildOfxContent(ofxSampleTransactions), "utf8");

const RECENT_TRANSACTION_TEMPLATES = [
  {
    envelopeId: "env-001-groceries",
    category: "Food & Dining",
    merchants: ["Whole Foods Market", "Kroger", "Trader Joes", "Walmart Neighborhood Market"],
    description: "Grocery run",
    amountRange: [35, 95],
  },
  {
    envelopeId: "env-002-gas",
    category: "Transportation",
    merchants: ["Shell", "Chevron", "BP", "Costco Fuel", "76 Gas"],
    description: "Fuel refill",
    amountRange: [28, 78],
  },
  {
    envelopeId: "env-001-groceries",
    category: "Food & Dining",
    merchants: ["Chipotle", "Five Guys", "Taco Bell", "Chick-fil-A", "Shake Shack"],
    description: "Fast food stop",
    amountRange: [12, 24],
  },
];

const generateRecentTransactions = (count = 10) => {
  const today = new Date();
  const transactions = [];

  for (let i = 0; i < count; i += 1) {
    const template = RECENT_TRANSACTION_TEMPLATES[i % RECENT_TRANSACTION_TEMPLATES.length];
    const variation = Math.floor(i / RECENT_TRANSACTION_TEMPLATES.length);
    const merchant =
      template.merchants[(i * 2 + variation) % template.merchants.length] || template.merchants[0];

    const transactionDate = new Date(today);
    transactionDate.setDate(today.getDate() - (i % 5));

    const amountMin = template.amountRange[0];
    const amountMax = template.amountRange[1];
    const fraction = (variation % 4) / 3;
    const rawAmount = amountMin + fraction * (amountMax - amountMin);
    const amount = -Math.round(rawAmount * 100) / 100;

    const timestamp = transactionDate.getTime();

    transactions.push({
      id: `txn-recent-${String(i + 1).padStart(3, "0")}`,
      date: transactionDate.toISOString().split("T")[0],
      amount,
      envelopeId: template.envelopeId,
      category: template.category,
      type: "expense",
      lastModified: timestamp,
      createdAt: timestamp,
      description: template.description,
      merchant,
    });
  }

  return transactions;
};

const recentTransactions = generateRecentTransactions(10);

const recentJsonPath = path.join(__dirname, "violet-vault-transactions-recent.json");
fs.writeFileSync(
  recentJsonPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      transactions: recentTransactions,
    },
    null,
    2
  )
);

const recentOfxPath = path.join(__dirname, "violet-vault-transactions-recent.ofx");
fs.writeFileSync(recentOfxPath, buildOfxContent(recentTransactions), "utf8");

console.log(`   - OFX Sample: ${ofxSampleTransactions.length} transactions saved to ${ofxOutputPath}`);
console.log(
  `   - Recent Transactions: ${recentTransactions.length} saved to ${recentJsonPath} and ${recentOfxPath}`
);
