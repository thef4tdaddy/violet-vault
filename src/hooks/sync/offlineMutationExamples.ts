/**
 * Example: Using useOfflineMutation Hook
 *
 * This file demonstrates how to use the offline mutation hook
 * to make API calls that automatically queue when offline.
 */

import { useOfflineMutation } from "@/hooks/sync/useOfflineMutation";
import type { Envelope } from "@/db/types";
import logger from "@/utils/common/logger";

/**
 * Example: Create Envelope with Offline Support
 */
export function useCreateEnvelopeOffline() {
  return useOfflineMutation<Envelope, Envelope>({
    mutationFn: async (envelope: Envelope) => {
      // Simulate API call
      const response = await fetch("/api/envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope),
      });

      if (!response.ok) {
        throw new Error(`Failed to create envelope: ${response.statusText}`);
      }

      return response.json();
    },

    toRequest: (envelope: Envelope) => ({
      url: "/api/envelopes",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    }),

    priority: "high",
    maxRetries: 3,
    entityType: "envelope",
    getEntityId: (envelope) => envelope.id,

    mutationOptions: {
      onSuccess: (data) => {
        logger.production("Envelope created successfully", { data });
        // Invalidate queries, update cache, etc.
      },
      onError: (error) => {
        logger.error("Failed to create envelope", error);
        // Note: Network errors will queue the request, other errors will show here
      },
    },
  });
}

/**
 * Example: Update Transaction with Offline Support
 */
export function useUpdateTransactionOffline() {
  return useOfflineMutation<
    { id: string; amount: number; description: string },
    { id: string; updates: { amount: number; description: string } }
  >({
    mutationFn: async ({ id, updates }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update transaction: ${response.statusText}`);
      }

      return response.json();
    },

    toRequest: ({ id, updates }) => ({
      url: `/api/transactions/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),

    priority: "normal",
    maxRetries: 3,
    entityType: "transaction",
    getEntityId: ({ id }) => id,

    mutationOptions: {
      onSuccess: (data) => {
        logger.production("Transaction updated successfully", { data });
      },
    },
  });
}

/**
 * Example: Delete Bill with Offline Support
 */
export function useDeleteBillOffline() {
  return useOfflineMutation<void, string>({
    mutationFn: async (billId: string) => {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete bill: ${response.statusText}`);
      }
    },

    toRequest: (billId: string) => ({
      url: `/api/bills/${billId}`,
      method: "DELETE",
    }),

    priority: "low",
    maxRetries: 3,
    entityType: "bill",
    getEntityId: (billId) => billId,

    mutationOptions: {
      onSuccess: () => {
        logger.production("Bill deleted successfully");
      },
    },
  });
}

/**
 * Example Component Using Offline Mutations
 */
/*
export function EnvelopeForm() {
  const createEnvelope = useCreateEnvelopeOffline();

  const handleSubmit = async (envelope: Envelope) => {
    try {
      await createEnvelope.mutateAsync(envelope);
      // Success! Either submitted immediately or queued for later
    } catch (error) {
      // Only non-network errors reach here
      console.error("Envelope creation error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {createEnvelope.isPending && <div>Saving...</div>}
      {createEnvelope.isError && <div>Error: {createEnvelope.error.message}</div>}
      {createEnvelope.isSuccess && <div>Envelope saved!</div>}
      
      // Form fields...
    </form>
  );
}
*/
