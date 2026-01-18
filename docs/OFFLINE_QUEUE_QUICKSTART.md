# Offline Request Queuing - Quick Start Guide

## What is it?

The Offline Request Queuing system automatically captures API requests when you're offline and replays them when you reconnect. It's completely transparent to your application code - just use the provided hooks and it handles everything.

## Quick Start (3 Steps)

### 1. Initialize on App Startup

In your main app initialization (e.g., `main.tsx` or App setup):

```typescript
import { initializeOfflineQueue } from "@/services/sync/offlineQueueInitializer";

// During app startup
await initializeOfflineQueue();
```

### 2. Add the Status UI Component

Add the queue status indicator to your app layout:

```tsx
import { OfflineQueueStatus } from "@/components/sync/OfflineQueueStatus";

function App() {
  return (
    <div>
      {/* Your app content */}

      {/* Add this at the bottom - it auto-hides when queue is empty */}
      <OfflineQueueStatus />
    </div>
  );
}
```

### 3. Use Offline-Aware Mutations

Replace standard `useMutation` with `useOfflineMutation`:

```typescript
// ❌ Before (no offline support)
const createEnvelope = useMutation({
  mutationFn: async (envelope) => {
    return await envelopeService.create(envelope);
  },
});

// ✅ After (with offline support)
import { useOfflineMutation } from "@/hooks/sync/useOfflineMutation";

const createEnvelope = useOfflineMutation({
  mutationFn: async (envelope) => {
    return await envelopeService.create(envelope);
  },
  toRequest: (envelope) => ({
    url: "/api/envelopes",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envelope),
  }),
  priority: "high", // optional: high, normal (default), or low
  entityType: "envelope", // optional: for tracking
  getEntityId: (envelope) => envelope.id, // optional: for tracking
});
```

That's it! Now your mutations automatically queue when offline. 🎉

## What Happens When Offline?

1. User makes a change (e.g., creates a transaction)
2. App detects network is offline
3. Request is automatically queued in IndexedDB
4. User sees a "queued" notification (via your mutation's loading state)
5. When online, queue automatically processes
6. User sees success notification

## Monitoring

### User-Facing UI

The `<OfflineQueueStatus />` component shows:

- Online/Offline status
- Number of pending requests
- Request details (when expanded)
- Manual retry buttons

### Developer Tools

In the browser console:

```javascript
// Get queue status
await window.offlineRequestQueueService.getStatus();

// Force process queue
await window.offlineRequestQueueService.processQueue();

// Clear failed requests
await window.offlineRequestQueueService.clearFailedRequests();

// View queue in database
await window.budgetDb.offlineRequestQueue.toArray();
```

## Priority Levels

Choose priority based on user impact:

- **`high`**: Critical operations (user-initiated actions, payments)
- **`normal`**: Standard operations (most CRUD operations) ← Default
- **`low`**: Background operations (analytics, logging)

```typescript
useOfflineMutation({
  // ...
  priority: "high", // Processes first when queue is processed
});
```

## Retry Behavior

Requests automatically retry with exponential backoff:

- Retry 1: after 2 seconds
- Retry 2: after 4 seconds
- Retry 3: after 8 seconds
- Max retries: 3 (configurable)
- Max delay: 30 seconds

Only retryable errors (network, timeout, 5xx) trigger retries.
Client errors (4xx) fail immediately.

## Common Patterns

### Create Operation

```typescript
const createItem = useOfflineMutation({
  mutationFn: async (item) => await api.create(item),
  toRequest: (item) => ({
    url: "/api/items",
    method: "POST",
    body: JSON.stringify(item),
  }),
  priority: "high",
});
```

### Update Operation

```typescript
const updateItem = useOfflineMutation({
  mutationFn: async ({ id, data }) => await api.update(id, data),
  toRequest: ({ id, data }) => ({
    url: `/api/items/${id}`,
    method: "PATCH",
    body: JSON.stringify(data),
  }),
});
```

### Delete Operation

```typescript
const deleteItem = useOfflineMutation({
  mutationFn: async (id) => await api.delete(id),
  toRequest: (id) => ({
    url: `/api/items/${id}`,
    method: "DELETE",
  }),
  priority: "low",
});
```

## Troubleshooting

### Requests Not Processing?

1. Check if device is online: `navigator.onLine`
2. Check queue: `window.offlineRequestQueueService.getStatus()`
3. Try manual processing: `window.offlineRequestQueueService.processQueue()`

### Too Many Failed Requests?

```javascript
// Clear all failed requests
await window.offlineRequestQueueService.clearFailedRequests();
```

### Need to Debug?

```javascript
// Get detailed status
const status = await window.offlineRequestQueueService.getStatus();
console.log(JSON.stringify(status, null, 2));
```

## Best Practices

✅ **DO:**

- Use `high` priority for user-initiated actions
- Keep request payloads small
- Test offline scenarios regularly
- Monitor queue size in production

❌ **DON'T:**

- Queue GET requests (they should fail fast)
- Queue sensitive auth operations
- Set maxRetries > 5 (causes delays)
- Ignore failed requests indefinitely

## Full Documentation

See [OFFLINE_QUEUE.md](./OFFLINE_QUEUE.md) for complete documentation including:

- Architecture details
- Advanced configuration
- Service Worker integration (future)
- Performance characteristics
- Security considerations

## Need Help?

- Check the [full documentation](./OFFLINE_QUEUE.md)
- Review [usage examples](../src/hooks/sync/offlineMutationExamples.ts)
- Inspect queue in browser: `window.offlineRequestQueueService.getStatus()`
