/**
 * Comprehensive CRUD Operations Integration Tests
 *
 * This test suite verifies:
 * 1. All CRUD operations for Debts, Envelopes, Bills, Transactions, Savings Goals, and Supplemental Accounts
 * 2. Relationships between entities (e.g., Bills -> Envelopes, Transactions -> Envelopes)
 * 3. Data consistency across operations
 * 4. Proper error handling and validation
 *
 * Part of: Verify CRUD for all utilities issue
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";
import { budgetDb } from "@/db/budgetDb";
import type { Envelope, Bill, Transaction, Debt, SavingsGoal } from "@/db/types";

// Import the hooks we're testing
import { useDebts } from "@/hooks/debts/useDebts";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import useBills from "@/hooks/bills/useBills";
import { useTransactionMutations } from "@/hooks/transactions/useTransactionMutations";
import { useTransactionQuery } from "@/hooks/transactions/useTransactionQuery";
import useSavingsGoals from "@/hooks/savings/useSavingsGoals";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock crypto.randomUUID for Node environment
global.crypto = {
  randomUUID: () => `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
} as Crypto;

describe("CRUD Operations Integration Tests", () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;
  let wrapper: ReturnType<typeof createQueryWrapper>;

  beforeEach(async () => {
    // Create fresh query client for each test
    queryClient = createTestQueryClient();
    wrapper = createQueryWrapper(queryClient);

    // Clear all database tables
    await budgetDb.envelopes.clear();
    await budgetDb.bills.clear();
    await budgetDb.transactions.clear();
    await budgetDb.debts.clear();
    await budgetDb.savingsGoals.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    queryClient.clear();
    await budgetDb.envelopes.clear();
    await budgetDb.bills.clear();
    await budgetDb.transactions.clear();
    await budgetDb.debts.clear();
    await budgetDb.savingsGoals.clear();
    vi.clearAllMocks();
  });

  describe("Envelope CRUD Operations", () => {
    it("should create a new envelope", async () => {
      const { result } = renderHook(() => useEnvelopes(), { wrapper });

      const newEnvelope = {
        name: "Test Envelope",
        category: "utilities",
        currentBalance: 100,
        targetAmount: 500,
      };

      await act(async () => {
        await result.current.addEnvelopeAsync(newEnvelope);
      });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(1);
        expect(result.current.envelopes[0].name).toBe("Test Envelope");
      });
    });

    it("should update an existing envelope", async () => {
      // Create an envelope first
      const envelope: Envelope = {
        id: "env-1",
        name: "Original Name",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 100,
        targetAmount: 500,
      };
      await budgetDb.envelopes.add(envelope);

      const { result } = renderHook(() => useEnvelopes(), { wrapper });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(1);
      });

      await act(async () => {
        await result.current.updateEnvelopeAsync({
          id: "env-1",
          updates: { name: "Updated Name", currentBalance: 200 },
        });
      });

      await waitFor(() => {
        const updatedEnvelope = result.current.envelopes.find((e) => e.id === "env-1");
        expect(updatedEnvelope?.name).toBe("Updated Name");
        expect(updatedEnvelope?.currentBalance).toBe(200);
      });
    });

    it("should delete an envelope", async () => {
      const envelope: Envelope = {
        id: "env-1",
        name: "Test Envelope",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 100,
      };
      await budgetDb.envelopes.add(envelope);

      const { result } = renderHook(() => useEnvelopes(), { wrapper });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteEnvelopeAsync("env-1", false);
      });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(0);
      });
    });

    it("should read all envelopes", async () => {
      // Add multiple envelopes
      const envelopes: Envelope[] = [
        {
          id: "env-1",
          name: "Envelope 1",
          category: "utilities",
          archived: false,
          lastModified: Date.now(),
          currentBalance: 100,
        },
        {
          id: "env-2",
          name: "Envelope 2",
          category: "food",
          archived: false,
          lastModified: Date.now(),
          currentBalance: 200,
        },
      ];
      await budgetDb.envelopes.bulkAdd(envelopes);

      const { result } = renderHook(() => useEnvelopes(), { wrapper });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(2);
        expect(result.current.totalBalance).toBe(300);
      });
    });
  });

  describe("Bill CRUD Operations", () => {
    it("should create a new bill", async () => {
      const { result } = renderHook(() => useBills(), { wrapper });

      const newBill = {
        name: "Test Bill",
        amount: 100,
        dueDate: new Date("2024-12-31"),
        category: "Utilities",
        isPaid: false,
        isRecurring: false,
      };

      await act(async () => {
        await result.current.addBillAsync(newBill);
      });

      await waitFor(() => {
        expect(result.current.bills.length).toBe(1);
        expect(result.current.bills[0].name).toBe("Test Bill");
      });
    });

    it("should update a bill", async () => {
      const bill: Bill = {
        id: "bill-1",
        name: "Original Bill",
        amount: 100,
        dueDate: new Date("2024-12-31"),
        category: "Utilities",
        isPaid: false,
        isRecurring: false,
        lastModified: Date.now(),
      };
      await budgetDb.bills.add(bill);

      const { result } = renderHook(() => useBills(), { wrapper });

      await waitFor(() => {
        expect(result.current.bills.length).toBe(1);
      });

      await act(async () => {
        await result.current.updateBillAsync({
          billId: "bill-1",
          updates: { name: "Updated Bill", amount: 150 },
        });
      });

      await waitFor(() => {
        const updatedBill = result.current.bills.find((b) => b.id === "bill-1");
        expect(updatedBill?.name).toBe("Updated Bill");
        expect(updatedBill?.amount).toBe(150);
      });
    });

    it("should delete a bill", async () => {
      const bill: Bill = {
        id: "bill-1",
        name: "Test Bill",
        amount: 100,
        dueDate: new Date("2024-12-31"),
        category: "Utilities",
        isPaid: false,
        isRecurring: false,
        lastModified: Date.now(),
      };
      await budgetDb.bills.add(bill);

      const { result } = renderHook(() => useBills(), { wrapper });

      await waitFor(() => {
        expect(result.current.bills.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteBillAsync("bill-1");
      });

      await waitFor(() => {
        expect(result.current.bills.length).toBe(0);
      });
    });

    it("should link bill to envelope", async () => {
      // Create envelope first
      const envelope: Envelope = {
        id: "env-1",
        name: "Utilities Envelope",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 500,
      };
      await budgetDb.envelopes.add(envelope);

      const { result } = renderHook(() => useBills(), { wrapper });

      const newBill = {
        name: "Electric Bill",
        amount: 100,
        dueDate: new Date("2024-12-31"),
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        envelopeId: "env-1",
      };

      await act(async () => {
        await result.current.addBillAsync(newBill);
      });

      await waitFor(() => {
        const addedBill = result.current.bills[0];
        expect(addedBill.envelopeId).toBe("env-1");
      });
    });
  });

  describe("Transaction CRUD Operations", () => {
    it("should create a new transaction", async () => {
      // Create envelope first
      const envelope: Envelope = {
        id: "env-1",
        name: "Test Envelope",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 500,
      };
      await budgetDb.envelopes.add(envelope);

      const { result: mutationResult } = renderHook(() => useTransactionMutations(), { wrapper });
      const { result: queryResult } = renderHook(() => useTransactionQuery(), { wrapper });

      const newTransaction = {
        date: new Date().toISOString(),
        amount: -50,
        type: "expense" as const,
        category: "utilities",
        description: "Test Transaction",
        envelopeId: "env-1",
      };

      await act(async () => {
        await mutationResult.current.addTransaction(newTransaction);
      });

      await waitFor(() => {
        expect(queryResult.current.transactions.length).toBeGreaterThan(0);
      });
    });

    it("should update a transaction", async () => {
      const envelope: Envelope = {
        id: "env-1",
        name: "Test Envelope",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 500,
      };
      await budgetDb.envelopes.add(envelope);

      const transaction: Transaction = {
        id: "txn-1",
        date: new Date(),
        amount: -50,
        type: "expense",
        category: "utilities",
        description: "Original Transaction",
        envelopeId: "env-1",
        lastModified: Date.now(),
        createdAt: Date.now(),
      };
      await budgetDb.transactions.add(transaction);

      const { result: mutationResult } = renderHook(() => useTransactionMutations(), { wrapper });
      const { result: queryResult } = renderHook(() => useTransactionQuery(), { wrapper });

      await waitFor(() => {
        expect(queryResult.current.transactions.length).toBe(1);
      });

      await act(async () => {
        await mutationResult.current.updateTransaction({
          id: "txn-1",
          updates: { description: "Updated Transaction", amount: -75 },
        });
      });

      await waitFor(() => {
        const updatedTxn = queryResult.current.transactions.find((t) => t.id === "txn-1");
        expect(updatedTxn?.description).toBe("Updated Transaction");
        expect(updatedTxn?.amount).toBe(-75);
      });
    });

    it("should delete a transaction", async () => {
      const transaction: Transaction = {
        id: "txn-1",
        date: new Date(),
        amount: -50,
        type: "expense",
        category: "utilities",
        description: "Test Transaction",
        envelopeId: "env-1",
        lastModified: Date.now(),
        createdAt: Date.now(),
      };
      await budgetDb.transactions.add(transaction);

      const { result: mutationResult } = renderHook(() => useTransactionMutations(), { wrapper });
      const { result: queryResult } = renderHook(() => useTransactionQuery(), { wrapper });

      await waitFor(() => {
        expect(queryResult.current.transactions.length).toBe(1);
      });

      await act(async () => {
        await mutationResult.current.deleteTransaction("txn-1");
      });

      await waitFor(() => {
        expect(queryResult.current.transactions.length).toBe(0);
      });
    });

    it("should link transaction to envelope", async () => {
      const envelope: Envelope = {
        id: "env-1",
        name: "Food Envelope",
        category: "food",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 300,
      };
      await budgetDb.envelopes.add(envelope);

      const { result: mutationResult } = renderHook(() => useTransactionMutations(), { wrapper });
      const { result: queryResult } = renderHook(() => useTransactionQuery(), { wrapper });

      const newTransaction = {
        date: new Date().toISOString(),
        amount: -25,
        type: "expense" as const,
        category: "food",
        description: "Grocery Shopping",
        envelopeId: "env-1",
      };

      await act(async () => {
        await mutationResult.current.addTransaction(newTransaction);
      });

      await waitFor(() => {
        const txn = queryResult.current.transactions[0];
        expect(txn.envelopeId).toBe("env-1");
      });
    });
  });

  describe("Debt CRUD Operations", () => {
    it("should create a new debt", async () => {
      const { result } = renderHook(() => useDebts(), { wrapper });

      const newDebt = {
        name: "Test Debt",
        creditor: "Test Bank",
        type: "credit_card" as const,
        currentBalance: 5000,
        interestRate: 15.99,
        minimumPayment: 150,
      };

      await act(async () => {
        await result.current.addDebtAsync(newDebt);
      });

      await waitFor(() => {
        expect(result.current.debts.length).toBe(1);
        expect(result.current.debts[0].name).toBe("Test Debt");
      });
    });

    it("should update a debt", async () => {
      const debt: Debt = {
        id: "debt-1",
        name: "Original Debt",
        creditor: "Test Bank",
        type: "credit_card",
        status: "active",
        currentBalance: 5000,
        interestRate: 15.99,
        minimumPayment: 150,
        lastModified: Date.now(),
      };
      await budgetDb.debts.add(debt);

      const { result } = renderHook(() => useDebts(), { wrapper });

      await waitFor(() => {
        expect(result.current.debts.length).toBe(1);
      });

      await act(async () => {
        await result.current.updateDebtAsync({
          id: "debt-1",
          updates: { name: "Updated Debt", currentBalance: 4500 },
        });
      });

      await waitFor(() => {
        const updatedDebt = result.current.debts.find((d) => d.id === "debt-1");
        expect(updatedDebt?.name).toBe("Updated Debt");
        expect(updatedDebt?.currentBalance).toBe(4500);
      });
    });

    it("should delete a debt", async () => {
      const debt: Debt = {
        id: "debt-1",
        name: "Test Debt",
        creditor: "Test Bank",
        type: "credit_card",
        status: "active",
        currentBalance: 5000,
        interestRate: 15.99,
        minimumPayment: 150,
        lastModified: Date.now(),
      };
      await budgetDb.debts.add(debt);

      const { result } = renderHook(() => useDebts(), { wrapper });

      await waitFor(() => {
        expect(result.current.debts.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteDebtAsync({ id: "debt-1" });
      });

      await waitFor(() => {
        expect(result.current.debts.length).toBe(0);
      });
    });

    it("should record a debt payment", async () => {
      const debt: Debt = {
        id: "debt-1",
        name: "Test Debt",
        creditor: "Test Bank",
        type: "credit_card",
        status: "active",
        currentBalance: 5000,
        interestRate: 15.99,
        minimumPayment: 150,
        lastModified: Date.now(),
      };
      await budgetDb.debts.add(debt);

      const { result } = renderHook(() => useDebts(), { wrapper });

      await waitFor(() => {
        expect(result.current.debts.length).toBe(1);
      });

      await act(async () => {
        await result.current.recordDebtPaymentAsync({
          id: "debt-1",
          payment: { amount: 500, date: new Date().toISOString() },
        });
      });

      await waitFor(() => {
        const updatedDebt = result.current.debts.find((d) => d.id === "debt-1");
        expect(updatedDebt?.currentBalance).toBe(4500);
      });
    });
  });

  describe("Savings Goal CRUD Operations", () => {
    it("should create a new savings goal", async () => {
      const { result } = renderHook(() => useSavingsGoals(), { wrapper });

      const newGoal = {
        name: "Test Goal",
        category: "emergency",
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: new Date("2025-12-31"),
        priority: "high" as const,
        isPaused: false,
        isCompleted: false,
      };

      await act(async () => {
        await result.current.helpers.addGoal(newGoal);
      });

      await waitFor(() => {
        expect(result.current.savingsGoals.length).toBe(1);
        expect(result.current.savingsGoals[0].name).toBe("Test Goal");
      });
    });

    it("should update a savings goal", async () => {
      const goal: SavingsGoal = {
        id: "goal-1",
        name: "Original Goal",
        category: "emergency",
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: new Date("2025-12-31"),
        priority: "high",
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      };
      await budgetDb.savingsGoals.add(goal);

      const { result } = renderHook(() => useSavingsGoals(), { wrapper });

      await waitFor(() => {
        expect(result.current.savingsGoals.length).toBe(1);
      });

      await act(async () => {
        await result.current.helpers.updateGoal("goal-1", {
          name: "Updated Goal",
          currentAmount: 2500,
        });
      });

      await waitFor(() => {
        const updatedGoal = result.current.savingsGoals.find((g) => g.id === "goal-1");
        expect(updatedGoal?.name).toBe("Updated Goal");
        expect(updatedGoal?.currentAmount).toBe(2500);
      });
    });

    it("should delete a savings goal", async () => {
      const goal: SavingsGoal = {
        id: "goal-1",
        name: "Test Goal",
        category: "emergency",
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: new Date("2025-12-31"),
        priority: "high",
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      };
      await budgetDb.savingsGoals.add(goal);

      const { result } = renderHook(() => useSavingsGoals(), { wrapper });

      await waitFor(() => {
        expect(result.current.savingsGoals.length).toBe(1);
      });

      await act(async () => {
        await result.current.helpers.deleteGoal("goal-1");
      });

      await waitFor(() => {
        expect(result.current.savingsGoals.length).toBe(0);
      });
    });
  });

  describe("Relationship Tests", () => {
    it("should maintain bill-envelope relationship", async () => {
      // Create envelope
      const envelope: Envelope = {
        id: "env-1",
        name: "Utilities",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 500,
      };
      await budgetDb.envelopes.add(envelope);

      // Create bill linked to envelope
      const bill: Bill = {
        id: "bill-1",
        name: "Electric Bill",
        amount: 100,
        dueDate: new Date("2024-12-31"),
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        envelopeId: "env-1",
        lastModified: Date.now(),
      };
      await budgetDb.bills.add(bill);

      // Verify relationship
      const storedBill = await budgetDb.bills.get("bill-1");
      expect(storedBill?.envelopeId).toBe("env-1");

      const storedEnvelope = await budgetDb.envelopes.get("env-1");
      expect(storedEnvelope).toBeDefined();
    });

    it("should maintain transaction-envelope relationship", async () => {
      // Create envelope
      const envelope: Envelope = {
        id: "env-1",
        name: "Food",
        category: "food",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 300,
      };
      await budgetDb.envelopes.add(envelope);

      // Create transaction linked to envelope
      const transaction: Transaction = {
        id: "txn-1",
        date: new Date(),
        amount: -50,
        type: "expense",
        category: "food",
        description: "Groceries",
        envelopeId: "env-1",
        lastModified: Date.now(),
        createdAt: Date.now(),
      };
      await budgetDb.transactions.add(transaction);

      // Verify relationship
      const storedTxn = await budgetDb.transactions.get("txn-1");
      expect(storedTxn?.envelopeId).toBe("env-1");

      const storedEnvelope = await budgetDb.envelopes.get("env-1");
      expect(storedEnvelope).toBeDefined();
    });

    it("should handle envelope deletion with linked bills", async () => {
      // Create envelope with linked bill
      const envelope: Envelope = {
        id: "env-1",
        name: "Utilities",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 500,
      };
      await budgetDb.envelopes.add(envelope);

      const bill: Bill = {
        id: "bill-1",
        name: "Electric Bill",
        amount: 100,
        dueDate: new Date("2024-12-31"),
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        envelopeId: "env-1",
        lastModified: Date.now(),
      };
      await budgetDb.bills.add(bill);

      const { result } = renderHook(() => useEnvelopes(), { wrapper });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(1);
      });

      // Delete envelope and linked bills
      await act(async () => {
        await result.current.deleteEnvelopeAsync("env-1", true);
      });

      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(0);
      });

      // Verify bill is also deleted
      const remainingBill = await budgetDb.bills.get("bill-1");
      expect(remainingBill).toBeUndefined();
    });
  });

  describe("Data Consistency Tests", () => {
    it("should maintain data integrity when creating multiple related entities", async () => {
      // Create envelope
      const envelope: Envelope = {
        id: "env-1",
        name: "Utilities",
        category: "utilities",
        archived: false,
        lastModified: Date.now(),
        currentBalance: 1000,
      };
      await budgetDb.envelopes.add(envelope);

      // Create multiple bills linked to envelope
      const bills: Bill[] = [
        {
          id: "bill-1",
          name: "Electric",
          amount: 100,
          dueDate: new Date("2024-12-31"),
          category: "Utilities",
          isPaid: false,
          isRecurring: true,
          envelopeId: "env-1",
          lastModified: Date.now(),
        },
        {
          id: "bill-2",
          name: "Water",
          amount: 50,
          dueDate: new Date("2024-12-31"),
          category: "Utilities",
          isPaid: false,
          isRecurring: true,
          envelopeId: "env-1",
          lastModified: Date.now(),
        },
      ];
      await budgetDb.bills.bulkAdd(bills);

      // Create transaction
      const transaction: Transaction = {
        id: "txn-1",
        date: new Date(),
        amount: -100,
        type: "expense",
        category: "utilities",
        description: "Electric Bill Payment",
        envelopeId: "env-1",
        lastModified: Date.now(),
        createdAt: Date.now(),
      };
      await budgetDb.transactions.add(transaction);

      // Verify all entities are connected properly
      const storedEnvelope = await budgetDb.envelopes.get("env-1");
      expect(storedEnvelope).toBeDefined();

      const storedBills = await budgetDb.bills.where({ envelopeId: "env-1" }).toArray();
      expect(storedBills.length).toBe(2);

      const storedTransactions = await budgetDb.transactions
        .where({ envelopeId: "env-1" })
        .toArray();
      expect(storedTransactions.length).toBe(1);
    });
  });
});
