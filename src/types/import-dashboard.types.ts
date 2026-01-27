import { Receipt } from "@/db/types";
import { SentinelReceipt } from "@/types/sentinel";

/**
 * Confidence level for OCR extraction fields
 */
export type ConfidenceLevel = "high" | "medium" | "low" | "none";

/**
 * OCR confidence scores for individual fields
 */
export interface OcrConfidence {
  merchant: ConfidenceLevel;
  total: ConfidenceLevel;
  date: ConfidenceLevel;
  overall: number; // 0-1 scale
}

/**
 * Unified receipt item for the import dashboard
 * Normalizes both Sentinel and OCR receipts into a single interface
 */
export interface DashboardReceiptItem {
  /** Unique receipt identifier */
  id: string;

  /** Source of the receipt */
  source: "sentinel" | "ocr";

  /** Merchant or vendor name */
  merchant: string;

  /** Transaction amount */
  amount: number;

  /** Transaction date (ISO 8601 format) */
  date: string;

  /** Current status of the receipt */
  status: "pending" | "processing" | "matched" | "failed" | "ignored";

  /** Match confidence score (0-1 scale) from matching algorithm */
  matchConfidence?: number;

  /** ID of suggested transaction for matching */
  suggestedTransactionId?: string;

  /** OCR confidence scores (only for OCR receipts) */
  ocrConfidence?: OcrConfidence;

  /** Original raw data for mutations */
  rawData: SentinelReceipt | Receipt;
}

/**
 * Mode selection for the import dashboard
 */
export type ImportMode = "digital" | "scan";

/**
 * UI state for the import dashboard
 */
export interface ImportDashboardState {
  selectedMode: ImportMode;
  setSelectedMode: (mode: ImportMode) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
}
