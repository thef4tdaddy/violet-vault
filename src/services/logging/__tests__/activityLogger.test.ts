import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import activityLogger, { ACTIVITY_TYPES, ENTITY_TYPES } from "../activityLogger";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import type { Envelope, Transaction, Bill, Debt, PaycheckHistory } from "@/db/types";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    auditLog: {
      add: vi.fn(),
      orderBy: vi.fn(),
      where: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ActivityLogger", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();

    // Mock navigator.userAgent
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 Test Browser",
      writable: true,
    });
  });

  afterEach(() => {
    // Reset current user after each test
    activityLogger.setCurrentUser(null);
  });

  describe("setCurrentUser and getCurrentUser", () => {
    it("should set and get current user", () => {
      const user = {
        id: "user-123",
        userName: "John Doe",
        userColor: "#FF0000",
      };

      activityLogger.setCurrentUser(user);
      const currentUser = activityLogger.getCurrentUser();

      expect(currentUser).toEqual(user);
    });

    it("should return null when no user is set", () => {
      activityLogger.setCurrentUser(null);
      const currentUser = activityLogger.getCurrentUser();

      expect(currentUser).toBeNull();
    });

    it("should fallback to localStorage when currentUser is null", () => {
      const storedProfile = {
        id: "local-123",
        userName: "Jane Smith",
        userColor: "#00FF00",
      };

      localStorageMock.setItem("userProfile", JSON.stringify(storedProfile));
      activityLogger.setCurrentUser(null);

      const currentUser = activityLogger.getCurrentUser();

      expect(currentUser).toEqual({
        id: "local-123",
        userName: "Jane Smith",
        userColor: "#00FF00",
      });
    });

    it("should use default id when localStorage profile has no id", () => {
      const storedProfile = {
        userName: "No ID User",
      };

      localStorageMock.setItem("userProfile", JSON.stringify(storedProfile));
      activityLogger.setCurrentUser(null);

      const currentUser = activityLogger.getCurrentUser();

      expect(currentUser).toEqual({
        id: "local-user",
        userName: "No ID User",
        userColor: undefined,
      });
    });

    it("should return null when localStorage has invalid JSON", () => {
      localStorageMock.setItem("userProfile", "invalid json {");
      activityLogger.setCurrentUser(null);

      const currentUser = activityLogger.getCurrentUser();

      expect(currentUser).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        "Failed to get user profile from localStorage:",
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it("should return null when localStorage has no userName", () => {
      localStorageMock.setItem("userProfile", JSON.stringify({ id: "123" }));
      activityLogger.setCurrentUser(null);

      const currentUser = activityLogger.getCurrentUser();

      expect(currentUser).toBeNull();
    });

    it("should prioritize currentUser over localStorage", () => {
      const currentUser = {
        id: "current-123",
        userName: "Current User",
      };
      const storedProfile = {
        id: "stored-456",
        userName: "Stored User",
      };

      localStorageMock.setItem("userProfile", JSON.stringify(storedProfile));
      activityLogger.setCurrentUser(currentUser);

      const result = activityLogger.getCurrentUser();

      expect(result).toEqual(currentUser);
    });
  });

  describe("logActivity", () => {
    beforeEach(() => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);
    });

    it("should log activity with user attribution", async () => {
      const user = {
        id: "user-123",
        userName: "Test User",
      };
      activityLogger.setCurrentUser(user);

      const result = await activityLogger.logActivity("test_action", "test_entity", "entity-123", {
        key: "value",
      });

      expect(result).toBeDefined();
      expect(result?.action).toBe("test_action");
      expect(result?.entityType).toBe("test_entity");
      expect(result?.entityId).toBe("entity-123");
      expect(result?.userId).toBe("user-123");
      expect(result?.userName).toBe("Test User");
      expect(result?.details).toEqual({
        key: "value",
        userAgent: "Mozilla/5.0 Test Browser",
        timestamp: expect.any(String),
      });

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "test_action",
          entityType: "test_entity",
          entityId: "entity-123",
          userId: "user-123",
          userName: "Test User",
        })
      );
    });

    it("should use anonymous user when no user is set", async () => {
      activityLogger.setCurrentUser(null);

      await activityLogger.logActivity("test_action", "test_entity", "entity-123");

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "anonymous",
          userName: "Anonymous User",
        })
      );
    });

    it("should include timestamp and userAgent in details", async () => {
      await activityLogger.logActivity("test_action", "test_entity", "entity-123", {
        custom: "data",
      });

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          details: {
            custom: "data",
            userAgent: "Mozilla/5.0 Test Browser",
            timestamp: expect.any(String),
          },
        })
      );
    });

    it("should log debug message on success", async () => {
      const user = {
        id: "user-123",
        userName: "Test User",
      };
      activityLogger.setCurrentUser(user);

      await activityLogger.logActivity("test_action", "test_entity", "entity-123");

      expect(logger.debug).toHaveBeenCalledWith("Activity logged:", {
        action: "test_action",
        entityType: "test_entity",
        entityId: "entity-123",
        user: "Test User",
      });
    });

    it("should handle database errors gracefully and return null", async () => {
      (budgetDb.auditLog.add as Mock).mockRejectedValue(new Error("Database error"));

      const result = await activityLogger.logActivity("test_action", "test_entity", "entity-123");

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith("Failed to log activity:", expect.any(Error), {
        action: "test_action",
        entityType: "test_entity",
        entityId: "entity-123",
      });
    });

    it("should not throw errors when logging fails", async () => {
      (budgetDb.auditLog.add as Mock).mockRejectedValue(new Error("Database error"));

      await expect(
        activityLogger.logActivity("test_action", "test_entity", "entity-123")
      ).resolves.toBeNull();
    });
  });

  describe("Envelope Activities", () => {
    const mockEnvelope: Envelope = {
      id: "env-123",
      name: "Groceries",
      category: "Food",
      type: "standard",
      balance: 100,
      monthlyBudget: 500,
      lastModified: Date.now(),
    } as Envelope;

    it("should log envelope created", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logEnvelopeCreated(mockEnvelope);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.ENVELOPE_CREATED,
          entityType: ENTITY_TYPES.ENVELOPE,
          entityId: "env-123",
          details: expect.objectContaining({
            name: "Groceries",
            category: "Food",
            monthlyBudget: 500,
          }),
        })
      );
    });

    it("should log envelope updated with changes", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      const changes = {
        monthlyBudget: 600,
      };

      await activityLogger.logEnvelopeUpdated(mockEnvelope, changes);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.ENVELOPE_UPDATED,
          entityType: ENTITY_TYPES.ENVELOPE,
          entityId: "env-123",
          details: expect.objectContaining({
            name: "Groceries",
            changes: ["monthlyBudget"],
            monthlyBudget: 600,
          }),
        })
      );
    });

    it("should log envelope deleted", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logEnvelopeDeleted(mockEnvelope);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.ENVELOPE_DELETED,
          entityType: ENTITY_TYPES.ENVELOPE,
          entityId: "env-123",
          details: expect.objectContaining({
            name: "Groceries",
            category: "Food",
          }),
        })
      );
    });

    it("should log envelope funded", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logEnvelopeFunded("env-123", 250, "paycheck");

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.ENVELOPE_FUNDED,
          entityType: ENTITY_TYPES.ENVELOPE,
          entityId: "env-123",
          details: expect.objectContaining({
            amount: 250,
            source: "paycheck",
          }),
        })
      );
    });

    it("should log envelope funded with default source", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logEnvelopeFunded("env-123", 100);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            source: "manual",
          }),
        })
      );
    });
  });

  describe("Transaction Activities", () => {
    const mockTransaction: Transaction = {
      id: "txn-123",
      description: "Coffee Shop",
      amount: -5.5,
      category: "Dining",
      envelopeId: "env-123",
      date: "2024-01-01",
      lastModified: Date.now(),
    } as Transaction;

    it("should log transaction added", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logTransactionAdded(mockTransaction);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.TRANSACTION_ADDED,
          entityType: ENTITY_TYPES.TRANSACTION,
          entityId: "txn-123",
          details: expect.objectContaining({
            description: "Coffee Shop",
            amount: -5.5,
            category: "Dining",
            envelopeId: "env-123",
            date: "2024-01-01",
          }),
        })
      );
    });

    it("should log transaction updated with changes", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      const changes = {
        category: "Food",
      };

      await activityLogger.logTransactionUpdated(mockTransaction, changes);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.TRANSACTION_UPDATED,
          entityType: ENTITY_TYPES.TRANSACTION,
          entityId: "txn-123",
          details: expect.objectContaining({
            description: "Coffee Shop",
            amount: -5.5,
            changes: ["category"],
            category: "Food",
          }),
        })
      );
    });

    it("should log transaction deleted", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logTransactionDeleted(mockTransaction);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.TRANSACTION_DELETED,
          entityType: ENTITY_TYPES.TRANSACTION,
          entityId: "txn-123",
          details: expect.objectContaining({
            description: "Coffee Shop",
            amount: -5.5,
            category: "Dining",
          }),
        })
      );
    });

    it("should log transactions imported", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logTransactionsImported(25, "csv");

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.TRANSACTIONS_IMPORTED,
          entityType: ENTITY_TYPES.SYSTEM,
          entityId: expect.stringContaining("import_"),
          details: expect.objectContaining({
            count: 25,
            source: "csv",
          }),
        })
      );
    });

    it("should log transactions imported with default source", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logTransactionsImported(10);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            source: "file",
          }),
        })
      );
    });
  });

  describe("Bill Activities", () => {
    const mockBill: Bill = {
      id: "bill-123",
      name: "Electric Bill",
      amount: 150,
      category: "Utilities",
      dueDate: "2024-01-15",
      type: "liability",
      balance: 150,
      lastModified: Date.now(),
    } as Bill;

    it("should log bill created", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logBillCreated(mockBill);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.BILL_CREATED,
          entityType: ENTITY_TYPES.BILL,
          entityId: "bill-123",
          details: expect.objectContaining({
            name: "Electric Bill",
            amount: 150,
            category: "Utilities",
            dueDate: "2024-01-15",
          }),
        })
      );
    });

    it("should log bill updated with changes", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      const changes = {
        dueDate: "2024-01-20",
      };

      await activityLogger.logBillUpdated(mockBill, changes);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.BILL_UPDATED,
          entityType: ENTITY_TYPES.BILL,
          entityId: "bill-123",
          details: expect.objectContaining({
            name: "Electric Bill",
            amount: 150,
            changes: ["dueDate"],
            dueDate: "2024-01-20",
          }),
        })
      );
    });

    it("should log bill paid", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logBillPaid(mockBill, 150);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.BILL_PAID,
          entityType: ENTITY_TYPES.BILL,
          entityId: "bill-123",
          details: expect.objectContaining({
            name: "Electric Bill",
            amount: 150,
            dueDate: "2024-01-15",
            paidDate: expect.any(String),
          }),
        })
      );
    });
  });

  describe("Paycheck Activities", () => {
    const mockPaycheck: PaycheckHistory & { payerName?: string; mode?: string } = {
      id: "pay-123",
      amount: 2500,
      payerName: "Acme Corp",
      mode: "direct_deposit",
      date: "2024-01-15",
      description: "Bi-weekly paycheck",
      category: "Income",
      lastModified: Date.now(),
    } as PaycheckHistory & { payerName?: string; mode?: string };

    it("should log paycheck processed", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logPaycheckProcessed(mockPaycheck);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.PAYCHECK_PROCESSED,
          entityType: ENTITY_TYPES.PAYCHECK,
          entityId: "pay-123",
          details: expect.objectContaining({
            amount: 2500,
            payerName: "Acme Corp",
            mode: "direct_deposit",
            date: "2024-01-15",
          }),
        })
      );
    });

    it("should log paycheck processed with generated id", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      const paycheckWithoutId = { ...mockPaycheck, id: undefined };

      await activityLogger.logPaycheckProcessed(paycheckWithoutId);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: expect.stringContaining("paycheck_"),
        })
      );
    });

    it("should log paycheck deleted", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logPaycheckDeleted(mockPaycheck);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.PAYCHECK_DELETED,
          entityType: ENTITY_TYPES.PAYCHECK,
          entityId: "pay-123",
          details: expect.objectContaining({
            amount: 2500,
            payerName: "Acme Corp",
            mode: "direct_deposit",
          }),
        })
      );
    });
  });

  describe("Debt Activities", () => {
    const mockDebt: Debt = {
      id: "debt-123",
      name: "Credit Card",
      creditor: "Bank of America",
      currentBalance: 5000,
      minimumPayment: 150,
      type: "liability",
      balance: 5000,
      category: "Debt",
      lastModified: Date.now(),
    } as Debt;

    it("should log debt created", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logDebtCreated(mockDebt);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.DEBT_CREATED,
          entityType: ENTITY_TYPES.DEBT,
          entityId: "debt-123",
          details: expect.objectContaining({
            name: "Credit Card",
            creditor: "Bank of America",
            currentBalance: 5000,
            minimumPayment: 150,
          }),
        })
      );
    });

    it("should log debt updated with changes", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      const changes = {
        currentBalance: 4500,
        minimumPayment: 140,
      };

      await activityLogger.logDebtUpdated(mockDebt, changes);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.DEBT_UPDATED,
          entityType: ENTITY_TYPES.DEBT,
          entityId: "debt-123",
          details: expect.objectContaining({
            name: "Credit Card",
            creditor: "Bank of America",
            changes: ["currentBalance", "minimumPayment"],
          }),
        })
      );
    });
  });

  describe("System Activities", () => {
    it("should log sync completed with details", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logSyncCompleted("incremental", 15);

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          action: ACTIVITY_TYPES.SYNC_COMPLETED,
          entityType: ENTITY_TYPES.SYSTEM,
          entityId: expect.stringContaining("sync_"),
          details: expect.objectContaining({
            syncType: "incremental",
            itemsChanged: 15,
          }),
        })
      );
    });

    it("should log sync completed with default values", async () => {
      (budgetDb.auditLog.add as Mock).mockResolvedValue(1);

      await activityLogger.logSyncCompleted();

      expect(budgetDb.auditLog.add).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            syncType: "full",
            itemsChanged: 0,
          }),
        })
      );
    });
  });

  describe("getRecentActivity", () => {
    const mockActivities = [
      {
        id: 1,
        timestamp: Date.now(),
        action: "envelope_created",
        entityType: "envelope",
        entityId: "env-1",
        userId: "user-1",
        userName: "User 1",
      },
      {
        id: 2,
        timestamp: Date.now() - 1000,
        action: "transaction_added",
        entityType: "transaction",
        entityId: "txn-1",
        userId: "user-1",
        userName: "User 1",
      },
    ];

    it("should retrieve recent activities with default limit", async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockActivities);
      const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray });
      const mockReverse = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ reverse: mockReverse });

      (budgetDb.auditLog.orderBy as Mock).mockImplementation(mockOrderBy);

      const activities = await activityLogger.getRecentActivity();

      expect(activities).toEqual(mockActivities);
      expect(mockOrderBy).toHaveBeenCalledWith("timestamp");
      expect(mockReverse).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it("should filter by entityType", async () => {
      const mockToArray = vi.fn().mockResolvedValue([mockActivities[0]]);
      const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray });
      const mockReverse = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEquals = vi.fn().mockReturnValue({ reverse: mockReverse });
      const mockWhere = vi.fn().mockReturnValue({ equals: mockEquals });

      (budgetDb.auditLog.where as Mock).mockImplementation(mockWhere);

      const activities = await activityLogger.getRecentActivity(50, "envelope", null);

      expect(activities).toEqual([mockActivities[0]]);
      expect(mockWhere).toHaveBeenCalledWith("entityType");
      expect(mockEquals).toHaveBeenCalledWith("envelope");
    });

    it("should filter by entityType and entityId", async () => {
      const mockToArray = vi.fn().mockResolvedValue([mockActivities[0]]);
      const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray });
      const mockReverse = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEquals = vi.fn().mockReturnValue({ reverse: mockReverse });
      const mockWhere = vi.fn().mockReturnValue({ equals: mockEquals });

      (budgetDb.auditLog.where as Mock).mockImplementation(mockWhere);

      const activities = await activityLogger.getRecentActivity(50, "envelope", "env-1");

      expect(activities).toEqual([mockActivities[0]]);
      expect(mockWhere).toHaveBeenCalledWith("[entityType+entityId]");
      expect(mockEquals).toHaveBeenCalledWith(["envelope", "env-1"]);
    });

    it("should use custom limit", async () => {
      const mockToArray = vi.fn().mockResolvedValue(mockActivities.slice(0, 10));
      const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray });
      const mockReverse = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ reverse: mockReverse });

      (budgetDb.auditLog.orderBy as Mock).mockImplementation(mockOrderBy);

      await activityLogger.getRecentActivity(10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("should handle database errors gracefully", async () => {
      const mockToArray = vi.fn().mockRejectedValue(new Error("Database error"));
      const mockLimit = vi.fn().mockReturnValue({ toArray: mockToArray });
      const mockReverse = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockOrderBy = vi.fn().mockReturnValue({ reverse: mockReverse });

      (budgetDb.auditLog.orderBy as Mock).mockImplementation(mockOrderBy);

      const activities = await activityLogger.getRecentActivity();

      expect(activities).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to retrieve activity history:",
        expect.any(Error)
      );
    });
  });

  describe("getActivityCount", () => {
    it("should get total activity count", async () => {
      (budgetDb.auditLog.count as Mock).mockResolvedValue(150);

      const count = await activityLogger.getActivityCount();

      expect(count).toBe(150);
      expect(budgetDb.auditLog.count).toHaveBeenCalled();
    });

    it("should count activities by entityType", async () => {
      const mockWhere = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue(25),
        }),
      });
      (budgetDb.auditLog.where as Mock).mockReturnValue(mockWhere());

      const count = await activityLogger.getActivityCount("envelope", null);

      expect(count).toBe(25);
      expect(budgetDb.auditLog.where).toHaveBeenCalledWith("entityType");
    });

    it("should count activities by entityType and entityId", async () => {
      const mockEquals = vi.fn().mockReturnValue({
        count: vi.fn().mockResolvedValue(5),
      });
      const mockWhere = vi.fn().mockReturnValue({
        equals: mockEquals,
      });
      (budgetDb.auditLog.where as Mock).mockReturnValue(mockWhere());

      const count = await activityLogger.getActivityCount("envelope", "env-123");

      expect(count).toBe(5);
      expect(budgetDb.auditLog.where).toHaveBeenCalledWith("[entityType+entityId]");
      expect(mockEquals).toHaveBeenCalledWith(["envelope", "env-123"]);
    });

    it("should handle database errors gracefully", async () => {
      (budgetDb.auditLog.count as Mock).mockRejectedValue(new Error("Database error"));

      const count = await activityLogger.getActivityCount();

      expect(count).toBe(0);
      expect(logger.error).toHaveBeenCalledWith("Failed to get activity count:", expect.any(Error));
    });
  });

  describe("clearOldActivities", () => {
    it("should clear activities older than specified days", async () => {
      const mockDelete = vi.fn().mockResolvedValue(42);
      const mockBelow = vi.fn().mockReturnValue({
        delete: mockDelete,
      });
      const mockWhere = {
        below: mockBelow,
      };
      (budgetDb.auditLog.where as Mock).mockReturnValue(mockWhere);

      const deletedCount = await activityLogger.clearOldActivities(90);

      expect(deletedCount).toBe(42);
      expect(budgetDb.auditLog.where).toHaveBeenCalledWith("timestamp");
      expect(mockBelow).toHaveBeenCalledWith(expect.any(Number));
      expect(logger.info).toHaveBeenCalledWith("Cleared 42 old activities older than 90 days");
    });

    it("should use default 90 days when not specified", async () => {
      const mockDelete = vi.fn().mockResolvedValue(10);
      const mockBelow = vi.fn().mockReturnValue({
        delete: mockDelete,
      });
      const mockWhere = {
        below: mockBelow,
      };
      (budgetDb.auditLog.where as Mock).mockReturnValue(mockWhere);

      await activityLogger.clearOldActivities();

      expect(mockBelow).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should calculate correct cutoff timestamp", async () => {
      const mockDelete = vi.fn().mockResolvedValue(5);
      const mockBelow = vi.fn().mockReturnValue({
        delete: mockDelete,
      });
      const mockWhere = {
        below: mockBelow,
      };
      (budgetDb.auditLog.where as Mock).mockReturnValue(mockWhere);

      await activityLogger.clearOldActivities(30);

      expect(mockBelow).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should handle database errors gracefully", async () => {
      const mockBelow = vi.fn().mockReturnValue({
        delete: vi.fn().mockRejectedValue(new Error("Database error")),
      });
      const mockWhere = {
        below: mockBelow,
      };
      (budgetDb.auditLog.where as Mock).mockReturnValue(mockWhere);

      const deletedCount = await activityLogger.clearOldActivities(30);

      expect(deletedCount).toBe(0);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to clear old activities:",
        expect.any(Error)
      );
    });
  });

  describe("Constants", () => {
    it("should export ACTIVITY_TYPES constants", () => {
      expect(ACTIVITY_TYPES).toHaveProperty("ENVELOPE_CREATED");
      expect(ACTIVITY_TYPES).toHaveProperty("TRANSACTION_ADDED");
      expect(ACTIVITY_TYPES).toHaveProperty("BILL_CREATED");
      expect(ACTIVITY_TYPES).toHaveProperty("PAYCHECK_PROCESSED");
      expect(ACTIVITY_TYPES).toHaveProperty("DEBT_CREATED");
      expect(ACTIVITY_TYPES).toHaveProperty("SYNC_COMPLETED");
    });

    it("should export ENTITY_TYPES constants", () => {
      expect(ENTITY_TYPES).toHaveProperty("ENVELOPE");
      expect(ENTITY_TYPES).toHaveProperty("TRANSACTION");
      expect(ENTITY_TYPES).toHaveProperty("BILL");
      expect(ENTITY_TYPES).toHaveProperty("PAYCHECK");
      expect(ENTITY_TYPES).toHaveProperty("DEBT");
      expect(ENTITY_TYPES).toHaveProperty("SYSTEM");
    });
  });
});
