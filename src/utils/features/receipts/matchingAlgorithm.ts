/** Smart Receipt-to-Transaction Matching Algorithm */
import type { Transaction } from "@/db/types";
import { MERCHANT_ALIASES } from "./merchantAliases";
export { MERCHANT_ALIASES };

/** Receipt interface for matching */
export interface Receipt {
  id: string;
  merchant?: string;
  amount?: number;
  total?: number;
  date?: string;
  transactionId?: string;
  processingStatus?: string;
  hasReceipt?: boolean;
  dismissedMatches?: Array<{ transactionId: string; dismissedAt: string }>;
}

/** Match suggestion returned by the algorithm */
export interface MatchSuggestion {
  transactionId: string;
  transaction: Transaction;
  confidence: number;
  confidenceLevel: "high" | "medium" | "low" | "very_low";
  matchReasons: {
    amount: { score: number; diff: number; receiptAmount?: number; transactionAmount?: number };
    date: {
      score: number;
      daysDiff: number;
      receiptDate?: string | Date;
      transactionDate?: string | Date;
    };
    merchant: {
      score: number;
      similarity: number;
      receiptMerchant?: string;
      transactionMerchant?: string;
      normalizedReceipt?: string;
      normalizedTransaction?: string;
    };
  };
}

/** Data difference for match confirmation */
export interface DataDifference {
  field: "merchant" | "amount" | "date";
  label: string;
  receiptValue: string | number | Date;
  transactionValue: string | number | Date;
  normalizedReceipt?: string;
  normalizedTransaction?: string;
  diff?: number;
  daysDiff?: number;
}

/** Options for finding matches */
export interface FindMatchOptions {
  minConfidence?: number;
  maxResults?: number;
  maxDaysApart?: number;
}

/** Confidence level thresholds */
export const CONFIDENCE_LEVELS = { HIGH: 80, MEDIUM: 60, LOW: 40, MINIMUM: 40 } as const;

/** Weight configuration for match scoring */
export const MATCH_WEIGHTS = { AMOUNT: 0.5, DATE: 0.3, MERCHANT: 0.2 } as const;

/** Calculate Levenshtein distance between two strings */
export const levenshteinDistance = (
  str1: string | null | undefined,
  str2: string | null | undefined
): number => {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);

  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[s1.length][s2.length];
};

/** Calculate string similarity as a percentage (0-100) */
export const stringSimilarity = (
  str1: string | null | undefined,
  str2: string | null | undefined
): number => {
  if (!str1 && !str2) return 100;
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  if (maxLength === 0) return 100;

  return Math.round((1 - distance / maxLength) * 100);
};

/** Normalize a merchant name using the alias map
 */
export const normalizeMerchant = (merchantName: string | null | undefined): string => {
  if (!merchantName) return "";

  let normalized = merchantName
    .toUpperCase()
    .trim()
    .replace(/^(SQ \*|SQUARE \*|TST\*|TOAST\*|PAYPAL \*|VENMO \*|ZELLE \*|CASH APP\*)/i, "")
    .replace(/\s*#?\d{4,}$/i, "")
    .replace(/^[*#\s]+|[*#\s]+$/g, "")
    .trim();

  if (MERCHANT_ALIASES[normalized]) {
    return MERCHANT_ALIASES[normalized];
  }

  for (const [alias, fullName] of Object.entries(MERCHANT_ALIASES)) {
    if (normalized.startsWith(alias) || normalized.includes(alias)) {
      if (fullName) {
        return fullName;
      }
    }
  }

  return normalized
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/** Calculate amount match score
 */
export const calculateAmountScore = (
  receiptAmount: number | string | undefined,
  transactionAmount: number | string | undefined
): { score: number; diff: number } => {
  const receipt = Math.abs(parseFloat(String(receiptAmount)) || 0);
  const transaction = Math.abs(parseFloat(String(transactionAmount)) || 0);
  const diff = Math.abs(receipt - transaction);

  let score: number;
  if (diff === 0) {
    score = 100;
  } else if (diff <= 0.5) {
    score = 80;
  } else if (diff <= 2.0) {
    score = 60;
  } else {
    score = 0;
  }

  return { score, diff: Math.round(diff * 100) / 100 };
};

/** Calculate date match score
 */
export const calculateDateScore = (
  receiptDate: string | Date | undefined,
  transactionDate: string | Date | undefined
): { score: number; daysDiff: number } => {
  const rDate = new Date(receiptDate || new Date());
  const tDate = new Date(transactionDate || new Date());

  rDate.setHours(0, 0, 0, 0);
  tDate.setHours(0, 0, 0, 0);

  const diffMs = Math.abs(rDate.getTime() - tDate.getTime());
  const daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let score: number;
  if (daysDiff === 0) {
    score = 100;
  } else if (daysDiff === 1) {
    score = 80;
  } else if (daysDiff <= 2) {
    score = 60;
  } else if (daysDiff <= 7) {
    score = 40;
  } else {
    score = 0;
  }

  return { score, daysDiff };
};

/**
 * Calculate merchant match score
 */
export const calculateMerchantScore = (
  receiptMerchant: string | undefined,
  transactionMerchant: string | undefined
): { score: number; similarity: number } => {
  const normalizedReceipt = normalizeMerchant(receiptMerchant);
  const normalizedTransaction = normalizeMerchant(transactionMerchant);

  if (
    normalizedReceipt.toLowerCase() === normalizedTransaction.toLowerCase() &&
    normalizedReceipt !== ""
  ) {
    return { score: 100, similarity: 100 };
  }

  const similarity = stringSimilarity(normalizedReceipt, normalizedTransaction);

  const containsMatch =
    normalizedReceipt.toLowerCase().includes(normalizedTransaction.toLowerCase()) ||
    normalizedTransaction.toLowerCase().includes(normalizedReceipt.toLowerCase());

  const boostedSimilarity = containsMatch ? Math.max(similarity, 70) : similarity;

  return { score: boostedSimilarity, similarity: boostedSimilarity };
};

/**
 * Calculate overall match confidence score
 */
export const calculateMatchScore = (
  receipt: Receipt,
  transaction: Transaction
): MatchSuggestion => {
  const amountResult = calculateAmountScore(receipt.amount || receipt.total, transaction.amount);
  const dateResult = calculateDateScore(receipt.date, transaction.date);
  const merchantResult = calculateMerchantScore(
    receipt.merchant,
    transaction.description || transaction.category
  );

  const overallScore = Math.round(
    amountResult.score * MATCH_WEIGHTS.AMOUNT +
      dateResult.score * MATCH_WEIGHTS.DATE +
      merchantResult.score * MATCH_WEIGHTS.MERCHANT
  );

  let confidenceLevel: MatchSuggestion["confidenceLevel"];
  if (overallScore >= CONFIDENCE_LEVELS.HIGH) {
    confidenceLevel = "high";
  } else if (overallScore >= CONFIDENCE_LEVELS.MEDIUM) {
    confidenceLevel = "medium";
  } else if (overallScore >= CONFIDENCE_LEVELS.LOW) {
    confidenceLevel = "low";
  } else {
    confidenceLevel = "very_low";
  }

  return {
    transactionId: transaction.id,
    transaction,
    confidence: overallScore,
    confidenceLevel,
    matchReasons: {
      amount: {
        score: amountResult.score,
        diff: amountResult.diff,
        receiptAmount: receipt.amount || receipt.total,
        transactionAmount: transaction.amount,
      },
      date: {
        score: dateResult.score,
        daysDiff: dateResult.daysDiff,
        receiptDate: receipt.date,
        transactionDate: transaction.date,
      },
      merchant: {
        score: merchantResult.score,
        similarity: merchantResult.similarity,
        receiptMerchant: receipt.merchant,
        transactionMerchant: transaction.description || transaction.category,
        normalizedReceipt: normalizeMerchant(receipt.merchant),
        normalizedTransaction: normalizeMerchant(transaction.description || transaction.category),
      },
    },
  };
};

/**
 * Find potential transaction matches for a receipt
 */
export const findMatchesForReceipt = (
  receipt: Receipt | null | undefined,
  transactions: Transaction[] | null | undefined,
  options: FindMatchOptions = {}
): MatchSuggestion[] => {
  const { minConfidence = CONFIDENCE_LEVELS.MINIMUM, maxResults = 5, maxDaysApart = 14 } = options;

  if (!receipt || !transactions || transactions.length === 0) {
    return [];
  }

  const receiptDate = new Date(receipt.date || new Date());
  receiptDate.setHours(0, 0, 0, 0);

  const minDate = new Date(receiptDate);
  minDate.setDate(minDate.getDate() - maxDaysApart);

  const maxDate = new Date(receiptDate);
  maxDate.setDate(maxDate.getDate() + maxDaysApart);

  const candidateTransactions = transactions.filter((t) => {
    // Skip transactions that already have a receipt linked
    const txnWithReceipt = t as unknown as { receiptUrl?: string };
    if (txnWithReceipt.receiptUrl) return false;

    const tDate = new Date(t.date);
    tDate.setHours(0, 0, 0, 0);
    return tDate >= minDate && tDate <= maxDate;
  });

  const matches = candidateTransactions
    .map((transaction) => calculateMatchScore(receipt, transaction))
    .filter((match) => match.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxResults);

  return matches;
};

/**
 * Find the best match for a receipt
 */
export const findBestMatch = (
  receipt: Receipt | null | undefined,
  transactions: Transaction[] | null | undefined,
  minConfidence: number = CONFIDENCE_LEVELS.MEDIUM
): MatchSuggestion | null => {
  const matches = findMatchesForReceipt(receipt, transactions, {
    minConfidence,
    maxResults: 1,
  });

  return matches.length > 0 ? matches[0] : null;
};

/**
 * Check if a match is considered high confidence
 */
export const isHighConfidenceMatch = (
  matchSuggestion: MatchSuggestion | null | undefined
): boolean => {
  if (!matchSuggestion) return false;
  return matchSuggestion.confidence >= CONFIDENCE_LEVELS.HIGH;
};

/**
 * Get display color for confidence level
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= CONFIDENCE_LEVELS.HIGH) return "green";
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return "yellow";
  if (confidence >= CONFIDENCE_LEVELS.LOW) return "orange";
  return "gray";
};

/**
 * Get display label for confidence level
 */
export const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= CONFIDENCE_LEVELS.HIGH) return "High Confidence";
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) return "Medium Confidence";
  if (confidence >= CONFIDENCE_LEVELS.LOW) return "Possible Match";
  return "Low Confidence";
};

/**
 * Get color scheme for UI components based on confidence
 */
export const getConfidenceColorScheme = (confidence: number) => {
  if (confidence >= CONFIDENCE_LEVELS.HIGH) {
    return {
      border: "border-green-300",
      bgLight: "bg-green-50",
      textColor: "text-green-800",
      iconColor: "text-green-600",
      buttonBg: "bg-green-600 hover:bg-green-700",
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
    };
  }

  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) {
    return {
      border: "border-yellow-300",
      bgLight: "bg-yellow-50",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-600",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-800",
    };
  }

  return {
    border: "border-orange-300",
    bgLight: "bg-orange-50",
    textColor: "text-orange-800",
    iconColor: "text-orange-600",
    buttonBg: "bg-orange-600 hover:bg-orange-700",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
  };
};

/**
 * Get color for individual score indicators
 */
export const getScoreIndicatorColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

/**
 * Calculate differences between receipt and transaction data
 */
export const calculateDataDifferences = (
  receipt: Receipt,
  transaction: Transaction
): DataDifference[] => {
  const differences: DataDifference[] = [];

  const normalizedReceiptMerchant = normalizeMerchant(receipt.merchant);
  const normalizedTransactionMerchant = normalizeMerchant(
    transaction.description || transaction.category
  );

  if (normalizedReceiptMerchant !== normalizedTransactionMerchant) {
    differences.push({
      field: "merchant",
      label: "Merchant",
      receiptValue: receipt.merchant || "",
      transactionValue: transaction.description || transaction.category || "",
      normalizedReceipt: normalizedReceiptMerchant,
      normalizedTransaction: normalizedTransactionMerchant,
    });
  }

  const receiptAmount = Math.abs(parseFloat(String(receipt.amount || receipt.total)) || 0);
  const transactionAmount = Math.abs(parseFloat(String(transaction.amount)) || 0);

  if (Math.abs(receiptAmount - transactionAmount) > 0.01) {
    differences.push({
      field: "amount",
      label: "Amount",
      receiptValue: receiptAmount,
      transactionValue: transactionAmount,
      diff: Math.abs(receiptAmount - transactionAmount),
    });
  }

  const receiptDate = new Date(receipt.date || new Date());
  const transactionDate = new Date(transaction.date);
  receiptDate.setHours(0, 0, 0, 0);
  transactionDate.setHours(0, 0, 0, 0);

  if (receiptDate.getTime() !== transactionDate.getTime()) {
    differences.push({
      field: "date",
      label: "Date",
      receiptValue: receipt.date || "",
      transactionValue: transaction.date,
      daysDiff: Math.round(
        Math.abs(receiptDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
    });
  }

  return differences;
};

// All functions are already exported individually above
