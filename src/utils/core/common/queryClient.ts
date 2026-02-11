// Enhanced TanStack Query configuration with separated services
// Main orchestrator importing from focused query services for Issue #154
import queryClient from "../query/queryClientConfig.ts";

// Import separated query services
export { queryKeys } from "../query/queryKeys.ts";

export { prefetchHelpers } from "../query/prefetchHelpers.ts";

export { optimisticHelpers } from "../query/optimisticHelpers.ts";

export { backgroundSync, networkManager } from "../query/backgroundSyncService.ts";

export { queryClient };
export default queryClient;
