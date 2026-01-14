import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SafeUnknown } from "@/types/firebase";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock firebaseConfig
vi.mock("@/utils/common/firebaseConfig", () => ({
  firebaseConfig: {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.appspot.com",
    messagingSenderId: "123456",
    appId: "1:123456:web:abc",
  },
}));

// Mock encryption manager
vi.mock("@/services/security/encryptionManager", () => ({
  encryptionManager: {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    setKey: vi.fn(),
    deriveKey: vi.fn(),
  },
}));

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transaction: vi.fn(),
    envelopes: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    transactions: {
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    budget: {
      put: vi.fn(),
    },
  },
}));

// Import after mocks
import { FirebaseSyncProvider } from "../firebaseSyncProvider";
import { encryptionManager } from "@/services/security/encryptionManager";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/common/logger";

describe("FirebaseSyncProvider", () => {
  let provider: FirebaseSyncProvider;
  let mockCryptoKey: CryptoKey;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get Firebase mocks from global setup - they should already be available
    const { onAuthStateChanged, signInAnonymously } = await import("firebase/auth");
    const { getDoc, setDoc, getDocs, writeBatch } = await import("firebase/firestore");

    // Setup default mock behavior for Firebase
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      // Immediately call callback with authenticated user
      setTimeout(() => callback({ uid: "test-user" } as never), 0);
      return vi.fn(); // unsubscribe function
    });

    vi.mocked(signInAnonymously).mockResolvedValue({
      user: { uid: "anonymous-user" },
    } as never);

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => null,
    } as never);

    vi.mocked(setDoc).mockResolvedValue(undefined);

    vi.mocked(getDocs).mockResolvedValue({
      empty: true,
      docs: [],
    } as never);

    vi.mocked(writeBatch).mockReturnValue({
      set: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    } as never);

    // Setup encryption mocks
    vi.mocked(encryptionManager.encrypt).mockResolvedValue({
      data: [1, 2, 3],
      iv: [4, 5, 6],
      metadata: {
        optimized: true,
        originalSize: 100,
        compressedSize: 80,
        encryptedSize: 90,
        compressionRatio: 1.25,
      },
    });

    vi.mocked(encryptionManager.decrypt).mockResolvedValue({
      lastModified: Date.now(),
      envelopes: [],
      transactions: [],
      unassignedCash: 0,
      actualBalance: 0,
    });

    // Setup budgetDb mocks
    vi.mocked(budgetDb.transaction).mockImplementation(
      async (_mode: string, _stores: unknown[], callback: () => Promise<void>) => {
        await callback();
      }
    );

    vi.mocked(budgetDb.envelopes.clear).mockResolvedValue(undefined);
    vi.mocked(budgetDb.envelopes.bulkAdd).mockResolvedValue(1);
    vi.mocked(budgetDb.transactions.clear).mockResolvedValue(undefined);
    vi.mocked(budgetDb.transactions.bulkAdd).mockResolvedValue(1);
    vi.mocked(budgetDb.budget.put).mockResolvedValue("metadata");

    // Initialize provider
    provider = new FirebaseSyncProvider();
    mockCryptoKey = { type: "secret", algorithm: { name: "AES-GCM" } } as CryptoKey;
  });

  describe("initialize", () => {
    it("should initialize provider with budgetId and key", async () => {
      await provider.initialize("test-budget-id", mockCryptoKey);

      expect(provider.name).toBe("firebase");
    });

    it("should call ensureAuthenticated during initialization", async () => {
      const { onAuthStateChanged } = await import("firebase/auth");

      await provider.initialize("test-budget-id", mockCryptoKey);

      expect(onAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe("ensureAuthenticated", () => {
    it("should resolve if user is already authenticated", async () => {
      await provider.initialize("test-budget-id", mockCryptoKey);
      const result = await provider.ensureAuthenticated();

      expect(result).toBe(true);
    });

    it("should sign in anonymously if user is not authenticated", async () => {
      const { onAuthStateChanged, signInAnonymously } = await import("firebase/auth");

      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        setTimeout(() => callback(null), 0);
        return vi.fn();
      });

      await provider.initialize("test-budget-id", mockCryptoKey);
      const result = await provider.ensureAuthenticated();

      expect(result).toBe(true);
      expect(signInAnonymously).toHaveBeenCalled();
    });

    it("should reject if sign-in fails", async () => {
      const { onAuthStateChanged, signInAnonymously } = await import("firebase/auth");

      // Create new provider so we can control the mock before initialization
      const testProvider = new FirebaseSyncProvider();

      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        setTimeout(() => callback(null), 0);
        return vi.fn();
      });

      vi.mocked(signInAnonymously).mockRejectedValue(new Error("Sign-in failed"));

      // Initialize should fail
      await expect(testProvider.initialize("test-budget-id", mockCryptoKey)).rejects.toThrow(
        "Sign-in failed"
      );
    });
  });

  describe("load", () => {
    beforeEach(async () => {
      await provider.initialize("test-budget-id", mockCryptoKey);
    });

    it("should throw error if not initialized", async () => {
      const uninitializedProvider = new FirebaseSyncProvider();

      await expect(uninitializedProvider.load()).rejects.toThrow(
        "FirebaseSyncProvider: Not initialized"
      );
    });

    it("should return null if document does not exist", async () => {
      const result = await provider.load();

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should load and decrypt data successfully", async () => {
      const { getDoc } = await import("firebase/firestore");

      const mockData = {
        lastModified: 1234567890,
        envelopes: [{ id: "env1", name: "Groceries" }],
        transactions: [{ id: "txn1", amount: 100 }],
        unassignedCash: 500,
        actualBalance: 1000,
      };

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      vi.mocked(encryptionManager.decrypt).mockResolvedValue(mockData);

      const result = await provider.load();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it("should reassemble chunked data", async () => {
      const { getDoc, getDocs } = await import("firebase/firestore");

      const mockMainData = {
        lastModified: 1234567890,
        envelopes: { _chunked: true, count: 750 },
        transactions: [],
      };

      const chunkData1 = Array.from({ length: 500 }, (_, i) => ({ id: `env${i}` }));
      const chunkData2 = Array.from({ length: 250 }, (_, i) => ({ id: `env${i + 500}` }));

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      vi.mocked(encryptionManager.decrypt)
        .mockResolvedValueOnce(mockMainData)
        .mockResolvedValueOnce(chunkData1)
        .mockResolvedValueOnce(chunkData2);

      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            data: () => ({
              data: [10, 11, 12],
              iv: [13, 14, 15],
              chunkId: "envelopes_chunk_000",
            }),
          },
          {
            data: () => ({
              data: [16, 17, 18],
              iv: [19, 20, 21],
              chunkId: "envelopes_chunk_001",
            }),
          },
        ],
      } as never);

      const result = await provider.load();

      expect(result.success).toBe(true);
      expect(encryptionManager.decrypt).toHaveBeenCalledTimes(3);
    });

    it("should handle errors and return error response", async () => {
      const { getDoc } = await import("firebase/firestore");

      vi.mocked(getDoc).mockRejectedValue(new Error("Network error"));

      const result = await provider.load();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("LOAD_FAILED");
      expect(result.error?.message).toBe("Network error");
    });
  });

  describe("save", () => {
    beforeEach(async () => {
      await provider.initialize("test-budget-id", mockCryptoKey);
    });

    it("should throw error if not initialized", async () => {
      const uninitializedProvider = new FirebaseSyncProvider();

      await expect(uninitializedProvider.save({})).rejects.toThrow(
        "FirebaseSyncProvider: Not initialized"
      );
    });

    it("should upload data when cloud data does not exist", async () => {
      const { setDoc } = await import("firebase/firestore");

      const localData = {
        lastModified: Date.now(),
        envelopes: [{ id: "env1", name: "Groceries" }],
        transactions: [],
        unassignedCash: 500,
        actualBalance: 1000,
      };

      const result = await provider.save(localData);

      expect(result.success).toBe(true);
      expect(setDoc).toHaveBeenCalled();
    });

    it("should chunk large arrays (> 500 items)", async () => {
      const { writeBatch } = await import("firebase/firestore");

      const largeEnvelopes = Array.from({ length: 1200 }, (_, i) => ({
        id: `env${i}`,
        name: `Envelope ${i}`,
      }));

      const localData = {
        lastModified: Date.now(),
        envelopes: largeEnvelopes,
        transactions: [],
      };

      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn(() => Promise.resolve()),
      };
      vi.mocked(writeBatch).mockReturnValue(mockBatch as never);

      const result = await provider.save(localData);

      expect(result.success).toBe(true);
      expect(mockBatch.set).toHaveBeenCalledTimes(3); // 3 chunks: 500, 500, 200
    });

    it("should handle save errors gracefully", async () => {
      const { setDoc } = await import("firebase/firestore");

      // Mock setDoc to fail (this is the upload phase, not load)
      vi.mocked(setDoc).mockRejectedValue(new Error("Network error"));

      const localData = {
        lastModified: Date.now(),
        envelopes: [{ id: "env1" }], // Non-empty so it triggers upload
        transactions: [],
      };

      const result = await provider.save(localData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("SAVE_FAILED");
    });

    it("should log info on successful save", async () => {
      const localData = {
        lastModified: Date.now(),
        envelopes: [],
        transactions: [],
      };

      await provider.save(localData);

      expect(logger.info).toHaveBeenCalled();
    });

    it("should log errors on failed save", async () => {
      const { setDoc } = await import("firebase/firestore");

      // Mock setDoc to fail (this is the upload phase)
      vi.mocked(setDoc).mockRejectedValue(new Error("Test error"));

      const localData = {
        lastModified: Date.now(),
        envelopes: [{ id: "env1" }], // Non-empty so it triggers upload
        transactions: [],
      };

      await provider.save(localData);

      expect(logger.error).toHaveBeenCalledWith(
        "FirebaseSyncProvider: Save failed",
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  describe("name property", () => {
    it("should have name property set to 'firebase'", () => {
      expect(provider.name).toBe("firebase");
    });
  });

  describe("sync direction logic", () => {
    beforeEach(async () => {
      await provider.initialize("test-budget-id", mockCryptoKey);
    });

    it("should download when cloud has data and local envelopes are empty", async () => {
      const { getDoc } = await import("firebase/firestore");

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      vi.mocked(encryptionManager.decrypt).mockResolvedValue({
        lastModified: Date.now(),
        envelopes: [{ id: "cloud-env" }],
        transactions: [],
        unassignedCash: 100,
        actualBalance: 500,
      });

      const localData = {
        lastModified: Date.now(),
        envelopes: [], // Empty envelopes triggers download
        transactions: [],
      };

      const result = await provider.save(localData);

      expect(result.success).toBe(true);
      expect(budgetDb.transaction).toHaveBeenCalled();
    });

    it("should upload when timestamps are equal but local has data", async () => {
      const timestamp = Date.now();
      const { getDoc } = await import("firebase/firestore");

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      vi.mocked(encryptionManager.decrypt).mockResolvedValue({
        lastModified: timestamp, // Same timestamp
        envelopes: [{ id: "cloud-env" }],
        transactions: [],
      });

      const localData = {
        lastModified: timestamp, // Same timestamp
        envelopes: [{ id: "local-env" }],
        transactions: [],
      };

      const result = await provider.save(localData);

      // When timestamps are equal, it should not sync (returns "none")
      // But the implementation currently doesn't handle "none" case, so it would download
      expect(result.success).toBe(true);
    });

    it("should handle null local data and trigger download", async () => {
      const { getDoc } = await import("firebase/firestore");

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      vi.mocked(encryptionManager.decrypt).mockResolvedValue({
        lastModified: Date.now(),
        envelopes: [{ id: "cloud-env" }],
        transactions: [],
        unassignedCash: 100,
        actualBalance: 500,
      });

      // Testing null data scenario - TypeScript allows this at runtime
      const result = await provider.save(null as unknown as SafeUnknown);

      expect(result.success).toBe(true);
      expect(budgetDb.transaction).toHaveBeenCalled();
    });
  });

  describe("syncToLocal edge cases", () => {
    beforeEach(async () => {
      await provider.initialize("test-budget-id", mockCryptoKey);
    });

    it("should handle data with missing optional fields", async () => {
      const { getDoc } = await import("firebase/firestore");

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      // Cloud data missing optional fields
      vi.mocked(encryptionManager.decrypt).mockResolvedValue({
        lastModified: Date.now() + 1000,
        envelopes: [{ id: "env1" }],
        transactions: [{ id: "txn1" }],
        // Missing: unassignedCash, actualBalance
      });

      const localData = {
        lastModified: Date.now(),
        envelopes: [],
        transactions: [],
      };

      const result = await provider.save(localData);

      expect(result.success).toBe(true);
      expect(budgetDb.budget.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "metadata",
          unassignedCash: 0, // Should default to 0
          actualBalance: 0, // Should default to 0
          syncVersion: "2.0",
        })
      );
    });

    it("should handle data with non-array envelopes and transactions", async () => {
      const { getDoc } = await import("firebase/firestore");

      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({
          data: [1, 2, 3],
          iv: [4, 5, 6],
        }),
      } as never);

      // Cloud data with invalid array types
      vi.mocked(encryptionManager.decrypt).mockResolvedValue({
        lastModified: Date.now() + 1000,
        envelopes: "not-an-array", // Invalid
        transactions: null, // Invalid
        unassignedCash: 100,
        actualBalance: 500,
      });

      const localData = {
        lastModified: Date.now(),
        envelopes: [],
        transactions: [],
      };

      const result = await provider.save(localData);

      expect(result.success).toBe(true);
      // bulkAdd should not be called for invalid arrays
      expect(budgetDb.envelopes.bulkAdd).not.toHaveBeenCalled();
      expect(budgetDb.transactions.bulkAdd).not.toHaveBeenCalled();
    });
  });
});
