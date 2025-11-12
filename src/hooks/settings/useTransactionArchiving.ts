import { useState, useCallback } from "react";
import logger from "../../utils/common/logger";
import { createArchiver, ARCHIVE_CONFIG } from "@/utils/common/transactionArchiving";

/**
 * Hook for managing transaction archiving UI state and preview generation
 * Extracts archival logic from TransactionArchiving component
 */
export const useTransactionArchivingUI = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [confirmArchiving, setConfirmArchiving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    totalCount: number;
    cutoffDate: Date;
    categories: Record<string, { count: number; amount: number }>;
    envelopes: Record<string, { count: number; amount: number }>;
    totalAmount: number;
    dateRange: {
      earliest: Date | null;
      latest: Date | null;
    };
  } | null>(null);

  const handlePeriodChange = useCallback((period: number | string) => {
    setSelectedPeriod(Number(period));
  }, []);

  const toggleAdvancedOptions = useCallback(() => {
    setShowAdvancedOptions((prev) => !prev);
  }, []);

  const toggleConfirmArchiving = useCallback(() => {
    setConfirmArchiving((prev) => !prev);
  }, []);

  const resetArchivingState = useCallback(() => {
    setConfirmArchiving(false);
    setShowPreview(false);
    setPreviewData(null);
  }, []);

  const handlePreview = useCallback(async () => {
    try {
      setShowPreview(true);
      const archiver = createArchiver();
      const cutoffDateStr = archiver.calculateCutoffDate(selectedPeriod);
      const cutoffDate = new Date(cutoffDateStr);
      const transactionsToArchive = await archiver.getTransactionsForArchiving(cutoffDateStr);

      // Group by category and envelope for preview
      const preview = {
        totalCount: transactionsToArchive.length,
        cutoffDate,
        categories: {} as Record<string, { count: number; amount: number }>,
        envelopes: {} as Record<string, { count: number; amount: number }>,
        totalAmount: 0,
        dateRange: {
          earliest: null as Date | null,
          latest: null as Date | null,
        },
      };

      transactionsToArchive.forEach((transaction) => {
        const amount = Number(transaction.amount || 0);
        const categoryKey = transaction.category ? String(transaction.category) : "Uncategorized";
        const envelopeKey = transaction.envelopeId ? String(transaction.envelopeId) : "None";
        const transactionDate = new Date(String(transaction.date));

        // Categories
        if (!preview.categories[categoryKey]) {
          preview.categories[categoryKey] = { count: 0, amount: 0 };
        }
        preview.categories[categoryKey].count++;
        preview.categories[categoryKey].amount += amount;

        // Envelopes
        if (!preview.envelopes[envelopeKey]) {
          preview.envelopes[envelopeKey] = { count: 0, amount: 0 };
        }
        preview.envelopes[envelopeKey].count++;
        preview.envelopes[envelopeKey].amount += amount;

        // Totals
        preview.totalAmount += amount;

        // Date range
        if (!preview.dateRange.earliest || transactionDate < preview.dateRange.earliest) {
          preview.dateRange.earliest = transactionDate;
        }
        if (!preview.dateRange.latest || transactionDate > preview.dateRange.latest) {
          preview.dateRange.latest = transactionDate;
        }
      });

      setPreviewData(preview);
    } catch (error) {
      logger.error("Failed to generate transaction archiving preview", { error });
    }
  }, [selectedPeriod]);

  const closePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  return {
    // State
    selectedPeriod,
    showAdvancedOptions,
    confirmArchiving,
    showPreview,
    previewData,

    // Actions
    handlePeriodChange,
    toggleAdvancedOptions,
    toggleConfirmArchiving,
    resetArchivingState,
    handlePreview,
    closePreview,
  };
};

/**
 * Hook for handling transaction archiving process execution
 * Manages the archiving workflow and error handling
 */
export const useTransactionArchivingProcess = () => {
  const handleArchive = useCallback(
    async (
      selectedPeriod: number,
      executeArchiving: (period: number) => Promise<unknown>,
      callbacks: {
        onSuccess?: () => void;
        onError?: (error: unknown) => void;
      } = {}
    ) => {
      const { onSuccess, onError } = callbacks;

      try {
        await executeArchiving(selectedPeriod);
        onSuccess?.();
      } catch (error) {
        logger.error("Archiving failed", { error });
        onError?.(error);
      }
    },
    []
  );

  return {
    handleArchive,
  };
};

/**
 * Utility functions for archiving UI display
 */
export const useArchivingUIHelpers = () => {
  const getUrgencyColor = useCallback((urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);

  const getUrgencyIcon = useCallback((urgency: string) => {
    const icons: Record<string, string> = {
      high: "AlertTriangle",
      medium: "Clock",
      low: "CheckCircle",
      default: "Info",
    };
    return icons[urgency] || icons.default;
  }, []);

  const formatStorageSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }, []);

  const calculateStorageImpact = useCallback(
    (transactionCount: number) => {
      // Estimate: ~0.35KB per transaction
      const bytes = transactionCount * 0.35 * 1024;
      return {
        bytes,
        megabytes: Math.round((bytes / (1024 * 1024)) * 100) / 100,
        formatted: formatStorageSize(bytes),
      };
    },
    [formatStorageSize]
  );

  return {
    getUrgencyColor,
    getUrgencyIcon,
    formatStorageSize,
    calculateStorageImpact,
    ARCHIVE_CONFIG,
  };
};
