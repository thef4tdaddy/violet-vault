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

import type { ExtendedReceiptData } from "../../../hooks/receipts/useReceiptScanner";

/**
 * Maps extracted data for display in the UI
 */
export const mapExtractedDataForDisplay = (extractedData: ExtendedReceiptData | null) => {
  if (!extractedData) return null;

  return {
    merchant: extractedData.merchant ?? undefined,
    total: extractedData.total ? parseFloat(extractedData.total) : undefined,
    date: extractedData.date ?? undefined,
    tax: extractedData.tax ? parseFloat(extractedData.tax) : undefined,
    subtotal: extractedData.subtotal ? parseFloat(extractedData.subtotal) : undefined,
    processingTime: extractedData.processingTime,
    items: extractedData.items,
    confidence: {
      merchant: extractedData.confidence.merchant
        ? parseFloat(extractedData.confidence.merchant)
        : undefined,
      total: extractedData.confidence.total
        ? parseFloat(extractedData.confidence.total)
        : undefined,
      date: extractedData.confidence.date ? parseFloat(extractedData.confidence.date) : undefined,
      tax: extractedData.confidence.tax ? parseFloat(extractedData.confidence.tax) : undefined,
      subtotal: extractedData.confidence.subtotal
        ? parseFloat(extractedData.confidence.subtotal)
        : undefined,
    },
  };
};
