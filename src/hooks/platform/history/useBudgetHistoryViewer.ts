import React, { useState, useCallback } from "react";
import { getIcon } from "@/utils";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import { usePrompt } from "@/hooks/platform/ux/usePrompt";
import logger from "@/utils/common/logger";

/**
 * Hook for managing Budget History Viewer UI state
 * Extracts UI state management from BudgetHistoryViewer component
 */
export const useBudgetHistoryViewerUI = () => {
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [expandedCommits, setExpandedCommits] = useState(new Set<string>());
  const [filter, setFilter] = useState({ author: "all", limit: 50 });
  const [showIntegrityDetails, setShowIntegrityDetails] = useState(false);

  const handleCommitSelection = useCallback((commitHash: string) => {
    setSelectedCommit(commitHash);
  }, []);

  const toggleCommitExpanded = useCallback((commitHash: string) => {
    setExpandedCommits((prev) => {
      const next = new Set(prev);
      if (next.has(commitHash)) {
        next.delete(commitHash);
      } else {
        next.add(commitHash);
      }
      return next;
    });
  }, []);

  const updateFilter = useCallback((updates: Partial<{ author: string; limit: number }>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleIntegrityDetails = useCallback(() => {
    setShowIntegrityDetails((prev) => !prev);
  }, []);

  return {
    // State
    selectedCommit,
    expandedCommits,
    filter,
    showIntegrityDetails,

    // Actions
    handleCommitSelection,
    toggleCommitExpanded,
    updateFilter,
    toggleIntegrityDetails,
  };
};

/**
 * Hook for handling budget history restoration process
 * Extracts restoration logic with password validation
 */
export const useBudgetHistoryRestore = (
  restore: (params: { commitHash: string; password: string }) => Promise<void>
) => {
  const confirm = useConfirm();
  const prompt = usePrompt();

  const handleRestoreFromHistory = useCallback(
    async (commitHash: string) => {
      const confirmed = await confirm({
        title: "Restore from History",
        message:
          "This will restore your budget to a previous state. Current changes will be lost unless committed. Continue?",
        confirmLabel: "Restore",
        cancelLabel: "Cancel",
        destructive: true,
      });

      if (!confirmed) {
        return;
      }

      try {
        // Need password for decryption - in a real implementation, get from auth store
        const password = await prompt({
          title: "Password Required",
          message: "Enter your password to restore from history:",
          inputType: "password",
          placeholder: "Enter your password...",
          isRequired: true,
          validation: (value) => {
            if (!value.trim()) {
              return { valid: false, error: "Password is required" };
            }
            if (value.length < 6) {
              return {
                valid: false,
                error: "Password must be at least 6 characters",
              };
            }
            return { valid: true };
          },
        });

        if (!password) return;

        await restore({ commitHash, password });
        // TanStack Query will automatically refresh all data
      } catch (err) {
        logger.error("Failed to restore from history:", err);
      }
    },
    [confirm, prompt, restore]
  );

  return {
    handleRestoreFromHistory,
  };
};

/**
 * Hook for budget history UI helpers and display utilities
 * Provides utility functions for rendering history elements
 */
export const useBudgetHistoryUIHelpers = () => {
  const getChangeIcon = useCallback((changeType: string) => {
    switch (changeType) {
      case "add":
        return React.createElement(getIcon("Plus"), {
          className: "h-3 w-3 text-green-600",
        });
      case "delete":
        return React.createElement(getIcon("Minus"), {
          className: "h-3 w-3 text-red-600",
        });
      case "modify":
        return React.createElement(getIcon("Edit3"), {
          className: "h-3 w-3 text-blue-600",
        });
      default:
        return React.createElement(getIcon("FileText"), {
          className: "h-3 w-3 text-gray-600",
        });
    }
  }, []);

  const getAuthorColor = useCallback((author: string) => {
    const colorMap: Record<string, string> = {
      system: "bg-gray-100 text-gray-700",
      user: "bg-blue-100 text-blue-700",
      default: "bg-purple-100 text-purple-700",
    };
    return colorMap[author] || colorMap.default;
  }, []);

  const formatCommitHash = useCallback((hash: string) => {
    return hash?.substring(0, 8) || "";
  }, []);

  const formatTimestamp = useCallback((timestamp: string | number) => {
    return new Date(timestamp).toLocaleString();
  }, []);

  const formatDate = useCallback((date: string | number) => {
    return new Date(date).toLocaleDateString();
  }, []);

  return {
    getChangeIcon,
    getAuthorColor,
    formatCommitHash,
    formatTimestamp,
    formatDate,
  };
};
