import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  renderConfidenceIndicator,
  formatFileSize,
  hasMinimumExtractedData,
  validateReceiptData,
  validateTransactionForm,
  formatCurrency,
  formatDisplayDate,
  getConfidenceDescription,
  getConfidenceColor,
  extractReceiptSummary,
  generateReceiptReference,
  getReceiptFormChanges,
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

  describe("validateTransactionForm", () => {
    it("should validate complete form data", () => {
      const validForm = {
        description: "Test Store",
        amount: 25.99,
        date: "2024-01-01",
        envelopeId: "env-123",
      };

      const result = validateTransactionForm(validForm);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject form without description", () => {
      const invalidForm = {
        description: "",
        amount: 25.99,
        date: "2024-01-01",
        envelopeId: "env-123",
      };

      const result = validateTransactionForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Description is required");
    });

    it("should reject form with invalid amount", () => {
      const invalidForm = {
        description: "Test Store",
        amount: 0,
        date: "2024-01-01",
        envelopeId: "env-123",
      };

      const result = validateTransactionForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid amount is required");
    });

    it("should reject form with invalid date", () => {
      const invalidForm = {
        description: "Test Store",
        amount: 25.99,
        date: "01/01/2024",
        envelopeId: "env-123",
      };

      const result = validateTransactionForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid date is required");
    });

    it("should reject form without envelope", () => {
      const invalidForm = {
        description: "Test Store",
        amount: 25.99,
        date: "2024-01-01",
        envelopeId: "",
      };

      const result = validateTransactionForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Envelope selection is required");
    });
  });

  describe("formatDisplayDate", () => {
    it("should format valid date strings", () => {
      const result = formatDisplayDate("2024-01-15");
      expect(result).toBe("Jan 15, 2024");
    });

    it("should handle empty string", () => {
      const result = formatDisplayDate("");
      expect(result).toBe("No date");
    });

    it("should handle invalid date strings", () => {
      const result = formatDisplayDate("invalid-date");
      expect(result).toBe("invalid-date");
    });

    it("should handle truly malformed date inputs", () => {
      // These will create Invalid Date objects that throw when formatted
      expect(formatDisplayDate("not-a-date-at-all")).toBe("not-a-date-at-all");
      expect(formatDisplayDate("2024-13-45")).toBe("2024-13-45");
    });

    it("should format different months correctly", () => {
      expect(formatDisplayDate("2024-12-25")).toBe("Dec 25, 2024");
      expect(formatDisplayDate("2024-06-01")).toBe("Jun 1, 2024");
    });
  });

  describe("getConfidenceDescription", () => {
    it("should return Very High for confidence >= 0.9", () => {
      expect(getConfidenceDescription(0.9)).toBe("Very High");
      expect(getConfidenceDescription(1.0)).toBe("Very High");
    });

    it("should return High for confidence >= 0.8", () => {
      expect(getConfidenceDescription(0.8)).toBe("High");
      expect(getConfidenceDescription(0.85)).toBe("High");
    });

    it("should return Medium for confidence >= 0.6", () => {
      expect(getConfidenceDescription(0.6)).toBe("Medium");
      expect(getConfidenceDescription(0.7)).toBe("Medium");
    });

    it("should return Low for confidence >= 0.4", () => {
      expect(getConfidenceDescription(0.4)).toBe("Low");
      expect(getConfidenceDescription(0.5)).toBe("Low");
    });

    it("should return Very Low for confidence < 0.4", () => {
      expect(getConfidenceDescription(0.3)).toBe("Very Low");
      expect(getConfidenceDescription(0.1)).toBe("Very Low");
      expect(getConfidenceDescription(0)).toBe("Very Low");
    });

    it("should handle invalid inputs", () => {
      expect(getConfidenceDescription(NaN)).toBe("Unknown");
      expect(getConfidenceDescription(null)).toBe("Unknown");
      expect(getConfidenceDescription(undefined)).toBe("Unknown");
    });
  });

  describe("getConfidenceColor", () => {
    it("should return green for confidence >= 0.8", () => {
      expect(getConfidenceColor(0.8)).toBe("green");
      expect(getConfidenceColor(1.0)).toBe("green");
    });

    it("should return yellow for confidence >= 0.6", () => {
      expect(getConfidenceColor(0.6)).toBe("yellow");
      expect(getConfidenceColor(0.7)).toBe("yellow");
    });

    it("should return red for confidence < 0.6", () => {
      expect(getConfidenceColor(0.5)).toBe("red");
      expect(getConfidenceColor(0.1)).toBe("red");
      expect(getConfidenceColor(0)).toBe("red");
    });

    it("should return gray for invalid inputs", () => {
      expect(getConfidenceColor(NaN)).toBe("gray");
      expect(getConfidenceColor(null)).toBe("gray");
      expect(getConfidenceColor(undefined)).toBe("gray");
    });
  });

  describe("extractReceiptSummary", () => {
    it("should extract all data from complete receipt", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 99.99,
        date: "2024-01-15",
        items: [{ name: "Item 1" }, { name: "Item 2" }],
        subtotal: 89.99,
        tax: 10.0,
        confidence: 0.95,
        processingTime: 1500,
      };

      const summary = extractReceiptSummary(receiptData);

      expect(summary.merchant).toBe("Test Store");
      expect(summary.total).toBe(99.99);
      expect(summary.date).toBe("2024-01-15");
      expect(summary.itemCount).toBe(2);
      expect(summary.hasSubtotal).toBe(true);
      expect(summary.hasTax).toBe(true);
      expect(summary.confidence).toBe(0.95);
      expect(summary.processingTime).toBe(1500);
    });

    it("should use defaults for missing data", () => {
      const receiptData = {};

      const summary = extractReceiptSummary(receiptData);

      expect(summary.merchant).toBe("Unknown Merchant");
      expect(summary.total).toBe(0);
      expect(summary.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Should be today's date
      expect(summary.itemCount).toBe(0);
      expect(summary.hasSubtotal).toBe(false);
      expect(summary.hasTax).toBe(false);
      expect(summary.confidence).toBe(0);
      expect(summary.processingTime).toBe(0);
    });

    it("should handle non-array items", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        items: "not an array",
      };

      const summary = extractReceiptSummary(receiptData);

      expect(summary.itemCount).toBe(0);
    });
  });

  describe("generateReceiptReference", () => {
    it("should generate reference with correct format", () => {
      const ref = generateReceiptReference("Test Store", "2024-01-15", 99.99);

      expect(ref).toMatch(/^TES-240115-\d+$/);
    });

    it("should handle merchant names shorter than 3 characters", () => {
      const ref = generateReceiptReference("AB", "2024-01-15", 50.0);

      expect(ref).toMatch(/^AB-240115-\d+$/);
    });

    it("should convert amount to cents and pad", () => {
      const ref1 = generateReceiptReference("Store", "2024-01-15", 9.99);
      expect(ref1).toContain("-0999");

      const ref2 = generateReceiptReference("Store", "2024-01-15", 1.5);
      expect(ref2).toContain("-0150");

      const ref3 = generateReceiptReference("Store", "2024-01-15", 123.45);
      expect(ref3).toContain("-12345");
    });

    it("should handle missing merchant", () => {
      const ref = generateReceiptReference("", "2024-01-15", 50.0);

      expect(ref).toMatch(/^RCP-240115-\d+$/);
    });

    it("should handle missing or invalid date", () => {
      const ref = generateReceiptReference("Store", "", 50.0);

      // Should use today's date
      expect(ref).toMatch(/^STO-\d{6}-\d+$/);
    });
  });

  describe("getReceiptFormChanges", () => {
    it("should detect description change", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        date: "2024-01-15",
      };

      const form = {
        description: "Modified Store",
        amount: 50.0,
        date: "2024-01-15",
      };

      const changes = getReceiptFormChanges(receiptData, form);

      expect(changes).toHaveLength(1);
      expect(changes[0].field).toBe("description");
      expect(changes[0].original).toBe("Test Store");
      expect(changes[0].updated).toBe("Modified Store");
    });

    it("should detect amount change", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        date: "2024-01-15",
      };

      const form = {
        description: "Test Store",
        amount: 55.0,
        date: "2024-01-15",
      };

      const changes = getReceiptFormChanges(receiptData, form);

      expect(changes).toHaveLength(1);
      expect(changes[0].field).toBe("amount");
      expect(changes[0].original).toBe(50.0);
      expect(changes[0].updated).toBe(55.0);
    });

    it("should detect date change", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        date: "2024-01-15",
      };

      const form = {
        description: "Test Store",
        amount: 50.0,
        date: "2024-01-16",
      };

      const changes = getReceiptFormChanges(receiptData, form);

      expect(changes).toHaveLength(1);
      expect(changes[0].field).toBe("date");
      expect(changes[0].original).toBe("2024-01-15");
      expect(changes[0].updated).toBe("2024-01-16");
    });

    it("should detect multiple changes", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        date: "2024-01-15",
      };

      const form = {
        description: "Modified Store",
        amount: 55.0,
        date: "2024-01-16",
      };

      const changes = getReceiptFormChanges(receiptData, form);

      expect(changes).toHaveLength(3);
    });

    it("should return empty array when no changes", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        date: "2024-01-15",
      };

      const form = {
        description: "Test Store",
        amount: 50.0,
        date: "2024-01-15",
      };

      const changes = getReceiptFormChanges(receiptData, form);

      expect(changes).toHaveLength(0);
    });

    it("should ignore small amount differences (< 0.01)", () => {
      const receiptData = {
        merchant: "Test Store",
        total: 50.0,
        date: "2024-01-15",
      };

      const form = {
        description: "Test Store",
        amount: 50.005,
        date: "2024-01-15",
      };

      const changes = getReceiptFormChanges(receiptData, form);

      expect(changes).toHaveLength(0);
    });
  });
});
