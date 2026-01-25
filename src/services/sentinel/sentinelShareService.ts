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

import { goClient } from "@/utils/core/api/client";

/**
 * Fetch all SentinelShare receipts from the API
 */
export async function fetchSentinelReceipts(): Promise<SentinelReceiptsResponseType> {
  try {
    const data = await goClient.get<unknown>("/receipts", {
      credentials: "include",
    });

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
    await goClient.request(`/receipts/${options.receiptId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: options.status,
        matchedTransactionId: options.matchedTransactionId,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
