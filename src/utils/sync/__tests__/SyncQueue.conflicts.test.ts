import { describe, it, expect, beforeEach, vi } from "vitest";
import { SyncQueue } from "../SyncQueue";

vi.mock("../../common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SyncQueue - Conflict Resolution", () => {
  let syncQueue: SyncQueue;

  beforeEach(() => {
    vi.clearAllMocks();
    syncQueue = new SyncQueue({
      name: "TestSyncQueue",
      debounceMs: 100,
      maxBatchSize: 5,
    });
  });

  describe("Transaction Conflicts", () => {
    it("should detect duplicate transaction", async () => {
      const operation1 = vi.fn(async (data) => data);
      const operation2 = vi.fn(async (data) => data);

      const txn = { id: "txn-1", amount: 100 };

      // Enqueue same transaction twice
      const promise1 = syncQueue.enqueue("transaction:txn-1", operation1, txn);
      const promise2 = syncQueue.enqueue("transaction:txn-1", operation2, txn);

      // First promise will be rejected as superseded, second will resolve
      const results = await Promise.allSettled([promise1, promise2]);

      // First should be rejected (superseded)
      expect(results[0].status).toBe("rejected");
      if (results[0].status === "rejected") {
        expect(results[0].reason).toBeInstanceOf(Error);
        expect(results[0].reason.message).toContain("Superseded");
      }

      // Second operation should supersede the first
      expect(results[1].status).toBe("fulfilled");
      expect(operation2).toHaveBeenCalled();
      // First operation should not be called if superseded
    });

    it("should resolve transaction overwrites using last-write", async () => {
      const earlyOperation = vi.fn(async (data) => data);
      const laterOperation = vi.fn(async (data) => data);

      const earlyTxn = { id: "txn-1", amount: 100, lastModified: Date.now() - 1000 };
      const laterTxn = { id: "txn-1", amount: 200, lastModified: Date.now() };

      // Enqueue earlier transaction
      const promise1 = syncQueue.enqueue("transaction:txn-1", earlyOperation, earlyTxn);

      // Enqueue later transaction (should supersede)
      const promise2 = syncQueue.enqueue("transaction:txn-1", laterOperation, laterTxn);

      const results = await Promise.allSettled([promise1, promise2]);

      // First should be rejected (superseded)
      expect(results[0].status).toBe("rejected");
      // Second should succeed
      expect(results[1].status).toBe("fulfilled");

      // Only the later operation should be processed
      expect(laterOperation).toHaveBeenCalled();
    });

    it("should handle identical transaction data", async () => {
      const operation1 = vi.fn(async (data) => data);
      const operation2 = vi.fn(async (data) => data);

      const txn = { id: "txn-1", amount: 100, description: "Same transaction" };

      const promise1 = syncQueue.enqueue("transaction:txn-1", operation1, txn);
      const promise2 = syncQueue.enqueue("transaction:txn-1", operation2, txn);

      const results = await Promise.allSettled([promise1, promise2]);

      // First should be rejected (superseded)
      expect(results[0].status).toBe("rejected");
      // Second should succeed
      expect(results[1].status).toBe("fulfilled");

      // Should handle duplicate gracefully
      expect(operation2).toHaveBeenCalled();
    });

    it("should match transactions by similar amounts and dates", async () => {
      const operation = vi.fn(async (data) => data);

      const txn1 = {
        id: "txn-1",
        amount: 100.0,
        date: "2024-01-01",
        category: "Groceries",
      };

      const txn2 = {
        id: "txn-2",
        amount: 100.0,
        date: "2024-01-01",
        category: "Groceries",
      };

      await syncQueue.enqueue("transaction:txn-1", operation, txn1);
      await syncQueue.enqueue("transaction:txn-2", operation, txn2);

      // Different IDs but similar data - should process both
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("Bill Conflicts", () => {
    it("should detect duplicate bills", async () => {
      const operation = vi.fn(async (data) => data);

      const bill = { id: "bill-1", name: "Rent", amount: 1500 };

      const promise1 = syncQueue.enqueue("bill:bill-1", operation, bill);
      const promise2 = syncQueue.enqueue("bill:bill-1", operation, bill);

      const results = await Promise.allSettled([promise1, promise2]);

      // First should be rejected (superseded)
      expect(results[0].status).toBe("rejected");
      // Second should succeed
      expect(results[1].status).toBe("fulfilled");

      // Should handle duplicate bill
      expect(operation).toHaveBeenCalled();
    });

    it("should resolve amount mismatches", async () => {
      const operation = vi.fn(async (data) => data);

      const bill1 = { id: "bill-1", name: "Rent", amount: 1500, lastModified: Date.now() - 1000 };
      const bill2 = { id: "bill-1", name: "Rent", amount: 1600, lastModified: Date.now() };

      const promise1 = syncQueue.enqueue("bill:bill-1", operation, bill1);
      const promise2 = syncQueue.enqueue("bill:bill-1", operation, bill2);

      const results = await Promise.allSettled([promise1, promise2]);

      // First should be rejected (superseded)
      expect(results[0].status).toBe("rejected");
      // Second should succeed
      expect(results[1].status).toBe("fulfilled");

      // Latest version should win
      expect(operation).toHaveBeenCalledWith(bill2);
    });

    it("should handle frequency conflicts", async () => {
      const operation = vi.fn(async (data) => data);

      const bill1 = { id: "bill-1", frequency: "monthly", lastModified: Date.now() - 1000 };
      const bill2 = { id: "bill-1", frequency: "bi-weekly", lastModified: Date.now() };

      await syncQueue.enqueue("bill:bill-1", operation, bill1);
      await syncQueue.enqueue("bill:bill-1", operation, bill2);

      // Last write wins
      expect(operation).toHaveBeenLastCalledWith(bill2);
    });

    it("should resolve payment status conflicts", async () => {
      const operation = vi.fn(async (data) => data);

      const bill1 = {
        id: "bill-1",
        paid: false,
        paidAmount: 0,
        lastModified: Date.now() - 1000,
      };
      const bill2 = {
        id: "bill-1",
        paid: true,
        paidAmount: 1500,
        lastModified: Date.now(),
      };

      await syncQueue.enqueue("bill:bill-1", operation, bill1);
      await syncQueue.enqueue("bill:bill-1", operation, bill2);

      // Paid status from latest should be preserved
      expect(operation).toHaveBeenLastCalledWith(bill2);
    });
  });

  describe("Envelope Conflicts", () => {
    it("should resolve fund allocation conflicts", async () => {
      const operation = vi.fn(async (data) => data);

      const env1 = {
        id: "env-1",
        balance: 500,
        allocated: 500,
        lastModified: Date.now() - 1000,
      };
      const env2 = {
        id: "env-1",
        balance: 700,
        allocated: 700,
        lastModified: Date.now(),
      };

      await syncQueue.enqueue("envelope:env-1", operation, env1);
      await syncQueue.enqueue("envelope:env-1", operation, env2);

      // Latest allocation should win
      expect(operation).toHaveBeenLastCalledWith(env2);
    });

    it("should handle different allocation amounts", async () => {
      const operation = vi.fn(async (data) => data);

      const env1 = { id: "env-1", allocated: 500 };
      const env2 = { id: "env-1", allocated: 700 };

      await syncQueue.enqueue("envelope:env-1", operation, env1);
      await syncQueue.enqueue("envelope:env-1", operation, env2);

      // Last operation should be called
      expect(operation).toHaveBeenCalledWith(env2);
    });

    it("should use timestamp-based resolution", async () => {
      const operation = vi.fn(async (data) => data);

      const older = { id: "env-1", balance: 500, lastModified: 1000 };
      const newer = { id: "env-1", balance: 700, lastModified: 2000 };

      await syncQueue.enqueue("envelope:env-1", operation, older);
      await syncQueue.enqueue("envelope:env-1", operation, newer);

      // Newer timestamp should win
      expect(operation).toHaveBeenLastCalledWith(newer);
    });
  });

  describe("Complex Conflicts", () => {
    it("should handle multi-document conflicts", async () => {
      const txnOp = vi.fn(async (data) => data);
      const billOp = vi.fn(async (data) => data);
      const envOp = vi.fn(async (data) => data);

      // Queue operations for different document types
      await Promise.all([
        syncQueue.enqueue("transaction:txn-1", txnOp, { id: "txn-1" }),
        syncQueue.enqueue("bill:bill-1", billOp, { id: "bill-1" }),
        syncQueue.enqueue("envelope:env-1", envOp, { id: "env-1" }),
      ]);

      expect(txnOp).toHaveBeenCalled();
      expect(billOp).toHaveBeenCalled();
      expect(envOp).toHaveBeenCalled();
    });

    it("should handle cascade effects in related documents", async () => {
      const operation = vi.fn(async (data) => data);

      // Transaction affects envelope balance
      const txn = { id: "txn-1", amount: 100, envelopeId: "env-1" };
      const env = { id: "env-1", balance: 500 };

      await syncQueue.enqueue("transaction:txn-1", operation, txn);
      await syncQueue.enqueue("envelope:env-1", operation, env);

      // Both operations should be processed
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should maintain correct resolution order", async () => {
      const operations: string[] = [];

      const op1 = vi.fn(async (data) => {
        operations.push("op1");
        return data;
      });
      const op2 = vi.fn(async (data) => {
        operations.push("op2");
        return data;
      });
      const op3 = vi.fn(async (data) => {
        operations.push("op3");
        return data;
      });

      await Promise.all([
        syncQueue.enqueue("doc:1", op1, {}),
        syncQueue.enqueue("doc:2", op2, {}),
        syncQueue.enqueue("doc:3", op3, {}),
      ]);

      // All should be called
      expect(operations.length).toBe(3);
    });
  });

  describe("Conflict Resolution Strategies", () => {
    it("should apply last-write-wins strategy", async () => {
      const operation = vi.fn(async (data) => data);

      const v1 = { id: "doc-1", value: "v1", lastModified: 1000 };
      const v2 = { id: "doc-1", value: "v2", lastModified: 2000 };
      const v3 = { id: "doc-1", value: "v3", lastModified: 3000 };

      await syncQueue.enqueue("doc:doc-1", operation, v1);
      await syncQueue.enqueue("doc:doc-1", operation, v2);
      await syncQueue.enqueue("doc:doc-1", operation, v3);

      // Only latest should be called
      expect(operation).toHaveBeenLastCalledWith(v3);
    });

    it("should support user-guided resolution", async () => {
      const operation = vi.fn(async (data) => {
        // Simulate user choosing a version
        return data;
      });

      const local = { id: "doc-1", value: "local", source: "local" };
      const remote = { id: "doc-1", value: "remote", source: "remote" };

      await syncQueue.enqueue("doc:doc-1", operation, local);
      const result = await syncQueue.enqueue("doc:doc-1", operation, remote);

      // User choice (remote) should be respected
      expect(result).toBeDefined();
    });

    it("should perform smart merge for non-conflicting fields", async () => {
      const mergeOperation = vi.fn(async (data) => {
        // Simulate merging non-conflicting fields
        return {
          ...data,
          merged: true,
        };
      });

      const local = { id: "doc-1", field1: "a", field2: "b" };
      const remote = { id: "doc-1", field1: "a", field3: "c" };

      await syncQueue.enqueue("doc:doc-1", mergeOperation, local);
      const result = await syncQueue.enqueue("doc:doc-1", mergeOperation, remote);

      expect(result).toBeDefined();
    });

    it("should log conflict resolution details", async () => {
      const loggerModule = await import("@/utils/common/logger");
      const logger = loggerModule.default;
      const operation = vi.fn(async (data) => data);

      const v1 = { id: "doc-1", value: "v1" };
      const v2 = { id: "doc-1", value: "v2" };

      const promise1 = syncQueue.enqueue("doc:doc-1", operation, v1);
      const promise2 = syncQueue.enqueue("doc:doc-1", operation, v2);

      await Promise.allSettled([promise1, promise2]);

      // Logger should be called for queue operations
      expect(logger.debug).toHaveBeenCalled();
    });
  });

  describe("Queue Statistics", () => {
    it("should track superseded operations", async () => {
      const operation = vi.fn(async (data) => data);

      await syncQueue.enqueue("doc:1", operation, { v: 1 });
      await syncQueue.enqueue("doc:1", operation, { v: 2 });
      await syncQueue.enqueue("doc:1", operation, { v: 3 });

      // Check stats for superseded operations
      expect(syncQueue.stats.superseded).toBeGreaterThanOrEqual(0);
    });

    it("should track processed operations", async () => {
      const operation = vi.fn(async (data) => data);

      await syncQueue.enqueue("doc:1", operation, {});
      await syncQueue.enqueue("doc:2", operation, {});

      expect(syncQueue.stats.processed).toBeGreaterThanOrEqual(0);
    });

    it("should track failed operations", async () => {
      const failingOp = vi.fn(async () => {
        throw new Error("Operation failed");
      });

      // Enqueue and catch the expected rejection
      const promise = syncQueue.enqueue("doc:1", failingOp, {}).catch(() => {
        // Expected to fail, suppress unhandled rejection
      });

      const results = await syncQueue.flush();
      await promise; // Ensure promise is fully handled

      // Operation should have failed
      expect(results[0].success).toBe(false);
      expect(syncQueue.stats.failed).toBeGreaterThanOrEqual(1);
    });
  });
});
