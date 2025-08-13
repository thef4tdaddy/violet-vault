import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";
import { budgetHistory } from "../utils/budgetHistory";

/**
 * TanStack Query hooks for budget history following proper data flow:
 * Firebase → Dexie → TanStack Query → React Components
 *
 * This replaces the Zustand-based budget history implementation
 */

export const useBudgetCommits = (options = {}) => {
  const queryClient = useQueryClient();

  const commitsQuery = useQuery({
    queryKey: queryKeys.budgetCommits(options),
    queryFn: async () => {
      try {
        const commits = await budgetDb.getBudgetCommits(options);
        return commits || [];
      } catch (error) {
        console.warn("Failed to fetch budget commits:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });

  const createCommitMutation = useMutation({
    mutationKey: ["budgetCommits", "create"],
    mutationFn: async (commitData) => {
      // Generate hash and encrypt snapshot
      const hash = await budgetHistory.generateCommitHash(commitData);
      const encryptedSnapshot = await budgetHistory.encryptSnapshot(
        commitData.snapshot,
        commitData.password
      );

      const commit = {
        ...commitData,
        hash,
        encryptedSnapshot,
        timestamp: Date.now(),
      };

      await budgetDb.createBudgetCommit(commit);

      // Also create changes if provided
      if (commitData.changes && commitData.changes.length > 0) {
        const changes = commitData.changes.map((change) => ({
          ...change,
          commitHash: hash,
        }));
        await budgetDb.createBudgetChanges(changes);
      }

      return commit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCommits() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetHistory() });
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

export const useBudgetCommitDetails = (commitHash) => {
  return useQuery({
    queryKey: queryKeys.budgetCommit(commitHash),
    queryFn: async () => {
      if (!commitHash) return null;

      try {
        const [commit, changes] = await Promise.all([
          budgetDb.getBudgetCommit(commitHash),
          budgetDb.getBudgetChanges(commitHash),
        ]);

        return { commit, changes };
      } catch (error) {
        console.warn("Failed to fetch commit details:", error);
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
        const commitCount = await budgetDb.getBudgetCommitCount();
        const commits = await budgetDb.getBudgetCommits({ limit: 1 });
        const lastCommit = commits[0];

        return {
          totalCommits: commitCount,
          lastCommitDate: lastCommit?.timestamp,
          lastCommitMessage: lastCommit?.message,
          lastCommitAuthor: lastCommit?.author,
        };
      } catch (error) {
        console.warn("Failed to fetch budget history stats:", error);
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
    mutationFn: async ({ commitHash, password }) => {
      const commit = await budgetDb.getBudgetCommit(commitHash);
      if (!commit) {
        throw new Error("Commit not found");
      }

      // Decrypt and restore the snapshot
      const snapshot = await budgetHistory.decryptSnapshot(commit.encryptedSnapshot, password);

      // Restore all data to the snapshot state
      await budgetHistory.restoreFromSnapshot(snapshot);

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
      await budgetDb.clearBudgetHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetCommits() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetHistory() });
    },
  });

  const exportHistoryMutation = useMutation({
    mutationKey: ["budgetHistory", "export"],
    mutationFn: async (options = {}) => {
      const commits = await budgetDb.getBudgetCommits(options);
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
