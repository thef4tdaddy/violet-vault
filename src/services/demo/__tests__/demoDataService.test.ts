import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadDemoDataset, seedDemoData, initializeDemoDatabase } from "../demoDataService";
import { VioletVaultDB } from "@/db/budgetDb";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("demoDataService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("loadDemoDataset", () => {
    it("should load demo dataset from public test data", async () => {
      const mockData = {
        envelopes: [
          {
            id: "env-1",
            name: "Groceries",
            category: "Food",
            balance: 100,
            target: 200,
            archived: false,
            type: "standard",
            lastModified: Date.now(),
          },
        ],
        transactions: [
          {
            id: "txn-1",
            date: new Date().toISOString(),
            amount: -50,
            description: "Store",
            envelopeId: "env-1",
            category: "Food",
            type: "expense",
            lastModified: Date.now(),
          },
        ],
        bills: [],
        generatedAt: new Date().toISOString(),
        recordCount: 2,
        generationTimeMs: 5,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const dataset = await loadDemoDataset();

      expect(global.fetch).toHaveBeenCalledWith("/api/demo-factory?count=10000");
      expect(dataset.envelopes).toHaveLength(1);
      expect(dataset.transactions).toHaveLength(1);
    });

    it("should return fallback data when fetch fails", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

      const dataset = await loadDemoDataset();

      expect(dataset.envelopes).toEqual([]);
      expect(dataset.transactions).toEqual([]);
      expect(dataset.unassignedCash).toBe(0);
      expect(dataset.actualBalance).toBe(0);
    });

    it("should handle non-ok response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

      const dataset = await loadDemoDataset();

      expect(dataset.envelopes).toEqual([]);
      expect(dataset.transactions).toEqual([]);
    });
  });

  describe("seedDemoData", () => {
    it("should seed database with demo data", async () => {
      const mockDb = {
        transaction: vi.fn((mode, tables, callback) => callback()),
        envelopes: {
          clear: vi.fn(),
        },
        transactions: {
          clear: vi.fn(),
        },
        budget: {
          clear: vi.fn(),
          put: vi.fn(),
        },
        bulkUpsertEnvelopesValidated: vi.fn(),
        bulkUpsertTransactionsValidated: vi.fn(),
      } as unknown as VioletVaultDB;

      const mockData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [{ id: "txn-1", amount: 100 }],
        unassignedCash: 50,
        actualBalance: 200,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await seedDemoData(mockDb);

      expect(mockDb.bulkUpsertEnvelopesValidated).toHaveBeenCalledWith(mockData.envelopes);
      expect(mockDb.bulkUpsertTransactionsValidated).toHaveBeenCalledWith(mockData.transactions);
      expect(mockDb.budget.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "metadata",
          unassignedCash: 50,
          actualBalance: 200,
        })
      );
    });

    it("should handle empty dataset", async () => {
      const mockDb = {
        transaction: vi.fn((mode, tables, callback) => callback()),
        envelopes: {
          clear: vi.fn(),
        },
        transactions: {
          clear: vi.fn(),
        },
        budget: {
          clear: vi.fn(),
          put: vi.fn(),
        },
        bulkUpsertEnvelopesValidated: vi.fn(),
        bulkUpsertTransactionsValidated: vi.fn(),
      } as unknown as VioletVaultDB;

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          envelopes: [],
          transactions: [],
        }),
      });

      await seedDemoData(mockDb);

      expect(mockDb.bulkUpsertEnvelopesValidated).not.toHaveBeenCalled();
      expect(mockDb.bulkUpsertTransactionsValidated).not.toHaveBeenCalled();
    });
  });

  describe("initializeDemoDatabase", () => {
    it("should open database and seed data", async () => {
      const mockDb = {
        isOpen: vi.fn(() => false),
        open: vi.fn(),
        transaction: vi.fn((mode, tables, callback) => callback()),
        envelopes: {
          clear: vi.fn(),
        },
        transactions: {
          clear: vi.fn(),
        },
        budget: {
          clear: vi.fn(),
          put: vi.fn(),
        },
        bulkUpsertEnvelopesValidated: vi.fn(),
        bulkUpsertTransactionsValidated: vi.fn(),
      } as unknown as VioletVaultDB;

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          envelopes: [],
          transactions: [],
        }),
      });

      await initializeDemoDatabase(mockDb);

      expect(mockDb.open).toHaveBeenCalled();
    });

    it("should skip opening if database is already open", async () => {
      const mockDb = {
        isOpen: vi.fn(() => true),
        open: vi.fn(),
        transaction: vi.fn((mode, tables, callback) => callback()),
        envelopes: {
          clear: vi.fn(),
        },
        transactions: {
          clear: vi.fn(),
        },
        budget: {
          clear: vi.fn(),
          put: vi.fn(),
        },
        bulkUpsertEnvelopesValidated: vi.fn(),
        bulkUpsertTransactionsValidated: vi.fn(),
      } as unknown as VioletVaultDB;

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          envelopes: [],
          transactions: [],
        }),
      });

      await initializeDemoDatabase(mockDb);

      expect(mockDb.open).not.toHaveBeenCalled();
    });
  });
});
