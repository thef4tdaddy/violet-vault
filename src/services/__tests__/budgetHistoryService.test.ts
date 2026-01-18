import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import budgetHistoryService from "@/services/budget/budgetHistoryService";
import { budgetDb } from "@/db/budgetDb";
import { encryptionUtils } from "@/utils/platform/security/encryption";

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
              toArray: vi.fn(),
            })),
          })),
        })),
        anyOf: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn(),
            })),
          })),
        })),
        above: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
    budgetCommits: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn(),
            })),
          })),
          first: vi.fn(),
        })),
        above: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
      count: vi.fn(),
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
      bulkDelete: vi.fn(),
    },
    budgetBranches: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
          modify: vi.fn(),
        })),
      })),
      orderBy: vi.fn(() => ({
        toArray: vi.fn(),
      })),
    },
    budgetTags: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
  },
}));

vi.mock("@/utils/platform/security/encryption", () => ({
  encryptionUtils: {
    generateDeviceFingerprint: vi.fn(),
    generateHash: vi.fn(),
  },
}));

// Type the mocked functions using vi.mocked()
const mockedEncryptionUtils = vi.mocked(encryptionUtils);
const mockedBudgetDb = vi.mocked(budgetDb);

describe("BudgetHistoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully", async () => {
      const result = await budgetHistoryService.initialize();
      expect(result).toBe(true);
    });
  });

  describe("createCommit", () => {
    it("should create a budget history commit", async () => {
      const mockHash = "abc123456789";
      const mockFingerprint = "device123";

      mockedEncryptionUtils.generateDeviceFingerprint.mockReturnValue(mockFingerprint);
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const commitOptions = {
        entityType: "unassignedCash",
        changeType: "modify",
        description: "Updated unassigned cash",
        beforeData: { amount: 1000 },
        afterData: { amount: 1500 },
        author: "Test User",
      };

      const result = await budgetHistoryService.createCommit(commitOptions);

      expect(result).toHaveProperty("commit");
      expect(result).toHaveProperty("changes");
      expect(result.commit.hash).toBe(mockHash);
      expect(result.commit.author).toBe("Test User");
      expect(result.changes).toHaveLength(1);

      expect(mockedBudgetDb.createBudgetCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          hash: mockHash,
          author: "Test User",
          message: "Updated unassigned cash",
          deviceFingerprint: mockFingerprint,
        })
      );

      expect(mockedBudgetDb.createBudgetChanges).toHaveBeenCalledWith([
        expect.objectContaining({
          commitHash: mockHash,
          entityType: "unassignedCash",
          changeType: "modify",
          description: "Updated unassigned cash",
        }),
      ]);
    });

    it("should handle commit creation errors", async () => {
      const error = new Error("Database error");
      mockedBudgetDb.createBudgetCommit.mockRejectedValue(error);

      const commitOptions = {
        entityType: "unassignedCash",
        changeType: "modify",
        description: "Test commit",
        beforeData: {},
        afterData: {},
      };

      await expect(budgetHistoryService.createCommit(commitOptions)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("trackUnassignedCashChange", () => {
    it("should track unassigned cash changes", async () => {
      const mockHash = "hash123";
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const options = {
        previousAmount: 1000,
        newAmount: 1500,
        author: "Test User",
        source: "manual",
      };

      const result = await budgetHistoryService.trackUnassignedCashChange(options);

      expect(result.commit.message).toContain("Updated unassigned cash from");
      expect(result.changes[0].oldValue.amount).toBe(1000);
      expect(result.changes[0].newValue.amount).toBe(1500);
    });

    it("should handle distribution source correctly", async () => {
      const mockHash = "hash123";
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const options = {
        previousAmount: 1500,
        newAmount: 1000,
        author: "Test User",
        source: "distribution",
      };

      const result = await budgetHistoryService.trackUnassignedCashChange(options);

      expect(result.commit.message).toContain("Distributed");
      expect(result.commit.message).toContain("to envelopes");
    });
  });

  describe("trackActualBalanceChange", () => {
    it("should track actual balance changes", async () => {
      const mockHash = "hash123";
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const options = {
        previousBalance: 5000,
        newBalance: 5500,
        isManual: true,
        author: "Test User",
      };

      const result = await budgetHistoryService.trackActualBalanceChange(options);

      expect(result.commit.message).toContain("Updated actual balance via manual entry");
      expect(result.changes[0].oldValue.balance).toBe(5000);
      expect(result.changes[0].newValue.balance).toBe(5500);
      expect(result.changes[0].newValue.isManual).toBe(true);
    });
  });

  describe("trackDebtChange", () => {
    it("should track debt addition", async () => {
      const mockHash = "hash123";
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const options = {
        debtId: "debt1",
        changeType: "add",
        previousData: null,
        newData: { name: "Credit Card", currentBalance: 2000 },
        author: "Test User",
      };

      const result = await budgetHistoryService.trackDebtChange(options);

      expect(result.commit.message).toContain("Added new debt: Credit Card");
      expect(result.changes[0].entityId).toBe("debt1");
      expect(result.changes[0].changeType).toBe("create");
    });

    it("should track debt modification", async () => {
      const mockHash = "hash123";
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const options = {
        debtId: "debt1",
        changeType: "modify",
        previousData: { name: "Credit Card", currentBalance: 2000 },
        newData: { name: "Credit Card", currentBalance: 1800 },
        author: "Test User",
      };

      const result = await budgetHistoryService.trackDebtChange(options);

      expect(result.commit.message).toContain("Updated Credit Card balance from");
    });

    it("should track debt deletion", async () => {
      const mockHash = "hash123";
      mockedEncryptionUtils.generateHash.mockReturnValue(mockHash);
      mockedBudgetDb.createBudgetCommit.mockResolvedValue("mock-hash");
      mockedBudgetDb.createBudgetChanges.mockResolvedValue(1);

      const options = {
        debtId: "debt1",
        changeType: "delete",
        previousData: { name: "Credit Card", currentBalance: 0 },
        newData: null,
        author: "Test User",
      };

      const result = await budgetHistoryService.trackDebtChange(options);

      expect(result.commit.message).toContain("Deleted debt: Credit Card");
    });
  });

  describe("getRecentChanges", () => {
    it("should get recent changes for entity type", async () => {
      const mockChanges = [
        { id: 1, entityType: "unassignedCash", changeType: "modify" },
        { id: 2, entityType: "unassignedCash", changeType: "modify" },
      ];

      const mockQuery = {
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn().mockResolvedValue(mockChanges),
            })),
          })),
        })),
      };

      (mockedBudgetDb.budgetChanges.where as Mock).mockReturnValue(mockQuery);

      const result = await budgetHistoryService.getRecentChanges("unassignedCash", 10);

      expect(result).toEqual(mockChanges);
      expect(mockedBudgetDb.budgetChanges.where).toHaveBeenCalledWith("entityType");
      expect(mockQuery.equals).toHaveBeenCalledWith("unassignedCash");
    });

    it("should handle query errors gracefully", async () => {
      (mockedBudgetDb.budgetChanges.where as Mock).mockImplementation(() => {
        throw new Error("Query failed");
      });

      const result = await budgetHistoryService.getRecentChanges("unassignedCash");

      expect(result).toEqual([]);
    });
  });

  describe("createBranch", () => {
    it("should create a new branch", async () => {
      const mockCommit = { hash: "commit123" };

      (mockedBudgetDb.budgetBranches.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(null), // No existing branch
        })),
      });

      (mockedBudgetDb.budgetCommits.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(mockCommit), // Commit exists
        })),
      });

      (mockedBudgetDb.createBudgetBranch as Mock).mockResolvedValue(1);

      const options = {
        fromCommitHash: "commit123",
        branchName: "feature-branch",
        description: "Test branch",
        author: "Test User",
      };

      const result = await budgetHistoryService.createBranch(options);

      expect(result.name).toBe("feature-branch");
      expect(result.sourceCommitHash).toBe("commit123");
      expect(result.author).toBe("Test User");
      expect(mockedBudgetDb.createBudgetBranch).toHaveBeenCalled();
    });

    it("should reject duplicate branch names", async () => {
      (mockedBudgetDb.budgetBranches.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue({ name: "existing-branch" }),
        })),
      });

      const options = {
        fromCommitHash: "commit123",
        branchName: "existing-branch",
        author: "Test User",
      };

      await expect(budgetHistoryService.createBranch(options)).rejects.toThrow(
        "Branch 'existing-branch' already exists"
      );
    });

    it("should reject invalid source commit", async () => {
      (mockedBudgetDb.budgetBranches.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(null), // No existing branch
        })),
      });

      (mockedBudgetDb.budgetCommits.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(null), // Commit doesn't exist
        })),
      });

      const options = {
        fromCommitHash: "invalid-commit",
        branchName: "feature-branch",
        author: "Test User",
      };

      await expect(budgetHistoryService.createBranch(options)).rejects.toThrow(
        "Source commit 'invalid-commit' not found"
      );
    });
  });

  describe("createTag", () => {
    it("should create a new tag", async () => {
      const mockCommit = { hash: "commit123" };

      (mockedBudgetDb.budgetTags.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(null), // No existing tag
        })),
      });

      (mockedBudgetDb.budgetCommits.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(mockCommit), // Commit exists
        })),
      });

      (mockedBudgetDb.createBudgetTag as Mock).mockResolvedValue(1);

      const options = {
        commitHash: "commit123",
        tagName: "v1.0.0",
        description: "Release v1.0.0",
        tagType: "release",
        author: "Test User",
      };

      const result = await budgetHistoryService.createTag(options);

      expect(result.name).toBe("v1.0.0");
      expect(result.commitHash).toBe("commit123");
      expect(result.tagType).toBe("release");
      expect(mockedBudgetDb.createBudgetTag).toHaveBeenCalled();
    });
  });

  describe("verifyDeviceConsistency", () => {
    it("should return true for first commit from author", async () => {
      (mockedBudgetDb.budgetCommits.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn().mockResolvedValue([]), // No previous commits
            })),
          })),
        })),
      });

      const result = await budgetHistoryService.verifyDeviceConsistency(
        "Test User",
        "fingerprint123"
      );

      expect(result).toBe(true);
    });

    it("should verify known device fingerprints", async () => {
      const mockCommits = [
        { deviceFingerprint: "fingerprint123" },
        { deviceFingerprint: "fingerprint123" },
      ];

      (mockedBudgetDb.budgetCommits.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn().mockResolvedValue(mockCommits),
            })),
          })),
        })),
      });

      const result = await budgetHistoryService.verifyDeviceConsistency(
        "Test User",
        "fingerprint123"
      );

      expect(result).toBe(true);
    });

    it("should allow new devices within limit", async () => {
      const mockCommits = [
        { deviceFingerprint: "fingerprint1" },
        { deviceFingerprint: "fingerprint2" },
      ];

      (mockedBudgetDb.budgetCommits.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          reverse: vi.fn(() => ({
            limit: vi.fn(() => ({
              toArray: vi.fn().mockResolvedValue(mockCommits),
            })),
          })),
        })),
      });

      const result = await budgetHistoryService.verifyDeviceConsistency(
        "Test User",
        "fingerprint3"
      );

      expect(result).toBe(true); // Should allow 3rd device
    });
  });

  describe("cleanup", () => {
    it("should cleanup old commits when limit exceeded", async () => {
      const maxCommits = budgetHistoryService.maxRecentCommits;
      const totalCommits = maxCommits + 100;

      (mockedBudgetDb.budgetCommits.count as Mock).mockResolvedValue(totalCommits);

      const oldCommits = Array.from({ length: 100 }, (_, i) => ({
        hash: `old-hash-${i}`,
      }));

      (mockedBudgetDb.budgetCommits.orderBy as Mock).mockReturnValue({
        limit: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(oldCommits),
        })),
      });

      (mockedBudgetDb.budgetCommits.bulkDelete as Mock).mockResolvedValue(undefined);
      (mockedBudgetDb.budgetChanges.where as Mock).mockReturnValue({
        anyOf: vi.fn(() => ({
          delete: vi.fn().mockResolvedValue(undefined),
        })),
      });

      await budgetHistoryService.cleanup();

      expect(mockedBudgetDb.budgetCommits.bulkDelete).toHaveBeenCalledWith(
        oldCommits.map((c) => c.hash)
      );
    });

    it("should not cleanup when within limits", async () => {
      const maxCommits = budgetHistoryService.maxRecentCommits;
      (mockedBudgetDb.budgetCommits.count as Mock).mockResolvedValue(maxCommits - 100);

      await budgetHistoryService.cleanup();

      expect(mockedBudgetDb.budgetCommits.bulkDelete).not.toHaveBeenCalled();
    });
  });

  describe("getStatus", () => {
    it("should return service status", () => {
      const status = budgetHistoryService.getStatus();

      expect(status).toEqual({
        maxRecentCommits: budgetHistoryService.maxRecentCommits,
        maxDevicesPerAuthor: budgetHistoryService.maxDevicesPerAuthor,
        defaultAnalysisRange: budgetHistoryService.defaultAnalysisRange,
      });
    });
  });
});
