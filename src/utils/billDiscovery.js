/**
 * Bill Discovery System
 * Analyzes transactions to automatically suggest new recurring bills
 */

import { getBillIcon } from "./billIcons";

/**
 * Common bill patterns and their characteristics
 */
export const BILL_PATTERNS = {
  utilities: {
    keywords: [
      "electric",
      "electricity",
      "power",
      "gas",
      "water",
      "sewer",
      "utility",
      "energy",
    ],
    category: "Utilities",
    recurring: true,
    confidence: 0.9,
  },
  internet: {
    keywords: [
      "internet",
      "wifi",
      "broadband",
      "comcast",
      "verizon",
      "att",
      "spectrum",
      "cox",
    ],
    category: "Internet & Phone",
    recurring: true,
    confidence: 0.9,
  },
  phone: {
    keywords: [
      "mobile",
      "cell",
      "wireless",
      "phone",
      "tmobile",
      "sprint",
      "verizon",
      "att",
    ],
    category: "Internet & Phone",
    recurring: true,
    confidence: 0.85,
  },
  streaming: {
    keywords: [
      "netflix",
      "spotify",
      "disney",
      "hulu",
      "prime",
      "apple music",
      "youtube premium",
    ],
    category: "Entertainment",
    recurring: true,
    confidence: 0.95,
  },
  insurance: {
    keywords: [
      "insurance",
      "state farm",
      "geico",
      "progressive",
      "allstate",
      "farmers",
    ],
    category: "Insurance",
    recurring: true,
    confidence: 0.9,
  },
  rent: {
    keywords: ["rent", "lease", "apartment", "property management"],
    category: "Housing",
    recurring: true,
    confidence: 0.95,
  },
  mortgage: {
    keywords: [
      "mortgage",
      "loan payment",
      "wells fargo",
      "chase",
      "bank of america",
    ],
    category: "Housing",
    recurring: true,
    confidence: 0.9,
  },
};

/**
 * Analyze transactions to find potential recurring bills
 */
export const analyzeTransactionsForBills = (
  transactions,
  existingBills = [],
) => {
  const potentialBills = [];
  const existingBillDescriptions = new Set(
    existingBills.map(
      (bill) => bill.description?.toLowerCase() || bill.provider?.toLowerCase(),
    ),
  );

  // Group similar transactions by description/merchant
  const transactionGroups = groupSimilarTransactions(transactions);

  for (const [groupKey, transactionGroup] of Object.entries(
    transactionGroups,
  )) {
    // Skip if we already have this bill
    if (existingBillDescriptions.has(groupKey.toLowerCase())) {
      continue;
    }

    const billSuggestion = analyzeTransactionGroup(transactionGroup, groupKey);

    if (billSuggestion && billSuggestion.confidence > 0.6) {
      potentialBills.push(billSuggestion);
    }
  }

  // Sort by confidence and limit results
  return potentialBills
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
};

/**
 * Group similar transactions by normalized description
 */
const groupSimilarTransactions = (transactions) => {
  const groups = {};

  transactions.forEach((transaction) => {
    if (!transaction.amount || transaction.amount >= 0) return; // Only negative amounts (expenses)

    const normalizedDesc = normalizeTransactionDescription(
      transaction.description,
    );
    if (!normalizedDesc) return;

    if (!groups[normalizedDesc]) {
      groups[normalizedDesc] = [];
    }
    groups[normalizedDesc].push(transaction);
  });

  // Only return groups with multiple transactions (indicating recurring)
  const recurringGroups = {};
  for (const [key, group] of Object.entries(groups)) {
    if (group.length >= 2) {
      recurringGroups[key] = group;
    }
  }

  return recurringGroups;
};

/**
 * Normalize transaction descriptions for grouping
 */
const normalizeTransactionDescription = (description) => {
  if (!description) return null;

  return description
    .toLowerCase()
    .replace(/\d+/g, "") // Remove numbers
    .replace(/[#*\-_]/g, " ") // Replace special chars with spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

/**
 * Analyze a group of similar transactions to determine bill characteristics
 */
const analyzeTransactionGroup = (transactions, groupKey) => {
  if (transactions.length < 2) return null;

  // Calculate transaction frequency
  const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => a - b);

  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = Math.abs(dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  const avgInterval =
    intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  // Determine if it's truly recurring (monthly, weekly, etc.)
  const isMonthlyRecurring = avgInterval >= 25 && avgInterval <= 35;
  const isWeeklyRecurring = avgInterval >= 6 && avgInterval <= 8;
  const isBiWeeklyRecurring = avgInterval >= 13 && avgInterval <= 15;

  if (!isMonthlyRecurring && !isWeeklyRecurring && !isBiWeeklyRecurring) {
    return null; // Not a regular recurring pattern
  }

  // Calculate average amount
  const amounts = transactions.map((t) => Math.abs(t.amount));
  const avgAmount =
    amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const amountVariation = Math.max(...amounts) - Math.min(...amounts);

  // Pattern matching for bill type
  const detectedPattern = detectBillPattern(groupKey);

  // Calculate confidence score
  let confidence = 0.5; // Base confidence for recurring pattern

  // Boost confidence for recognized bill patterns
  if (detectedPattern) {
    confidence = Math.max(confidence, detectedPattern.confidence);
  }

  // Boost confidence for consistent amounts (utilities vary, subscriptions don't)
  if (amountVariation < avgAmount * 0.1) {
    confidence += 0.2; // Very consistent amounts (subscriptions)
  } else if (amountVariation < avgAmount * 0.3) {
    confidence += 0.1; // Moderately consistent (utilities)
  }

  // Boost confidence for more transaction history
  if (transactions.length >= 6) confidence += 0.15;
  else if (transactions.length >= 4) confidence += 0.1;
  else if (transactions.length >= 3) confidence += 0.05;

  // Predict next due date
  const lastTransaction = dates[dates.length - 1];
  const nextDueDate = new Date(lastTransaction);
  nextDueDate.setDate(nextDueDate.getDate() + Math.round(avgInterval));

  return {
    id: `discovered_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    provider: groupKey,
    description: `${groupKey} (Auto-discovered)`,
    amount: Math.round(avgAmount * 100) / 100,
    dueDate: nextDueDate.toISOString().split("T")[0],
    category: detectedPattern?.category || "Bills & Utilities",
    frequency: isMonthlyRecurring
      ? "monthly"
      : isWeeklyRecurring
        ? "weekly"
        : "biweekly",
    confidence,
    source: "auto_discovery",
    discoveryData: {
      transactionCount: transactions.length,
      avgInterval: Math.round(avgInterval),
      amountRange: [Math.min(...amounts), Math.max(...amounts)],
      lastTransactionDate: lastTransaction.toISOString().split("T")[0],
      sampleTransactions: transactions.slice(0, 3).map((t) => ({
        date: t.date,
        amount: t.amount,
        description: t.description,
      })),
    },
    iconName:
      detectedPattern?.iconName ||
      getBillIcon(groupKey, "", detectedPattern?.category || "").name,
    metadata: {
      detectedPattern: detectedPattern?.keywords || [],
      confidence: confidence,
      discoveryMethod: "transaction_analysis",
    },
  };
};

/**
 * Detect bill pattern from transaction description
 */
const detectBillPattern = (description) => {
  const lowerDesc = description.toLowerCase();

  for (const [patternName, pattern] of Object.entries(BILL_PATTERNS)) {
    const matchedKeywords = pattern.keywords.filter((keyword) =>
      lowerDesc.includes(keyword),
    );

    if (matchedKeywords.length > 0) {
      return {
        ...pattern,
        patternName,
        matchedKeywords,
        iconName: patternName,
      };
    }
  }

  return null;
};

/**
 * Generate smart bill suggestions based on existing data
 */
export const generateBillSuggestions = (transactions, bills, envelopes) => {
  const discoveredBills = analyzeTransactionsForBills(transactions, bills);

  // Enhance suggestions with envelope recommendations
  const enhancedSuggestions = discoveredBills.map((bill) => {
    const suggestedEnvelope = findBestEnvelopeForBill(bill, envelopes);

    return {
      ...bill,
      suggestedEnvelopeId: suggestedEnvelope?.id,
      suggestedEnvelopeName: suggestedEnvelope?.name,
      envelopeConfidence: suggestedEnvelope?.confidence || 0,
    };
  });

  return enhancedSuggestions;
};

/**
 * Find the best matching envelope for a discovered bill
 */
const findBestEnvelopeForBill = (bill, envelopes) => {
  let bestMatch = null;
  let highestScore = 0;

  for (const envelope of envelopes) {
    let score = 0;
    const envelopeName = envelope.name.toLowerCase();
    const billDesc = bill.description.toLowerCase();
    const billCategory = bill.category.toLowerCase();

    // Direct name matching
    if (envelopeName.includes(bill.provider.toLowerCase())) {
      score += 0.9;
    }

    // Category matching
    if (envelopeName.includes(billCategory)) {
      score += 0.7;
    }

    // Keyword matching
    const keywords = bill.metadata?.detectedPattern || [];
    for (const keyword of keywords) {
      if (envelopeName.includes(keyword.toLowerCase())) {
        score += 0.5;
      }
    }

    // Partial description matching
    const billWords = billDesc.split(" ");
    const envelopeWords = envelopeName.split(" ");
    const commonWords = billWords.filter(
      (word) =>
        word.length > 3 &&
        envelopeWords.some((envWord) => envWord.includes(word)),
    );
    score += commonWords.length * 0.3;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { ...envelope, confidence: score };
    }
  }

  return highestScore > 0.5 ? bestMatch : null;
};

export default {
  analyzeTransactionsForBills,
  generateBillSuggestions,
  BILL_PATTERNS,
};
