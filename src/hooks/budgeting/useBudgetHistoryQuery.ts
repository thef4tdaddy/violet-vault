import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../utils/common/queryClient";
import { budgetDb } from "../../db/budgetDb";
import { encryptionUtils } from "../../utils/security/encryption";
import logger from "../../utils/common/logger";

/**
 * TanStack Query hooks for budget history following proper data flow:
 * Firebase → Dexie → TanStack Query → React Components
 *
 * This replaces the Zustand-based budget history implementation
 */

export const useBudgetCommits = (options: Record<string, unknown> = {}) => {
  const queryClient = useQueryClient();

  const commitsQuery = useQuery({
    queryKey: queryKeys.budgetCommits(options as Record<string, unknown> | undefined),
    queryFn: async () => {
      try {
        // Query budget commits table directly
        const commits = await budgetDb.budgetCommits.orderBy("timestamp").reverse().toArray();
        return commits || [];
      } catch (error) {
        logger.warn("Failed to fetch budget commits:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });

  const createCommitMutation = useMutation({
    mutationKey: ["budgetCommits", "create"],
    mutationFn: async (commitData: {
      password: string;
      snapshot: unknown;
      changes?: Array<Partial<import("../../db/types").BudgetChange>>;
      message?: string;
      author?: string;
      parentHash?: string;
    }) => {
      // Generate hash and encrypt snapshot
      const hash = encryptionUtils.generateHash(JSON.stringify(commitData));
      const encryptionKey = await encryptionUtils.deriveKey(commitData.password);
      const encryptedSnapshot = await encryptionUtils.encrypt(
        JSON.stringify(commitData.snapshot),
        encryptionKey
      );

      const commit = {
        hash,
        message: commitData.message || "",
        author: commitData.author || "Unknown",
        parentHash: commitData.parentHash || null,
        deviceFingerprint: "",
        encryptedSnapshot: encryptedSnapshot.data,
        iv: encryptedSnapshot.iv,
        timestamp: Date.now(),
      };

      await budgetDb.budgetCommits.put(commit);

      // Also create changes if provided
      if (commitData.changes && commitData.changes.length > 0) {
        const changes = commitData.changes.map((change) => ({
          ...change,
          commitHash: hash,
        }));
        await budgetDb.createBudgetChanges(changes as import("../../db/types").BudgetChange[]);
      }

      return commit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCommits() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetHistory as readonly unknown[] });
    },
  });

  return {
    commits: commitsQuery.data || [],
    isLoading: commitsQuery.isLoading,
    isError: commitsQuery.isError,
    error: commitsQuery.error,
    createCommit: createCommitMutation.mutate,
    createCommitAsync: createCommitMutation.mutateAsync,
    refetch: commitsQuery.refetch,
  };
};

export const useBudgetCommitDetails = (commitHash: string | null) => {
  return useQuery({
    queryKey: queryKeys.budgetCommit(commitHash ?? ""),
    queryFn: async (): Promise<{
      commit?: {
        hash?: string;
        message?: string;
        author?: string;
        timestamp?: string | number;
        parentHash?: string;
        [key: string]: unknown;
      };
      changes: Array<{
        type?: string;
        changeType?: string;
        entityType?: string;
        description?: string;
        diff?: Record<string, { from: unknown; to: unknown }>;
        [key: string]: unknown;
      }>;
    } | null> => {
      if (!commitHash) return null;

      try {
        const [commit, changes] = await Promise.all([
          budgetDb.budgetCommits.get(commitHash),
          budgetDb.budgetChanges.where("commitHash").equals(commitHash).toArray(),
        ]);

        return { commit, changes };
      } catch (error) {
        logger.warn("Failed to fetch commit details:", {
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    },
    enabled: !!commitHash,
    staleTime: 10 * 60 * 1000, // 10 minutes - commits are immutable
  });
};

export const useBudgetHistoryStats = () => {
  return useQuery({
    queryKey: queryKeys.budgetHistoryStats(),
    queryFn: async () => {
      try {
        const commitCount = await budgetDb.budgetCommits.count();
        const commits = await budgetDb.budgetCommits
          .orderBy("timestamp")
          .reverse()
          .limit(1)
          .toArray();
        const lastCommit = commits[0];

        return {
          totalCommits: commitCount,
          lastCommitDate: lastCommit?.timestamp,
          lastCommitMessage: lastCommit?.message,
          lastCommitAuthor: lastCommit?.author,
        };
      } catch (error) {
        logger.warn("Failed to fetch budget history stats:", {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          totalCommits: 0,
          lastCommitDate: null,
          lastCommitMessage: null,
          lastCommitAuthor: null,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBudgetHistoryOperations = () => {
  const queryClient = useQueryClient();

  const restoreMutation = useMutation({
    mutationKey: ["budgetHistory", "restore"],
    mutationFn: async ({ commitHash, password }: { commitHash: string; password: string }) => {
      const commit = await budgetDb.budgetCommits.get(commitHash);
      if (!commit) {
        throw new Error("Commit not found");
      }

      // Decrypt and restore the snapshot
      const encryptionKey = await encryptionUtils.deriveKey(password);
      const commitWithSnapshot = commit as typeof commit & {
        encryptedSnapshot: number[];
        iv: number[];
      };
      const decrypted = await encryptionUtils.decrypt(
        commitWithSnapshot.encryptedSnapshot,
        encryptionKey,
        new Uint8Array(commitWithSnapshot.iv)
      );
      const snapshot = JSON.parse(decrypted);

      // Restore all data to the snapshot state using Dexie
      await budgetDb.transaction(
        "rw",
        [
          budgetDb.envelopes,
          budgetDb.transactions,
          budgetDb.bills,
          budgetDb.savingsGoals,
          budgetDb.debts,
          budgetDb.paycheckHistory,
        ],
        async () => {
          // Clear existing data
          await Promise.all([
            budgetDb.envelopes.clear(),
            budgetDb.transactions.clear(),
            budgetDb.bills.clear(),
            budgetDb.savingsGoals.clear(),
            budgetDb.debts.clear(),
            budgetDb.paycheckHistory.clear(),
          ]);

          // Restore snapshot data
          if (snapshot.envelopes?.length) await budgetDb.envelopes.bulkAdd(snapshot.envelopes);
          if (snapshot.transactions?.length)
            await budgetDb.transactions.bulkAdd(snapshot.transactions);
          if (snapshot.bills?.length) await budgetDb.bills.bulkAdd(snapshot.bills);
          if (snapshot.savingsGoals?.length)
            await budgetDb.savingsGoals.bulkAdd(snapshot.savingsGoals);
          if (snapshot.debts?.length) await budgetDb.debts.bulkAdd(snapshot.debts);
          if (snapshot.paycheckHistory?.length)
            await budgetDb.paycheckHistory.bulkAdd(snapshot.paycheckHistory);
        }
      );

      return { commitHash, snapshot };
    },
    onSuccess: () => {
      // Invalidate all data queries since we restored everything
      queryClient.invalidateQueries();
    },
  });

  const clearHistoryMutation = useMutation({
    mutationKey: ["budgetHistory", "clear"],
    mutationFn: async () => {
      await budgetDb.budgetCommits.clear();
      await budgetDb.budgetChanges.clear();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCommits() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetHistory as readonly unknown[] });
    },
  });

  const exportHistoryMutation = useMutation({
    mutationKey: ["budgetHistory", "export"],
    mutationFn: async (_options: Record<string, unknown> = {}) => {
      const commits = await budgetDb.budgetCommits.orderBy("timestamp").reverse().toArray();
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        totalCommits: commits.length,
        commits,
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `violet-vault-history-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return exportData;
    },
  });

  return {
    restore: restoreMutation.mutate,
    restoreAsync: restoreMutation.mutateAsync,
    clearHistory: clearHistoryMutation.mutate,
    clearHistoryAsync: clearHistoryMutation.mutateAsync,
    exportHistory: exportHistoryMutation.mutate,
    exportHistoryAsync: exportHistoryMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    isClearing: clearHistoryMutation.isPending,
    isExporting: exportHistoryMutation.isPending,
  };
};

// Combined hook for most common use cases
export const useBudgetHistory = (options = {}) => {
  const commits = useBudgetCommits(options);
  const stats = useBudgetHistoryStats();
  const operations = useBudgetHistoryOperations();

  return {
    ...commits,
    stats: stats.data,
    statsLoading: stats.isLoading,
    ...operations,
  };
};
