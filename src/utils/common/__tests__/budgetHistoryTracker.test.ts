import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BudgetHistoryTracker } from "../budgetHistoryTracker";
import { budgetDb } from "@/db/budgetDb";
import { encryptionUtils } from "@/utils/security/encryption";
import logger from "@/utils/common/logger";
import type { BudgetCommit, BudgetChange, BudgetBranch, BudgetTag, Debt } from "@/db/types";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    createBudgetCommit: vi.fn(),
    createBudgetChanges: vi.fn(),
    createBudgetBranch: vi.fn(),
    createBudgetTag: vi.fn(),
    budgetChanges: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn(() => Promise.resolve([])),
            })),
            toArray: vi.fn(() => Promise.resolve([])),
          })),
          and: vi.fn(() => ({
            reverse: vi.fn(() => ({
              toArray: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        anyOf: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        above: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
      })),
    },
    budgetCommits: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(null)),
        })),
        above: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
      })),
    },
    budgetBranches: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(null)),
          modify: vi.fn(() => Promise.resolve(0)),
        })),
      })),
      orderBy: vi.fn(() => ({
        toArray: vi.fn(() => Promise.resolve([])),
      })),
    },
    budgetTags: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(null)),
        })),
      })),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn(() => Promise.resolve([])),
        })),
      })),
    },
  },
}));

vi.mock("@/utils/security/encryption", () => ({
  encryptionUtils: {
    generateDeviceFingerprint: vi.fn(() => "mock-fingerprint"),
    generateHash: vi.fn((data) => {
      const str = typeof data === "string" ? data : JSON.stringify(data);
      return `mock-hash-${str.length}`;
    }),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock formatCurrency
vi.mock("@/utils/accounts/accountHelpers", () => ({
  formatCurrency: vi.fn((amount: number) => `$${amount.toFixed(2)}`),
}));

describe("BudgetHistoryTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createHistoryCommit", () => {
    it("should create a history commit with all required fields", async () => {
      const mockCommitData = {
        entityType: "unassignedCash",
        entityId: null,
        changeType: "update",
        description: "Test update",
        beforeData: { amount: 100 },
        afterData: { amount: 200 },
        author: "Test User",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      expect(encryptionUtils.generateDeviceFingerprint).toHaveBeenCalled();
      expect(encryptionUtils.generateHash).toHaveBeenCalled();
      expect(budgetDb.createBudgetCommit).toHaveBeenCalled();
      expect(budgetDb.createBudgetChanges).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Budget history commit created",
        expect.objectContaining({
          entityType: "unassignedCash",
          changeType: "update",
          author: "Test User",
        })
      );
    });

    it("should normalize changeType 'add' to 'create'", async () => {
      const mockCommitData = {
        entityType: "debt",
        entityId: "debt-123",
        changeType: "add",
        description: "Added new debt",
        beforeData: null,
        afterData: { name: "Test Debt", currentBalance: 1000 },
        author: "Test User",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      const changeCall = vi.mocked(budgetDb.createBudgetChanges).mock.calls[0];
      const changes = changeCall[0] as BudgetChange[];
      expect(changes[0].changeType).toBe("create");
    });

    it("should normalize changeType 'create' to 'create'", async () => {
      const mockCommitData = {
        entityType: "debt",
        entityId: "debt-123",
        changeType: "create",
        description: "Created new debt",
        beforeData: null,
        afterData: { name: "Test Debt", currentBalance: 1000 },
        author: "Test User",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      const changeCall = vi.mocked(budgetDb.createBudgetChanges).mock.calls[0];
      const changes = changeCall[0] as BudgetChange[];
      expect(changes[0].changeType).toBe("create");
    });

    it("should normalize changeType 'delete' to 'delete'", async () => {
      const mockCommitData = {
        entityType: "debt",
        entityId: "debt-123",
        changeType: "delete",
        description: "Deleted debt",
        beforeData: { name: "Test Debt", currentBalance: 1000 },
        afterData: null,
        author: "Test User",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      const changeCall = vi.mocked(budgetDb.createBudgetChanges).mock.calls[0];
      const changes = changeCall[0] as BudgetChange[];
      expect(changes[0].changeType).toBe("delete");
    });

    it("should default unknown changeType to 'update'", async () => {
      const mockCommitData = {
        entityType: "actualBalance",
        entityId: null,
        changeType: "modify",
        description: "Modified balance",
        beforeData: { balance: 1000 },
        afterData: { balance: 1500 },
        author: "Test User",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      const changeCall = vi.mocked(budgetDb.createBudgetChanges).mock.calls[0];
      const changes = changeCall[0] as BudgetChange[];
      expect(changes[0].changeType).toBe("update");
    });

    it("should use custom deviceFingerprint if provided", async () => {
      const mockCommitData = {
        entityType: "unassignedCash",
        entityId: null,
        changeType: "update",
        description: "Test update",
        beforeData: { amount: 100 },
        afterData: { amount: 200 },
        author: "Test User",
        deviceFingerprint: "custom-fingerprint",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      expect(encryptionUtils.generateDeviceFingerprint).not.toHaveBeenCalled();
      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.deviceFingerprint).toBe("custom-fingerprint");
    });

    it("should handle parentHash when provided", async () => {
      const mockCommitData = {
        entityType: "unassignedCash",
        entityId: null,
        changeType: "update",
        description: "Test update",
        beforeData: { amount: 100 },
        afterData: { amount: 200 },
        author: "Test User",
        parentHash: "parent-hash-123",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.parentHash).toBe("parent-hash-123");
    });

    it("should handle errors and log them", async () => {
      vi.mocked(budgetDb.createBudgetCommit).mockRejectedValueOnce(new Error("Database error"));

      const mockCommitData = {
        entityType: "unassignedCash",
        entityId: null,
        changeType: "update",
        description: "Test update",
        beforeData: { amount: 100 },
        afterData: { amount: 200 },
        author: "Test User",
      };

      await expect(BudgetHistoryTracker.createHistoryCommit(mockCommitData)).rejects.toThrow(
        "Database error"
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to create budget history commit:",
        "Database error"
      );
    });

    it("should use 'main' as entityId when entityId is null", async () => {
      const mockCommitData = {
        entityType: "unassignedCash",
        entityId: null,
        changeType: "update",
        description: "Test update",
        beforeData: { amount: 100 },
        afterData: { amount: 200 },
        author: "Test User",
      };

      await BudgetHistoryTracker.createHistoryCommit(mockCommitData);

      const changeCall = vi.mocked(budgetDb.createBudgetChanges).mock.calls[0];
      const changes = changeCall[0] as BudgetChange[];
      expect(changes[0].entityId).toBe("main");
    });
  });

  describe("trackUnassignedCashChange", () => {
    it("should track unassigned cash change with manual source", async () => {
      const result = await BudgetHistoryTracker.trackUnassignedCashChange({
        previousAmount: 100,
        newAmount: 150,
        author: "Test User",
        source: "manual",
      });

      expect(result).toBeDefined();
      expect(result.commit).toBeDefined();
      expect(result.changes).toHaveLength(1);
      expect(budgetDb.createBudgetCommit).toHaveBeenCalled();
    });

    it("should format description for distribution source", async () => {
      await BudgetHistoryTracker.trackUnassignedCashChange({
        previousAmount: 200,
        newAmount: 100,
        author: "Test User",
        source: "distribution",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("Distributed");
      expect(commit.message).toContain("$100.00");
    });

    it("should format description for manual source", async () => {
      await BudgetHistoryTracker.trackUnassignedCashChange({
        previousAmount: 100,
        newAmount: 150,
        author: "Test User",
        source: "manual",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("Updated unassigned cash");
      expect(commit.message).toContain("$100.00");
      expect(commit.message).toContain("$150.00");
    });
  });

  describe("trackActualBalanceChange", () => {
    it("should track actual balance change with manual entry", async () => {
      const result = await BudgetHistoryTracker.trackActualBalanceChange({
        previousBalance: 1000,
        newBalance: 1500,
        isManual: true,
        author: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.commit).toBeDefined();
      expect(budgetDb.createBudgetCommit).toHaveBeenCalled();
    });

    it("should format description for manual entry", async () => {
      await BudgetHistoryTracker.trackActualBalanceChange({
        previousBalance: 1000,
        newBalance: 1500,
        isManual: true,
        author: "Test User",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("manual entry");
    });

    it("should format description for automatic calculation", async () => {
      await BudgetHistoryTracker.trackActualBalanceChange({
        previousBalance: 1000,
        newBalance: 1500,
        isManual: false,
        author: "Test User",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("automatic calculation");
    });

    it("should store beforeData with correct isManual flag", async () => {
      await BudgetHistoryTracker.trackActualBalanceChange({
        previousBalance: 1000,
        newBalance: 1500,
        isManual: true,
        author: "Test User",
      });

      const changeCall = vi.mocked(budgetDb.createBudgetChanges).mock.calls[0];
      const changes = changeCall[0] as BudgetChange[];
      expect(changes[0].oldValue).toEqual({ balance: 1000, isManual: false });
      expect(changes[0].newValue).toEqual({ balance: 1500, isManual: true });
    });
  });

  describe("trackDebtChange", () => {
    const mockDebt: Debt = {
      id: "debt-123",
      name: "Credit Card",
      creditor: "Bank ABC",
      type: "credit_card",
      status: "active",
      currentBalance: 1000,
      minimumPayment: 50,
      lastModified: Date.now(),
    };

    it("should track debt addition", async () => {
      const result = await BudgetHistoryTracker.trackDebtChange({
        debtId: "debt-123",
        changeType: "add",
        previousData: {} as Debt,
        newData: mockDebt,
        author: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.commit.message).toContain("Added new debt");
      expect(result.commit.message).toContain("Credit Card");
    });

    it("should track debt modification with balance change", async () => {
      const previousDebt = { ...mockDebt, currentBalance: 1000 };
      const newDebt = { ...mockDebt, currentBalance: 800 };

      await BudgetHistoryTracker.trackDebtChange({
        debtId: "debt-123",
        changeType: "modify",
        previousData: previousDebt,
        newData: newDebt,
        author: "Test User",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("Updated");
      expect(commit.message).toContain("balance from");
      expect(commit.message).toContain("$1000.00");
      expect(commit.message).toContain("$800.00");
    });

    it("should track debt modification without balance change", async () => {
      const previousDebt = { ...mockDebt };
      const newDebt = { ...mockDebt, name: "Updated Credit Card" };

      await BudgetHistoryTracker.trackDebtChange({
        debtId: "debt-123",
        changeType: "modify",
        previousData: previousDebt,
        newData: newDebt,
        author: "Test User",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("Updated debt");
      expect(commit.message).not.toContain("balance from");
    });

    it("should track debt deletion", async () => {
      await BudgetHistoryTracker.trackDebtChange({
        debtId: "debt-123",
        changeType: "delete",
        previousData: mockDebt,
        newData: {} as Debt,
        author: "Test User",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("Deleted debt");
      expect(commit.message).toContain("Credit Card");
    });

    it("should handle unknown change type", async () => {
      await BudgetHistoryTracker.trackDebtChange({
        debtId: "debt-123",
        changeType: "unknown",
        previousData: mockDebt,
        newData: mockDebt,
        author: "Test User",
      });

      const commitCall = vi.mocked(budgetDb.createBudgetCommit).mock.calls[0];
      const commit = commitCall[0] as BudgetCommit;
      expect(commit.message).toContain("Modified debt");
    });
  });

  describe("getRecentChanges", () => {
    it("should get recent changes for entity type", async () => {
      const mockChanges: BudgetChange[] = [
        {
          commitHash: "hash-1",
          entityType: "unassignedCash",
          entityId: "main",
          changeType: "update",
          description: "Change 1",
          oldValue: { amount: 100 },
          newValue: { amount: 200 },
        },
      ];

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockChanges),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getRecentChanges("unassignedCash", 10);

      expect(result).toEqual(mockChanges);
      expect(budgetDb.budgetChanges.where).toHaveBeenCalledWith("entityType");
    });

    it("should return empty array on error", async () => {
      vi.mocked(budgetDb.budgetChanges.where).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.getRecentChanges("unassignedCash");

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getEntityHistory", () => {
    it("should get entity history without entityId", async () => {
      const mockChanges: BudgetChange[] = [
        {
          commitHash: "hash-1",
          entityType: "unassignedCash",
          entityId: "main",
          changeType: "update",
          description: "Change 1",
          oldValue: { amount: 100 },
          newValue: { amount: 200 },
        },
      ];

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue(mockChanges),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getEntityHistory("unassignedCash");

      expect(result).toEqual(mockChanges);
    });

    it("should get entity history with entityId", async () => {
      const mockChanges: BudgetChange[] = [
        {
          commitHash: "hash-1",
          entityType: "debt",
          entityId: "debt-123",
          changeType: "update",
          description: "Change 1",
          oldValue: { balance: 1000 },
          newValue: { balance: 800 },
        },
      ];

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            reverse: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockChanges),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getEntityHistory("debt", "debt-123");

      expect(result).toEqual(mockChanges);
    });

    it("should return empty array on error", async () => {
      vi.mocked(budgetDb.budgetChanges.where).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.getEntityHistory("unassignedCash");

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getRecentActivity", () => {
    it("should get recent activity across all tracked entities", async () => {
      const mockChanges: BudgetChange[] = [
        {
          commitHash: "hash-1",
          entityType: "unassignedCash",
          entityId: "main",
          changeType: "update",
          description: "Change 1",
          oldValue: { amount: 100 },
          newValue: { amount: 200 },
        },
        {
          commitHash: "hash-2",
          entityType: "debt",
          entityId: "debt-123",
          changeType: "update",
          description: "Change 2",
          oldValue: { balance: 1000 },
          newValue: { balance: 800 },
        },
      ];

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockChanges),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getRecentActivity(20);

      expect(result).toEqual(mockChanges);
      expect(budgetDb.budgetChanges.where).toHaveBeenCalledWith("entityType");
    });

    it("should return empty array on error", async () => {
      vi.mocked(budgetDb.budgetChanges.where).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.getRecentActivity();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("createBranch", () => {
    it("should create a new branch successfully", async () => {
      const mockCommit: BudgetCommit = {
        hash: "commit-hash-123",
        timestamp: Date.now(),
        message: "Test commit",
        author: "Test User",
        parentHash: null,
        snapshotData: "{}",
        deviceFingerprint: "test-fingerprint",
      };

      vi.mocked(budgetDb.budgetBranches.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockCommit),
        }),
      } as never);

      vi.mocked(budgetDb.createBudgetBranch).mockResolvedValue(1);

      const result = await BudgetHistoryTracker.createBranch({
        fromCommitHash: "commit-hash-123",
        branchName: "feature-branch",
        description: "Test branch",
        author: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.name).toBe("feature-branch");
      expect(result.sourceCommitHash).toBe("commit-hash-123");
      expect(budgetDb.createBudgetBranch).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Budget history branch created",
        expect.objectContaining({
          branchName: "feature-branch",
          author: "Test User",
        })
      );
    });

    it("should throw error if branch name already exists", async () => {
      const existingBranch: BudgetBranch = {
        name: "existing-branch",
        description: "Existing",
        sourceCommitHash: "hash-1",
        headCommitHash: "hash-1",
        author: "Test User",
        created: Date.now(),
        isActive: false,
        isMerged: false,
      };

      vi.mocked(budgetDb.budgetBranches.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(existingBranch),
        }),
      } as never);

      await expect(
        BudgetHistoryTracker.createBranch({
          fromCommitHash: "commit-hash-123",
          branchName: "existing-branch",
          author: "Test User",
        })
      ).rejects.toThrow("Branch 'existing-branch' already exists");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error if source commit not found", async () => {
      vi.mocked(budgetDb.budgetBranches.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      await expect(
        BudgetHistoryTracker.createBranch({
          fromCommitHash: "non-existent-hash",
          branchName: "new-branch",
          author: "Test User",
        })
      ).rejects.toThrow("Source commit 'non-existent-hash' not found");
    });
  });

  describe("createTag", () => {
    it("should create a new tag successfully", async () => {
      const mockCommit: BudgetCommit = {
        hash: "commit-hash-123",
        timestamp: Date.now(),
        message: "Test commit",
        author: "Test User",
        parentHash: null,
        snapshotData: "{}",
        deviceFingerprint: "test-fingerprint",
      };

      vi.mocked(budgetDb.budgetTags.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockCommit),
        }),
      } as never);

      vi.mocked(budgetDb.createBudgetTag).mockResolvedValue(1);

      const result = await BudgetHistoryTracker.createTag({
        commitHash: "commit-hash-123",
        tagName: "v1.0.0",
        description: "First release",
        tagType: "release",
        author: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.name).toBe("v1.0.0");
      expect(result.commitHash).toBe("commit-hash-123");
      expect(result.tagType).toBe("release");
      expect(budgetDb.createBudgetTag).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Budget history tag created",
        expect.objectContaining({
          tagName: "v1.0.0",
          tagType: "release",
        })
      );
    });

    it("should throw error if tag name already exists", async () => {
      const existingTag: BudgetTag = {
        name: "existing-tag",
        description: "Existing",
        commitHash: "hash-1",
        tagType: "milestone",
        author: "Test User",
        created: Date.now(),
      };

      vi.mocked(budgetDb.budgetTags.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(existingTag),
        }),
      } as never);

      await expect(
        BudgetHistoryTracker.createTag({
          commitHash: "commit-hash-123",
          tagName: "existing-tag",
          author: "Test User",
        })
      ).rejects.toThrow("Tag 'existing-tag' already exists");
    });

    it("should throw error if commit not found", async () => {
      vi.mocked(budgetDb.budgetTags.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      await expect(
        BudgetHistoryTracker.createTag({
          commitHash: "non-existent-hash",
          tagName: "new-tag",
          author: "Test User",
        })
      ).rejects.toThrow("Commit 'non-existent-hash' not found");
    });

    it("should use default tagType 'milestone'", async () => {
      const mockCommit: BudgetCommit = {
        hash: "commit-hash-123",
        timestamp: Date.now(),
        message: "Test commit",
        author: "Test User",
        parentHash: null,
        snapshotData: "{}",
        deviceFingerprint: "test-fingerprint",
      };

      vi.mocked(budgetDb.budgetTags.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockCommit),
        }),
      } as never);

      vi.mocked(budgetDb.createBudgetTag).mockResolvedValue(1);

      const result = await BudgetHistoryTracker.createTag({
        commitHash: "commit-hash-123",
        tagName: "milestone-1",
        author: "Test User",
      });

      expect(result.tagType).toBe("milestone");
    });
  });

  describe("switchBranch", () => {
    it("should switch to a different branch successfully", async () => {
      vi.mocked(budgetDb.budgetBranches.where).mockImplementation((field: string) => {
        if (field === "isActive") {
          return {
            equals: vi.fn().mockReturnValue({
              modify: vi.fn().mockResolvedValue(1),
            }),
          } as never;
        }
        if (field === "name") {
          return {
            equals: vi.fn().mockReturnValue({
              modify: vi.fn().mockResolvedValue(1),
            }),
          } as never;
        }
        return {} as never;
      });

      const result = await BudgetHistoryTracker.switchBranch("feature-branch");

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith("Switched to budget history branch", {
        branchName: "feature-branch",
      });
    });

    it("should throw error if branch not found", async () => {
      vi.mocked(budgetDb.budgetBranches.where).mockImplementation((field: string) => {
        if (field === "isActive") {
          return {
            equals: vi.fn().mockReturnValue({
              modify: vi.fn().mockResolvedValue(1),
            }),
          } as never;
        }
        if (field === "name") {
          return {
            equals: vi.fn().mockReturnValue({
              modify: vi.fn().mockResolvedValue(0),
            }),
          } as never;
        }
        return {} as never;
      });

      await expect(BudgetHistoryTracker.switchBranch("non-existent-branch")).rejects.toThrow(
        "Branch 'non-existent-branch' not found"
      );
    });

    it("should handle errors and log them", async () => {
      vi.mocked(budgetDb.budgetBranches.where).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(BudgetHistoryTracker.switchBranch("feature-branch")).rejects.toThrow(
        "Database error"
      );

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getBranches", () => {
    it("should get all branches", async () => {
      const mockBranches: BudgetBranch[] = [
        {
          name: "main",
          description: "Main branch",
          sourceCommitHash: "hash-1",
          headCommitHash: "hash-2",
          author: "Test User",
          created: Date.now(),
          isActive: true,
          isMerged: false,
        },
      ];

      vi.mocked(budgetDb.budgetBranches.orderBy).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockBranches),
      } as never);

      const result = await BudgetHistoryTracker.getBranches();

      expect(result).toEqual(mockBranches);
      expect(budgetDb.budgetBranches.orderBy).toHaveBeenCalledWith("created");
    });

    it("should return empty array on error", async () => {
      vi.mocked(budgetDb.budgetBranches.orderBy).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.getBranches();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getTags", () => {
    it("should get all tags", async () => {
      const mockTags: BudgetTag[] = [
        {
          name: "v1.0.0",
          description: "First release",
          commitHash: "hash-1",
          tagType: "release",
          author: "Test User",
          created: Date.now(),
        },
      ];

      vi.mocked(budgetDb.budgetTags.orderBy).mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockTags),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getTags();

      expect(result).toEqual(mockTags);
      expect(budgetDb.budgetTags.orderBy).toHaveBeenCalledWith("created");
    });

    it("should return empty array on error", async () => {
      vi.mocked(budgetDb.budgetTags.orderBy).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.getTags();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("signCommit", () => {
    it("should sign commit with device fingerprint", async () => {
      const mockCommitData: BudgetCommit = {
        hash: "commit-hash-123",
        timestamp: Date.now(),
        message: "Test commit",
        author: "Test User",
        parentHash: null,
        snapshotData: "{}",
        deviceFingerprint: "test-fingerprint",
      };

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue([mockCommitData]),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.signCommit(mockCommitData, "current-fingerprint");

      expect(result).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.deviceFingerprint).toBe("current-fingerprint");
      expect(result.isDeviceConsistent).toBeDefined();
      expect(result.signedAt).toBeDefined();
      expect(encryptionUtils.generateHash).toHaveBeenCalled();
    });

    it("should handle errors during signing", async () => {
      const mockCommitData: BudgetCommit = {
        hash: "commit-hash-123",
        timestamp: Date.now(),
        message: "Test commit",
        author: "Test User",
        parentHash: null,
        snapshotData: "{}",
        deviceFingerprint: "test-fingerprint",
      };

      vi.mocked(encryptionUtils.generateHash).mockImplementation(() => {
        throw new Error("Hash generation error");
      });

      await expect(
        BudgetHistoryTracker.signCommit(mockCommitData, "current-fingerprint")
      ).rejects.toThrow("Hash generation error");

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("verifyDeviceConsistency", () => {
    it("should verify device consistency for known fingerprint", async () => {
      const mockCommits: BudgetCommit[] = [
        {
          hash: "hash-1",
          timestamp: Date.now(),
          message: "Commit 1",
          author: "Test User",
          parentHash: null,
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
        {
          hash: "hash-2",
          timestamp: Date.now(),
          message: "Commit 2",
          author: "Test User",
          parentHash: "hash-1",
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
      ];

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockCommits),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.verifyDeviceConsistency(
        "Test User",
        "fingerprint-1"
      );

      expect(result).toBe(true);
    });

    it("should allow new fingerprint when under 3 devices", async () => {
      const mockCommits: BudgetCommit[] = [
        {
          hash: "hash-1",
          timestamp: Date.now(),
          message: "Commit 1",
          author: "Test User",
          parentHash: null,
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
      ];

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockCommits),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.verifyDeviceConsistency(
        "Test User",
        "fingerprint-2"
      );

      expect(result).toBe(true);
    });

    it("should reject device when over 3 different fingerprints", async () => {
      const mockCommits: BudgetCommit[] = [
        {
          hash: "hash-1",
          timestamp: Date.now(),
          message: "Commit 1",
          author: "Test User",
          parentHash: null,
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
        {
          hash: "hash-2",
          timestamp: Date.now(),
          message: "Commit 2",
          author: "Test User",
          parentHash: "hash-1",
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-2",
        },
        {
          hash: "hash-3",
          timestamp: Date.now(),
          message: "Commit 3",
          author: "Test User",
          parentHash: "hash-2",
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-3",
        },
        {
          hash: "hash-4",
          timestamp: Date.now(),
          message: "Commit 4",
          author: "Test User",
          parentHash: "hash-3",
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-4",
        },
      ];

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockCommits),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.verifyDeviceConsistency(
        "Test User",
        "fingerprint-5"
      );

      expect(result).toBe(false);
    });

    it("should handle errors and return false", async () => {
      vi.mocked(budgetDb.budgetCommits.where).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.verifyDeviceConsistency(
        "Test User",
        "fingerprint-1"
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it("should filter out empty fingerprints", async () => {
      const mockCommits: BudgetCommit[] = [
        {
          hash: "hash-1",
          timestamp: Date.now(),
          message: "Commit 1",
          author: "Test User",
          parentHash: null,
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
        {
          hash: "hash-2",
          timestamp: Date.now(),
          message: "Commit 2",
          author: "Test User",
          parentHash: "hash-1",
          snapshotData: "{}",
          deviceFingerprint: "",
        },
      ];

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          reverse: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(mockCommits),
            }),
          }),
        }),
      } as never);

      const result = await BudgetHistoryTracker.verifyDeviceConsistency(
        "Test User",
        "fingerprint-2"
      );

      expect(result).toBe(true);
    });
  });

  describe("getChangePatterns", () => {
    it("should analyze change patterns successfully", async () => {
      const now = Date.now();
      const mockCommits: BudgetCommit[] = [
        {
          hash: "hash-1",
          timestamp: now - 1000,
          message: "Commit 1",
          author: "User A",
          parentHash: null,
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
        {
          hash: "hash-2",
          timestamp: now - 500,
          message: "Commit 2",
          author: "User B",
          parentHash: "hash-1",
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-2",
        },
      ];

      const mockChanges: BudgetChange[] = [
        {
          commitHash: "hash-1",
          entityType: "unassignedCash",
          entityId: "main",
          changeType: "update",
          description: "Change 1",
          oldValue: { amount: 100 },
          newValue: { amount: 200 },
        },
        {
          commitHash: "hash-2",
          entityType: "debt",
          entityId: "debt-123",
          changeType: "create",
          description: "Change 2",
          oldValue: null,
          newValue: { name: "New Debt" },
        },
      ];

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockChanges),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockCommits),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getChangePatterns();

      expect(result).toBeDefined();
      expect(result?.totalChanges).toBe(2);
      expect(result?.changesByType).toHaveProperty("update");
      expect(result?.changesByType).toHaveProperty("create");
      expect(result?.changesByEntity).toHaveProperty("unassignedCash");
      expect(result?.changesByEntity).toHaveProperty("debt");
      expect(result?.authorActivity).toHaveProperty("User A");
      expect(result?.authorActivity).toHaveProperty("User B");
      expect(result?.dailyActivity).toBeDefined();
      expect(result?.averageChangesPerDay).toBeGreaterThanOrEqual(0);
    });

    it("should calculate most active hour", async () => {
      const now = Date.now();
      const mockCommits: BudgetCommit[] = [
        {
          hash: "hash-1",
          timestamp: now - 1000,
          message: "Commit 1",
          author: "User A",
          parentHash: null,
          snapshotData: "{}",
          deviceFingerprint: "fingerprint-1",
        },
      ];

      const mockChanges: BudgetChange[] = [
        {
          commitHash: "hash-1",
          entityType: "unassignedCash",
          entityId: "main",
          changeType: "update",
          description: "Change 1",
          oldValue: { amount: 100 },
          newValue: { amount: 200 },
        },
      ];

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockChanges),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockCommits),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getChangePatterns();

      expect(result?.mostActiveHour).toBeDefined();
      expect(typeof result?.mostActiveHour).toBe("number");
    });

    it("should handle empty data", async () => {
      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      const result = await BudgetHistoryTracker.getChangePatterns();

      expect(result?.totalChanges).toBe(0);
      expect(result?.mostActiveHour).toBeNull();
      expect(result?.averageChangesPerDay).toBe(0);
    });

    it("should return null on error", async () => {
      vi.mocked(budgetDb.budgetChanges.where).mockImplementation(() => {
        throw new Error("Database error");
      });

      const result = await BudgetHistoryTracker.getChangePatterns();

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it("should use custom time range", async () => {
      const customTimeRange = 7 * 24 * 60 * 60 * 1000; // 7 days

      vi.mocked(budgetDb.budgetChanges.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      vi.mocked(budgetDb.budgetCommits.where).mockReturnValue({
        above: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      await BudgetHistoryTracker.getChangePatterns(customTimeRange);

      expect(budgetDb.budgetCommits.where).toHaveBeenCalledWith("timestamp");
    });
  });
});
