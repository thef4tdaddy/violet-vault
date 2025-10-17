# Typed Firebase Services Documentation

This document describes the type-safe Firebase service interfaces implemented for VioletVault, which provide type safety while maintaining compatibility with existing JavaScript services.

## Overview

The typed Firebase services layer adds comprehensive type safety to Firebase/Firestore operations while narrowing `any`/`unknown` types at service boundaries. This addresses Issue #409 (TypeScript Conversion) by providing:

- **Type-safe sync operations** with `TypedResponse<T>` wrapper
- **Chunked upload type safety** with validation and integrity checks
- **Comprehensive error handling** with detailed categorization and recovery strategies
- **Narrowed boundaries** that eliminate `any`/`unknown` types at service interfaces

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│            Typed Firebase Services Layer                    │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │ TypedFirebaseSyncService │ TypedChunkedSyncService │   │
│  │  - Type-safe operations  │  - Chunked uploads      │   │
│  │  - Error handling        │  - Size validation      │   │
│  │  - Response wrapping     │  - Integrity checks     │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│              Existing JavaScript Services                   │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │   firebaseSyncService    │    chunkedSyncService       │   │
│  │   (Unchanged)            │    (Unchanged)              │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Firebase SDK                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Type-Safe Operations

All operations return `TypedResponse<T>` which provides structured success/error handling:

```typescript
interface TypedResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: FirebaseError;
  readonly timestamp: number;
}
```

### 2. Enhanced Error Handling

Comprehensive error categorization with recovery strategies:

```typescript
interface EnhancedFirebaseError extends FirebaseError {
  readonly detailedCategory: DetailedErrorCategory;
  readonly recoveryStrategy: ErrorRecoveryStrategy;
  readonly userMessage: string;
  readonly technicalDetails: string;
}
```

### 3. Input Validation

Strict type checking at service boundaries prevents invalid data from reaching Firebase:

- String validation for IDs and keys
- Object structure validation for complex data
- Array validation for bulk operations
- Encryption key length validation

### 4. Automatic Retry Logic

Built-in retry mechanisms with exponential backoff for recoverable errors:

```typescript
await syncOperationWrapper.executeWithRetry(
  operation,
  maxRetries: 3,
  retryDelay: 2000
);
```

## Usage Examples

### Basic Initialization

```typescript
import { typedFirebaseSyncService, typedChunkedSyncService } from "@/services/types";

// Initialize services with validation
typedFirebaseSyncService.initialize(budgetId, encryptionKey);
await typedChunkedSyncService.initialize(budgetId, encryptionKey);
```

### Type-Safe Data Operations

```typescript
// Save with type safety
const result = await typedFirebaseSyncService.saveToCloud(budgetData, {
  version: "1.0",
  operation: "budget_save",
});

if (result.success) {
  console.log("Data saved successfully");
} else {
  console.error("Save failed:", result.error?.userMessage);
}
```

### Chunked Operations with Size Analysis

```typescript
// Analyze data size and choose appropriate method
const chunkInfo = typedChunkedSyncService.getChunkingInfo(largeData);

if (chunkInfo.wouldRequireChunking) {
  const result = await typedChunkedSyncService.saveToCloud(largeData, currentUser);
} else {
  const result = await typedFirebaseSyncService.saveToCloud(largeData);
}
```

### Error Handling with Recovery

```typescript
import { enhancedFirebaseErrorHandler } from "@/services/types";

try {
  await someFirebaseOperation();
} catch (error) {
  const enhancedError = enhancedFirebaseErrorHandler.handleError(error);

  if (enhancedError.recoveryStrategy.canRetry) {
    // Implement retry logic
    const retryDelay = enhancedFirebaseErrorHandler.getRetryDelay(enhancedError, attemptNumber);
    setTimeout(() => retry(), retryDelay);
  } else {
    // Show user-friendly error message
    showErrorToast(enhancedError.userMessage);
  }
}
```

## Error Categories

The system provides detailed error categorization for precise handling:

### Network Errors

- `network_timeout` - Connection timeouts (retryable)
- `network_connection` - Connection failures (retryable)
- `network_cors` - CORS policy violations (not retryable)

### Encryption Errors

- `encryption_decrypt` - Decryption failures (not retryable)
- `encryption_encrypt` - Encryption failures (retryable once)
- `encryption_key_invalid` - Invalid encryption keys (not retryable)

### Firebase Errors

- `firebase_permission` - Permission denied (not retryable)
- `firebase_quota` - Quota exceeded (not retryable)
- `firebase_rate_limit` - Rate limiting (retryable with delay)
- `firestore_unavailable` - Service unavailable (retryable)

### Validation Errors

- `validation_checksum` - Data integrity failures (not retryable)
- `validation_corrupt` - Corrupted data (not retryable)
- `validation_format` - Invalid data format (not retryable)

### Storage Errors

- `storage_full` - Storage quota exceeded (not retryable)
- `storage_unavailable` - Local storage issues (retryable)

### Authentication Errors

- `auth_unauthenticated` - User not signed in (retryable)
- `auth_expired` - Session expired (retryable)

## Type Definitions

### Core Types

```typescript
// Safe data types for boundaries
type SafeUnknown = Record<string, unknown> | unknown[] | string | number | boolean | null;

// Firebase operation interfaces
interface IFirebaseSyncService {
  initialize(budgetId: string, encryptionKey: string): void;
  saveToCloud<T>(data: T, metadata?: Partial<SyncMetadata>): Promise<TypedResponse<boolean>>;
  loadFromCloud<T>(): Promise<TypedResponse<T>>;
  // ... other methods
}

interface IChunkedSyncService {
  initialize(budgetId: string, encryptionKey: string): Promise<void>;
  saveToCloud<T>(
    data: T,
    currentUser: CloudSyncConfig["currentUser"]
  ): Promise<TypedResponse<boolean>>;
  loadFromCloud<T>(): Promise<TypedResponse<T>>;
  // ... other methods
}
```

### Validation Helpers

```typescript
// Type guards for runtime validation
function isEncryptedData(data: unknown): data is EncryptedData;
function isSyncResult(result: unknown): result is SyncResult;
function isChunkData(data: unknown): data is ChunkData;
function isFirebaseError(error: unknown): error is FirebaseError;
```

## Testing

Comprehensive test coverage ensures type safety and error handling:

```typescript
describe("TypedFirebaseSyncService", () => {
  it("should validate initialization parameters", () => {
    expect(() => {
      typedFirebaseSyncService.initialize("", "valid-key");
    }).toThrow("budgetId and encryptionKey cannot be empty");
  });

  it("should handle type-safe save operations", async () => {
    const result = await typedFirebaseSyncService.saveToCloud(testData);
    expect(result.success).toBe(true);
    expect(typeof result.timestamp).toBe("number");
  });
});
```

## Migration Guide

### From Existing Services

The typed services are designed as drop-in replacements:

```typescript
// Before (JavaScript)
import firebaseSyncService from "@/services/firebaseSyncService";
await firebaseSyncService.saveToCloud(data);

// After (TypeScript)
import { typedFirebaseSyncService } from "@/services/types";
const result = await typedFirebaseSyncService.saveToCloud(data);
if (result.success) {
  // Handle success
} else {
  // Handle error with detailed information
}
```

### Gradual Adoption

1. **Start with new code** - Use typed services for all new features
2. **Update critical paths** - Convert high-risk operations first
3. **Migrate incrementally** - Replace existing usage as you encounter it
4. **Full compatibility** - Existing JavaScript code continues to work

## Configuration

### TypeScript Setup

The services require minimal TypeScript configuration:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "strict": false,
    "paths": {
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

### ESLint Integration

The typed services work with existing ESLint rules and add type safety without breaking builds.

## Performance Impact

- **Minimal overhead** - Type checking happens at development time
- **Same runtime performance** - Wraps existing services without modification
- **Better error handling** - Reduces debugging time and improves reliability
- **Chunking optimization** - Automatic size analysis prevents oversized operations

## Future Enhancements

### Planned Improvements

1. **Zod Schema Integration** - Runtime validation with Zod schemas
2. **Storage Operations** - Type-safe file upload/download interfaces
3. **Real-time Subscriptions** - Enhanced WebSocket type safety
4. **Offline Support** - Type-safe offline queue management
5. **Metrics Collection** - Type-safe performance monitoring

### Extension Points

The architecture supports easy extension:

```typescript
// Custom error handlers
class CustomFirebaseErrorHandler extends EnhancedFirebaseErrorHandler {
  // Add domain-specific error handling
}

// Custom validation
class CustomSyncDataValidator extends TypedSyncDataValidator {
  // Add application-specific validation
}
```

## Best Practices

### 1. Always Check Results

```typescript
const result = await typedFirebaseSyncService.saveToCloud(data);
if (!result.success) {
  // Always handle errors explicitly
  handleError(result.error);
}
```

### 2. Use Type Guards

```typescript
if (isEncryptedData(cloudData)) {
  // TypeScript now knows cloudData is EncryptedData
  processEncryptedData(cloudData);
}
```

### 3. Leverage Error Categories

```typescript
switch (error.detailedCategory) {
  case "network_timeout":
    // Implement retry logic
    break;
  case "encryption_decrypt":
    // Prompt for correct password
    break;
  default:
  // Generic error handling
}
```

### 4. Validate at Boundaries

```typescript
// Always validate external data
if (!this.isValidBudgetData(loadedData)) {
  throw new Error("Invalid data structure received");
}
```

## Troubleshooting

### Common Issues

1. **Import Errors** - Ensure TypeScript is properly configured
2. **Type Mismatch** - Use type guards for runtime validation
3. **Async Errors** - Always await typed service calls
4. **Mock Issues** - Update test mocks for typed interfaces

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
import logger from "@/utils/common/logger";

// All typed services use the logger for debugging
logger.debug("Typed Firebase operation details", context);
```

## Contributing

When extending the typed Firebase services:

1. **Maintain Compatibility** - Don't break existing JavaScript usage
2. **Add Comprehensive Tests** - Test both success and error paths
3. **Document New Types** - Update this documentation
4. **Follow Patterns** - Use established error handling and validation patterns
5. **Performance Testing** - Ensure no regression in performance
