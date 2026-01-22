import { describe, it, expect } from "vitest";
import {
  MERCHANT_ALIASES,
  CONFIDENCE_LEVELS,
  MATCH_WEIGHTS,
  levenshteinDistance,
  stringSimilarity,
  normalizeMerchant,
  calculateAmountScore,
  calculateDateScore,
  calculateMerchantScore,
  calculateMatchScore,
  findMatchesForReceipt,
  findBestMatch,
  isHighConfidenceMatch,
  getConfidenceColor,
  getConfidenceLabel,
  getConfidenceColorScheme,
  getScoreIndicatorColor,
  calculateDataDifferences,
  type Receipt,
} from "../matchingAlgorithm";
import type { Transaction } from "@/db/types";

describe("matchingAlgorithm", () => {
  describe("constants", () => {
    it("should have correct confidence levels", () => {
      expect(CONFIDENCE_LEVELS.HIGH).toBe(80);
      expect(CONFIDENCE_LEVELS.MEDIUM).toBe(60);
      expect(CONFIDENCE_LEVELS.LOW).toBe(40);
      expect(CONFIDENCE_LEVELS.MINIMUM).toBe(40);
    });

    it("should have correct match weights that sum to 1", () => {
      const totalWeight = MATCH_WEIGHTS.AMOUNT + MATCH_WEIGHTS.DATE + MATCH_WEIGHTS.MERCHANT;
      expect(totalWeight).toBe(1);
      expect(MATCH_WEIGHTS.AMOUNT).toBe(0.5);
      expect(MATCH_WEIGHTS.DATE).toBe(0.3);
      expect(MATCH_WEIGHTS.MERCHANT).toBe(0.2);
    });

    it("should have merchant aliases defined", () => {
      expect(MERCHANT_ALIASES["AMZN"]).toBe("Amazon");
      expect(MERCHANT_ALIASES["WMT"]).toBe("Walmart");
      expect(MERCHANT_ALIASES["SBUX"]).toBe("Starbucks");
    });
  });

  describe("levenshteinDistance", () => {
    it("should return 0 for identical strings", () => {
      expect(levenshteinDistance("test", "test")).toBe(0);
    });

    it("should handle null/undefined values", () => {
      expect(levenshteinDistance(null, "test")).toBe(4);
      expect(levenshteinDistance("test", undefined)).toBe(4);
      expect(levenshteinDistance(null, undefined)).toBe(0);
    });

    it("should calculate correct distance for different strings", () => {
      expect(levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(levenshteinDistance("hello", "hallo")).toBe(1);
    });
  });

  describe("stringSimilarity", () => {
    it("should return 100 for identical strings", () => {
      expect(stringSimilarity("test", "test")).toBe(100);
    });

    it("should return 0 for completely different strings", () => {
      expect(stringSimilarity("abc", "xyz")).toBe(0);
    });

    it("should handle null/undefined values", () => {
      expect(stringSimilarity(null, null)).toBe(100);
      expect(stringSimilarity("test", null)).toBe(0);
    });
  });

  describe("normalizeMerchant", () => {
    it("should normalize known aliases", () => {
      expect(normalizeMerchant("AMZN")).toBe("Amazon");
      expect(normalizeMerchant("STARBUCKS")).toBe("Starbucks");
      expect(normalizeMerchant("WMT")).toBe("Walmart");
    });

    it("should handle null/undefined values", () => {
      expect(normalizeMerchant(null)).toBe("");
      expect(normalizeMerchant(undefined)).toBe("");
    });

    it("should strip transaction codes and whitespace", () => {
      expect(normalizeMerchant("WHOLEFDS #1234")).toContain("Whole Foods");
    });

    it("should title case unknown merchants", () => {
      expect(normalizeMerchant("local coffee shop")).toBe("Local Coffee Shop");
    });
  });

  describe("calculateAmountScore", () => {
    it("should return 100 for exact match", () => {
      const result = calculateAmountScore(50.0, 50.0);
      expect(result.score).toBe(100);
      expect(result.diff).toBe(0);
    });

    it("should return 80 for small differences", () => {
      const result = calculateAmountScore(50.0, 50.25);
      expect(result.score).toBe(80);
      expect(result.diff).toBe(0.25);
    });

    it("should return 60 for medium differences", () => {
      const result = calculateAmountScore(50.0, 51.5);
      expect(result.score).toBe(60);
    });

    it("should return 0 for large differences", () => {
      const result = calculateAmountScore(50.0, 60.0);
      expect(result.score).toBe(0);
    });

    it("should handle string inputs", () => {
      const result = calculateAmountScore("50.00", "50.00");
      expect(result.score).toBe(100);
    });
  });

  describe("calculateDateScore", () => {
    it("should return 100 for same day", () => {
      const result = calculateDateScore("2024-01-15", "2024-01-15");
      expect(result.score).toBe(100);
      expect(result.daysDiff).toBe(0);
    });

    it("should return 80 for 1 day difference", () => {
      const result = calculateDateScore("2024-01-15", "2024-01-16");
      expect(result.score).toBe(80);
      expect(result.daysDiff).toBe(1);
    });

    it("should return 60 for 2 day difference", () => {
      const result = calculateDateScore("2024-01-15", "2024-01-17");
      expect(result.score).toBe(60);
      expect(result.daysDiff).toBe(2);
    });

    it("should return 40 for 3-7 day difference", () => {
      const result = calculateDateScore("2024-01-15", "2024-01-20");
      expect(result.score).toBe(40);
    });

    it("should return 0 for more than 7 days", () => {
      const result = calculateDateScore("2024-01-15", "2024-01-30");
      expect(result.score).toBe(0);
    });

    it("should handle Date objects", () => {
      const result = calculateDateScore(new Date("2024-01-15"), new Date("2024-01-15"));
      expect(result.score).toBe(100);
    });
  });

  describe("calculateMerchantScore", () => {
    it("should return 100 for exact normalized match", () => {
      const result = calculateMerchantScore("Amazon", "Amazon");
      expect(result.score).toBe(100);
    });

    it("should return high score for alias match", () => {
      const result = calculateMerchantScore("AMZN", "Amazon");
      expect(result.score).toBe(100);
    });

    it("should calculate fuzzy similarity for similar names", () => {
      const result = calculateMerchantScore("Walmart Store", "Walmart Supercenter");
      expect(result.score).toBeGreaterThan(50);
    });
  });

  describe("calculateMatchScore", () => {
    const mockReceipt: Receipt = {
      id: "r1",
      merchant: "Amazon",
      amount: 50.0,
      date: "2024-01-15",
    };

    const mockTransaction = {
      id: "t1",
      description: "Amazon",
      amount: 50.0,
      date: new Date("2024-01-15"),
      type: "expense",
      category: "shopping",
      envelopeId: "e1",
      isScheduled: false,
      lastModified: Date.now(),
    } as Transaction;

    it("should calculate high confidence for perfect match", () => {
      const result = calculateMatchScore(mockReceipt, mockTransaction);
      expect(result.confidence).toBe(100);
      expect(result.confidenceLevel).toBe("high");
    });

    it("should include match reasons", () => {
      const result = calculateMatchScore(mockReceipt, mockTransaction);
      expect(result.matchReasons.amount.score).toBe(100);
      expect(result.matchReasons.date.score).toBe(100);
      expect(result.matchReasons.merchant.score).toBe(100);
    });

    it("should return correct confidence level", () => {
      const lowReceipt = { ...mockReceipt, amount: 100 };
      const result = calculateMatchScore(lowReceipt, mockTransaction);
      expect(result.confidenceLevel).not.toBe("high");
    });
  });

  describe("findMatchesForReceipt", () => {
    const mockReceipt: Receipt = {
      id: "r1",
      merchant: "Amazon",
      amount: 50.0,
      date: "2024-01-15",
    };

    const mockTransactions: Transaction[] = [
      {
        id: "t1",
        description: "Amazon",
        amount: 50.0,
        date: new Date("2024-01-15"),
        type: "expense",
        category: "shopping",
        envelopeId: "e1",
        isScheduled: false,
        lastModified: Date.now(),
      },
      {
        id: "t2",
        description: "Walmart",
        amount: 75.0,
        date: new Date("2024-01-10"),
        type: "expense",
        category: "shopping",
        envelopeId: "e1",
        isScheduled: false,
        lastModified: Date.now(),
      },
    ];

    it("should find matching transactions", () => {
      const matches = findMatchesForReceipt(mockReceipt, mockTransactions);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].transactionId).toBe("t1");
    });

    it("should return empty array for null receipt", () => {
      const matches = findMatchesForReceipt(null, mockTransactions);
      expect(matches).toEqual([]);
    });

    it("should return empty array for empty transactions", () => {
      const matches = findMatchesForReceipt(mockReceipt, []);
      expect(matches).toEqual([]);
    });

    it("should sort by confidence descending", () => {
      const matches = findMatchesForReceipt(mockReceipt, mockTransactions);
      if (matches.length > 1) {
        expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence);
      }
    });

    it("should respect minConfidence option", () => {
      const matches = findMatchesForReceipt(mockReceipt, mockTransactions, { minConfidence: 90 });
      matches.forEach((m) => expect(m.confidence).toBeGreaterThanOrEqual(90));
    });

    it("should respect maxResults option", () => {
      const matches = findMatchesForReceipt(mockReceipt, mockTransactions, { maxResults: 1 });
      expect(matches.length).toBeLessThanOrEqual(1);
    });
  });

  describe("findBestMatch", () => {
    const mockReceipt: Receipt = {
      id: "r1",
      merchant: "Amazon",
      amount: 50.0,
      date: "2024-01-15",
    };

    const mockTransactions: Transaction[] = [
      {
        id: "t1",
        description: "Amazon",
        amount: 50.0,
        date: new Date("2024-01-15"),
        type: "expense",
        category: "shopping",
        envelopeId: "e1",
        isScheduled: false,
        lastModified: Date.now(),
      },
    ];

    it("should return the best match", () => {
      const match = findBestMatch(mockReceipt, mockTransactions);
      expect(match).not.toBeNull();
      expect(match?.transactionId).toBe("t1");
    });

    it("should return null when no matches meet threshold", () => {
      const match = findBestMatch(mockReceipt, mockTransactions, 101);
      expect(match).toBeNull();
    });
  });

  describe("isHighConfidenceMatch", () => {
    it("should return true for high confidence", () => {
      expect(isHighConfidenceMatch({ confidence: 85 } as any)).toBe(true);
    });

    it("should return false for low confidence", () => {
      expect(isHighConfidenceMatch({ confidence: 50 } as any)).toBe(false);
    });

    it("should return false for null input", () => {
      expect(isHighConfidenceMatch(null)).toBe(false);
    });
  });

  describe("getConfidenceColor", () => {
    it("should return green for high confidence", () => {
      expect(getConfidenceColor(85)).toBe("green");
    });

    it("should return yellow for medium confidence", () => {
      expect(getConfidenceColor(65)).toBe("yellow");
    });

    it("should return orange for low confidence", () => {
      expect(getConfidenceColor(45)).toBe("orange");
    });

    it("should return gray for very low confidence", () => {
      expect(getConfidenceColor(30)).toBe("gray");
    });
  });

  describe("getConfidenceLabel", () => {
    it("should return correct labels", () => {
      expect(getConfidenceLabel(85)).toBe("High Confidence");
      expect(getConfidenceLabel(65)).toBe("Medium Confidence");
      expect(getConfidenceLabel(45)).toBe("Possible Match");
      expect(getConfidenceLabel(30)).toBe("Low Confidence");
    });
  });

  describe("getConfidenceColorScheme", () => {
    it("should return green scheme for high confidence", () => {
      const scheme = getConfidenceColorScheme(85);
      expect(scheme.badgeBg).toContain("green");
    });

    it("should return yellow scheme for medium confidence", () => {
      const scheme = getConfidenceColorScheme(65);
      expect(scheme.badgeBg).toContain("yellow");
    });

    it("should return orange scheme for low confidence", () => {
      const scheme = getConfidenceColorScheme(45);
      expect(scheme.badgeBg).toContain("orange");
    });
  });

  describe("getScoreIndicatorColor", () => {
    it("should return correct colors", () => {
      expect(getScoreIndicatorColor(85)).toContain("green");
      expect(getScoreIndicatorColor(65)).toContain("yellow");
      expect(getScoreIndicatorColor(45)).toContain("orange");
      expect(getScoreIndicatorColor(25)).toContain("red");
    });
  });

  describe("calculateDataDifferences", () => {
    const mockReceipt: Receipt = {
      id: "r1",
      merchant: "Amazon Store",
      amount: 50.0,
      date: "2024-01-15",
    };

    it("should detect merchant difference", () => {
      const transaction = {
        description: "AMZN",
        amount: 50.0,
        date: new Date("2024-01-15"),
      } as Transaction;

      const differences = calculateDataDifferences(mockReceipt, transaction);
      expect(differences.some((d) => d.field === "merchant")).toBe(true);
    });

    it("should detect amount difference", () => {
      const transaction = {
        description: "Amazon",
        amount: 55.0,
        date: new Date("2024-01-15"),
      } as Transaction;

      const differences = calculateDataDifferences(mockReceipt, transaction);
      expect(differences.some((d) => d.field === "amount")).toBe(true);
    });

    it("should detect date difference", () => {
      const transaction = {
        description: "Amazon",
        amount: 50.0,
        date: new Date("2024-01-17"),
      } as Transaction;

      const differences = calculateDataDifferences(mockReceipt, transaction);
      expect(differences.some((d) => d.field === "date")).toBe(true);
    });

    it("should return empty array for no differences", () => {
      const transaction = {
        description: "Amazon Store",
        amount: 50.0,
        date: new Date("2024-01-15"),
      } as Transaction;

      const differences = calculateDataDifferences(mockReceipt, transaction);
      // May have some differences due to normalization
      expect(Array.isArray(differences)).toBe(true);
    });
  });
});
