# Offline Request Queuing

A robust offline request queuing system for Violet Vault that automatically captures and replays API requests when the device reconnects to the network.

## Features

- ✅ **Automatic Request Capture**: Requests are automatically queued when offline or when network errors occur
- ✅ **Priority-based Queue**: Requests can be prioritized (high, normal, low)
- ✅ **Exponential Backoff**: Failed requests retry with exponential backoff
- ✅ **Persistent Storage**: Queue is stored in Dexie (IndexedDB) and survives page refreshes
- ✅ **TanStack Query Integration**: Seamless integration with existing mutation hooks
- ✅ **Conflict Resolution**: Support for different conflict resolution strategies
- ✅ **Status Monitoring**: Real-time queue status and debugging tools

## Architecture

### Components

1. **Database Layer** (`src/db/`)
   - `OfflineRequestQueueEntry` type definition
   - `offlineRequestQueue` table in Dexie
   - Indexed for efficient queue management

2. **Service Layer** (`src/services/sync/`)
   - `offlineRequestQueueService.ts`: Core queue management service
   - `offlineQueueInitializer.ts`: Initialization helpers
   - Integration with `syncOrchestrator.ts`

3. **Hook Layer** (`src/hooks/sync/`)
   - `useOfflineMutation.ts`: TanStack Query integration hook
   - `offlineMutationExamples.ts`: Usage examples

4. **UI Layer** (`src/components/sync/`)
   - `OfflineQueueStatus.tsx`: Status display component

## Usage

### Basic Usage

```typescript
import { useOfflineMutation } from "@/hooks/sync/useOfflineMutation";

function MyComponent() {
  const createItem = useOfflineMutation({
    mutationFn: async (item) => {
      return await api.createItem(item);
    },
    toRequest: (item) => ({
      url: "/api/items",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }),
    priority: "high",
    entityType: "item",
    getEntityId: (item) => item.id,
  });

  return (
    <button onClick={() => createItem.mutate(newItem)}>
      Create Item
    </button>
  );
}
```

### Direct Service Usage

```typescript
import { offlineRequestQueueService } from "@/services/sync/offlineRequestQueueService";

// Queue a request manually
await offlineRequestQueueService.enqueue({
  requestId: crypto.randomUUID(),
  url: "https://api.example.com/data",
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "value" }),
  priority: "high",
  maxRetries: 3,
  entityType: "data",
  entityId: "123",
});

// Get queue status
const status = await offlineRequestQueueService.getStatus();
console.log(`Pending: ${status.pendingCount}, Failed: ${status.failedCount}`);

// Process queue manually
await offlineRequestQueueService.processQueue();

// Retry a specific request
await offlineRequestQueueService.retryRequest("request-id");

// Clear failed requests
await offlineRequestQueueService.clearFailedRequests();
```

### Displaying Queue Status

```tsx
import { OfflineQueueStatus } from "@/components/sync/OfflineQueueStatus";

function App() {
  return (
    <div>
      {/* Your app content */}

      {/* Offline queue status indicator */}
      <OfflineQueueStatus />
    </div>
  );
}
```

## Configuration

### Queue Entry Options

```typescript
interface OfflineRequestQueueEntry {
  requestId: string; // Unique identifier for the request
  url: string; // Target API endpoint
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Record<string, string>;
  body?: string; // Stringified JSON body
  priority: "low" | "normal" | "high";
  maxRetries: number; // Maximum retry attempts (default: 3)
  entityType?: string; // Type of entity (e.g., "envelope", "transaction")
  entityId?: string; // ID of entity being modified
  conflictResolution?: "local" | "remote" | "merge";
}
```

### Retry Behavior

- **Exponential Backoff**: Delay doubles with each retry (2s, 4s, 8s, 16s, etc.)
- **Maximum Delay**: Capped at 30 seconds
- **Retryable Errors**: Network errors, timeouts, HTTP 5xx, HTTP 429, HTTP 408
- **Non-retryable Errors**: HTTP 4xx (except 408, 429), validation errors

## Queue Processing

### Automatic Processing

- Queue is processed automatically when device comes online
- Periodic processing every 30 seconds when online
- Immediate processing after enqueueing (when online)

### Manual Processing

```typescript
// Force immediate processing
await offlineRequestQueueService.processQueue();

// Check if processing is in progress
const status = await offlineRequestQueueService.getStatus();
if (status.processingQueue) {
  console.log("Queue is currently being processed");
}
```

## Monitoring & Debugging

### Window Exposure (Development)

The queue service is exposed on the window object for debugging:

```javascript
// In browser console
window.offlineRequestQueueService.getStatus();
window.offlineRequestQueueService.processQueue();
window.offlineRequestQueueService.clearFailedRequests();
```

### Database Inspection

```javascript
// In browser console
window.budgetDb.offlineRequestQueue.toArray();
```

### Logging

All queue operations are logged with structured data:

```
ℹ️ OfflineRequestQueue: Request enqueued
ℹ️ OfflineRequestQueue: Processing queue
✅ OfflineRequestQueue: Request completed successfully
⚠️ OfflineRequestQueue: Request failed, will retry
❌ OfflineRequestQueue: Request failed permanently
```

## Integration Points

### Sync Orchestrator

The offline queue is automatically initialized when the sync orchestrator starts:

```typescript
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";

await syncOrchestrator.start({
  budgetId: "...",
  encryptionKey: "...",
  provider: myProvider,
});
// Offline queue is now initialized and processing
```

### TanStack Query

Mutations automatically queue when offline:

```typescript
const mutation = useOfflineMutation({
  mutationFn: async (data) => await api.save(data),
  toRequest: (data) => ({ url: "/api/data", method: "POST", body: JSON.stringify(data) }),
});

// This will queue if offline or on network error
mutation.mutate(myData);
```

## Testing

Run the test suite:

```bash
npm run test:run -- src/services/sync/__tests__/offlineRequestQueueService.test.ts
```

### Test Coverage

- ✅ Request enqueueing
- ✅ Priority-based sorting
- ✅ Queue size tracking
- ✅ Status reporting
- ✅ Failed request handling
- ✅ Request retry logic
- ✅ Online/offline event handling

## Future Enhancements

- [ ] Service Worker integration for background sync
- [ ] Conflict resolution UI
- [ ] Request deduplication
- [ ] Request batching for efficiency
- [ ] Progressive Web App sync event integration
- [ ] Queue size limits and oldest-first eviction
- [ ] Request compression for large payloads

## Troubleshooting

### Requests Not Processing

1. Check if device is online: `navigator.onLine`
2. Check queue status: `offlineRequestQueueService.getStatus()`
3. Verify no errors in console logs
4. Try manual processing: `offlineRequestQueueService.processQueue()`

### Requests Failing Permanently

1. Check error message in queue status
2. Verify API endpoint is correct
3. Check authentication/authorization
4. Verify request payload is valid
5. Consider increasing `maxRetries`

### Queue Growing Too Large

1. Clear failed requests: `offlineRequestQueueService.clearFailedRequests()`
2. Check for systematic API issues
3. Review and fix root cause of failures
4. Consider implementing queue size limits

## Related Files

- `src/db/types.ts` - Type definitions
- `src/db/budgetDb.ts` - Database schema
- `src/services/sync/offlineRequestQueueService.ts` - Core service
- `src/hooks/sync/useOfflineMutation.ts` - React hook
- `src/components/sync/OfflineQueueStatus.tsx` - UI component
- `src/services/sync/__tests__/offlineRequestQueueService.test.ts` - Tests
