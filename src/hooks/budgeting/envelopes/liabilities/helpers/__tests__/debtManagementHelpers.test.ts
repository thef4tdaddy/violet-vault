import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEnvelopeAndBillForDebt,
  handleBillConnectionsForDebt,
  buildDebtWithPayment,
  createDebtOperation,
  recordPaymentOperation,
  linkDebtToBillOperation,
  syncDebtDueDatesOperation,
  updateDebtOperation,
  deleteDebtOperation,
  enrichDebtsWithRelations,
} from "../debtManagementHelpers";
import { DEBT_STATUS } from "@/constants/debts";

// Mock logger to avoid noise
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock debtCalculations
vi.mock("@/utils/domain/debts/debtCalculations", () => ({
  convertPaymentFrequency: vi.fn((freq: string) => freq),
  calculateInterestPortion: vi.fn(() => 50),
  enrichDebt: vi.fn((debt, bill, envelope, transactions) => ({
    ...debt,
    relatedBill: bill,
    relatedEnvelope: envelope,
    relatedTransactions: transactions,
  })),
}));

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
    },
  },
}));

describe("debtManagementHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEnvelopeAndBillForDebt", () => {
    it("should create envelope and bill with provided envelope name", async () => {
      const cleanDebtData = {
        name: "Test Debt",
        minimumPayment: 100,
        paymentDueDate: "2024-01-15",
        paymentFrequency: "monthly",
      };
      const createdDebt = { id: "debt-123" };
      const newEnvelopeName = "Custom Envelope";
      const createEnvelope = vi.fn().mockResolvedValue({ id: "env-123" });
      const createBill = vi.fn().mockResolvedValue({ id: "bill-123" });

      await createEnvelopeAndBillForDebt(
        cleanDebtData,
        createdDebt,
        newEnvelopeName,
        createEnvelope,
        createBill
      );

      expect(createEnvelope).toHaveBeenCalledWith({
        name: "Custom Envelope",
        targetAmount: 200,
        currentBalance: 0,
        category: "Fixed Expenses",
      });
      expect(createBill).toHaveBeenCalledWith({
        name: "Test Debt Payment",
        amount: 100,
        dueDate: "2024-01-15",
        frequency: "monthly",
        envelopeId: "env-123",
        debtId: "debt-123",
        isActive: true,
      });
    });

    it("should use default envelope name when not provided", async () => {
      const cleanDebtData = {
        name: "Credit Card",
        minimumPayment: 50,
        paymentDueDate: "2024-01-20",
        paymentFrequency: "monthly",
      };
      const createdDebt = { id: "debt-456" };
      const createEnvelope = vi.fn().mockResolvedValue({ id: "env-456" });
      const createBill = vi.fn().mockResolvedValue({ id: "bill-456" });

      await createEnvelopeAndBillForDebt(
        cleanDebtData,
        createdDebt,
        "",
        createEnvelope,
        createBill
      );

      expect(createEnvelope).toHaveBeenCalledWith({
        name: "Credit Card Payment",
        targetAmount: 100,
        currentBalance: 0,
        category: "Fixed Expenses",
      });
    });
  });

  describe("handleBillConnectionsForDebt", () => {
    it("should return early when no connection data", async () => {
      const createEnvelope = vi.fn();
      const createBill = vi.fn();
      const updateBill = vi.fn();

      await handleBillConnectionsForDebt({
        connectionData: null,
        cleanDebtData: {
          name: "Test",
          minimumPayment: 100,
          paymentDueDate: "2024-01-15",
          paymentFrequency: "monthly",
        },
        createdDebt: { id: "debt-123" },
        createEnvelope,
        createBill,
        updateBill,
      });

      expect(createEnvelope).not.toHaveBeenCalled();
      expect(createBill).not.toHaveBeenCalled();
      expect(updateBill).not.toHaveBeenCalled();
    });

    it("should create new envelope and bill when paymentMethod is create_new", async () => {
      const createEnvelope = vi.fn().mockResolvedValue({ id: "env-789" });
      const createBill = vi.fn().mockResolvedValue({ id: "bill-789" });
      const updateBill = vi.fn();

      await handleBillConnectionsForDebt({
        connectionData: {
          paymentMethod: "create_new",
          createBill: true,
          newEnvelopeName: "My Envelope",
        },
        cleanDebtData: {
          name: "Auto Loan",
          minimumPayment: 300,
          paymentDueDate: "2024-02-01",
          paymentFrequency: "monthly",
        },
        createdDebt: { id: "debt-789" },
        createEnvelope,
        createBill,
        updateBill,
      });

      expect(createEnvelope).toHaveBeenCalled();
      expect(createBill).toHaveBeenCalled();
      expect(updateBill).not.toHaveBeenCalled();
    });

    it("should update existing bill when paymentMethod is connect_existing_bill", async () => {
      const createEnvelope = vi.fn();
      const createBill = vi.fn();
      const updateBill = vi.fn().mockResolvedValue(undefined);

      await handleBillConnectionsForDebt({
        connectionData: {
          paymentMethod: "connect_existing_bill",
          existingBillId: "existing-bill-123",
        },
        cleanDebtData: {
          name: "Mortgage",
          minimumPayment: 1000,
          paymentDueDate: "2024-01-01",
          paymentFrequency: "monthly",
        },
        createdDebt: { id: "debt-999" },
        createEnvelope,
        createBill,
        updateBill,
      });

      expect(updateBill).toHaveBeenCalledWith("existing-bill-123", {
        debtId: "debt-999",
      });
      expect(createEnvelope).not.toHaveBeenCalled();
      expect(createBill).not.toHaveBeenCalled();
    });
  });

  describe("buildDebtWithPayment", () => {
    it("should build debt with payment history", () => {
      const debt = {
        id: "debt-1",
        name: "Test Debt",
        currentBalance: 1000,
        minimumPayment: 100,
        status: DEBT_STATUS.ACTIVE,
        paymentHistory: [
          {
            date: "2024-01-01",
            amount: 100,
            interestPortion: 20,
            principalPortion: 80,
            balanceAfter: 920,
            notes: "Previous payment",
          },
        ],
      };

      const result = buildDebtWithPayment(debt, {
        amount: 150,
        paymentDate: "2024-02-01",
        interestPortion: 30,
        principalPortion: 120,
        notes: "Regular payment",
      });

      expect(result.currentBalance).toBe(880); // 1000 - 120
      expect(result.lastPaymentDate).toBe("2024-02-01");
      expect(result.lastPaymentAmount).toBe(150);
      expect(result.paymentHistory).toHaveLength(2);
      expect(result.paymentHistory?.[1]).toEqual({
        date: "2024-02-01",
        amount: 150,
        interestPortion: 30,
        principalPortion: 120,
        balanceAfter: 880,
        notes: "Regular payment",
      });
    });

    it("should initialize payment history if it does not exist", () => {
      const debt = {
        id: "debt-2",
        name: "New Debt",
        currentBalance: 500,
        minimumPayment: 50,
        status: DEBT_STATUS.ACTIVE,
      };

      const result = buildDebtWithPayment(debt, {
        amount: 50,
        paymentDate: "2024-01-15",
        interestPortion: 10,
        principalPortion: 40,
      });

      expect(result.paymentHistory).toBeDefined();
      expect(result.paymentHistory).toHaveLength(1);
      expect(result.paymentHistory?.[0]).toEqual({
        date: "2024-01-15",
        amount: 50,
        interestPortion: 10,
        principalPortion: 40,
        balanceAfter: 460,
        notes: "",
      });
    });

    it("should set status to paid_off when balance reaches zero", () => {
      const debt = {
        id: "debt-3",
        name: "Almost Paid",
        currentBalance: 100,
        minimumPayment: 100,
        status: DEBT_STATUS.ACTIVE,
      };

      const result = buildDebtWithPayment(debt, {
        amount: 100,
        paymentDate: "2024-03-01",
        interestPortion: 0,
        principalPortion: 100,
      });

      expect(result.currentBalance).toBe(0);
      expect(result.status).toBe(DEBT_STATUS.PAID_OFF);
    });

    it("should not allow negative balance", () => {
      const debt = {
        id: "debt-4",
        name: "Over Payment",
        currentBalance: 50,
        minimumPayment: 50,
        status: DEBT_STATUS.ACTIVE,
      };

      const result = buildDebtWithPayment(debt, {
        amount: 100,
        paymentDate: "2024-04-01",
        interestPortion: 0,
        principalPortion: 100,
      });

      expect(result.currentBalance).toBe(0);
    });
  });

  describe("createDebtOperation", () => {
    it("should create debt successfully with connection data", async () => {
      const debtData = {
        name: "Student Loan",
        minimumPayment: 200,
        paymentDueDate: "2024-01-10",
        paymentFrequency: "monthly",
        currentBalance: 10000,
        interestRate: 5.5,
        connectionData: {
          paymentMethod: "create_new",
          createBill: true,
          newEnvelopeName: "Student Loan Envelope",
        },
      };

      const createDebtData = vi.fn().mockResolvedValue({ id: "debt-student" });
      const createEnvelope = vi.fn().mockResolvedValue({ id: "env-student" });
      const createBill = vi.fn().mockResolvedValue({ id: "bill-student" });
      const updateBill = vi.fn();

      const result = await createDebtOperation(debtData, {
        connectionData: debtData.connectionData,
        createEnvelope,
        createBill,
        updateBill,
        createDebtData,
      });

      expect(result).toEqual({ id: "debt-student" });
      expect(createDebtData).toHaveBeenCalledWith({
        name: "Student Loan",
        minimumPayment: 200,
        paymentDueDate: "2024-01-10",
        paymentFrequency: "monthly",
        currentBalance: 10000,
        interestRate: 5.5,
      });
    });

    it("should propagate errors when createDebtData fails", async () => {
      const debtData = {
        name: "Failed Debt",
        minimumPayment: 100,
        paymentDueDate: "2024-01-01",
        paymentFrequency: "monthly",
      };

      const createDebtData = vi.fn().mockRejectedValue(new Error("Database error"));
      const createEnvelope = vi.fn();
      const createBill = vi.fn();
      const updateBill = vi.fn();

      await expect(
        createDebtOperation(debtData, {
          createEnvelope,
          createBill,
          updateBill,
          createDebtData,
        })
      ).rejects.toThrow("Database error");
    });
  });

  describe("recordPaymentOperation", () => {
    beforeEach(async () => {
      // Reset the mock for budgetDb
      const { budgetDb } = await import("@/db/budgetDb");
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({ id: "env-123" } as never);
    });

    it("should record payment successfully with valid envelope", async () => {
      const debt = {
        id: "debt-pay",
        name: "Credit Card",
        currentBalance: 1000,
        minimumPayment: 50,
        interestRate: 18,
        envelopeId: "env-123",
        status: DEBT_STATUS.ACTIVE,
      };

      const paymentData = {
        amount: 100,
        paymentDate: "2024-01-15",
        notes: "Monthly payment",
      };

      const updateDebtData = vi.fn().mockResolvedValue(undefined);
      const createTransaction = vi.fn().mockResolvedValue(undefined);

      const result = await recordPaymentOperation({
        debt,
        paymentData,
        updateDebtData,
        createTransaction,
      });

      expect(result.currentBalance).toBe(950); // 1000 - (100 - 50)
      expect(result.lastPaymentAmount).toBe(100);
      expect(updateDebtData).toHaveBeenCalled();
      expect(createTransaction).toHaveBeenCalledWith({
        amount: -100,
        description: "Credit Card Payment",
        category: "Debt Payment",
        envelopeId: "env-123",
        debtId: "debt-pay",
        date: "2024-01-15",
        notes: "Monthly payment",
      });
    });

    it("should use debt.id as envelopeId when envelopeId is not set", async () => {
      const { budgetDb } = await import("@/db/budgetDb");
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({ id: "debt-no-env" } as never);

      const debt = {
        id: "debt-no-env",
        name: "Personal Loan",
        currentBalance: 5000,
        minimumPayment: 200,
        status: DEBT_STATUS.ACTIVE,
      };

      const paymentData = {
        amount: 200,
        paymentDate: "2024-02-01",
      };

      const updateDebtData = vi.fn().mockResolvedValue(undefined);
      const createTransaction = vi.fn().mockResolvedValue(undefined);

      await recordPaymentOperation({
        debt,
        paymentData,
        updateDebtData,
        createTransaction,
      });

      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          envelopeId: "debt-no-env",
        })
      );
    });

    it("should throw error when envelope does not exist", async () => {
      const { budgetDb } = await import("@/db/budgetDb");
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue(null as never);

      const debt = {
        id: "debt-bad",
        name: "Bad Debt",
        currentBalance: 1000,
        minimumPayment: 100,
        envelopeId: "non-existent-env",
        status: DEBT_STATUS.ACTIVE,
      };

      const paymentData = {
        amount: 100,
        paymentDate: "2024-01-15",
      };

      const updateDebtData = vi.fn();
      const createTransaction = vi.fn();

      await expect(
        recordPaymentOperation({
          debt,
          paymentData,
          updateDebtData,
          createTransaction,
        })
      ).rejects.toThrow('Cannot record debt payment: Envelope "non-existent-env" does not exist');
    });

    it("should use debt.id when envelopeId is empty and validate it exists", async () => {
      const { budgetDb } = await import("@/db/budgetDb");
      vi.mocked(budgetDb.envelopes.get).mockResolvedValue({ id: "debt-empty" } as never);

      const debt = {
        id: "debt-empty",
        name: "Empty Envelope Debt",
        currentBalance: 1000,
        minimumPayment: 100,
        envelopeId: "",
        status: DEBT_STATUS.ACTIVE,
      };

      const paymentData = {
        amount: 100,
        paymentDate: "2024-01-15",
      };

      const updateDebtData = vi.fn().mockResolvedValue(undefined);
      const createTransaction = vi.fn().mockResolvedValue(undefined);

      await recordPaymentOperation({
        debt,
        paymentData,
        updateDebtData,
        createTransaction,
      });

      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          envelopeId: "debt-empty",
        })
      );
    });
  });

  describe("linkDebtToBillOperation", () => {
    it("should link debt to bill successfully", async () => {
      const debts = [
        {
          id: "debt-link",
          name: "Mortgage",
          currentBalance: 200000,
          minimumPayment: 1500,
          status: DEBT_STATUS.ACTIVE,
        },
      ];

      const bills = [
        {
          id: "bill-link",
          name: "Mortgage Payment",
          amount: 1400,
          dueDate: "2024-01-01",
          envelopeId: "env-mortgage",
        },
      ];

      const updateBill = vi.fn().mockResolvedValue(undefined);
      const updateDebtData = vi.fn().mockResolvedValue(undefined);

      await linkDebtToBillOperation({
        debtId: "debt-link",
        billId: "bill-link",
        debts,
        bills,
        updateBill,
        updateDebtData,
      });

      expect(updateBill).toHaveBeenCalledWith("bill-link", {
        debtId: "debt-link",
        amount: 1500,
      });
      expect(updateDebtData).toHaveBeenCalledWith({
        id: "debt-link",
        updates: {
          paymentDueDate: "2024-01-01",
          envelopeId: "env-mortgage",
        },
      });
    });

    it("should throw error when debt not found", async () => {
      const debts = [];
      const bills = [
        {
          id: "bill-1",
          name: "Bill",
          amount: 100,
          dueDate: "2024-01-01",
        },
      ];

      const updateBill = vi.fn();
      const updateDebtData = vi.fn();

      await expect(
        linkDebtToBillOperation({
          debtId: "non-existent",
          billId: "bill-1",
          debts,
          bills,
          updateBill,
          updateDebtData,
        })
      ).rejects.toThrow("Debt or bill not found");
    });

    it("should throw error when bill not found", async () => {
      const debts = [
        {
          id: "debt-1",
          name: "Debt",
          currentBalance: 1000,
          minimumPayment: 100,
          status: DEBT_STATUS.ACTIVE,
        },
      ];
      const bills = [];

      const updateBill = vi.fn();
      const updateDebtData = vi.fn();

      await expect(
        linkDebtToBillOperation({
          debtId: "debt-1",
          billId: "non-existent",
          debts,
          bills,
          updateBill,
          updateDebtData,
        })
      ).rejects.toThrow("Debt or bill not found");
    });
  });

  describe("syncDebtDueDatesOperation", () => {
    it("should sync debt due dates with linked bills", async () => {
      const debts = [
        {
          id: "debt-sync-1",
          name: "Debt 1",
          currentBalance: 1000,
          minimumPayment: 100,
          paymentDueDate: "2024-01-01",
          status: DEBT_STATUS.ACTIVE,
        },
        {
          id: "debt-sync-2",
          name: "Debt 2",
          currentBalance: 2000,
          minimumPayment: 200,
          paymentDueDate: "2024-01-15",
          status: DEBT_STATUS.ACTIVE,
        },
      ];

      const bills = [
        {
          id: "bill-sync-1",
          debtId: "debt-sync-1",
          amount: 150,
          dueDate: "2024-02-01",
        },
        {
          id: "bill-sync-2",
          debtId: "debt-sync-2",
          amount: 200,
          dueDate: "2024-01-15",
        },
      ];

      const updateDebtData = vi.fn().mockResolvedValue(undefined);

      await syncDebtDueDatesOperation({
        debts,
        bills,
        updateDebtData,
      });

      // Only debt-sync-1 should be updated (different due date)
      expect(updateDebtData).toHaveBeenCalledTimes(1);
      expect(updateDebtData).toHaveBeenCalledWith({
        id: "debt-sync-1",
        updates: {
          paymentDueDate: "2024-02-01",
          minimumPayment: 150,
        },
      });
    });

    it("should handle errors gracefully", async () => {
      const debts = [
        {
          id: "debt-error",
          name: "Error Debt",
          currentBalance: 1000,
          minimumPayment: 100,
          status: DEBT_STATUS.ACTIVE,
        },
      ];

      const bills = [
        {
          id: "bill-error",
          debtId: "debt-error",
          amount: 100,
          dueDate: "2024-01-01",
        },
      ];

      const updateDebtData = vi.fn().mockRejectedValue(new Error("Update failed"));

      // Should not throw error
      await expect(
        syncDebtDueDatesOperation({
          debts,
          bills,
          updateDebtData,
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("updateDebtOperation", () => {
    it("should update debt successfully", async () => {
      const updateDebtData = vi.fn().mockResolvedValue(undefined);

      await updateDebtOperation({
        debtId: "debt-update",
        updates: {
          minimumPayment: 250,
          currentBalance: 9000,
        },
        author: "Test User",
        updateDebtData,
      });

      expect(updateDebtData).toHaveBeenCalledWith({
        id: "debt-update",
        updates: {
          minimumPayment: 250,
          currentBalance: 9000,
        },
        author: "Test User",
      });
    });

    it("should use default author when not provided", async () => {
      const updateDebtData = vi.fn().mockResolvedValue(undefined);

      await updateDebtOperation({
        debtId: "debt-default",
        updates: { status: DEBT_STATUS.PAID_OFF },
        updateDebtData,
      });

      expect(updateDebtData).toHaveBeenCalledWith({
        id: "debt-default",
        updates: { status: DEBT_STATUS.PAID_OFF },
        author: "Unknown User",
      });
    });

    it("should throw error when debtId is missing", async () => {
      const updateDebtData = vi.fn();

      await expect(
        updateDebtOperation({
          debtId: "",
          updates: {},
          updateDebtData,
        })
      ).rejects.toThrow("Debt ID is required for update");
    });
  });

  describe("deleteDebtOperation", () => {
    it("should delete debt and related bill", async () => {
      const bills = [
        {
          id: "bill-delete",
          debtId: "debt-delete",
          amount: 100,
        },
      ];

      const deleteBill = vi.fn().mockResolvedValue(undefined);
      const deleteDebtData = vi.fn().mockResolvedValue(undefined);

      await deleteDebtOperation({
        debtId: "debt-delete",
        bills,
        deleteBill,
        deleteDebtData,
      });

      expect(deleteBill).toHaveBeenCalledWith("bill-delete");
      expect(deleteDebtData).toHaveBeenCalledWith({ id: "debt-delete" });
    });

    it("should delete debt without related bill", async () => {
      const bills = [];

      const deleteBill = vi.fn();
      const deleteDebtData = vi.fn().mockResolvedValue(undefined);

      await deleteDebtOperation({
        debtId: "debt-no-bill",
        bills,
        deleteBill,
        deleteDebtData,
      });

      expect(deleteBill).not.toHaveBeenCalled();
      expect(deleteDebtData).toHaveBeenCalledWith({ id: "debt-no-bill" });
    });

    it("should propagate errors when deletion fails", async () => {
      const bills = [];
      const deleteBill = vi.fn();
      const deleteDebtData = vi.fn().mockRejectedValue(new Error("Deletion failed"));

      await expect(
        deleteDebtOperation({
          debtId: "debt-fail",
          bills,
          deleteBill,
          deleteDebtData,
        })
      ).rejects.toThrow("Deletion failed");
    });
  });

  describe("enrichDebtsWithRelations", () => {
    it("should return empty array when debts is empty", () => {
      const result = enrichDebtsWithRelations([], [], [], []);
      expect(result).toEqual([]);
    });

    it("should enrich debts with related bill, envelope, and transactions", () => {
      const debts = [
        {
          id: "debt-enrich",
          name: "Test Debt",
          currentBalance: 1000,
          minimumPayment: 100,
          status: DEBT_STATUS.ACTIVE,
          envelopeId: "env-enrich",
        },
      ];

      const bills = [
        {
          id: "bill-enrich",
          debtId: "debt-enrich",
          envelopeId: "env-enrich",
          amount: 100,
        },
      ];

      const envelopes = [
        {
          id: "env-enrich",
          name: "Test Envelope",
        },
      ];

      const transactions = [
        {
          id: "trans-1",
          debtId: "debt-enrich",
          amount: -100,
        },
      ];

      const result = enrichDebtsWithRelations(debts, bills, envelopes, transactions);

      expect(result).toHaveLength(1);
      expect(result[0].relatedBill).toBeDefined();
      expect(result[0].relatedEnvelope).toBeDefined();
      expect(result[0].relatedTransactions).toBeDefined();
    });

    it("should handle debts with no related bill", () => {
      const debts = [
        {
          id: "debt-no-bill",
          name: "No Bill Debt",
          currentBalance: 500,
          minimumPayment: 50,
          status: DEBT_STATUS.ACTIVE,
          envelopeId: "env-123",
        },
      ];

      const bills = [];
      const envelopes = [
        {
          id: "env-123",
          name: "Envelope",
        },
      ];
      const transactions = [];

      const result = enrichDebtsWithRelations(debts, bills, envelopes, transactions);

      expect(result).toHaveLength(1);
      expect(result[0].relatedBill).toBeNull();
      expect(result[0].relatedEnvelope).toBeDefined();
    });

    it("should handle debt with bill but no direct envelopeId", () => {
      const debts = [
        {
          id: "debt-bill-env",
          name: "Debt via Bill",
          currentBalance: 2000,
          minimumPayment: 200,
          status: DEBT_STATUS.ACTIVE,
        },
      ];

      const bills = [
        {
          id: "bill-123",
          debtId: "debt-bill-env",
          envelopeId: "env-via-bill",
          amount: 200,
        },
      ];

      const envelopes = [
        {
          id: "env-via-bill",
          name: "Envelope via Bill",
        },
      ];

      const transactions = [];

      const result = enrichDebtsWithRelations(debts, bills, envelopes, transactions);

      expect(result).toHaveLength(1);
      expect(result[0].relatedBill).toBeDefined();
      expect(result[0].relatedEnvelope).toBeDefined();
    });
  });
});
