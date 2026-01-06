import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { offlineRequestQueueService } from "@/services/sync/offlineRequestQueueService";
import logger from "@/utils/common/logger";

/**
 * Options for offline-aware mutations
 */
export interface OfflineMutationOptions<TData, TVariables> {
  /**
   * Function to execute the mutation when online
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Priority for the request in the offline queue
   */
  priority?: "low" | "normal" | "high";

  /**
   * Maximum number of retries
   */
  maxRetries?: number;

  /**
   * Entity type being modified (for tracking)
   */
  entityType?: string;

  /**
   * Function to extract entity ID from variables
   */
  getEntityId?: (variables: TVariables) => string | undefined;

  /**
   * Convert variables to request details for queuing
   */
  toRequest: (variables: TVariables) => {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: string;
  };

  /**
   * TanStack Query mutation options
   */
  mutationOptions?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
}

/**
 * Hook for creating offline-aware mutations
 *
 * Automatically queues mutations when offline and retries them when back online.
 * Integrates with TanStack Query for optimistic updates and cache management.
 *
 * @example
 * ```tsx
 * const createEnvelope = useOfflineMutation({
 *   mutationFn: async (envelope: Envelope) => {
 *     return envelopeService.create(envelope);
 *   },
 *   toRequest: (envelope) => ({
 *     url: '/api/envelopes',
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(envelope),
 *   }),
 *   priority: 'high',
 *   entityType: 'envelope',
 *   getEntityId: (envelope) => envelope.id,
 *   mutationOptions: {
 *     onSuccess: (data) => {
 *       queryClient.invalidateQueries({ queryKey: ['envelopes'] });
 *     },
 *   },
 * });
 * ```
 */
export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  options: OfflineMutationOptions<TData, TVariables>
) {
  const {
    mutationFn,
    priority = "normal",
    maxRetries = 3,
    entityType,
    getEntityId,
    toRequest,
    mutationOptions,
  } = options;

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables: TVariables) => {
      // Check if online
      if (navigator.onLine) {
        // Execute mutation normally when online
        try {
          return await mutationFn(variables);
        } catch (error) {
          // If the error is a network error, queue the request
          if (error instanceof Error && isNetworkError(error)) {
            logger.warn("useOfflineMutation: Network error, queuing request", {
              entityType,
              error: error.message,
            });

            await queueRequest(variables, {
              priority,
              maxRetries,
              entityType,
              getEntityId,
              toRequest,
            });

            // Return a pending response to indicate queued status
            throw new Error("Request queued for offline sync");
          }

          // Re-throw other errors
          throw error;
        }
      } else {
        // Device is offline, queue the request immediately
        logger.info("useOfflineMutation: Device offline, queuing request", {
          entityType,
        });

        await queueRequest(variables, {
          priority,
          maxRetries,
          entityType,
          getEntityId,
          toRequest,
        });

        // Return a pending response to indicate queued status
        throw new Error("Request queued for offline sync");
      }
    },
  });
}

/**
 * Queue a request for offline execution
 */
async function queueRequest<TVariables>(
  variables: TVariables,
  options: {
    priority: "low" | "normal" | "high";
    maxRetries: number;
    entityType?: string;
    getEntityId?: (variables: TVariables) => string | undefined;
    toRequest: (variables: TVariables) => {
      url: string;
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      headers?: Record<string, string>;
      body?: string;
    };
  }
): Promise<void> {
  const request = options.toRequest(variables);
  const entityId = options.getEntityId ? options.getEntityId(variables) : undefined;

  await offlineRequestQueueService.enqueue({
    requestId: crypto.randomUUID(),
    url: request.url,
    method: request.method,
    headers: request.headers || {},
    body: request.body,
    priority: options.priority,
    maxRetries: options.maxRetries,
    entityType: options.entityType,
    entityId,
  });
}

/**
 * Check if an error is a network error
 */
function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();

  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("abort") ||
    message.includes("connection")
  );
}
