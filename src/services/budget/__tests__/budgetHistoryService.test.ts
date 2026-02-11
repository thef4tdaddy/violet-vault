import { describe, it, expect, vi, beforeEach } from "vitest";
import budgetHistoryService from "../budgetHistoryService";
import { budgetDb } from "@/db/budgetDb";
import { encryptionUtils } from "@/utils/platform/security/encryption";
import logger from "@/utils/core/common/logger";

// Use vi.hoisted to define the factory so it's available for vi.mock
const { createMockStore } = vi.hoisted(() => ({
  createMockStore: () => ({
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    above: vi.fn().mockReturnThis(),
    anyOf: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    sortBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    first: vi.fn(),
    toArray: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    modify: vi.fn(),
    count: vi.fn(),
    clear: vi.fn(),
    and: vi.fn().mockReturnThis(),
  }),
}));

// Mock dependencies
vi.mock("@/db/budgetDb", () => {
  // Re-create them inside the mock to ensure fresh instances
  const createMockStore = () => ({
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    above: vi.fn().mockReturnThis(),
    anyOf: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    sortBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    first: vi.fn(),
    toArray: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    modify: vi.fn(),
    count: vi.fn(),
    clear: vi.fn(),
    and: vi.fn().mockReturnThis(),
  });

  return {
    budgetDb: {
      budgetCommits: createMockStore(),
      budgetChanges: createMockStore(),
      budgetBranches: createMockStore(),
      budgetTags: createMockStore(),
      createBudgetCommit: vi.fn(),
      createBudgetChanges: vi.fn(),
      createBudgetBranch: vi.fn(),
      createBudgetTag: vi.fn(),
    },
  };
});

vi.mock("@/utils/platform/security/encryption", () => ({
  encryptionUtils: {
    generateHash: vi.fn().mockReturnValue("test-hash"),
    generateDeviceFingerprint: vi.fn().mockReturnValue("test-fingerprint"),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Budget History Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully", async () => {
      const result = await budgetHistoryService.initialize();
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith("Budget history service initialized");
    });
  });

  describe("createCommit", () => {
    it("should create and save a commit with changes", async () => {
      const options = {
        entityType: "envelope",
        changeType: "update",
        description: "Updated fuel budget",
        beforeData: { amount: 100 },
        afterData: { amount: 150 },
        author: "Alice",
      };

      const result = await budgetHistoryService.createCommit(options);

      expect(result.commit.author).toBe("Alice");
      expect(result.commit.message).toBe(options.description);
      expect(result.changes[0].oldValue).toEqual(options.beforeData);
      expect(budgetDb.createBudgetCommit).toHaveBeenCalled();
    });
  });

  describe("Branch Management", () => {
    it("should create a new branch if it doesn't exist", async () => {
      (budgetDb.budgetBranches.first as any).mockResolvedValue(null);
      (budgetDb.budgetCommits.first as any).mockResolvedValue({ hash: "source-hash" });

      const options = {
        fromCommitHash: "source-hash",
        branchName: "vacation-planning",
        author: "Bob",
      };

      const branch = await budgetHistoryService.createBranch(options);

      expect(branch.name).toBe("vacation-planning");
      expect(budgetDb.createBudgetBranch).toHaveBeenCalled();
    });

    it("should throw error if branch already exists", async () => {
      (budgetDb.budgetBranches.first as any).mockResolvedValue({ name: "existing" });

      await expect(
        budgetHistoryService.createBranch({
          fromCommitHash: "hash",
          branchName: "existing",
        })
      ).rejects.toThrow("already exists");
    });

    it("should switch between branches", async () => {
      (budgetDb.budgetBranches.modify as any).mockResolvedValue(1);

      const result = await budgetHistoryService.switchBranch("new-branch");

      expect(result).toBe(true);
      expect(budgetDb.budgetBranches.where).toHaveBeenCalledWith("isActive");
    });
  });

  describe("Device Consistency", () => {
    it("should verify consistency for existing author with same fingerprint", async () => {
      (budgetDb.budgetCommits.toArray as any).mockResolvedValue([
        { deviceFingerprint: "finger-1" },
      ]);

      const result = await budgetHistoryService.verifyDeviceConsistency("Alice", "finger-1");
      expect(result).toBe(true);
    });

    it("should return true for first-time author", async () => {
      (budgetDb.budgetCommits.toArray as any).mockResolvedValue([]);
      const result = await budgetHistoryService.verifyDeviceConsistency("NewUser", "any");
      expect(result).toBe(true);
    });
  });

  describe("Cleanup", () => {
    it("should delete old commits when threshold is reached", async () => {
      (budgetDb.budgetCommits.count as any).mockResolvedValue(2000);
      budgetHistoryService.maxRecentCommits = 1000;

      (budgetDb.budgetCommits.toArray as any).mockResolvedValue([
        { hash: "old-1" },
        { hash: "old-2" },
      ]);

      await budgetHistoryService.cleanup();

      expect(budgetDb.budgetCommits.bulkDelete).toHaveBeenCalledWith(["old-1", "old-2"]);
    });
  });
});
