/**
 * Bill Discovery System
 * Analyzes transactions to automatically suggest new recurring bills
 */

import { getBillIcon } from "./billIcons.ts";
import type { Envelope as DbEnvelope, Bill as DbBill } from "../../db/types";

type Envelope = DbEnvelope;
type Bill = DbBill & {
  provider?: string;
  description?: string;
};

interface Transaction {
  date: string;
  amount: number;
  description: string;
  [key: string]: unknown;
}

interface BillPattern {
  keywords: string[];
  category: string;
  recurring: boolean;
  confidence: number;
  patternName?: string;
  matchedKeywords?: string[];
  iconName?: string;
}

interface BillSuggestion {
  id: string;
  provider: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  frequency: string;
  confidence: number;
  source: string;
  discoveryData: {
    transactionCount: number;
    avgInterval: number;
    amountRange: number[];
    lastTransactionDate: string;
    sampleTransactions: Array<{
      date: string;
      amount: number;
      description: string;
    }>;
  };
  iconName?: string;
  metadata: {
    detectedPattern: string[];
    confidence: number;
    discoveryMethod: string;
  };
}

interface EnhancedBillSuggestion extends BillSuggestion {
  suggestedEnvelopeId?: string;
  suggestedEnvelopeName?: string;
  envelopeConfidence?: number;
}

interface EnvelopeMatch extends Envelope {
  confidence: number;
}

// Constants
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Common bill patterns and their characteristics
 */
export const BILL_PATTERNS: Record<string, BillPattern> = {
  utilities: {
    keywords: ["electric", "electricity", "power", "gas", "water", "sewer", "utility", "energy"],
    category: "Utilities",
    recurring: true,
    confidence: 0.9,
  },
  internet: {
    keywords: ["internet", "wifi", "broadband", "comcast", "verizon", "att", "spectrum", "cox"],
    category: "Internet & Phone",
    recurring: true,
    confidence: 0.9,
  },
  phone: {
    keywords: ["mobile", "cell", "wireless", "phone", "tmobile", "sprint", "verizon", "att"],
    category: "Internet & Phone",
    recurring: true,
    confidence: 0.85,
  },
  streaming: {
    keywords: ["netflix", "spotify", "disney", "hulu", "prime", "apple music", "youtube premium"],
    category: "Entertainment",
    recurring: true,
    confidence: 0.95,
  },
  insurance: {
    keywords: ["insurance", "state farm", "geico", "progressive", "allstate", "farmers"],
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
    keywords: ["mortgage", "loan payment", "wells fargo", "chase", "bank of america"],
    category: "Housing",
    recurring: true,
    confidence: 0.9,
  },
};

/**
 * Analyze transactions to find potential recurring bills
 */
export const analyzeTransactionsForBills = (
  transactions: Transaction[],
  existingBills: Bill[] = []
): BillSuggestion[] => {
  const potentialBills: BillSuggestion[] = [];
  const existingBillDescriptions = new Set(
    existingBills.map((bill) => bill.description?.toLowerCase() || bill.provider?.toLowerCase())
  );

  // Group similar transactions by description/merchant
  const transactionGroups = groupSimilarTransactions(transactions);

  for (const [groupKey, transactionGroup] of Object.entries(transactionGroups)) {
    // Skip if we already have this bill
    if (existingBillDescriptions.has(groupKey.toLowerCase())) {
      continue;
    }

    const billSuggestion = analyzeTransactionGroup(transactionGroup as Transaction[], groupKey);

    if (billSuggestion && billSuggestion.confidence > 0.6) {
      potentialBills.push(billSuggestion);
    }
  }

  // Sort by confidence and limit results
  return potentialBills.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
};

/**
 * Group similar transactions by normalized description
 */
const groupSimilarTransactions = (transactions: Transaction[]): Record<string, Transaction[]> => {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    if (!transaction.amount || transaction.amount >= 0) return; // Only negative amounts (expenses)

    const normalizedDesc = normalizeTransactionDescription(transaction.description);
    if (!normalizedDesc) return;

    if (!groups[normalizedDesc]) {
      groups[normalizedDesc] = [];
    }
    groups[normalizedDesc].push(transaction);
  });

  // Only return groups with multiple transactions (indicating recurring)
  const recurringGroups: Record<string, Transaction[]> = {};
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
const normalizeTransactionDescription = (description: string): string | null => {
  if (!description) return null;

  return description
    .toLowerCase()
    .replace(/\d+/g, "") // Remove numbers
    .replace(/[#*\-_]/g, " ") // Replace special chars with spaces
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

/**
 * Calculate transaction intervals in days
 */
const calculateTransactionIntervals = (dates: Date[]): number[] => {
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = Math.abs(dates[i].getTime() - dates[i - 1].getTime()) / MILLISECONDS_PER_DAY;
    intervals.push(daysDiff);
  }
  return intervals;
};

/**
 * Determine frequency type based on average interval
 */
const determineFrequencyType = (
  avgInterval: number
): { frequency: string; isRecurring: boolean } => {
  if (avgInterval >= 25 && avgInterval <= 35) {
    return { frequency: "monthly", isRecurring: true };
  }
  if (avgInterval >= 6 && avgInterval <= 8) {
    return { frequency: "weekly", isRecurring: true };
  }
  if (avgInterval >= 13 && avgInterval <= 15) {
    return { frequency: "biweekly", isRecurring: true };
  }
  return { frequency: "monthly", isRecurring: false };
};

/**
 * Calculate confidence score for bill detection
 */
const calculateConfidenceScore = (
  detectedPattern: BillPattern | null,
  amountVariation: number,
  avgAmount: number,
  transactionCount: number
): number => {
  let confidence = 0.5; // Base confidence for recurring pattern

  // Boost confidence for recognized bill patterns
  if (detectedPattern) {
    confidence = Math.max(confidence, detectedPattern.confidence);
  }

  // Boost confidence for consistent amounts
  if (amountVariation < avgAmount * 0.1) {
    confidence += 0.2; // Very consistent amounts (subscriptions)
  } else if (amountVariation < avgAmount * 0.3) {
    confidence += 0.1; // Moderately consistent (utilities)
  }

  // Boost confidence for more transaction history
  if (transactionCount >= 6) confidence += 0.15;
  else if (transactionCount >= 4) confidence += 0.1;
  else if (transactionCount >= 3) confidence += 0.05;

  return confidence;
};

/**
 * Create bill suggestion object
 */
const createBillSuggestion = (options: {
  groupKey: string;
  avgAmount: number;
  nextDueDate: Date;
  detectedPattern: BillPattern | null;
  frequency: string;
  confidence: number;
  transactions: Transaction[];
  amounts: number[];
  avgInterval: number;
  lastTransaction: Date;
}): BillSuggestion => {
  const {
    groupKey,
    avgAmount,
    nextDueDate,
    detectedPattern,
    frequency,
    confidence,
    transactions,
    amounts,
    avgInterval,
    lastTransaction,
  } = options;

  return {
    id: `discovered_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    provider: groupKey,
    description: `${groupKey} (Auto-discovered)`,
    amount: Math.round(avgAmount * 100) / 100,
    dueDate: nextDueDate.toISOString().split("T")[0],
    category: detectedPattern?.category || "Bills & Utilities",
    frequency,
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
      detectedPattern?.iconName || getBillIcon(groupKey, "", detectedPattern?.category || "").name,
    metadata: {
      detectedPattern: detectedPattern?.keywords || [],
      confidence: confidence,
      discoveryMethod: "transaction_analysis",
    },
  };
};

/**
 * Analyze a group of similar transactions to determine bill characteristics
 */
const analyzeTransactionGroup = (
  transactions: Transaction[],
  groupKey: string
): BillSuggestion | null => {
  if (transactions.length < 2) return null;

  // Calculate transaction frequency
  const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
  const intervals = calculateTransactionIntervals(dates);
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  // Determine if it's truly recurring
  const { frequency, isRecurring } = determineFrequencyType(avgInterval);
  if (!isRecurring) return null;

  // Calculate average amount
  const amounts = transactions.map((t) => Math.abs(t.amount));
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const amountVariation = Math.max(...amounts) - Math.min(...amounts);

  // Pattern matching for bill type
  const detectedPattern = detectBillPattern(groupKey);

  // Calculate confidence score
  const confidence = calculateConfidenceScore(
    detectedPattern,
    amountVariation,
    avgAmount,
    transactions.length
  );

  // Predict next due date
  const lastTransaction = dates[dates.length - 1];
  const nextDueDate = new Date(lastTransaction);
  nextDueDate.setDate(nextDueDate.getDate() + Math.round(avgInterval));

  return createBillSuggestion({
    groupKey,
    avgAmount,
    nextDueDate,
    detectedPattern,
    frequency,
    confidence,
    transactions,
    amounts,
    avgInterval,
    lastTransaction,
  });
};

/**
 * Detect bill pattern from transaction description
 */
const detectBillPattern = (description: string): BillPattern | null => {
  const lowerDesc = description.toLowerCase();

  for (const [patternName, pattern] of Object.entries(BILL_PATTERNS)) {
    const matchedKeywords = pattern.keywords.filter((keyword) => lowerDesc.includes(keyword));

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
export const generateBillSuggestions = (
  transactions: Transaction[],
  bills: Bill[],
  envelopes: Envelope[]
): EnhancedBillSuggestion[] => {
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
 * Find best matching envelope for a discovered bill
 */
const findBestEnvelopeForBill = (
  bill: BillSuggestion,
  envelopes: Envelope[]
): EnvelopeMatch | null => {
  let bestMatch: EnvelopeMatch | null = null;
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
      (word) => word.length > 3 && envelopeWords.some((envWord) => envWord.includes(word))
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
