import type { HookReceiptData, ReceiptProcessedData } from "../ReceiptScanner";

/**
 * Maps hook receipt data to the processed data format expected by the parent component
 */
export const mapReceiptData = (data: HookReceiptData): ReceiptProcessedData => {
  return {
    merchant: data.merchant,
    total: data.total,
    date: data.date,
    time: data.time,
    tax: data.tax,
    subtotal: data.subtotal,
    items: data.items,
    confidence: data.confidence,
    rawText: data.rawText,
    processingTime: data.processingTime,
    imageData: {
      file: data.imageData.file,
      preview: data.imageData.url,
    },
  };
};

import type { ExtendedReceiptData } from "@/hooks/platform/receipts/useReceiptScanner";

const parseOptionalFloat = (value: string | null | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Maps extracted data for display in the UI
 */
const parseConfidence = (
  confidence: ExtendedReceiptData["confidence"]
): {
  merchant?: number;
  total?: number;
  date?: number;
  tax?: number;
  subtotal?: number;
} => {
  if (!confidence) {
    return {
      merchant: undefined,
      total: undefined,
      date: undefined,
      tax: undefined,
      subtotal: undefined,
    };
  }

  return {
    merchant: parseOptionalFloat(confidence.merchant),
    total: parseOptionalFloat(confidence.total),
    date: parseOptionalFloat(confidence.date),
    tax: parseOptionalFloat(confidence.tax),
    subtotal: parseOptionalFloat(confidence.subtotal),
  };
};

/**
 * Maps extracted data for display in the UI
 */
export const mapExtractedDataForDisplay = (extractedData: ExtendedReceiptData | null) => {
  if (!extractedData) return null;

  return {
    merchant: extractedData.merchant ?? undefined,
    total: parseOptionalFloat(extractedData.total),
    date: extractedData.date ?? undefined,
    tax: parseOptionalFloat(extractedData.tax),
    subtotal: parseOptionalFloat(extractedData.subtotal),
    processingTime: extractedData.processingTime,
    items: extractedData.items,
    confidence: parseConfidence(extractedData.confidence),
  };
};
