#!/usr/bin/env node

/**
 * Generate comprehensive test data for Violet Vault
 * Creates 100+ transactions over 6 months with proper connections
 * Connections: Debt → Bill → Envelope → Transactions
 */

const fs = require('fs');
const path = require('path');

// Load base data
const baseData = require('./violet-vault-test-budget.json');

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
  return date.toISOString().split('T')[0];
};

// Merchant lists for realistic transactions
const merchants = {
  groceries: ['Kroger', 'Whole Foods', 'Trader Joes', 'Costco', 'Walmart', 'Aldi', 'Safeway'],
  gas: ['Shell', 'Chevron', 'BP', 'Exxon', '76 Gas', 'Arco', 'Circle K'],
  entertainment: ['AMC Theaters', 'Netflix', 'Spotify', 'Steam', 'PlayStation Store', 'Regal Cinemas', 'Amazon Prime'],
  restaurants: ['Chipotle', 'Olive Garden', 'Starbucks', 'McDonalds', 'Panera Bread', 'Subway', 'Taco Bell'],
  healthcare: ['Walgreens', 'CVS Pharmacy', 'Rite Aid', 'Urgent Care Clinic', 'Dr. Smith Office'],
  petcare: ['PetSmart', 'Petco', 'Chewy.com', 'VCA Animal Hospital'],
  personal: ['Great Clips', 'Target', 'Ulta Beauty', 'Sephora'],
  gifts: ['Amazon', 'Target', 'Best Buy', 'Etsy', 'Hallmark'],
  shopping: ['Amazon', 'Target', 'Best Buy', 'HomeDepot', 'Lowes', 'IKEA']
};

// Add 4 debt payment envelopes
const debtEnvelopes = [
  {
    id: 'env-debt-001-cc',
    name: 'Credit Card Payment',
    category: 'Debt Payment',
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 85.00,
    targetAmount: 85.00,
    description: 'Chase Freedom Credit Card monthly payment',
    billId: 'bill-debt-001-cc',
    debtId: 'debt-001-credit-card'
  },
  {
    id: 'env-debt-002-student',
    name: 'Student Loan Payment',
    category: 'Debt Payment',
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 150.00,
    targetAmount: 150.00,
    description: 'Federal Student Loan monthly payment',
    billId: 'bill-debt-002-student',
    debtId: 'debt-002-student-loan'
  },
  {
    id: 'env-debt-003-auto',
    name: 'Auto Loan Payment',
    category: 'Debt Payment',
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 285.00,
    targetAmount: 285.00,
    description: 'Honda Civic auto loan monthly payment',
    billId: 'bill-debt-003-auto',
    debtId: 'debt-003-car-loan'
  },
  {
    id: 'env-debt-004-personal',
    name: 'Personal Loan Payment',
    category: 'Debt Payment',
    archived: false,
    lastModified: getTimestamp(180),
    createdAt: getTimestamp(180),
    currentBalance: 125.00,
    targetAmount: 125.00,
    description: 'LendingClub personal loan monthly payment',
    billId: 'bill-debt-004-personal',
    debtId: 'debt-004-personal-loan'
  }
];

// Add 4 debt payment bills with current due dates
// NOTE: getDateString with negative offset means FUTURE dates (e.g., -3 = 3 days from now)
const debtBills = [
  {
    id: 'bill-debt-001-cc',
    name: 'Credit Card Payment',
    dueDate: getDateString(-3), // Due in 3 days (DUE SOON)
    amount: 85.00,
    category: 'Debt Payment',
    isPaid: false,
    isRecurring: true,
    frequency: 'monthly',
    envelopeId: 'env-debt-001-cc',
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: 'Chase Freedom minimum payment',
    paymentMethod: 'Auto-pay',
    debtId: 'debt-001-credit-card'
  },
  {
    id: 'bill-debt-002-student',
    name: 'Student Loan Payment',
    dueDate: getDateString(-5), // Due in 5 days (DUE SOON)
    amount: 150.00,
    category: 'Debt Payment',
    isPaid: false,
    isRecurring: true,
    frequency: 'monthly',
    envelopeId: 'env-debt-002-student',
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: 'Federal Student Loan monthly payment',
    paymentMethod: 'Auto-pay',
    debtId: 'debt-002-student-loan'
  },
  {
    id: 'bill-debt-003-auto',
    name: 'Auto Loan Payment',
    dueDate: getDateString(-15), // Due in 15 days
    amount: 285.00,
    category: 'Debt Payment',
    isPaid: false,
    isRecurring: true,
    frequency: 'monthly',
    envelopeId: 'env-debt-003-auto',
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: 'Honda Civic monthly payment',
    paymentMethod: 'Auto-pay',
    debtId: 'debt-003-car-loan'
  },
  {
    id: 'bill-debt-004-personal',
    name: 'Personal Loan Payment',
    dueDate: getDateString(-20), // Due in 20 days
    amount: 125.00,
    category: 'Debt Payment',
    isPaid: false,
    isRecurring: true,
    frequency: 'monthly',
    envelopeId: 'env-debt-004-personal',
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    description: 'LendingClub monthly payment',
    paymentMethod: 'Bank Transfer',
    debtId: 'debt-004-personal-loan'
  }
];

// Update debts to include envelopeId and current dates
const enhancedDebts = baseData.debts.map((debt, index) => {
  const debtEnvMap = {
    'debt-001-credit-card': 'env-debt-001-cc',
    'debt-002-student-loan': 'env-debt-002-student',
    'debt-003-car-loan': 'env-debt-003-auto',
    'debt-004-personal-loan': 'env-debt-004-personal'
  };
  
  // Spread due dates: some due soon (2-7 days), some later (15-25 days)
  const daysUntilDue = index < 2 ? (index * 2) + 3 : (index * 5) + 15; // [3, 5, 15, 20 days]
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);
  
  const nextPaymentDate = new Date(dueDate);
  
  return {
    ...debt,
    envelopeId: debtEnvMap[debt.id],
    dueDate: dueDate.toISOString().split('T')[0],
    nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(365), // Created a year ago
  };
});

// Helper to properly format transaction amount based on type
const formatTransactionAmount = (amount, type) => {
  const numAmount = parseFloat(amount);
  // Expenses should be negative, income should be positive
  return type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);
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
        const daysAgo = startDay + (week * 7) + Math.floor(Math.random() * 7);
        const amount = (Math.random() * 100 + 30).toFixed(2);
        transactions.push({
          id: `txn-${String(txnCounter++).padStart(3, '0')}`,
          date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, 'expense'),
          envelopeId: 'env-001-groceries',
          category: 'Food & Dining',
          type: 'expense',
          lastModified: getTimestamp(daysAgo),
          createdAt: getTimestamp(daysAgo),
          description: 'Grocery shopping',
          merchant: merchants.groceries[Math.floor(Math.random() * merchants.groceries.length)]
        });
      }
    }
    
    // Gas - 1-2x per week (4-8 per month)
    for (let week = 0; week < 4; week++) {
      const count = Math.floor(Math.random() * 2) + 1; // 1-2 per week
      for (let i = 0; i < count; i++) {
        const daysAgo = startDay + (week * 7) + Math.floor(Math.random() * 7);
        const amount = (Math.random() * 30 + 30).toFixed(2);
        transactions.push({
          id: `txn-${String(txnCounter++).padStart(3, '0')}`,
          date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, 'expense'),
          envelopeId: 'env-002-gas',
          category: 'Transportation',
          type: 'expense',
          lastModified: getTimestamp(daysAgo),
          createdAt: getTimestamp(daysAgo),
          description: 'Gas fill-up',
          merchant: merchants.gas[Math.floor(Math.random() * merchants.gas.length)]
        });
      }
    }
    
    // Restaurants/Dining - 1-2x per week (4-8 per month)
    for (let week = 0; week < 4; week++) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const daysAgo = startDay + (week * 7) + Math.floor(Math.random() * 7);
        const amount = (Math.random() * 40 + 10).toFixed(2);
        transactions.push({
          id: `txn-${String(txnCounter++).padStart(3, '0')}`,
          date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, 'expense'),
          envelopeId: 'env-001-groceries',
          category: 'Food & Dining',
          type: 'expense',
          lastModified: getTimestamp(daysAgo),
          createdAt: getTimestamp(daysAgo),
          description: 'Dining out',
          merchant: merchants.restaurants[Math.floor(Math.random() * merchants.restaurants.length)]
        });
      }
    }
    
    // Entertainment - 2-3x per month
    const entertainmentCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < entertainmentCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 50 + 10).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, '0')}`,
        date: getDateString(daysAgo),
          amount: formatTransactionAmount(amount, 'expense'),
          envelopeId: 'env-005-entertainment',
          category: 'Entertainment',
          type: 'expense',
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: 'Entertainment',
        merchant: merchants.entertainment[Math.floor(Math.random() * merchants.entertainment.length)]
      });
    }
    
    // Healthcare - 1-2x per month
    const healthcareCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < healthcareCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 100 + 15).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, '0')}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, 'expense'),
        envelopeId: 'env-006-healthcare',
        category: 'Health & Medical',
        type: 'expense',
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: 'Medical expense',
        merchant: merchants.healthcare[Math.floor(Math.random() * merchants.healthcare.length)]
      });
    }
    
    // Pet Care - 2-3x per month
    const petCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < petCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 60 + 20).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, '0')}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, 'expense'),
        envelopeId: 'env-007-pet-care',
        category: 'Pets',
        type: 'expense',
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: 'Pet supplies',
        merchant: merchants.petcare[Math.floor(Math.random() * merchants.petcare.length)]
      });
    }
    
    // Personal Care - 2x per month
    for (let i = 0; i < 2; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 40 + 15).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, '0')}`,
        date: getDateString(daysAgo),
        amount: formatTransactionAmount(amount, 'expense'),
        envelopeId: 'env-009-personal-care',
        category: 'Personal Care',
        type: 'expense',
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: 'Personal care',
        merchant: merchants.personal[Math.floor(Math.random() * merchants.personal.length)]
      });
    }
    
    // Shopping/Gifts - 1-2x per month
    const giftCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < giftCount; i++) {
      const daysAgo = startDay + Math.floor(Math.random() * daysInMonth);
      const amount = (Math.random() * 80 + 20).toFixed(2);
      transactions.push({
        id: `txn-${String(txnCounter++).padStart(3, '0')}`,
        date: getDateString(daysAgo),
        amount: parseFloat(amount),
        envelopeId: 'env-010-gifts',
        category: 'Gifts & Donations',
        type: 'expense',
        lastModified: getTimestamp(daysAgo),
        createdAt: getTimestamp(daysAgo),
        description: 'Gift purchase',
        merchant: merchants.gifts[Math.floor(Math.random() * merchants.gifts.length)]
      });
    }
    
    // Debt payments - once per month for each debt
    const debtPaymentDay = 15 + Math.floor(Math.random() * 5);
    
    // Credit card payment
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, '0')}`,
      date: getDateString(startDay + debtPaymentDay),
      amount: 85.00,
      envelopeId: 'env-debt-001-cc',
      category: 'Debt Payment',
      type: 'bill',
      lastModified: getTimestamp(startDay + debtPaymentDay),
      createdAt: getTimestamp(startDay + debtPaymentDay),
      description: 'Credit Card Payment',
      billId: 'bill-debt-001-cc',
      merchant: 'Chase Bank'
    });
    
    // Student loan payment
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, '0')}`,
      date: getDateString(startDay + debtPaymentDay - 5),
      amount: 150.00,
      envelopeId: 'env-debt-002-student',
      category: 'Debt Payment',
      type: 'bill',
      lastModified: getTimestamp(startDay + debtPaymentDay - 5),
      createdAt: getTimestamp(startDay + debtPaymentDay - 5),
      description: 'Student Loan Payment',
      billId: 'bill-debt-002-student',
      merchant: 'Dept of Education'
    });
    
    // Auto loan payment
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, '0')}`,
      date: getDateString(startDay + debtPaymentDay + 5),
      amount: 285.00,
      envelopeId: 'env-debt-003-auto',
      category: 'Debt Payment',
      type: 'bill',
      lastModified: getTimestamp(startDay + debtPaymentDay + 5),
      createdAt: getTimestamp(startDay + debtPaymentDay + 5),
      description: 'Auto Loan Payment',
      billId: 'bill-debt-003-auto',
      merchant: 'Ally Financial'
    });
    
    // Personal loan payment
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, '0')}`,
      date: getDateString(startDay + debtPaymentDay + 10),
      amount: 125.00,
      envelopeId: 'env-debt-004-personal',
      category: 'Debt Payment',
      type: 'bill',
      lastModified: getTimestamp(startDay + debtPaymentDay + 10),
      createdAt: getTimestamp(startDay + debtPaymentDay + 10),
      description: 'Personal Loan Payment',
      billId: 'bill-debt-004-personal',
      merchant: 'LendingClub'
    });
    
    // Income - 2x per month (biweekly paychecks)
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, '0')}`,
      date: getDateString(startDay + 3),
      amount: 2500.00,
      envelopeId: 'env-008-emergency',
      category: 'Income',
      type: 'income',
      lastModified: getTimestamp(startDay + 3),
      createdAt: getTimestamp(startDay + 3),
      description: 'Biweekly paycheck',
      merchant: 'Acme Corporation'
    });
    
    transactions.push({
      id: `txn-${String(txnCounter++).padStart(3, '0')}`,
      date: getDateString(startDay + 17),
      amount: 2500.00,
      envelopeId: 'env-008-emergency',
      category: 'Income',
      type: 'income',
      lastModified: getTimestamp(startDay + 17),
      createdAt: getTimestamp(startDay + 17),
      description: 'Biweekly paycheck',
      merchant: 'Acme Corporation'
    });
  }
  
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
      amount: txn.type === 'expense' ? -Math.abs(txn.amount) : Math.abs(txn.amount),
    };
  });
};

// Update base bills to have current/upcoming due dates
const updateBaseBills = () => {
  return baseData.bills.map((bill, index) => {
    // Spread bills throughout the month
    const daysOffset = (index * 3) - 15; // Range from -15 to +15 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);
    
    return {
      ...bill,
      dueDate: dueDate.toISOString().split('T')[0],
      lastModified: getTimestamp(0),
      createdAt: getTimestamp(90),
    };
  });
};

// Update envelopes to have recent timestamps and proper amounts
const updateBaseEnvelopes = () => {
  return baseData.envelopes.map((env) => ({
    ...env,
    lastModified: getTimestamp(0),
    createdAt: getTimestamp(180),
    currentBalance: env.currentBalance || 0,
    targetAmount: env.targetAmount || env.currentBalance || 100,
  }));
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
      targetDate: goal.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      id: `paycheck-${String(i + 1).padStart(3, '0')}`,
      payerName: 'Acme Corporation',
      processedAt: paycheckDate,
      processedBy: 'System',
      allocationMode: 'allocate',
      amount: amount,
      totalAllocated: totalAllocated,
      remainingAmount: amount - totalAllocated,
      lastModified: getTimestamp(daysAgo),
      createdAt: getTimestamp(daysAgo),
      allocations: [
        { envelopeId: 'env-003-rent', envelopeName: 'Rent', amount: 750 },
        { envelopeId: 'env-004-utilities', envelopeName: 'Utilities', amount: 125 },
        { envelopeId: 'env-001-groceries', envelopeName: 'Groceries', amount: 300 },
        { envelopeId: 'env-002-gas', envelopeName: 'Gas/Transportation', amount: 150 },
        { envelopeId: 'env-008-emergency', envelopeName: 'Emergency Fund', amount: 250 },
        { envelopeId: 'env-005-entertainment', envelopeName: 'Entertainment', amount: 100 },
        { envelopeId: 'env-006-healthcare', envelopeName: 'Health & Medical', amount: 100 },
        { envelopeId: 'env-007-pet-care', envelopeName: 'Pet Care', amount: 75 },
        { envelopeId: 'env-009-personal-care', envelopeName: 'Personal Care', amount: 50 },
        { envelopeId: 'env-010-gifts', envelopeName: 'Gifts & Donations', amount: 75 },
        { envelopeId: 'env-debt-001-cc', envelopeName: 'Credit Card Payment', amount: 85 },
        { envelopeId: 'env-debt-002-student', envelopeName: 'Student Loan Payment', amount: 40 },
      ]
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

const allEnvelopes = [...updatedBaseEnvelopes, ...debtEnvelopes];
const allBills = [...updatedBaseBills, ...debtBills];
const allTransactions = [...updatedBaseTransactions, ...newTransactions];

// Build allTransactions array (includes bill payments)
const buildAllTransactions = () => {
  const billPayments = allBills.filter(b => b.isPaid).map(bill => ({
    id: `${bill.id}-payment`,
    date: bill.dueDate,
    amount: -Math.abs(bill.amount), // Bill payments are expenses (negative)
    envelopeId: bill.envelopeId,
    category: bill.category,
    type: 'bill',
    lastModified: bill.lastModified,
    createdAt: bill.createdAt,
    description: bill.name,
    billId: bill.id,
    merchant: bill.paymentMethod || 'Payment'
  }));
  
  return [...allTransactions, ...billPayments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Construct final export object
const enhancedData = {
  envelopes: allEnvelopes,
  bills: allBills,
  transactions: allTransactions,
  allTransactions: buildAllTransactions(),
  savingsGoals: updatedBaseSavingsGoals,
  supplementalAccounts: baseData.supplementalAccounts,
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
    note: 'Enhanced test data with 100+ transactions and full entity connections'
  },
  _dataGuide: {
    ...baseData._dataGuide,
    connections: {
      'Debt → Envelope': 'debts have envelopeId field',
      'Debt → Bill': 'bills have debtId field pointing to debt',
      'Bill → Envelope': 'bills have envelopeId field',
      'Envelope → Bill': 'envelopes have billId field',
      'Envelope → Debt': 'envelopes have debtId field',
      'Transaction → Envelope': 'transactions have envelopeId field',
      'Transaction → Bill': 'bill payment transactions have billId field'
    },
    stats: {
      envelopes: allEnvelopes.length,
      bills: allBills.length,
      transactions: allTransactions.length,
      allTransactions: buildAllTransactions().length,
      debts: enhancedDebts.length,
      savingsGoals: baseData.savingsGoals.length,
      supplementalAccounts: baseData.supplementalAccounts.length,
      paycheckHistory: baseData.paycheckHistory.length
    }
  }
};

// Write to file
const outputPath = path.join(__dirname, 'violet-vault-test-budget-enhanced.json');
fs.writeFileSync(outputPath, JSON.stringify(enhancedData, null, 2));

console.log('✅ Enhanced test data generated!');
console.log(`📊 Stats:`);
console.log(`   - Envelopes: ${allEnvelopes.length} (added 4 debt payment envelopes)`);
console.log(`   - Bills: ${allBills.length} (added 4 debt payment bills)`);
console.log(`   - Transactions: ${allTransactions.length} (generated ${newTransactions.length} new)`);
console.log(`   - All Transactions: ${buildAllTransactions().length}`);
console.log(`   - Debts: ${enhancedDebts.length} (updated with envelope connections)`);
console.log(`\n📁 Saved to: ${outputPath}`);
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 180);

console.log(`\n🔗 Connections:`);
console.log(`   - Each debt is connected to a dedicated envelope`);
console.log(`   - Each debt has a recurring bill for monthly payments`);
console.log(`   - Debt payment bills are connected to debt payment envelopes`);
console.log(`   - Transactions span 6 months (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);
console.log(`   - Multiple pages of transactions for testing pagination`);
console.log(`   - Data generated on: ${endDate.toISOString()}`);

