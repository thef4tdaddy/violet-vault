/**
 * Utility functions for receipt processing and validation
 * Handles data validation, formatting, and common calculations
 */
import React from "react";
import { getIcon } from "@/utils";

interface ReceiptData {
  merchant?: string;
  total?: number;
  date?: string;
  [key: string]: unknown;
}

interface TransactionForm {
  description?: string;
  amount?: number;
  date?: string;
  envelopeId?: string;
  [key: string]: unknown;
}

/**
 * Validate receipt data structure
 */
export const validateReceiptData = (receiptData: ReceiptData) => {
  const errors = [];

  if (!receiptData) {
    errors.push("Receipt data is required");
    return { isValid: false, errors };
  }

  if (!receiptData.merchant || receiptData.merchant.trim() === "") {
    errors.push("Merchant name is required");
  }

  if (!receiptData.total || isNaN(receiptData.total) || receiptData.total <= 0) {
    errors.push("Valid total amount is required");
  }

  if (!receiptData.date || !/^\d{4}-\d{2}-\d{2}$/.test(receiptData.date)) {
    errors.push("Valid date in YYYY-MM-DD format is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate transaction form data
 */
export const validateTransactionForm = (form: TransactionForm) => {
  const errors = [];

  if (!form.description || form.description.trim() === "") {
    errors.push("Description is required");
  }

  if (!form.amount || isNaN(form.amount) || form.amount <= 0) {
    errors.push("Valid amount is required");
  }

  if (!form.date || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
    errors.push("Valid date is required");
  }

  if (!form.envelopeId || form.envelopeId.trim() === "") {
    errors.push("Envelope selection is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number) => {
  if (!amount || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
};

/**
 * Format date for display
 */
export const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "No date";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Calculate confidence level description
 */
export const getConfidenceDescription = (confidence: number) => {
  if (!confidence || isNaN(confidence)) return "Unknown";

  if (confidence >= 0.9) return "Very High";
  if (confidence >= 0.8) return "High";
  if (confidence >= 0.6) return "Medium";
  if (confidence >= 0.4) return "Low";
  return "Very Low";
};

/**
 * Get confidence level color for UI
 */
export const getConfidenceColor = (confidence: number) => {
  if (!confidence || isNaN(confidence)) return "gray";

  if (confidence >= 0.8) return "green";
  if (confidence >= 0.6) return "yellow";
  return "red";
};

/**
 * Extract key information from OCR text
 */
export const extractReceiptSummary = (receiptData: ReceiptData) => {
  const summary = {
    merchant: receiptData.merchant || "Unknown Merchant",
    total: receiptData.total || 0,
    date: receiptData.date || new Date().toISOString().split("T")[0],
    itemCount: receiptData.items?.length || 0,
    hasSubtotal: Boolean(receiptData.subtotal),
    hasTax: Boolean(receiptData.tax),
    confidence: receiptData.confidence || 0,
    processingTime: receiptData.processingTime || 0,
  };

  return summary;
};

/**
 * Check if receipt data is complete enough for transaction creation
 */
export const isReceiptDataComplete = (receiptData: ReceiptData) => {
  return Boolean(
    receiptData &&
      receiptData.merchant &&
      receiptData.total &&
      receiptData.total > 0 &&
      receiptData.date
  );
};

/**
 * Generate receipt reference ID
 */
export const generateReceiptReference = (merchant: string, date: string, total: number) => {
  const merchantCode = merchant?.substring(0, 3).toUpperCase() || "RCP";
  const dateCode =
    date?.replace(/-/g, "").substring(2) ||
    new Date().toISOString().split("T")[0].replace(/-/g, "").substring(2);
  const amountCode = Math.round(total * 100)
    .toString()
    .padStart(4, "0");

  return `${merchantCode}-${dateCode}-${amountCode}`;
};

/**
 * Compare receipt data with transaction form for changes
 */
export const getReceiptFormChanges = (
  receiptData: ReceiptData,
  transactionForm: TransactionForm
) => {
  const changes = [];

  if (receiptData.merchant !== transactionForm.description) {
    changes.push({
      field: "description",
      original: receiptData.merchant,
      updated: transactionForm.description,
    });
  }

  if (
    receiptData.total &&
    transactionForm.amount &&
    Math.abs(receiptData.total - transactionForm.amount) > 0.01
  ) {
    changes.push({
      field: "amount",
      original: receiptData.total,
      updated: transactionForm.amount,
    });
  }

  if (receiptData.date !== transactionForm.date) {
    changes.push({
      field: "date",
      original: receiptData.date,
      updated: transactionForm.date,
    });
  }

  return changes;
};

/**
 * Render confidence indicator for receipt data fields
 * UI utility function extracted from ReceiptScanner
 */
export const renderConfidenceIndicator = (_field: string, confidence: string) => {
  const confidenceMap: Record<string, { color: string; iconName: string }> = {
    high: { color: "text-green-600", iconName: "CheckCircle" },
    medium: { color: "text-yellow-600", iconName: "CheckCircle" },
    low: { color: "text-red-600", iconName: "XCircle" },
    none: { color: "text-gray-400", iconName: "XCircle" },
  };

  const conf = confidenceMap[confidence] || confidenceMap.none;

  return React.createElement(getIcon(conf.iconName), {
    className: `h-4 w-4 ${conf.color}`,
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number) => {
  return `${Math.round(bytes / 1024)} KB`;
};

/**
 * Validate if extracted data has minimum required fields for transaction creation
 */
export const hasMinimumExtractedData = (extractedData: unknown) => {
  return extractedData && (extractedData.total || extractedData.merchant);
};
