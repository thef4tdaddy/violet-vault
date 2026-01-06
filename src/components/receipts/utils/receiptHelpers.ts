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

const parseOptionalFloat = (value: string | null | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
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
    confidence: {
      merchant: parseOptionalFloat(extractedData.confidence?.merchant),
      total: parseOptionalFloat(extractedData.confidence?.total),
      date: parseOptionalFloat(extractedData.confidence?.date),
      tax: parseOptionalFloat(extractedData.confidence?.tax),
      subtotal: parseOptionalFloat(extractedData.confidence?.subtotal),
    },
  };
};
