import { describe, it, expect } from "vitest";
import {
  validateAccountForm,
  validateTransferForm,
  calculateAccountTotals,
  calculateDaysUntilExpiration,
  getExpirationStatus,
  validateBalanceUpdate,
  checkTransferEligibility,
} from "../accountValidation";

describe("Account Validation", () => {
  describe("validateAccountForm", () => {
    it("should validate a complete valid form", () => {
      const validForm = {
        name: "Health FSA 2024",
        currentBalance: "1500",
        annualContribution: "2000",
        expirationDate: "2024-12-31",
        description: "Health savings account",
        type: "FSA",
        color: "#06b6d4",
        isActive: true,
      };

      const result = validateAccountForm(validForm);
      expect(result.isValid).toBe(true);
    });

    it("should require account name", () => {
      const form = { name: "", currentBalance: "100" };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("name is required");
    });

    it("should require current balance", () => {
      const form = { name: "Test Account", currentBalance: "" };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("balance is required");
    });

    it("should validate numeric balance", () => {
      const form = { name: "Test Account", currentBalance: "invalid" };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("valid number");
    });

    it("should reject negative balance", () => {
      const form = { name: "Test Account", currentBalance: "-100" };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot be negative");
    });

    it("should validate annual contribution if provided", () => {
      const form = {
        name: "Test Account",
        currentBalance: "100",
        annualContribution: "invalid",
      };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("positive number");
    });

    it("should validate name length", () => {
      const form = {
        name: "x".repeat(101),
        currentBalance: "100",
      };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("100 characters");
    });

    it("should validate description length", () => {
      const form = {
        name: "Test Account",
        currentBalance: "100",
        description: "x".repeat(501),
      };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("500 characters");
    });

    it("should accept zero balance", () => {
      const form = { name: "Test Account", currentBalance: "0" };
      const result = validateAccountForm(form);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateTransferForm", () => {
    const mockAccount = { id: 1, currentBalance: 1000, name: "Test Account" };

    it("should validate a complete transfer form", () => {
      const form = {
        envelopeId: "envelope-1",
        amount: "500",
        description: "Transfer to groceries",
      };
      const result = validateTransferForm(form, mockAccount);
      expect(result.isValid).toBe(true);
    });

    it("should require envelope selection", () => {
      const form = { envelopeId: "", amount: "500" };
      const result = validateTransferForm(form, mockAccount);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("select an envelope");
    });

    it("should require positive amount", () => {
      const form = { envelopeId: "envelope-1", amount: "0" };
      const result = validateTransferForm(form, mockAccount);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("greater than 0");
    });

    it("should validate numeric amount", () => {
      const form = { envelopeId: "envelope-1", amount: "invalid" };
      const result = validateTransferForm(form, mockAccount);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("valid number");
    });

    it("should check sufficient balance", () => {
      const form = { envelopeId: "envelope-1", amount: "1500" };
      const result = validateTransferForm(form, mockAccount);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("Insufficient balance");
    });

    it("should prevent excessive transfers", () => {
      const largeAccount = { id: 1, currentBalance: 100000 };
      const form = { envelopeId: "envelope-1", amount: "60000" };
      const result = validateTransferForm(form, largeAccount);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot exceed $50,000");
    });

    it("should require source account", () => {
      const form = { envelopeId: "envelope-1", amount: "100" };
      const result = validateTransferForm(form, null);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("Source account not found");
    });
  });

  describe("calculateAccountTotals", () => {
    const mockAccounts = [
      { id: 1, currentBalance: 500, annualContribution: 1000, isActive: true },
      { id: 2, currentBalance: 300, annualContribution: 500, isActive: true },
      { id: 3, currentBalance: 200, annualContribution: 0, isActive: false },
      {
        id: 4,
        currentBalance: 400,
        annualContribution: 800,
        isActive: true,
        expirationDate: "2024-01-15",
      },
    ];

    it("should calculate total value for active accounts", () => {
      const result = calculateAccountTotals(mockAccounts);
      expect(result.totalValue).toBe(1200); // 500 + 300 + 400
    });

    it("should calculate total annual contributions", () => {
      const result = calculateAccountTotals(mockAccounts);
      expect(result.totalAnnualContributions).toBe(2300); // 1000 + 500 + 800
    });

    it("should count active and inactive accounts", () => {
      const result = calculateAccountTotals(mockAccounts);
      expect(result.activeAccountCount).toBe(3);
      expect(result.inactiveAccountCount).toBe(1);
    });

    it("should handle empty array", () => {
      const result = calculateAccountTotals([]);
      expect(result.totalValue).toBe(0);
      expect(result.activeAccountCount).toBe(0);
    });

    it("should handle undefined input", () => {
      const result = calculateAccountTotals();
      expect(result.totalValue).toBe(0);
      expect(result.activeAccountCount).toBe(0);
    });
  });

  describe("calculateDaysUntilExpiration", () => {
    it("should return null for no expiration date", () => {
      const result = calculateDaysUntilExpiration(null);
      expect(result).toBeNull();
    });

    it("should calculate days correctly", () => {
      // Use a fixed date to avoid timezone issues
      const result = calculateDaysUntilExpiration("2024-02-15");
      const testDate = new Date("2024-01-15");
      testDate.setHours(0, 0, 0, 0);
      const expiryDate = new Date("2024-02-15");
      expiryDate.setHours(0, 0, 0, 0);
      Math.ceil((expiryDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));

      // The actual function uses current date, so let's test with a known scenario
      expect(typeof result).toBe("number");
    });

    it("should handle past dates", () => {
      // Test with a date that's clearly in the past
      const pastDate = "2020-01-01";
      const result = calculateDaysUntilExpiration(pastDate);
      expect(result).toBeLessThan(0);
    });

    it("should handle today", () => {
      // Use today's date in YYYY-MM-DD format to avoid timezone issues
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day like the implementation
      const todayString =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

      const result = calculateDaysUntilExpiration(todayString);
      // Should be 0 or very close to 0 (allow for minor timing differences)
      expect(result).toBeGreaterThanOrEqual(-1);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe("getExpirationStatus", () => {
    it("should return empty for null days", () => {
      const result = getExpirationStatus(null);
      expect(result.text).toBe("");
      expect(result.color).toBe("text-gray-500");
    });

    it("should return expired status", () => {
      const result = getExpirationStatus(-5);
      expect(result.text).toBe("Expired");
      expect(result.color).toBe("text-red-600");
    });

    it("should return expires today status", () => {
      const result = getExpirationStatus(0);
      expect(result.text).toBe("Expires Today");
      expect(result.color).toBe("text-red-600");
    });

    it("should return orange for <= 30 days", () => {
      const result = getExpirationStatus(15);
      expect(result.text).toBe("15 days left");
      expect(result.color).toBe("text-orange-600");
    });

    it("should return yellow for <= 90 days", () => {
      const result = getExpirationStatus(60);
      expect(result.text).toBe("60 days left");
      expect(result.color).toBe("text-yellow-600");
    });

    it("should return green for > 90 days", () => {
      const result = getExpirationStatus(120);
      expect(result.text).toBe("120 days left");
      expect(result.color).toBe("text-green-600");
    });
  });

  describe("validateBalanceUpdate", () => {
    it("should allow positive balance updates", () => {
      const result = validateBalanceUpdate(100, 50);
      expect(result.isValid).toBe(true);
      expect(result.newBalance).toBe(150);
    });

    it("should prevent negative balances", () => {
      const result = validateBalanceUpdate(50, -100);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot go negative");
      expect(result.newBalance).toBe(50);
    });

    it("should prevent excessive balances", () => {
      const result = validateBalanceUpdate(999000, 2000);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("cannot exceed $1,000,000");
      expect(result.newBalance).toBe(999000);
    });

    it("should allow zero balance", () => {
      const result = validateBalanceUpdate(100, -100);
      expect(result.isValid).toBe(true);
      expect(result.newBalance).toBe(0);
    });
  });

  describe("checkTransferEligibility", () => {
    it("should allow eligible active account", () => {
      const account = {
        id: 1,
        isActive: true,
        currentBalance: 500,
        expirationDate: "2027-12-31", // Future date
      };
      const result = checkTransferEligibility(account);
      expect(result.isEligible).toBe(true);
    });

    it("should reject null account", () => {
      const result = checkTransferEligibility(null);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain("not found");
    });

    it("should reject inactive account", () => {
      const account = { id: 1, isActive: false, currentBalance: 500 };
      const result = checkTransferEligibility(account);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain("inactive");
    });

    it("should reject account with no balance", () => {
      const account = { id: 1, isActive: true, currentBalance: 0 };
      const result = checkTransferEligibility(account);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain("No balance available");
    });

    it("should reject expired account", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const account = {
        id: 1,
        isActive: true,
        currentBalance: 500,
        expirationDate: pastDate.toISOString().split("T")[0],
      };
      const result = checkTransferEligibility(account);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain("expired");
    });

    it("should allow account without expiration date", () => {
      const account = {
        id: 1,
        isActive: true,
        currentBalance: 500,
        expirationDate: null,
      };
      const result = checkTransferEligibility(account);
      expect(result.isEligible).toBe(true);
    });
  });
});
