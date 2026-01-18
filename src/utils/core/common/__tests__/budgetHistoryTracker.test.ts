import { describe, it, expect, vi, beforeEach } from "vitest";
import { BudgetHistoryTracker } from "../budgetHistoryTracker";
import { budgetDb } from "@/db/budgetDb";
import { encryptionUtils } from "@/utils/platform/security/encryption";
import logger from "../logger";

// Mock dependencies
vi.mock("@/db/budgetDb", () => {
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

vi.mock("../logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Budget History Tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createHistoryCommit", () => {
    it("should generate a hash and save commit+changes", async () => {
      const options = {
        entityType: "debt",
        entityId: "debt-1",
        changeType: "add",
        description: "Initial debt",
        beforeData: null,
        afterData: { name: "Loan", amount: 1000 },
        author: "Alice",
      };

      const result = await BudgetHistoryTracker.createHistoryCommit(options);

      expect(result.commit.hash).toBe("test-hash");
      expect(result.changes[0].changeType).toBe("create"); // "add" normalized to "create"
      expect(budgetDb.createBudgetCommit).toHaveBeenCalled();
      expect(budgetDb.createBudgetChanges).toHaveBeenCalled();
    });
  });

  describe("trackUnassignedCashChange", () => {
    it("should create a commit with formatted description", async () => {
      await BudgetHistoryTracker.trackUnassignedCashChange({
        previousAmount: 100,
        newAmount: 50,
        author: "Alice",
        source: "distribution",
      });

      expect(budgetDb.createBudgetCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Distributed $50.00"),
          author: "Alice",
        })
      );
    });
  });

  describe("Branch & Tag Management", () => {
    it("should create a branch if source commit exists", async () => {
      (budgetDb.budgetBranches.first as any).mockResolvedValue(null);
      (budgetDb.budgetCommits.first as any).mockResolvedValue({ hash: "source" });

      const branch = await BudgetHistoryTracker.createBranch({
        branchName: "test-branch",
        fromCommitHash: "source",
      });

      expect(branch.name).toBe("test-branch");
      expect(budgetDb.createBudgetBranch).toHaveBeenCalled();
    });

    it("should create a tag for a commit", async () => {
      (budgetDb.budgetTags.first as any).mockResolvedValue(null);
      (budgetDb.budgetCommits.first as any).mockResolvedValue({ hash: "commit-1" });

      const tag = await BudgetHistoryTracker.createTag({
        tagName: "v1.0",
        commitHash: "commit-1",
      });

      expect(tag.name).toBe("v1.0");
      expect(budgetDb.createBudgetTag).toHaveBeenCalled();
    });
  });

  describe("Analytics", () => {
    it("should return change patterns summary", async () => {
      (budgetDb.budgetChanges.toArray as any).mockResolvedValue([
        { commitHash: "h1", changeType: "create", entityType: "debt" },
      ]);
      (budgetDb.budgetCommits.toArray as any).mockResolvedValue([
        { hash: "h1", author: "Alice", timestamp: Date.now() },
      ]);

      const patterns = await BudgetHistoryTracker.getChangePatterns();

      expect(patterns?.totalChanges).toBe(1);
      expect(patterns?.authorActivity["Alice"]).toBe(1);
    });
  });
});
