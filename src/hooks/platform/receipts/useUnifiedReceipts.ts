/**
 * Unified Receipts Hook
 * Combines Sentinel and OCR receipts into a single normalized data source
 * for the import dashboard
 */
import { useMemo } from "react";
import { useSentinelReceipts } from "@/hooks/api/useSentinelReceipts";
import { useReceipts } from "@/hooks/platform/data/useReceipts";
import type { Receipt } from "@/db/types";
import type { SentinelReceipt } from "@/types/sentinel";
import type {
  DashboardReceiptItem,
  ConfidenceLevel,
  OcrConfidence,
} from "@/types/import-dashboard.types";

/**
 * Converts OCR confidence score (0-1) to confidence level
 */
function scoreToLevel(score?: number): ConfidenceLevel {
  if (!score || score < 0.4) return "none";
  if (score < 0.6) return "low";
  if (score < 0.8) return "medium";
  return "high";
}

/**
 * Adapts a Sentinel receipt to the unified dashboard format
 */
export function adaptSentinelReceipt(receipt: SentinelReceipt): DashboardReceiptItem {
  return {
    id: receipt.id,
    source: "sentinel",
    merchant: receipt.merchant,
    amount: receipt.amount,
    date: receipt.date,
    status: receipt.status,
    matchConfidence: undefined, // Will be populated by matching algorithm
    suggestedTransactionId: receipt.matchedTransactionId,
    ocrConfidence: undefined, // Sentinel receipts don't have OCR confidence
    rawData: receipt,
  };
}

/**
 * Adapts a local OCR receipt to the unified dashboard format
 */
export function adaptOcrReceipt(receipt: Receipt): DashboardReceiptItem {
  // Extract OCR confidence data if available
  let ocrConfidence: OcrConfidence | undefined;
  if (receipt.ocrData) {
    const merchantScore = receipt.ocrData.merchantConfidence as number | undefined;
    const totalScore = receipt.ocrData.totalConfidence as number | undefined;
    const dateScore = receipt.ocrData.dateConfidence as number | undefined;
    const overall = (receipt.confidence as number) || 0;

    ocrConfidence = {
      merchant: scoreToLevel(merchantScore),
      total: scoreToLevel(totalScore),
      date: scoreToLevel(dateScore),
      overall,
    };
  }

  return {
    id: receipt.id,
    source: "ocr",
    merchant: receipt.merchant,
    amount: receipt.amount,
    date: receipt.date,
    status: receipt.status,
    matchConfidence: (receipt.confidence as number) || undefined,
    suggestedTransactionId: receipt.transactionId,
    ocrConfidence,
    rawData: receipt,
  };
}

/**
 * Hook that provides unified receipts from both Sentinel (Digital) and Local OCR (Scan) sources.
 * Normalizes data into DashboardReceiptItem format for consistent UI rendering.
 *
 * @returns {Object} Hook result containing:
 *  - allReceipts: All receipts from both sources, sorted by date (newest first)
 *  - pendingReceipts: Receipts with "pending" or "processing" status
 *  - sentinelReceipts: Unified items sourced from SentinelShare
 *  - ocrReceipts: Unified items sourced from Local OCR scanner
 *  - isLoading: Combined loading state for both data sources
 *  - isError: Combined error state
 *  - error: The most recent error encountered from either source
 */
export function useUnifiedReceipts() {
  // Fetch from both sources
  const {
    receipts: sentinelData = [],
    isLoading: sentinelLoading,
    isError: sentinelError,
    error: sentinelErrorObj,
  } = useSentinelReceipts();

  const {
    receipts: ocrData = [],
    isLoading: ocrLoading,
    isError: ocrError,
    error: ocrErrorObj,
  } = useReceipts();

  // Adapt and combine receipts
  const allReceipts = useMemo<DashboardReceiptItem[]>(() => {
    const sentinel = sentinelData.map(adaptSentinelReceipt);
    const ocr = ocrData.map(adaptOcrReceipt);

    // Combine and sort by date (newest first)
    return [...sentinel, ...ocr].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [sentinelData, ocrData]);

  // Filter by status (pending or processing)
  const pendingReceipts = useMemo(
    () => allReceipts.filter((r) => r.status === "pending" || r.status === "processing"),
    [allReceipts]
  );

  // Filter by source
  const sentinelReceipts = useMemo(
    () => allReceipts.filter((r) => r.source === "sentinel"),
    [allReceipts]
  );

  const ocrReceipts = useMemo(() => allReceipts.filter((r) => r.source === "ocr"), [allReceipts]);

  return {
    allReceipts,
    pendingReceipts,
    sentinelReceipts,
    ocrReceipts,
    isLoading: sentinelLoading || ocrLoading,
    isError: sentinelError || ocrError,
    error: sentinelErrorObj || ocrErrorObj,
  };
}
