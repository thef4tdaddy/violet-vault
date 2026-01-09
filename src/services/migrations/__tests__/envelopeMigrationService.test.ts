/**
 * Envelope Migration Service Tests
 * Issue #1335: Database Schema Migration for Savings Goals and Supplemental Accounts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { budgetDb } from "../../../db/budgetDb";
import type { SavingsGoal, Envelope } from "../../../db/types";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import {
  convertSavingsGoalToEnvelope,
  convertSupplementalAccountToEnvelope,
  convertSinkingFundToSavings,
  runEnvelopeMigration,
  isMigrationNeeded,
  getMigrationStatus,
} from "../envelopeMigrationService";

// Mock budgetDb
vi.mock("../../../db/budgetDb", () => {
  const mockEnvelopes: any[] = [];
  const mockSavingsGoals: any[] = [];
  const mockBudget: Record<string, any> = {};

  return {
    budgetDb: {
      envelopes: {
        clear: vi.fn(async () => {
          mockEnvelopes.length = 0;
        }),
        add: vi.fn(async (item: any) => {
          mockEnvelopes.push(item);
          return item.id;
        }),
        put: vi.fn(async (item: any) => {
          const index = mockEnvelopes.findIndex((e) => e.id === item.id);
          if (index >= 0) mockEnvelopes[index] = item;
          else mockEnvelopes.push(item);
          return item.id;
        }),
        get: vi.fn(async (id: string) => mockEnvelopes.find((e) => e.id === id)),
        toArray: vi.fn(async () => mockEnvelopes),
        toCollection: vi.fn().mockImplementation(() => ({
          filter: vi.fn().mockImplementation((fn: any) => ({
            count: vi.fn(async () => mockEnvelopes.filter(fn).length),
            toArray: vi.fn(async () => mockEnvelopes.filter(fn)),
          })),
        })),
        where: vi.fn().mockImplementation((key: string) => ({
          equals: vi.fn().mockImplementation((val: any) => ({
            count: vi.fn(async () => mockEnvelopes.filter((e) => e[key] === val).length),
            toArray: vi.fn(async () => mockEnvelopes.filter((e) => e[key] === val)),
          })),
        })),
      },
      savingsGoals: {
        clear: vi.fn(async () => {
          mockSavingsGoals.length = 0;
        }),
        add: vi.fn(async (item: any) => {
          mockSavingsGoals.push(item);
          return item.id;
        }),
        toArray: vi.fn(async () => mockSavingsGoals),
        count: vi.fn(async () => mockSavingsGoals.length),
      },
      budget: {
        clear: vi.fn(async () => {
          Object.keys(mockBudget).forEach((k) => delete mockBudget[k]);
        }),
        get: vi.fn(async (id: string) => mockBudget[id]),
        put: vi.fn(async (item: any) => {
          mockBudget[item.id] = item;
          return item.id;
        }),
      },
      transaction: vi.fn().mockImplementation((_mode, _tables, fn) => fn()),
    },
  };
});

// Mock logger
vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Envelope Migration Service", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await (budgetDb as any).envelopes.clear();
    await (budgetDb as any).savingsGoals.clear();
    await (budgetDb as any).budget.clear();
  });

  afterEach(async () => {
    // Clean up after tests
    await (budgetDb as any).envelopes.clear();
    await (budgetDb as any).savingsGoals.clear();
    await (budgetDb as any).budget.clear();
  });

  describe("convertSavingsGoalToEnvelope", () => {
    it("should convert savings goal to envelope with correct type", () => {
      const goal: any = {
        id: "goal-1",
        name: "Emergency Fund",
        category: "Savings",
        priority: "high",
        targetAmount: 10000,
        currentAmount: 2500,
        targetDate: new Date("2025-12-31"),
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
        description: "Emergency savings fund",
        monthlyContribution: 500,
      };

      const envelope = convertSavingsGoalToEnvelope(goal);

      expect(envelope.id).toBe("goal-1");
      expect(envelope.name).toBe("Emergency Fund");
      expect(envelope.category).toBe("Savings");
      expect(envelope.type).toBe("goal");
      expect(envelope.currentBalance).toBe(2500);
      expect(envelope.targetAmount).toBe(10000);
      expect((envelope as any).priority).toBe("high");
      expect((envelope as any).isPaused).toBe(false);
      expect((envelope as any).isCompleted).toBe(false);
      expect((envelope as any).targetDate).toEqual(goal.targetDate);
      expect((envelope as any).monthlyContribution).toBe(500);
    });

    it("should handle missing optional fields", () => {
      const goal: any = {
        id: "goal-2",
        name: "Vacation",
        category: "Travel",
        priority: "low",
        targetAmount: 3000,
        currentAmount: 0,
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      };

      const envelope = convertSavingsGoalToEnvelope(goal);

      expect(envelope.id).toBe("goal-2");
      expect(envelope.name).toBe("Vacation");
      expect(envelope.type).toBe("goal");
      expect(envelope.description).toBe("");
      expect((envelope as any).targetDate).toBeUndefined();
      expect((envelope as any).monthlyContribution).toBeUndefined();
    });

    it("should mark completed goals as archived", () => {
      const goal: any = {
        id: "goal-3",
        name: "Completed Goal",
        category: "Savings",
        priority: "medium",
        targetAmount: 1000,
        currentAmount: 1000,
        isPaused: false,
        isCompleted: true,
        lastModified: Date.now(),
      };

      const envelope = convertSavingsGoalToEnvelope(goal);

      expect(envelope.archived).toBe(true);
      expect((envelope as any).isCompleted).toBe(true);
    });
  });

  describe("convertSupplementalAccountToEnvelope", () => {
    it("should convert supplemental account to envelope with correct type", () => {
      const account = {
        id: "hsa-1",
        name: "Health Savings Account",
        type: "HSA",
        balance: 5000,
        annualContribution: 3600,
        expirationDate: null,
        isActive: true,
        description: "My HSA",
      };

      const envelope = convertSupplementalAccountToEnvelope(account);

      expect(envelope.id).toBe("hsa-1");
      expect(envelope.name).toBe("Health Savings Account");
      expect(envelope.category).toBe("HSA");
      expect(envelope.type).toBe("supplemental");
      expect(envelope.currentBalance).toBe(5000);
      expect((envelope as any).annualContribution).toBe(3600);
      expect((envelope as any).isActive).toBe(true);
      expect((envelope as any).accountType).toBe("HSA");
      expect(envelope.autoAllocate).toBe(false);
    });

    it("should generate ID if missing", () => {
      const account = {
        name: "FSA Account",
        type: "FSA",
        balance: 1000,
      };

      const envelope = convertSupplementalAccountToEnvelope(account);

      expect(envelope.id).toMatch(/^supplemental_\d+_/);
      expect(envelope.name).toBe("FSA Account");
      expect(envelope.type).toBe("supplemental");
    });

    it("should handle accounts with currentBalance property", () => {
      const account = {
        id: "fsa-1",
        name: "FSA",
        type: "FSA",
        currentBalance: 2000,
      };

      const envelope = convertSupplementalAccountToEnvelope(account);

      expect(envelope.currentBalance).toBe(2000);
    });

    it("should use balance over currentBalance when both present", () => {
      const account = {
        id: "fsa-2",
        name: "FSA",
        type: "FSA",
        balance: 3000,
        currentBalance: 2000,
      };

      const envelope = convertSupplementalAccountToEnvelope(account);

      expect(envelope.currentBalance).toBe(3000);
    });
  });

  describe("convertSinkingFundToSavings", () => {
    it("should convert SINKING_FUND to SAVINGS type", () => {
      const sinkingFund: any = {
        id: "sink-1",
        name: "New Car",
        category: "Transportation",
        archived: false,
        lastModified: Date.now(),
        type: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 5000,
        targetAmount: 20000,
      };

      const converted = convertSinkingFundToSavings(sinkingFund);

      expect(converted.id).toBe("sink-1");
      expect(converted.name).toBe("New Car");
      expect(converted.type).toBe("goal");
      expect(converted.currentBalance).toBe(5000);
      expect(converted.targetAmount).toBe(20000);
    });

    it("should preserve existing fields", () => {
      const sinkingFund: any = {
        id: "sink-2",
        name: "Holiday Fund",
        category: "Travel",
        archived: false,
        lastModified: Date.now(),
        type: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 1000,
        targetAmount: 3000,
        targetDate: new Date("2024-12-01"),
        priority: "high",
        description: "Holiday savings",
      };

      const converted = convertSinkingFundToSavings(sinkingFund);

      expect(converted.type).toBe("goal");
      expect((converted as any).targetDate).toEqual(sinkingFund.targetDate);
      expect((converted as any).priority).toBe("high");
      expect(converted.description).toBe("Holiday savings");
    });

    it("should set isCompleted when balance >= target", () => {
      const sinkingFund: any = {
        id: "sink-3",
        name: "Completed Fund",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        type: ENVELOPE_TYPES.SINKING_FUND,
        currentBalance: 5000,
        targetAmount: 5000,
      };

      const converted = convertSinkingFundToSavings(sinkingFund);

      expect((converted as any).isCompleted).toBe(true);
    });
  });

  describe("isMigrationNeeded", () => {
    it("should return false when no migration is needed", async () => {
      const needed = await isMigrationNeeded();
      expect(needed).toBe(false);
    });

    it("should return true if savings goals exist", async () => {
      await (budgetDb as any).savingsGoals.add({
        id: "goal-1",
        name: "Test Goal",
        category: "Savings",
        priority: "medium",
        targetAmount: 1000,
        currentAmount: 0,
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      });

      const needed = await isMigrationNeeded();
      expect(needed).toBe(true);
    });

    it("should return true if sinking fund envelopes exist", async () => {
      await (budgetDb as any).envelopes.add({
        id: "sink-1",
        name: "Sinking Fund Test",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        type: ENVELOPE_TYPES.SINKING_FUND,
      });

      const needed = await isMigrationNeeded();
      expect(needed).toBe(true);
    });

    it("should return true if supplemental accounts in metadata", async () => {
      await (budgetDb as any).budget.put({
        id: "metadata",
        lastModified: Date.now(),
        supplementalAccounts: [{ id: "hsa-1", name: "HSA", type: "HSA", balance: 1000 }],
      });

      const needed = await isMigrationNeeded();
      expect(needed).toBe(true);
    });
  });

  describe("getMigrationStatus", () => {
    it("should return correct counts", async () => {
      // Add test data
      await (budgetDb as any).savingsGoals.add({
        id: "goal-1",
        name: "Goal 1",
        category: "Savings",
        priority: "medium",
        targetAmount: 1000,
        currentAmount: 0,
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      });

      await (budgetDb as any).envelopes.add({
        id: "sink-1",
        name: "Sinking Fund",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        type: ENVELOPE_TYPES.SINKING_FUND,
      });

      await (budgetDb as any).envelopes.add({
        id: "savings-1",
        name: "Already Migrated",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        type: "goal",
      } as any);

      await (budgetDb as any).budget.put({
        id: "metadata",
        lastModified: Date.now(),
        supplementalAccounts: [{ id: "hsa-1", name: "HSA", type: "HSA", balance: 1000 }],
      });

      const status = await getMigrationStatus();

      expect(status.needsMigration).toBe(true);
      expect(status.savingsGoalsCount).toBe(1);
      expect(status.sinkingFundsCount).toBe(1);
      expect(status.supplementalAccountsCount).toBe(1);
      expect(status.savingsEnvelopesCount).toBe(1);
    });
  });

  describe("runEnvelopeMigration", () => {
    it("should migrate savings goals to envelopes", async () => {
      await (budgetDb as any).savingsGoals.add({
        id: "goal-migrate-1",
        name: "Goal to Migrate",
        category: "Savings",
        priority: "high",
        targetAmount: 5000,
        currentAmount: 1000,
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      });

      const result = await runEnvelopeMigration();

      expect(result.success).toBe(true);
      expect(result.migratedSavingsGoals).toBe(1);

      const envelope = await budgetDb.envelopes.get("goal-migrate-1");
      expect(envelope).toBeDefined();
      expect(envelope?.name).toBe("Goal to Migrate");
      expect(envelope?.type).toBe("goal");
      expect(envelope?.currentBalance).toBe(1000);
    });

    it("should migrate sinking funds to savings", async () => {
      await (budgetDb as any).envelopes.add({
        id: "sink-migrate-1",
        name: "Sinking to Migrate",
        category: "Transportation",
        archived: false,
        lastModified: Date.now(),
        type: ENVELOPE_TYPES.SINKING_FUND,
        targetAmount: 10000,
        currentBalance: 2000,
      } as any);

      const result = await runEnvelopeMigration();

      expect(result.success).toBe(true);
      expect(result.migratedSinkingFunds).toBe(1);

      const envelope = await budgetDb.envelopes.get("sink-migrate-1");
      expect(envelope?.type).toBe("goal");
    });

    it("should migrate supplemental accounts to envelopes", async () => {
      await budgetDb.budget.put({
        id: "metadata",
        lastModified: Date.now(),
        supplementalAccounts: [
          { id: "hsa-migrate-1", name: "HSA Account", type: "HSA", balance: 3000 },
        ],
      });

      const result = await runEnvelopeMigration();

      expect(result.success).toBe(true);
      expect(result.migratedSupplementalAccounts).toBe(1);

      const envelope = await budgetDb.envelopes.get("hsa-migrate-1");
      expect(envelope).toBeDefined();
      expect(envelope?.name).toBe("HSA Account");
      expect(envelope?.type).toBe("supplemental");
      expect(envelope?.currentBalance).toBe(3000);
    });

    it("should skip already migrated data", async () => {
      // Add savings goal
      await (budgetDb as any).savingsGoals.add({
        id: "goal-existing",
        name: "Existing Goal",
        category: "Savings",
        priority: "medium",
        targetAmount: 1000,
        currentAmount: 500,
        isPaused: false,
        isCompleted: false,
        lastModified: Date.now(),
      });

      // Also add matching envelope (already migrated)
      await (budgetDb as any).envelopes.add({
        id: "goal-existing",
        name: "Existing Goal",
        category: "Savings",
        archived: false,
        lastModified: Date.now(),
        type: "goal",
      } as any);

      const result = await runEnvelopeMigration();

      expect(result.success).toBe(true);
      expect(result.migratedSavingsGoals).toBe(0);
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0]).toContain("already has matching envelope");
    });

    it("should handle empty database", async () => {
      const result = await runEnvelopeMigration();

      expect(result.success).toBe(true);
      expect(result.migratedSavingsGoals).toBe(0);
      expect(result.migratedSupplementalAccounts).toBe(0);
      expect(result.migratedSinkingFunds).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});
