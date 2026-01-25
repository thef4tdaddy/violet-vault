import { useMutation } from "@tanstack/react-query";
import {
  type AnalyticsRequest,
  type AnalyticsResponse,
  analyticsResponseSchema,
} from "@/domain/schemas";

import { pyClient } from "@/utils/core/api/client";

/**
 * Hook to fetch analytics predictions from the Python backend
 * Uses useMutation because the analysis requires sending a large POST body
 */
export const useAnalytics = () => {
  const mutation = useMutation({
    mutationFn: async (requestData: AnalyticsRequest): Promise<AnalyticsResponse> => {
      const data = await pyClient.post<AnalyticsResponse>("/", requestData);

      // Validate response with Zod
      const result = analyticsResponseSchema.safeParse(data);

      if (!result.success) {
        throw new Error(`Analytics API schema validation failed: ${result.error.message}`);
      }

      return result.data;
    },
  });

  return {
    fetchAnalytics: mutation.mutate,
    fetchAnalyticsAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
