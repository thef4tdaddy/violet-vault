/**
 * TypeScript-driven tests for accountHelpers
 * Testing edge cases and type safety revealed by TypeScript conversion
 */
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
  type AccountType,
  type User,
  type AccountForm,
  type FormattedAccount,
  type Transaction,
  type FilterCriteria,
} from "../accountHelpers";

describe("accountHelpers - Type Safety & Edge Cases", () => {
  describe("Type Definitions", () => {
    it("should have properly typed ACCOUNT_TYPES", () => {
      ACCOUNT_TYPES.forEach((type: AccountType) => {
        expect(type).toHaveProperty("value");
        expect(type).toHaveProperty("label");
        expect(type).toHaveProperty("icon");
        expect(typeof type.value).toBe("string");
        expect(typeof type.label).toBe("string");
        expect(typeof type.icon).toBe("string");
      });
    });

    it("should have properly typed ACCOUNT_COLORS", () => {
      ACCOUNT_COLORS.forEach((color: string) => {
        expect(typeof color).toBe("string");
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe("getAccountTypeInfo - Type Safety", () => {
    it("should always return a valid AccountType", () => {
      const validTypes = ACCOUNT_TYPES.map(t => t.value);
      
      validTypes.forEach(type => {
        const result = getAccountTypeInfo(type);
        expect(result).toHaveProperty("value");
        expect(result).toHaveProperty("label");
        expect(result).toHaveProperty("icon");
      });
    });

    it("should handle invalid types by returning 'Other'", () => {
      const invalidTypes = ["", "INVALID", "null", "undefined", "123"];
      
      invalidTypes.forEach(type => {
        const result = getAccountTypeInfo(type);
        expect(result.value).toBe("Other");
      });
    });

    it("should handle edge case strings", () => {
      const edgeCases = [
        "   FSA   ", // whitespace - won't match, should return Other
        "fsa", // wrong case - won't match, should return Other
        "FSA\n", // with newline - won't match, should return Other
      ];
      
      edgeCases.forEach(type => {
        const result = getAccountTypeInfo(type);
        // These should all return "Other" since they don't exactly match
        expect(result.value).toBe("Other");
      });
    });
  });

  describe("formatAccountData - Type Safety", () => {
    const mockUser: User = {
      displayName: "Test User",
      email: "test@example.com",
      uid: "test-uid"
    };

    it("should handle various AccountForm input types", () => {
      const testForms: AccountForm[] = [
        {
          name: "Test Account",
          type: "FSA",
          currentBalance: "100.50",
          annualContribution: "2000",
          expirationDate: "2024-12-31",
          description: "Test description",
          color: "#06b6d4",
          isActive: true
        },
        {
          name: "Numeric Balance Account",
          type: "HSA",
          currentBalance: 150.75,
          annualContribution: 3000,
          color: "#10b981",
          isActive: false
        },
        {
          name: "Minimal Account",
          type: "Other",
          currentBalance: 0,
          color: "#8b5cf6",
          isActive: true
        }
      ];

      testForms.forEach(form => {
        const result = formatAccountData(form, mockUser);
        
        expect(typeof result.id).toBe("string");
        expect(typeof result.name).toBe("string");
        expect(typeof result.currentBalance).toBe("number");
        expect(typeof result.annualContribution).toBe("number");
        expect(typeof result.isActive).toBe("boolean");
        expect(Array.isArray(result.transactions)).toBe(true);
        expect(result.createdBy).toBe(mockUser.displayName);
      });
    });

    it("should handle edge case numeric conversions", () => {
      const edgeCaseForm: AccountForm = {
        name: "Edge Case Account",
        type: "FSA",
        currentBalance: "invalid_number",
        annualContribution: "NaN",
        color: "#06b6d4",
        isActive: true
      };

      const result = formatAccountData(edgeCaseForm, mockUser);
      expect(result.currentBalance).toBe(0);
      expect(result.annualContribution).toBe(0);
    });

    it("should handle various User object shapes", () => {
      const userVariants: User[] = [
        { displayName: "Display Name User" },
        { email: "email@example.com" },
        { uid: "uid-only" },
        { displayName: "", email: "fallback@example.com" },
        {}, // empty user object
      ];

      const testForm: AccountForm = {
        name: "Test",
        type: "FSA",
        currentBalance: 100,
        color: "#06b6d4",
        isActive: true
      };

      userVariants.forEach(user => {
        const result = formatAccountData(testForm, user);
        expect(typeof result.createdBy).toBe("string");
        expect(result.createdBy.length).toBeGreaterThan(0);
      });
    });
  });

  describe("formatCurrency - Type Safety", () => {
    it("should handle various numeric types", () => {
      const testCases: Array<[number, boolean, string]> = [
        [100.555, true, "$100.56"],
        [100.555, false, "$101"],
        [0, true, "$0.00"],
        [0.001, true, "$0.00"],
        [-50.75, true, "$-50.75"],
        [Infinity, false, "$0.00"], // Should handle as NaN case
        [-Infinity, false, "$0.00"], // Should handle as NaN case
      ];

      testCases.forEach(([amount, showDecimals, expected]) => {
        const result = formatCurrency(amount, showDecimals);
        if (amount === Infinity || amount === -Infinity) {
          expect(result).toBe("$0.00"); // NaN handling
        } else {
          expect(result).toBe(expected);
        }
      });
    });

    it("should handle NaN values", () => {
      expect(formatCurrency(NaN)).toBe("$0.00");
      expect(formatCurrency(NaN, false)).toBe("$0.00");
    });
  });

  describe("formatDate - Type Safety", () => {
    it("should handle various date string formats", () => {
      const testCases: Array<[string, Intl.DateTimeFormatOptions, string]> = [
        ["2024-01-15", {}, "Jan 15, 2024"],
        ["2024-12-31T23:59:59Z", {}, "Dec 31, 2024"],
        ["", {}, ""],
        ["invalid-date", {}, "Invalid Date"],
      ];

      testCases.forEach(([dateString, options, expected]) => {
        const result = formatDate(dateString, options);
        expect(result).toBe(expected);
      });
    });

    it("should handle custom formatting options", () => {
      const date = "2024-01-15";
      const customOptions: Intl.DateTimeFormatOptions = {
        year: "2-digit",
        month: "long",
        day: "2-digit"
      };
      
      const result = formatDate(date, customOptions);
      expect(result).toContain("January");
      expect(result).toContain("24"); // 2-digit year
    });
  });

  describe("createAccountTransaction - Type Safety", () => {
    it("should create properly typed Transaction objects", () => {
      const transactionParams = {
        accountId: "account-123",
        type: "transfer_out",
        amount: 50.00,
        description: "Test transaction",
        relatedEntityId: "envelope-456",
        metadata: { category: "food", source: "test" }
      };

      const result = createAccountTransaction(transactionParams);

      expect(typeof result.id).toBe("string");
      expect(result.accountId).toBe("account-123");
      expect(result.type).toBe("transfer_out");
      expect(result.amount).toBe(50.00);
      expect(result.description).toBe("Test transaction");
      expect(result.relatedEntityId).toBe("envelope-456");
      expect(result.metadata).toEqual({ category: "food", source: "test" });
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should handle optional parameters", () => {
      const minimalParams = {
        accountId: 123,
        type: "adjustment",
        amount: 25.50,
        description: "Minimal transaction"
      };

      const result = createAccountTransaction(minimalParams);
      expect(result.relatedEntityId).toBeNull();
      expect(result.metadata).toEqual({});
    });
  });

  describe("calculateAccountUtilization - Type Safety", () => {
    it("should handle various numeric combinations", () => {
      const testCases: Array<[number, number, number]> = [
        [500, 2000, 25], // Normal case
        [2000, 2000, 100], // Full utilization
        [3000, 2000, 100], // Over-utilization (capped at 100)
        [0, 2000, 0], // Zero balance
        [500, 0, 0], // Zero contribution
        [-100, 2000, 0], // Negative balance
        [500, -100, 0], // Negative contribution
      ];

      testCases.forEach(([balance, contribution, expected]) => {
        const result = calculateAccountUtilization(balance, contribution);
        expect(result).toBe(expected);
      });
    });
  });

  describe("sortAccounts - Type Safety", () => {
    const mockAccounts: FormattedAccount[] = [
      {
        id: "1",
        name: "Z Account",
        type: "FSA",
        currentBalance: 100,
        annualContribution: 2000,
        expirationDate: "2024-12-31",
        description: "Last alphabetically",
        color: "#06b6d4",
        isActive: true,
        createdBy: "User 1",
        transactions: [],
        createdAt: "2024-01-01T00:00:00Z",
        lastUpdated: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "A Account",
        type: "HSA",
        currentBalance: 500,
        annualContribution: 3000,
        expirationDate: "2024-06-30",
        description: "First alphabetically",
        color: "#10b981",
        isActive: false,
        createdBy: "User 2",
        transactions: [],
        createdAt: "2024-02-01T00:00:00Z",
        lastUpdated: "2024-02-01T00:00:00Z",
      }
    ];

    it("should sort by all supported criteria", () => {
      const sortCriteria = ["name", "balance", "type", "expiration", "lastUpdated"] as const;
      
      sortCriteria.forEach(criteria => {
        const result = sortAccounts(mockAccounts, criteria);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
      });
    });

    it("should handle empty arrays and invalid inputs", () => {
      expect(sortAccounts([])).toEqual([]);
      expect(sortAccounts([] as any)).toEqual([]);
    });
  });

  describe("filterAccounts - Type Safety", () => {
    const mockAccounts: FormattedAccount[] = [
      {
        id: "1",
        name: "Active FSA",
        type: "FSA",
        currentBalance: 100,
        annualContribution: 2000,
        expirationDate: "2024-12-31",
        description: "Active account",
        color: "#06b6d4",
        isActive: true,
        createdBy: "User 1",
        transactions: [],
        createdAt: "2024-01-01T00:00:00Z",
        lastUpdated: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Inactive HSA",
        type: "HSA",
        currentBalance: 500,
        annualContribution: 3000,
        expirationDate: null,
        description: null,
        color: "#10b981",
        isActive: false,
        createdBy: "User 2",
        transactions: [],
        createdAt: "2024-02-01T00:00:00Z",
        lastUpdated: "2024-02-01T00:00:00Z",
      }
    ];

    it("should handle all filter criteria types", () => {
      const filters: FilterCriteria[] = [
        { activeOnly: true },
        { type: "FSA" },
        { minBalance: 200 },
        { search: "Active" },
        { expiringSoon: true, expirationDays: 365 },
        { activeOnly: true, type: "FSA", minBalance: 50 }
      ];

      filters.forEach(filter => {
        const result = filterAccounts(mockAccounts, filter);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it("should handle edge cases in search", () => {
      const searchTests = [
        { search: "" }, // Empty search
        { search: "   " }, // Whitespace search
        { search: "ACTIVE" }, // Case insensitive
      ];

      searchTests.forEach(filter => {
        const result = filterAccounts(mockAccounts, filter);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe("isValidAccountColor - Type Safety", () => {
    it("should validate hex colors correctly", () => {
      const validColors = ["#000000", "#FFFFFF", "#06b6d4", "#abc", "#ABC"];
      const invalidColors = ["", "000000", "#gggggg", "#12345", "#1234567", "rgb(255,0,0)"];

      validColors.forEach(color => {
        expect(isValidAccountColor(color)).toBe(true);
      });

      invalidColors.forEach(color => {
        expect(isValidAccountColor(color)).toBe(false);
      });
    });

    it("should handle non-string inputs", () => {
      // TypeScript prevents these at compile time, but testing runtime behavior
      expect(isValidAccountColor(null as any)).toBe(false);
      expect(isValidAccountColor(undefined as any)).toBe(false);
      expect(isValidAccountColor(123 as any)).toBe(false);
    });
  });

  describe("getAccountIconName - Type Safety", () => {
    it("should return valid icon names for all account types", () => {
      ACCOUNT_TYPES.forEach(accountType => {
        const iconName = getAccountIconName(accountType.value);
        expect(typeof iconName).toBe("string");
        expect(iconName.length).toBeGreaterThan(0);
      });
    });

    it("should handle invalid types with default", () => {
      const invalidTypes = ["", "INVALID", "null"];
      
      invalidTypes.forEach(type => {
        const result = getAccountIconName(type);
        expect(result).toBe("CreditCard");
      });
    });
  });

  describe("generateAccountId - Uniqueness", () => {
    it("should generate unique IDs", () => {
      const ids = new Set();
      
      // Generate multiple IDs rapidly
      for (let i = 0; i < 100; i++) {
        const id = generateAccountId();
        expect(typeof id).toBe("string");
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      
      expect(ids.size).toBe(100);
    });
  });
});