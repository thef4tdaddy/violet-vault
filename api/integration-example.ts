/**
 * TypeScript Integration Example for Go Import API
 *
 * This file demonstrates how to integrate the Go streaming import service
 * with the existing VioletVault transaction import flow.
 */

import type { Transaction } from "@/domain/schemas/transaction";

/**
 * Response from the Go import API
 */
interface ImportApiResponse {
  success: boolean;
  transactions?: Transaction[];
  invalid?: Array<{
    index: number;
    row: string;
    errors: string[];
  }>;
  error?: string;
  message?: string;
}

/**
 * Upload a CSV/JSON file to the Go import API for processing
 *
 * @param file - The CSV or JSON file to upload
 * @param fieldMapping - Optional field mapping (if not provided, auto-detection is used)
 * @returns Promise with parsed transactions and validation results
 *
 * @example
 * ```typescript
 * const file = document.querySelector('input[type="file"]').files[0];
 * const result = await uploadToGoImportApi(file);
 *
 * if (result.success) {
 *   console.log(`Valid transactions: ${result.transactions?.length}`);
 *   console.log(`Invalid rows: ${result.invalid?.length}`);
 * }
 * ```
 */
export async function uploadToGoImportApi(
  file: File,
  fieldMapping?: Record<string, string>
): Promise<ImportApiResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (fieldMapping) {
    formData.append("fieldMapping", JSON.stringify(fieldMapping));
  }

  try {
    const response = await fetch("/api/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data: ImportApiResponse = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Example: Enhanced transaction import hook using Go API
 *
 * This shows how to integrate the Go streaming service into the existing
 * useTransactionImport hook for better performance on large files.
 */
export function useGoImportApi() {
  const handleFileUploadWithGo = async (
    file: File,
    onSuccess: (transactions: Transaction[]) => void,
    onError: (error: string) => void
  ) => {
    // Note: Show loading state in your UI here

    // Upload to Go API
    const result = await uploadToGoImportApi(file);

    if (!result.success) {
      onError(result.error || "Import failed");
      return;
    }

    // Handle validation warnings
    if (result.invalid && result.invalid.length > 0) {
      // Note: Show a toast or modal with validation details in your UI
      // Example: globalToast.showWarning(`${result.invalid.length} rows failed validation`)
    }

    // Process valid transactions
    if (result.transactions && result.transactions.length > 0) {
      onSuccess(result.transactions);
    } else {
      onError("No valid transactions found in file");
    }
  };

  return {
    handleFileUploadWithGo,
  };
}

/**
 * Example: Determine when to use Go API vs client-side parsing
 *
 * For small files (<100 rows), client-side parsing is sufficient.
 * For large files (>=100 rows), use Go API for better performance.
 */
export async function smartImport(
  file: File,
  clientSideParser: (file: File) => Promise<Transaction[]>
): Promise<Transaction[]> {
  // Quick check: if file is small, use client-side parsing
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  const isSmallFile = file.size < 50 * 1024; // 50KB threshold

  if (isSmallFile && isCsv) {
    // Use existing client-side CSV parser
    return await clientSideParser(file);
  }

  // For larger files or JSON, use Go streaming service
  const result = await uploadToGoImportApi(file);

  if (!result.success) {
    throw new Error(result.error || "Import failed");
  }

  return result.transactions || [];
}

/**
 * Example: Integration with existing useTransactionImport hook
 *
 * This demonstrates how to modify the existing hook to optionally use
 * the Go API for large file imports.
 */
export function enhancedImportStrategy(
  file: File,
  useGoApi: boolean
): {
  shouldUseGoApi: boolean;
  reason: string;
} {
  const fileSize = file.size;
  const isLargeFile = fileSize > 100 * 1024; // 100KB
  const isJson = file.name.toLowerCase().endsWith(".json");

  if (useGoApi && (isLargeFile || isJson)) {
    return {
      shouldUseGoApi: true,
      reason: isJson
        ? "JSON files are processed more efficiently by the Go API"
        : "Large files benefit from server-side streaming",
    };
  }

  return {
    shouldUseGoApi: false,
    reason: "Small CSV files can be processed client-side",
  };
}
