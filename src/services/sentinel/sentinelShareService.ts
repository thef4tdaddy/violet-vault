/**
 * SentinelShare API Service
 * Handles communication with the PostgreSQL API endpoint for cross-app transaction matching
 */
import logger from "@/utils/core/common/logger";
import {
  SentinelReceiptsResponseSchema,
  type SentinelReceiptsResponseType,
} from "@/domain/schemas/sentinel";
import type { UpdateReceiptStatusOptions } from "@/types/sentinel";

/**
 * Base URL for SentinelShare API
 * In production, this should be configured via environment variables
 */
const API_BASE_URL = import.meta.env.VITE_SENTINEL_API_URL || "/api/receipts";

/**
 * Fetch all SentinelShare receipts from the API
 */
export async function fetchSentinelReceipts(): Promise<SentinelReceiptsResponseType> {
  try {
    logger.debug("Fetching SentinelShare receipts", {
      source: "sentinelShareService",
      url: API_BASE_URL,
    });

    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include credentials for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to fetch SentinelShare receipts", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        source: "sentinelShareService",
      });
      throw new Error(`Failed to fetch receipts: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response with Zod schema
    const validatedData = SentinelReceiptsResponseSchema.parse(data);

    logger.debug("Successfully fetched SentinelShare receipts", {
      count: validatedData.receipts.length,
      total: validatedData.total,
      source: "sentinelShareService",
    });

    return validatedData;
  } catch (error) {
    logger.error("Error fetching SentinelShare receipts", error, {
      source: "sentinelShareService",
    });
    throw error;
  }
}

/**
 * Update the status of a SentinelShare receipt
 */
export async function updateReceiptStatus(options: UpdateReceiptStatusOptions): Promise<void> {
  try {
    logger.debug("Updating SentinelShare receipt status", {
      receiptId: options.receiptId,
      status: options.status,
      source: "sentinelShareService",
    });

    const response = await fetch(`${API_BASE_URL}/${options.receiptId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status: options.status,
        matchedTransactionId: options.matchedTransactionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to update receipt status", {
        receiptId: options.receiptId,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        source: "sentinelShareService",
      });
      throw new Error(`Failed to update receipt status: ${response.statusText}`);
    }

    logger.debug("Successfully updated receipt status", {
      receiptId: options.receiptId,
      status: options.status,
      source: "sentinelShareService",
    });
  } catch (error) {
    logger.error("Error updating receipt status", error, {
      receiptId: options.receiptId,
      source: "sentinelShareService",
    });
    throw error;
  }
}

export const sentinelShareService = {
  fetchReceipts: fetchSentinelReceipts,
  updateStatus: updateReceiptStatus,
};

export default sentinelShareService;
