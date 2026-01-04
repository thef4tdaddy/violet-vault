import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  renderConfidenceIndicator,
  formatFileSize,
  hasMinimumExtractedData,
  validateReceiptData,
  formatCurrency,
  isReceiptDataComplete,
} from "../receiptHelpers";

describe("receiptHelpers", () => {
  describe("renderConfidenceIndicator", () => {
    it("should render high confidence indicator", () => {
      const result = render(renderConfidenceIndicator("merchant", "high"));
      const icon = result.container.querySelector("svg");
      expect(icon).toHaveClass("text-green-600");
    });

    it("should render medium confidence indicator", () => {
      const result = render(renderConfidenceIndicator("total", "medium"));
      const icon = result.container.querySelector("svg");
      expect(icon).toHaveClass("text-yellow-600");
    });

    it("should render low confidence indicator", () => {
      const result = render(renderConfidenceIndicator("date", "low"));
      const icon = result.container.querySelector("svg");
      expect(icon).toHaveClass("text-red-600");
    });

    it("should render default confidence indicator for unknown values", () => {
      const result = render(renderConfidenceIndicator("field", "unknown"));
      const icon = result.container.querySelector("svg");
      expect(icon).toHaveClass("text-gray-400");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes to KB correctly", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(2048)).toBe("2 KB");
      expect(formatFileSize(1536)).toBe("2 KB"); // Rounds up
      expect(formatFileSize(512)).toBe("512 Bytes"); // Less than 1 KB stays as Bytes
    });
  });

  describe("hasMinimumExtractedData", () => {
    it("should return true when total exists", () => {
      const data = { total: 25.99 };
      expect(hasMinimumExtractedData(data)).toBe(true);
    });

    it("should return true when merchant exists", () => {
      const data = { merchant: "Test Store" };
      expect(hasMinimumExtractedData(data)).toBe(true);
    });

    it("should return true when both exist", () => {
      const data = { merchant: "Test Store", total: 25.99 };
      expect(hasMinimumExtractedData(data)).toBe(true);
    });

    it("should return false when neither exists", () => {
      const data = { date: "2024-01-01" };
      expect(hasMinimumExtractedData(data)).toBe(false);
    });

    it("should return false when data is null", () => {
      expect(hasMinimumExtractedData(null)).toBe(false);
    });
  });

  describe("validateReceiptData", () => {
    it("should validate complete receipt data", () => {
      const validData = {
        merchant: "Test Store",
        total: 25.99,
        date: "2024-01-01",
      };

      const result = validateReceiptData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject data without merchant", () => {
      const invalidData = {
        total: 25.99,
        date: "2024-01-01",
      };

      const result = validateReceiptData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Merchant name is required");
    });

    it("should reject data with invalid total", () => {
      const invalidData = {
        merchant: "Test Store",
        total: "invalid",
        date: "2024-01-01",
      };

      const result = validateReceiptData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid total amount is required");
    });

    it("should reject data with invalid date format", () => {
      const invalidData = {
        merchant: "Test Store",
        total: 25.99,
        date: "01/01/2024",
      };

      const result = validateReceiptData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid date in YYYY-MM-DD format is required");
    });
  });

  describe("formatCurrency", () => {
    it("should format positive amounts correctly", () => {
      expect(formatCurrency(25.99)).toBe("$25.99");
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(0.01)).toBe("$0.01");
    });

    it("should format negative amounts as positive", () => {
      expect(formatCurrency(-25.99)).toBe("$25.99");
    });

    it("should handle invalid inputs", () => {
      expect(formatCurrency(null)).toBe("$0.00");
      expect(formatCurrency(undefined)).toBe("$0.00");
      expect(formatCurrency("invalid")).toBe("$0.00");
    });
  });

  describe("isReceiptDataComplete", () => {
    it("should return true for complete data", () => {
      const completeData = {
        merchant: "Test Store",
        total: 25.99,
        date: "2024-01-01",
      };

      expect(isReceiptDataComplete(completeData)).toBe(true);
    });

    it("should return false for incomplete data", () => {
      const incompleteData = {
        merchant: "Test Store",
        total: 0,
        date: "2024-01-01",
      };

      expect(isReceiptDataComplete(incompleteData)).toBe(false);
    });

    it("should return false for null data", () => {
      expect(isReceiptDataComplete(null)).toBe(false);
    });
  });
});
