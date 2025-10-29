import { describe, it, expect } from "vitest";
import {
  ACCOUNT_TYPES,
  ACCOUNT_COLORS,
  getAccountTypeInfo,
  formatAccountData,
  generateAccountId,
  createDefaultAccountForm,
  createDefaultTransferForm,
  formatCurrency,
  formatDate,
  createAccountTransaction,
  isValidAccountColor,
  getAccountIconName,
  calculateAccountUtilization,
  sortAccounts,
  filterAccounts,
} from "../accountHelpers";

describe("Account Helpers", () => {
  describe("ACCOUNT_TYPES", () => {
    it("should contain expected account types", () => {
      expect(ACCOUNT_TYPES).toHaveLength(8);
      expect(ACCOUNT_TYPES.map((t) => t.value)).toContain("FSA");
      expect(ACCOUNT_TYPES.map((t) => t.value)).toContain("HSA");
      expect(ACCOUNT_TYPES.map((t) => t.value)).toContain("Other");
    });

    it("should have required properties", () => {
      ACCOUNT_TYPES.forEach((type) => {
        expect(type).toHaveProperty("value");
        expect(type).toHaveProperty("label");
        expect(type).toHaveProperty("icon");
        expect(typeof type.value).toBe("string");
        expect(typeof type.label).toBe("string");
        expect(typeof type.icon).toBe("string");
      });
    });
  });

  describe("ACCOUNT_COLORS", () => {
    it("should contain valid hex colors", () => {
      expect(ACCOUNT_COLORS).toHaveLength(10);
      ACCOUNT_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("getAccountTypeInfo", () => {
    it("should return correct type info", () => {
      const fsaInfo = getAccountTypeInfo("FSA");
      expect(fsaInfo.value).toBe("FSA");
      expect(fsaInfo.label).toContain("Flexible Spending Account");
      expect(fsaInfo.icon).toBe("🏥");
    });

    it("should return Other for unknown type", () => {
      const unknownInfo = getAccountTypeInfo("UNKNOWN");
      expect(unknownInfo.value).toBe("Other");
      expect(unknownInfo.label).toContain("Other");
    });

    it("should return Other for null type", () => {
      const nullInfo = getAccountTypeInfo(null);
      expect(nullInfo.value).toBe("Other");
    });
  });

  describe("formatAccountData", () => {
    const mockUser = { userName: "John Doe" };
    const mockForm = {
      name: "  Health FSA  ",
      type: "FSA",
      currentBalance: "1500.50",
      annualContribution: "2000",
      expirationDate: "2024-12-31",
      description: "  Health savings  ",
      color: "#06b6d4",
      isActive: true,
    };

    it("should format account data correctly", () => {
      const result = formatAccountData(mockForm, mockUser);

      expect(result.name).toBe("Health FSA");
      expect(result.type).toBe("FSA");
      expect(result.currentBalance).toBe(1500.5);
      expect(result.annualContribution).toBe(2000);
      expect(result.expirationDate).toBe("2024-12-31");
      expect(result.description).toBe("Health savings");
      expect(result.color).toBe("#06b6d4");
      expect(result.isActive).toBe(true);
      expect(result.createdBy).toBe("John Doe");
      expect(result.transactions).toEqual([]);
    });

    it("should handle missing optional fields", () => {
      const minimalForm = {
        name: "Test Account",
        type: "FSA",
        currentBalance: "100",
        annualContribution: "",
        expirationDate: "",
        description: "",
        color: "#06b6d4",
        isActive: true,
      };

      const result = formatAccountData(minimalForm, mockUser);
      expect(result.annualContribution).toBe(0);
      expect(result.expirationDate).toBeNull();
      expect(result.description).toBeNull();
    });

    it("should include timestamps", () => {
      const result = formatAccountData(mockForm, mockUser);
      expect(result.createdAt).toBeDefined();
      expect(result.lastUpdated).toBeDefined();
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
    });
  });

  describe("generateAccountId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateAccountId();
      const id2 = generateAccountId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("number");
    });

    it("should generate timestamp-based IDs", () => {
      const id = generateAccountId();
      const now = Date.now();
      expect(id).toBeGreaterThan(now - 1000);
      expect(id).toBeLessThanOrEqual(now);
    });
  });

  describe("createDefaultAccountForm", () => {
    it("should create default form with correct properties", () => {
      const form = createDefaultAccountForm();

      expect(form.name).toBe("");
      expect(form.type).toBe("FSA");
      expect(form.currentBalance).toBe("");
      expect(form.annualContribution).toBe("");
      expect(form.expirationDate).toBe("");
      expect(form.description).toBe("");
      expect(form.color).toBe(ACCOUNT_COLORS[0]);
      expect(form.isActive).toBe(true);
    });
  });

  describe("createDefaultTransferForm", () => {
    it("should create default transfer form", () => {
      const form = createDefaultTransferForm();
      expect(form.envelopeId).toBe("");
      expect(form.amount).toBe("");
      expect(form.description).toBe("");
    });

    it("should include account name in description", () => {
      const form = createDefaultTransferForm("Health FSA");
      expect(form.description).toBe("Transfer from Health FSA");
    });
  });

  describe("formatCurrency", () => {
    it("should format positive amounts", () => {
      expect(formatCurrency(1234.56)).toBe("$1234.56");
      expect(formatCurrency(1000)).toBe("$1000.00");
    });

    it("should format zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("should handle no decimals option", () => {
      expect(formatCurrency(1234.56, false)).toBe("$1235");
      expect(formatCurrency(1234.23, false)).toBe("$1234");
    });

    it("should handle invalid inputs", () => {
      expect(formatCurrency(null)).toBe("$0.00");
      expect(formatCurrency(undefined)).toBe("$0.00");
      expect(formatCurrency(NaN)).toBe("$0.00");
      expect(formatCurrency("invalid")).toBe("$0.00");
    });
  });

  describe("formatDate", () => {
    it("should format valid dates", () => {
      const result = formatDate("2024-03-15");
      expect(result).toMatch(/Mar \d{1,2}, 2024/);
    });

    it("should handle empty dates", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate(null)).toBe("");
    });

    it("should handle invalid dates", () => {
      expect(formatDate("invalid-date")).toBe("Invalid Date");
    });

    it("should accept custom options", () => {
      const result = formatDate("2024-03-15", { year: "2-digit" });
      expect(result).toMatch(/Mar \d{1,2}, 24/);
    });
  });

  describe("createAccountTransaction", () => {
    it("should create transaction with required fields", () => {
      const transaction = createAccountTransaction({
        accountId: 123,
        type: "transfer_out",
        amount: 500,
        description: "Transfer to groceries",
      });

      expect(transaction.id).toBeDefined();
      expect(transaction.accountId).toBe(123);
      expect(transaction.type).toBe("transfer_out");
      expect(transaction.amount).toBe(500);
      expect(transaction.description).toBe("Transfer to groceries");
      expect(transaction.relatedEntityId).toBeNull();
      expect(transaction.metadata).toEqual({});
      expect(transaction.timestamp).toBeDefined();
    });

    it("should include optional fields", () => {
      const transaction = createAccountTransaction({
        accountId: 123,
        type: "transfer_out",
        amount: 500,
        description: "Transfer",
        relatedEntityId: "envelope-1",
        metadata: { category: "groceries" },
      });

      expect(transaction.relatedEntityId).toBe("envelope-1");
      expect(transaction.metadata).toEqual({ category: "groceries" });
    });
  });

  describe("isValidAccountColor", () => {
    it("should validate hex colors", () => {
      expect(isValidAccountColor("#ff0000")).toBe(true);
      expect(isValidAccountColor("#FF0000")).toBe(true);
      expect(isValidAccountColor("#f00")).toBe(true);
    });

    it("should reject invalid colors", () => {
      expect(isValidAccountColor("red")).toBe(false);
      expect(isValidAccountColor("#gggggg")).toBe(false);
      expect(isValidAccountColor("#12345")).toBe(false);
      expect(isValidAccountColor("")).toBe(false);
      expect(isValidAccountColor(null)).toBe(false);
    });
  });

  describe("getAccountIconName", () => {
    it("should return correct icon names", () => {
      expect(getAccountIconName("FSA")).toBe("Heart");
      expect(getAccountIconName("HSA")).toBe("Shield");
      expect(getAccountIconName("Gift Cards")).toBe("Gift");
      expect(getAccountIconName("Other")).toBe("CreditCard");
    });

    it("should return default for unknown types", () => {
      expect(getAccountIconName("UNKNOWN")).toBe("CreditCard");
    });
  });

  describe("calculateAccountUtilization", () => {
    it("should calculate utilization percentage", () => {
      expect(calculateAccountUtilization(500, 1000)).toBe(50);
      expect(calculateAccountUtilization(1000, 1000)).toBe(100);
      expect(calculateAccountUtilization(1500, 1000)).toBe(100); // Capped at 100
    });

    it("should handle edge cases", () => {
      expect(calculateAccountUtilization(0, 1000)).toBe(0);
      expect(calculateAccountUtilization(500, 0)).toBe(0);
      expect(calculateAccountUtilization(500, null)).toBe(0);
    });
  });

  describe("sortAccounts", () => {
    const mockAccounts = [
      {
        name: "Z Account",
        currentBalance: 100,
        type: "FSA",
        lastUpdated: "2024-01-01",
        isActive: true,
      },
      {
        name: "A Account",
        currentBalance: 500,
        type: "HSA",
        lastUpdated: "2024-01-02",
        isActive: true,
      },
      {
        name: "M Account",
        currentBalance: 300,
        type: "FSA",
        lastUpdated: "2024-01-03",
        isActive: true,
      },
    ];

    it("should sort by name", () => {
      const sorted = sortAccounts(mockAccounts, "name");
      expect(sorted[0].name).toBe("A Account");
      expect(sorted[2].name).toBe("Z Account");
    });

    it("should sort by balance (descending)", () => {
      const sorted = sortAccounts(mockAccounts, "balance");
      expect(sorted[0].currentBalance).toBe(500);
      expect(sorted[2].currentBalance).toBe(100);
    });

    it("should sort by type", () => {
      const sorted = sortAccounts(mockAccounts, "type");
      expect(sorted[0].type).toBe("FSA");
      expect(sorted[2].type).toBe("HSA");
    });

    it("should handle empty array", () => {
      expect(sortAccounts([])).toEqual([]);
    });

    it("should handle null input", () => {
      expect(sortAccounts(null)).toEqual([]);
    });
  });

  describe("filterAccounts", () => {
    const mockAccounts = [
      {
        id: 1,
        name: "Health FSA",
        type: "FSA",
        isActive: true,
        currentBalance: 500,
        lastUpdated: "2024-01-01",
      },
      {
        id: 2,
        name: "Savings HSA",
        type: "HSA",
        isActive: false,
        currentBalance: 1000,
        lastUpdated: "2024-01-02",
      },
      {
        id: 3,
        name: "Gift Cards",
        type: "Gift Cards",
        isActive: true,
        currentBalance: 50,
        lastUpdated: "2024-01-03",
      },
      {
        id: 4,
        name: "Old FSA",
        type: "FSA",
        isActive: true,
        currentBalance: 200,
        expirationDate: "2024-01-15",
        lastUpdated: "2024-01-04",
      },
    ];

    it("should filter active accounts only", () => {
      const filtered = filterAccounts(mockAccounts, { activeOnly: true });
      expect(filtered).toHaveLength(3);
      expect(filtered.every((acc) => acc.isActive)).toBe(true);
    });

    it("should filter by account type", () => {
      const filtered = filterAccounts(mockAccounts, { type: "FSA" });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((acc) => acc.type === "FSA")).toBe(true);
    });

    it("should filter by minimum balance", () => {
      const filtered = filterAccounts(mockAccounts, { minBalance: 300 });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((acc) => acc.currentBalance >= 300)).toBe(true);
    });

    it("should search by name", () => {
      const filtered = filterAccounts(mockAccounts, { search: "health" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Health FSA");
    });

    it("should combine multiple filters", () => {
      const filtered = filterAccounts(mockAccounts, {
        activeOnly: true,
        type: "FSA",
        minBalance: 300,
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Health FSA");
    });

    it("should handle empty array", () => {
      expect(filterAccounts([])).toEqual([]);
    });

    it("should handle null input", () => {
      expect(filterAccounts(null)).toEqual([]);
    });
  });
});
