/**
 * Tests for Transaction Operations Utilities
 * Testing validation, preparation, and transformation functions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateTransactionData,
  prepareTransactionForStorage,
  determineTransactionType,
  createTransferPair,
  categorizeTransaction,
  mergeDuplicateTransactions,
  calculateRunningBalance,
  formatTransactionForDisplay,
} from "../operations.js";

// Mock logger
vi.mock("../../common/logger.js", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Transaction Operations Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateTransactionData", () => {
    const validTransaction = {
      id: "txn-test-1",
      description: "Test Transaction",
      amount: -50.0,
      date: "2023-01-01",
      category: "Food",
      envelopeId: "env-test-1",
      type: "expense" as const,
      lastModified: Date.now(),
    };

    it("should validate correct transaction data", () => {
      const result = validateTransactionData(validTransaction);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should allow missing optional description", () => {
      const { description, ...withoutDescription } = validTransaction;
      const result = validateTransactionData(withoutDescription);

      // Description is optional in the schema
      expect(result.isValid).toBe(true);
    });

    it("should require amount", () => {
      const { amount, ...invalid } = validTransaction;
      const result = validateTransactionData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("amount"))).toBe(true);
    });

    it("should enforce amount sign convention for expenses", () => {
      // Expense type with positive amount should fail
      const invalid = { ...validTransaction, amount: 50 };
      const result = validateTransactionData(invalid);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("amount"))).toBe(true);
    });

    it("should accept date strings", () => {
      // TransactionSchema accepts both Date objects and date strings
      const withDateString = { ...validTransaction, date: "2023-01-01" };
      const result = validateTransactionData(withDateString);

      // String dates are valid per the schema
      expect(result.isValid).toBe(true);
    });

    it("should handle null input", () => {
      const result = validateTransactionData(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Transaction data is required");
    });
  });

  describe("prepareTransactionForStorage", () => {
    const rawTransaction = {
      description: "  Test Transaction  ",
      amount: -50.0,
      date: "2023-01-01T10:00:00Z",
      category: "  Food  ",
      account: "  checking  ",
    };

    it("should clean and prepare transaction data", () => {
      const prepared = prepareTransactionForStorage(rawTransaction);

      expect(prepared.description).toBe("Test Transaction");
      expect(prepared.amount).toBe(-50);
      expect(prepared.category).toBe("Food");
      expect(prepared.account).toBe("checking");
      expect(prepared.id).toBeDefined();
      expect(prepared.metadata).toBeDefined();
    });

    it("should generate ID if not provided", () => {
      const prepared = prepareTransactionForStorage(rawTransaction);

      expect(prepared.id).toMatch(/^txn_\d+_[a-z0-9]+$/);
    });

    it("should preserve existing ID", () => {
      const withId = { ...rawTransaction, id: "existing-id" };
      const prepared = prepareTransactionForStorage(withId);

      expect(prepared.id).toBe("existing-id");
    });

    it("should add timestamps to metadata", () => {
      const prepared = prepareTransactionForStorage(rawTransaction);

      expect(prepared.metadata).toBeDefined();
      expect(prepared.metadata?.updatedAt).toBeDefined();
      if (prepared.metadata?.updatedAt && typeof prepared.metadata.updatedAt === "string") {
        expect(new Date(prepared.metadata.updatedAt)).toBeInstanceOf(Date);
      }
    });

    it("should determine transaction type", () => {
      const income = prepareTransactionForStorage({
        ...rawTransaction,
        amount: 100,
      });
      const expense = prepareTransactionForStorage({
        ...rawTransaction,
        amount: -100,
      });

      expect(income.type).toBe("income");
      expect(expense.type).toBe("expense");
    });
  });

  describe("determineTransactionType", () => {
    it("should return explicit type if set", () => {
      const transaction = {
        description: "Test",
        date: "2023-01-01",
        amount: -50,
        type: "transfer" as const,
      };

      expect(determineTransactionType(transaction)).toBe("transfer");
    });

    it("should detect income from positive amount", () => {
      const transaction = { description: "Test", date: "2023-01-01", amount: 100 };

      expect(determineTransactionType(transaction)).toBe("income");
    });

    it("should detect expense from negative amount", () => {
      const transaction = { description: "Test", date: "2023-01-01", amount: -50 };

      expect(determineTransactionType(transaction)).toBe("expense");
    });

    it("should detect transfer from metadata", () => {
      const transaction = {
        description: "Test",
        date: "2023-01-01",
        amount: -50,
        metadata: { isTransfer: true },
      };

      expect(determineTransactionType(transaction)).toBe("transfer");
    });

    it("should default to expense for null transaction", () => {
      expect(determineTransactionType(null)).toBe("expense");
    });
  });

  describe("createTransferPair", () => {
    const transferData = {
      id: "txn-transfer-1",
      fromAccount: "checking",
      toAccount: "savings",
      amount: 500,
      description: "Monthly savings",
      date: "2023-01-01",
      category: "Transfer",
      envelopeId: "env-transfer",
      type: "transfer" as const,
      lastModified: Date.now(),
    };

    it("should create valid transfer pair", () => {
      const [outgoing, incoming] = createTransferPair(transferData);

      expect(outgoing.amount).toBe(-500);
      expect(incoming.amount).toBe(500);
      expect(outgoing.account).toBe("checking");
      expect(incoming.account).toBe("savings");
      expect(outgoing.type).toBe("transfer");
      expect(incoming.type).toBe("transfer");
    });

    it("should link transactions with transfer ID", () => {
      const [outgoing, incoming] = createTransferPair(transferData);

      expect(outgoing.metadata.transferId).toBe(incoming.metadata.transferId);
      expect(outgoing.metadata.transferType).toBe("outgoing");
      expect(incoming.metadata.transferType).toBe("incoming");
    });

    it("should handle envelope assignments", () => {
      const withEnvelopes = {
        ...transferData,
        fromEnvelopeId: "env1",
        toEnvelopeId: "env2",
      };

      const [outgoing, incoming] = createTransferPair(withEnvelopes);

      expect(outgoing.envelopeId).toBe("env1");
      expect(incoming.envelopeId).toBe("env2");
    });

    it("should throw on invalid data", () => {
      // Missing required fields should throw
      const invalid = { fromAccount: "checking", toAccount: "savings", amount: 0 };

      expect(() => createTransferPair(invalid as any)).toThrow("Invalid transfer data");
    });
  });

  describe("categorizeTransaction", () => {
    const customRules = [
      {
        name: "Grocery Rule",
        category: "Groceries",
        keywords: ["kroger", "walmart", "grocery"],
      },
      {
        name: "Gas Rule",
        category: "Transportation",
        keywords: ["shell", "bp", "gas station"],
      },
    ];

    it("should apply custom categorization rules", () => {
      const transaction = { description: "KROGER STORE #123", date: "2023-01-01", amount: -45.67 };

      const categorized = categorizeTransaction(transaction, customRules);

      expect(categorized.category).toBe("Groceries");
      expect(categorized.metadata.autoCategorized).toBe(true);
      expect(categorized.metadata.categoryRule).toBe("Grocery Rule");
    });

    it("should apply default categorization rules", () => {
      const transaction = { description: "Shell Gas Station", date: "2023-01-01", amount: -35.0 };

      const categorized = categorizeTransaction(transaction, []);

      expect(categorized.category).toBe("Transportation");
      expect(categorized.metadata.autoCategorized).toBe(true);
      expect(categorized.metadata.categoryRule).toBe("default");
    });

    it("should not override existing category", () => {
      const transaction = {
        description: "KROGER STORE #123",
        date: "2023-01-01",
        amount: -45.67,
        category: "Personal Care",
      };

      const categorized = categorizeTransaction(transaction, customRules);

      expect(categorized.category).toBe("Personal Care");
    });

    it("should handle income transactions", () => {
      const transaction = { description: "Salary Payment", date: "2023-01-01", amount: 2500 };

      const categorized = categorizeTransaction(transaction, []);

      expect(categorized.category).toBe("Income");
    });

    it("should default to uncategorized for expenses", () => {
      const transaction = { description: "Unknown Vendor", date: "2023-01-01", amount: -25.0 };

      const categorized = categorizeTransaction(transaction, []);

      expect(categorized.category).toBe("Uncategorized");
    });
  });

  describe("mergeDuplicateTransactions", () => {
    const transactions = [
      {
        id: "txn1",
        description: "Coffee Shop",
        amount: -4.5,
        date: "2023-01-01T10:00:00Z",
        account: "checking",
      },
      {
        id: "txn2",
        description: "Coffee Shop",
        amount: -4.5,
        date: "2023-01-01T10:02:00Z", // 2 minutes later
        account: "checking",
      },
      {
        id: "txn3",
        description: "Different Store",
        amount: -10.0,
        date: "2023-01-01T10:00:00Z",
        account: "checking",
      },
    ];

    it("should merge duplicate transactions within time window", () => {
      const merged = mergeDuplicateTransactions(transactions, {
        timeWindowMinutes: 5,
        amountTolerance: 0.01,
      });

      expect(merged).toHaveLength(2); // txn1 merged with txn2, txn3 kept
      expect(merged[0].metadata.duplicates).toHaveLength(1);
      expect(merged[0].metadata.duplicates[0].id).toBe("txn2");
    });

    it("should respect time window", () => {
      const merged = mergeDuplicateTransactions(transactions, {
        timeWindowMinutes: 1, // Stricter window
      });

      expect(merged).toHaveLength(3); // No merging
    });

    it("should respect amount tolerance", () => {
      const withDifferentAmount = [
        ...transactions,
        {
          id: "txn4",
          description: "Coffee Shop",
          amount: -4.55, // 5 cents difference
          date: "2023-01-01T10:01:00Z",
          account: "checking",
        },
      ];

      const strict = mergeDuplicateTransactions(withDifferentAmount, {
        amountTolerance: 0.01,
      });

      const lenient = mergeDuplicateTransactions(withDifferentAmount, {
        amountTolerance: 0.1,
      });

      expect(strict).toHaveLength(3); // No merge due to amount difference
      expect(lenient).toHaveLength(2); // Merge allowed
    });
  });

  describe("calculateRunningBalance", () => {
    const transactions = [
      { id: "txn1", description: "Income", amount: 1000, date: "2023-01-01" }, // Income
      { id: "txn2", description: "Expense", amount: -50, date: "2023-01-02" }, // Expense
      { id: "txn3", description: "Expense", amount: -25, date: "2023-01-03" }, // Expense
    ];

    it("should calculate running balance correctly", () => {
      const withBalance = calculateRunningBalance(transactions, 500);

      expect(withBalance[0].runningBalance).toBe(1500); // 500 + 1000
      expect(withBalance[1].runningBalance).toBe(1450); // 1500 - 50
      expect(withBalance[2].runningBalance).toBe(1425); // 1450 - 25
    });

    it("should handle zero starting balance", () => {
      const withBalance = calculateRunningBalance(transactions, 0);

      expect(withBalance[0].runningBalance).toBe(1000);
      expect(withBalance[1].runningBalance).toBe(950);
      expect(withBalance[2].runningBalance).toBe(925);
    });

    it("should round to 2 decimal places", () => {
      const fractionalTxns = [
        { id: "txn1", description: "Test1", date: "2023-01-01", amount: 33.33 },
        { id: "txn2", description: "Test2", date: "2023-01-02", amount: -33.34 },
      ];

      const withBalance = calculateRunningBalance(fractionalTxns, 0);

      expect(withBalance[0].runningBalance).toBe(33.33);
      expect(withBalance[1].runningBalance).toBe(-0.01);
    });
  });

  describe("formatTransactionForDisplay", () => {
    const transaction = {
      id: "txn1",
      description: "Test Transaction",
      amount: -45.67,
      date: "2023-01-15T14:30:00Z",
      category: "Food",
      account: "checking",
      type: "expense" as const,
    };

    it("should format transaction for display", () => {
      const formatted = formatTransactionForDisplay(transaction);

      expect(formatted.formattedAmount).toBe("$45.67");
      expect(formatted.amountDisplay).toBe("-$45.67");
      expect(formatted.formattedDate).toBeDefined();
      expect(formatted.isExpense).toBe(true);
      expect(formatted.isIncome).toBe(false);
      expect(formatted.categoryDisplay).toBe("Food");
    });

    it("should handle income transactions", () => {
      const income = { ...transaction, amount: 2500, type: "income" as const };
      const formatted = formatTransactionForDisplay(income);

      expect(formatted.amountDisplay).toBe("$2,500.00");
      expect(formatted.isIncome).toBe(true);
      expect(formatted.isExpense).toBe(false);
    });

    it("should format date with options", () => {
      const formatted = formatTransactionForDisplay(transaction, {
        dateFormat: "long",
        includeTime: true,
      });

      expect(formatted.formattedDate).toContain("January");
      expect(formatted.formattedTime).toBeDefined();
    });

    it("should handle missing category gracefully", () => {
      const noCategory = { ...transaction, category: undefined };
      const formatted = formatTransactionForDisplay(noCategory);

      expect(formatted.categoryDisplay).toBe("Uncategorized");
    });

    it("should detect transfer type", () => {
      const transfer = { ...transaction, type: "transfer" as const };
      const formatted = formatTransactionForDisplay(transfer);

      expect(formatted.isTransfer).toBe(true);
    });
  });
});
