// Enhanced TanStack Query configuration with separated services
// Main orchestrator importing from focused query services for Issue #154
import queryClient from "../query/queryClientConfig.js";

// Import separated query services
export { queryKeys } from "../query/queryKeys.js";

export { prefetchHelpers } from "../query/prefetchHelpers.js";

export { optimisticHelpers } from "../query/optimisticHelpers.js";

export {
  backgroundSync,
  networkManager,
} from "../query/backgroundSyncService.js";

export { queryClient };
export default queryClient;
