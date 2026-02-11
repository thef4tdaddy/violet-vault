# Progressive Enhancement / Graceful Degradation

Violet Vault implements progressive enhancement to ensure the application remains functional even when backend services are unavailable. The app automatically falls back to local client-side logic when the Go API is unreachable.

## Architecture Overview

The progressive enhancement system operates on three layers:

1. **Backend Services** (Preferred) - High-performance Go serverless functions
2. **Client-Side Fallbacks** - Local JavaScript implementations
3. **Offline Data** - Dexie IndexedDB with TanStack Query

```
┌─────────────────────────────────────────────────┐
│            Application Layer                     │
│  (React Components using TanStack Query hooks)  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────┐
│         Service Availability Manager             │
│    (Tracks backend service health status)       │
└────────────────┬────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────┐        ┌──────▼──────┐
│  Backend  │        │   Client    │
│ Services  │◄──X────┤  Fallback   │
│  (Go API) │  fails │  (Local JS) │
└───────────┘        └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │    Dexie    │
                     │  (IndexedDB)│
                     └─────────────┘
```

## Features

### 1. Budget Calculations

**Backend**: Go-based budget engine for high-performance calculations
**Fallback**: Client-side JavaScript calculations

```typescript
import { BudgetCalculationService } from "@/services/budget/budgetCalculationService";

// Automatically uses backend or falls back to client
const result = await BudgetCalculationService.calculate(envelopes, transactions, bills);

console.log(`Calculated using: ${result.source}`); // "backend" or "client"
```

### 2. Transaction Import

**Backend**: Go CSV/JSON parser with high-performance parsing
**Fallback**: Client-side CSV/JSON parser

```typescript
import { ImportService } from "@/services/api/importService";

// Automatically tries backend, falls back to client
const result = await ImportService.importTransactions(file, fieldMapping);

// Force client-side parsing
const clientResult = await ImportService.importTransactions(file, fieldMapping, {
  forceClientSide: true,
});
```

### 3. Service Availability Tracking

Track the health and availability of all backend services:

```typescript
import { serviceAvailability } from "@/services/serviceAvailabilityManager";

// Check specific service
const isAvailable = await serviceAvailability.checkService("budgetEngine");

// Check all services
const allStatus = await serviceAvailability.checkAllServices();

// Get cached status
const status = serviceAvailability.getStatus("import");
```

## React Integration

### useServiceAvailability Hook

Monitor service availability in React components:

```typescript
import { useServiceAvailability } from '@/hooks/common/useServiceAvailability';

function MyComponent() {
  const { status, isChecking, refresh, isOnline } = useServiceAvailability();

  return (
    <div>
      {status?.api.available ? 'API Online' : 'API Offline'}
      <button onClick={refresh}>Refresh Status</button>
    </div>
  );
}
```

### UI Components

#### ServiceStatusBadge

Display compact service status indicator:

```typescript
import { ServiceStatusBadge } from '@/components/common/ServiceStatusBadge';

<ServiceStatusBadge service="budgetEngine" showLabel={true} />
```

#### ServiceStatusDetails

Show detailed service status panel:

```typescript
import { ServiceStatusDetails } from '@/components/common/ServiceStatusBadge';

<ServiceStatusDetails className="p-4" />
```

## Client-Side Fallbacks

### CSV Parser

Parse CSV files locally when backend is unavailable:

```typescript
import { parseCSV, autoDetectFieldMapping } from "@/utils/dataManagement/csvParser";

// Read file
const content = await readFileAsText(file);

// Parse CSV
const result = parseCSV(content);

// Auto-detect field mappings
const mapping = autoDetectFieldMapping(result.headers);
```

**Features:**

- Handles quoted fields with commas
- Supports escaped quotes
- Skips empty lines
- Reports parsing errors with row numbers

### Transaction Mapper

Transform parsed CSV data into Transaction objects:

```typescript
import { mapRowsToTransactions } from "@/utils/dataManagement/transactionMapper";

const result = mapRowsToTransactions(rows, {
  date: "Date",
  amount: "Amount",
  description: "Description",
  category: "Category",
  dateFormat: "US", // Specify 'US' (MM/DD/YYYY) or 'EU' (DD/MM/YYYY) to avoid ambiguity
});

// Valid transactions
console.log(result.transactions);

// Invalid rows with errors
console.log(result.invalid);
```

**Features:**

- Multiple date formats: ISO, US (MM/DD/YYYY), EU (DD/MM/YYYY)
- Currency symbol handling: $, €, £, ¥
- Comma removal in amounts: 1,000.00 → 1000.00
- Parentheses for negative: (100.00) → -100.00
- Auto-detect income vs expense

## Offline Support

The application uses TanStack Query configured with `offlineFirst` network mode:

```typescript
// From utils/query/queryClientConfig.ts
{
  queries: {
    networkMode: 'offlineFirst',
    // ...
  },
  mutations: {
    networkMode: 'offlineFirst',
    // ...
  }
}
```

### Background Sync

Changes made offline are automatically synchronized when connectivity returns:

```typescript
import { backgroundSync } from "@/utils/query/backgroundSyncService";

// Sync all data manually
await backgroundSync.syncAllData();

// Persist cache to Dexie
await backgroundSync.syncWithDexie();

// Restore from Dexie
await backgroundSync.restoreFromDexie();
```

### Network Status Detection

Automatic network status tracking:

```typescript
import useNetworkStatus from "@/hooks/common/useNetworkStatus";

// In your component
useNetworkStatus(); // Sets up event listeners

// Access status from Zustand store
const isOnline = useBudgetStore((state) => state.isOnline);
```

## Best Practices

### 1. Always Prefer Backend

Let services automatically attempt backend first:

```typescript
// ✅ Good - Automatic fallback
const result = await ImportService.importTransactions(file);

// ❌ Avoid - Skip backend unnecessarily
const result = await ImportService.importTransactions(file, null, {
  forceClientSide: true,
});
```

### 2. Show User Feedback

Inform users when operating in fallback mode:

```typescript
const { status } = useServiceAvailability("budgetEngine");

if (!status?.available) {
  showToast("Using local calculations", "info");
}
```

### 3. Handle Errors Gracefully

Always handle potential service failures:

```typescript
try {
  const result = await ImportService.importTransactions(file);
  if (!result.success) {
    // Handle import failure
    showToast(result.error || "Import failed", "error");
  }
} catch (error) {
  // Handle unexpected errors
  logger.error("Import error", error);
  showToast("An unexpected error occurred", "error");
}
```

### 4. Test Offline Scenarios

Test your features in offline mode:

```typescript
// In your tests
vi.mock("@/services/api/client", () => ({
  ApiClient: {
    isOnline: vi.fn().mockReturnValue(false),
    healthCheck: vi.fn().mockResolvedValue(false),
  },
}));

// Your test
it("should work offline", async () => {
  const result = await ImportService.importTransactions(file);
  expect(result.success).toBe(true);
});
```

## Service Status Codes

Backend services report availability through health checks:

| Status          | Meaning                | User Impact               |
| --------------- | ---------------------- | ------------------------- |
| **Available**   | Backend responding     | Optimal performance       |
| **Unavailable** | Backend not responding | Automatic client fallback |
| **Offline**     | Device has no network  | Full offline mode         |

## Performance Considerations

### Caching

Service availability checks are cached for 1 minute to reduce network requests:

```typescript
// Uses cache (if < 1 minute old)
await serviceAvailability.checkService("api");

// Forces fresh check
await serviceAvailability.checkService("api", true);
```

### Deduplication

Concurrent health checks are deduplicated:

```typescript
// Only makes 1 actual health check, despite 3 calls
const [check1, check2, check3] = await Promise.all([
  serviceAvailability.checkService("api"),
  serviceAvailability.checkService("api"),
  serviceAvailability.checkService("api"),
]);
```

### Parallel Checks

Multiple services are checked in parallel:

```typescript
// Checks all 3 services simultaneously
const status = await serviceAvailability.checkAllServices();
```

## Troubleshooting

### Service shows as unavailable but backend is running

1. Check API base URL: `import.meta.env.VITE_API_BASE_URL`
2. Verify CORS configuration on backend
3. Check browser console for network errors
4. Try force refresh: `serviceAvailability.checkService('api', true)`

### Client-side parsing is slower than backend

This is expected. Client-side JavaScript will be slower than Go for large files:

- Backend: ~100-500ms for 1000 rows
- Client: ~500-2000ms for 1000 rows

Consider showing a loading indicator for large files.

### Offline changes not syncing

1. Check TanStack Query devtools
2. Verify Dexie persistence: `backgroundSync.syncWithDexie()`
3. Check network status: `navigator.onLine`
4. Manual sync: `backgroundSync.syncAllData()`

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - Overall application architecture
- [Offline Support](./OFFLINE.md) - Detailed offline functionality
- [API Integration](./API.md) - Backend API documentation
- [Testing Guide](./TESTING.md) - Testing best practices

## Future Enhancements

- [ ] Service Worker for true offline support
- [ ] Conflict resolution for concurrent edits
- [ ] Optimistic updates for all mutations
- [ ] Progressive Web App installation
- [ ] Background sync API integration
