# SyncManager API Documentation

## Overview

`SyncManager` is a unified "One-Box" sync management service that consolidates `SyncQueue`, `SyncMutex`, and `masterSyncValidator` into a cohesive internal API. This simplifies the sync flow and reduces the number of individual service calls required in UI hooks.

## Architecture

### Internal Components

- **SyncQueue**: Handles debouncing and batching of sync operations
- **SyncMutex**: Provides concurrency control to prevent race conditions
- **Health Monitor**: Tracks sync performance and reliability metrics
- **Validator**: Runs diagnostics and full validation suites

### Benefits

- ✅ Single unified API for all sync operations
- ✅ Automatic queue management and debouncing
- ✅ Built-in mutex protection for concurrent operations
- ✅ Combined status reporting from all components
- ✅ Type-safe interfaces with no `any` types
- ✅ Follows Violet Vault architectural patterns

## Public API

### Core Methods

#### `executeSync<T>(operation, operationType, options?)`

Queue and execute a sync operation with automatic mutex protection.

```typescript
import { syncManager } from '@/services/sync/SyncManager';

// Normal priority (queued with debouncing)
await syncManager.executeSync(
  async () => {
    // Your sync logic
    return result;
  },
  'my-sync-operation'
);

// High priority (immediate execution)
await syncManager.executeSync(
  async () => {
    // Your sync logic
    return result;
  },
  'urgent-sync',
  { priority: 'high' }
);

// Skip queue (immediate with mutex)
await syncManager.executeSync(
  async () => {
    // Your sync logic
    return result;
  },
  'direct-sync',
  { skipQueue: true }
);
```

**Parameters:**
- `operation`: `() => Promise<T>` - The async function to execute
- `operationType`: `string` - Name/identifier for the operation
- `options?`: `SyncOperationOptions`
  - `priority`: `'normal' | 'high'` - Priority level (default: 'normal')
  - `skipQueue`: `boolean` - Skip debouncing queue (default: false)
  - `timeout`: `number` - Timeout in milliseconds (default: 60000)

**Returns:** `Promise<T>` - Result from the operation

---

#### `checkHealth()`

Perform a quick, non-blocking health check of the sync system.

```typescript
const health = await syncManager.checkHealth();

console.log(health.isHealthy); // true/false
console.log(health.status);    // "HEALTHY" | "ISSUES_DETECTED" | "ERROR"
console.log(health.checks);    // Array of individual check results
```

**Returns:** `Promise<HealthCheckResult>`

---

#### `validateSync()`

Run the full validation suite including health checks, flow validation, edge cases, and corruption detection.

```typescript
const results = await syncManager.validateSync();

console.log(results.summary.overallStatus);  // "ALL_SYSTEMS_GO" | "ISSUES_DETECTED"
console.log(results.summary.totalTests);     // Total number of tests
console.log(results.summary.totalPassed);    // Number of passed tests
console.log(results.summary.totalFailed);    // Number of failed tests
```

**Returns:** `Promise<ValidationResult>`

---

#### `getStatus()`

Get combined status from all internal sync components (queue, mutex, health monitor).

```typescript
const status = syncManager.getStatus();

// Queue status
console.log(status.queue.currentQueueSize);
console.log(status.queue.stats.processed);

// Mutex status
console.log(status.mutex.locked);
console.log(status.mutex.currentOperation);

// Health status
console.log(status.health.status);
console.log(status.health.metrics.errorRate);
```

**Returns:** `SyncManagerStatus`

---

#### `forceSync<T>(operation, operationType)`

Force immediate execution by flushing the queue and executing directly with mutex protection.

```typescript
const result = await syncManager.forceSync(
  async () => {
    // Critical sync operation
    return data;
  },
  'critical-sync'
);
```

**Parameters:**
- `operation`: `() => Promise<T>` - The async function to execute
- `operationType`: `string` - Name/identifier for the operation

**Returns:** `Promise<T>` - Result from the operation

---

### Utility Methods

#### `clearQueue()`

Clear all pending operations in the queue.

```typescript
syncManager.clearQueue();
```

---

#### `forceReleaseMutex()`

Force release the mutex lock. **Use with caution** - only for recovery from stuck states.

```typescript
syncManager.forceReleaseMutex();
```

---

#### `reset()`

Reset all internal state (queue, mutex, health metrics). Useful for testing or recovery scenarios.

```typescript
syncManager.reset();
```

---

#### `getRecommendations()`

Get health recommendations based on current sync performance.

```typescript
const recommendations = syncManager.getRecommendations();
// ["Consider clearing local data and re-syncing", "Check network connection"]
```

**Returns:** `string[]`

---

#### `isInitialized()`

Check if the sync manager is initialized.

```typescript
if (syncManager.isInitialized()) {
  // Safe to use
}
```

**Returns:** `boolean`

---

## Usage in Hooks

### Before (Multiple Service Calls)

```typescript
import { getQuickSyncStatus } from '@/utils/features/sync/masterSyncValidator';
import { SyncQueue } from '@/utils/features/sync/SyncQueue';
import { globalSyncMutex } from '@/utils/features/sync/SyncMutex';

// Multiple imports and complex orchestration
const queue = new SyncQueue();
await globalSyncMutex.acquire('sync-op');
// ... complex logic
const health = await getQuickSyncStatus();
```

### After (Unified SyncManager)

```typescript
import { syncManager } from '@/services/sync/SyncManager';

// Single import, simple API
await syncManager.executeSync(operation, 'sync-op');
const health = await syncManager.checkHealth();
```

---

## Usage in SyncOrchestrator

The `SyncOrchestrator` now uses `SyncManager` internally for all sync operations:

```typescript
// Schedule sync with debouncing and mutex protection
syncOrchestrator.scheduleSync('high');

// Force immediate sync
await syncOrchestrator.forceSync();
```

The `SyncManager` handles all queue management, mutex locking, and health tracking automatically.

---

## Type Definitions

### `SyncOperationOptions`

```typescript
interface SyncOperationOptions {
  priority?: 'normal' | 'high';
  skipQueue?: boolean;
  timeout?: number;
}
```

### `HealthCheckResult`

```typescript
interface HealthCheckResult {
  isHealthy: boolean;
  status: string;
  failedTests?: number;
  lastChecked: string;
  checks?: Array<{
    name: string;
    status: string;
    details?: string;
    error?: string;
  }>;
}
```

### `ValidationResult`

```typescript
interface ValidationResult {
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    overallStatus: string;
    duration: number;
  };
  healthCheck: unknown;
  flowValidation?: unknown[];
  edgeCases?: unknown[];
  corruptionCheck?: unknown[];
}
```

### `SyncManagerStatus`

```typescript
interface SyncManagerStatus {
  queue: {
    currentQueueSize: number;
    processingCount: number;
    stats: {
      enqueued: number;
      processed: number;
      failed: number;
      superseded: number;
    };
  };
  mutex: {
    locked: boolean;
    currentOperation: string | null;
    queueLength: number;
    metrics: {
      operationsCompleted: number;
      averageLockTime: number;
      maxLockTime: number;
    };
  };
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'slow';
    issues: string[];
    metrics: {
      totalAttempts: number;
      successfulSyncs: number;
      failedSyncs: number;
      errorRate: number;
      consecutiveFailures: number;
      averageSyncTime: number;
      lastSyncTime: number | null;
    };
  };
  timestamp: number;
}
```

---

## Migration Guide

### Migrating from Direct SyncQueue Usage

**Before:**
```typescript
import { SyncQueue } from '@/utils/features/sync/SyncQueue';

const queue = new SyncQueue({ name: 'MyQueue' });
await queue.enqueue('operation', async () => {
  // logic
});
```

**After:**
```typescript
import { syncManager } from '@/services/sync/SyncManager';

await syncManager.executeSync(async () => {
  // logic
}, 'operation');
```

### Migrating from Direct SyncMutex Usage

**Before:**
```typescript
import { globalSyncMutex } from '@/utils/features/sync/SyncMutex';

await globalSyncMutex.acquire('operation');
try {
  // logic
} finally {
  globalSyncMutex.release();
}
```

**After:**
```typescript
import { syncManager } from '@/services/sync/SyncManager';

await syncManager.executeSync(async () => {
  // logic
}, 'operation', { skipQueue: true });
```

### Migrating from masterSyncValidator

**Before:**
```typescript
import { getQuickSyncStatus, runMasterSyncValidation } from '@/utils/features/sync/masterSyncValidator';

const health = await getQuickSyncStatus();
const results = await runMasterSyncValidation();
```

**After:**
```typescript
import { syncManager } from '@/services/sync/SyncManager';

const health = await syncManager.checkHealth();
const results = await syncManager.validateSync();
```

---

## Best Practices

1. **Use `executeSync()` for most operations** - It provides automatic queueing, debouncing, and mutex protection
2. **Use `forceSync()` sparingly** - Only for critical operations that must execute immediately
3. **Check health regularly** - Use `checkHealth()` in UI components for status indicators
4. **Monitor status in dev mode** - Use `getStatus()` to debug sync issues
5. **Trust the queue** - Let SyncManager handle debouncing rather than implementing custom delays
6. **Handle errors** - All methods return promises that can reject, so use try-catch

---

## Related Files

- Implementation: `/src/services/sync/SyncManager.ts`
- Tests: `/src/services/sync/__tests__/SyncManager.test.ts`
- Integration: `/src/services/sync/syncOrchestrator.ts`
- Hook usage: `/src/hooks/platform/sync/useSyncHealthIndicator.ts`

---

## Part of

- **GitHub Issue**: #1463 (v2.0 Architecture Refactoring)
- **Epic**: Service Layer: Sync Orchestration Consolidation
- **Milestone**: v2.0 (Target: March 1, 2026)
