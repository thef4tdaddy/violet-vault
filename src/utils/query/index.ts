// Query Utilities - Centralized export for TanStack Query utilities
export { default as queryClient, createQueryClient, queryClientUtils } from "./queryClientConfig";
export { queryKeys, queryKeyUtils } from "./queryKeys";
export { prefetchHelpers } from "./prefetchHelpers";
export { optimisticHelpers } from "./optimisticHelpers";

// Re-export for backward compatibility
export { default } from "./queryClientConfig";
