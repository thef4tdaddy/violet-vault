import { useMutation } from "@tanstack/react-query";
import {
  type AnalyticsRequest,
  type AnalyticsResponse,
  analyticsResponseSchema,
} from "@/domain/schemas";

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || "/api/analytics";

/**
 * Hook to fetch analytics predictions from the Python backend
 * Uses useMutation because the analysis requires sending a large POST body
 */
export const useAnalytics = () => {
  const mutation = useMutation({
    mutationFn: async (requestData: AnalyticsRequest): Promise<AnalyticsResponse> => {
      const response = await fetch(ANALYTICS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

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
