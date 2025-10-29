# API Response Validation Schemas - Usage Guide

This document provides examples and patterns for using Phase 2 API response validation schemas in VioletVault services.

## Overview

Phase 2 API response validation schemas ensure type safety and runtime validation for data received from external sources like Firebase, GitHub API, and other services. These schemas complement Phase 1 domain schemas by focusing on API communication layer validation.

## Table of Contents

- [Basic Concepts](#basic-concepts)
- [Firebase Integration](#firebase-integration)
- [Bug Report Services](#bug-report-services)
- [Sync Services](#sync-services)
- [Best Practices](#best-practices)

## Basic Concepts

### Safe vs. Unsafe Validation

```typescript
import { validateAPIResponse, validateAPIResponseSafe } from '@/domain/schemas';

// Unsafe - throws on invalid data (use in controlled scenarios)
try {
  const response = validateAPIResponse(apiData);
  // Use validated response
} catch (error) {
  logger.error('API validation failed', error);
}

// Safe - returns result object (recommended for most cases)
const result = validateAPIResponseSafe(apiData);
if (result.success) {
  // Use result.data
} else {
  logger.error('Validation errors', result.error);
}
```

### Generic API Responses

```typescript
import { 
  validateAPISuccessResponseSafe,
  validateAPIErrorResponseSafe,
  type APISuccessResponse,
  type APIErrorResponse 
} from '@/domain/schemas';

async function makeAPICall(): Promise<APISuccessResponse | APIErrorResponse> {
  try {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    
    // Validate response structure
    const validation = validateAPISuccessResponseSafe(data);
    
    if (validation.success) {
      return validation.data;
    } else {
      return {
        success: false,
        error: 'Invalid response structure',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

## Firebase Integration

### Validating Firebase Documents

```typescript
import { 
  validateFirebaseDocumentSafe,
  validateEncryptedDataSafe,
  type FirebaseDocument 
} from '@/domain/schemas';
import { getDoc, doc } from 'firebase/firestore';
import logger from '@/utils/common/logger';

async function loadFromFirebase(budgetId: string): Promise<FirebaseDocument | null> {
  try {
    const docRef = doc(db, 'budgets', budgetId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const cloudData = docSnap.data();
    
    // Validate Firebase document structure
    const validation = validateFirebaseDocumentSafe(cloudData);
    
    if (!validation.success) {
      logger.error('Invalid Firebase document structure', validation.error);
      return null;
    }
    
    return validation.data;
  } catch (error) {
    logger.error('Failed to load from Firebase', error);
    throw error;
  }
}
```

### Validating Encrypted Data

```typescript
import { 
  validateEncryptedDataSafe,
  type EncryptedData 
} from '@/domain/schemas';
import { encryptionUtils } from '@/utils/security/encryption';

async function decryptCloudData(cloudData: unknown, key: CryptoKey): Promise<unknown> {
  // Validate encrypted data structure before decryption
  const validation = validateEncryptedDataSafe(cloudData.encryptedData);
  
  if (!validation.success) {
    throw new Error('Invalid encrypted data structure');
  }
  
  const encryptedData: EncryptedData = validation.data;
  
  // Now safely decrypt with validated structure
  const decryptedData = await encryptionUtils.decrypt(
    encryptedData.data,
    key,
    encryptedData.iv
  );
  
  return JSON.parse(decryptedData);
}
```

### Validating Chunked Firebase Data

```typescript
import { 
  validateFirebaseChunkSafe,
  validateFirebaseManifestSafe,
  type FirebaseChunk,
  type FirebaseManifest 
} from '@/domain/schemas';

async function loadChunkedData(budgetId: string): Promise<string | null> {
  // Load manifest first
  const manifestDoc = await getDoc(doc(db, 'budgets', budgetId, 'manifest'));
  const manifestValidation = validateFirebaseManifestSafe(manifestDoc.data());
  
  if (!manifestValidation.success) {
    logger.error('Invalid manifest structure', manifestValidation.error);
    return null;
  }
  
  const manifest: FirebaseManifest = manifestValidation.data;
  const chunks: string[] = [];
  
  // Load and validate each chunk
  for (let i = 0; i < manifest.totalChunks; i++) {
    const chunkDoc = await getDoc(doc(db, 'budgets', budgetId, 'chunks', `chunk_${i}`));
    const chunkValidation = validateFirebaseChunkSafe(chunkDoc.data());
    
    if (!chunkValidation.success) {
      logger.error(`Invalid chunk ${i} structure`, chunkValidation.error);
      return null;
    }
    
    const chunk: FirebaseChunk = chunkValidation.data;
    
    // Verify chunk integrity
    if (chunk.chunkIndex !== i || chunk.totalChunks !== manifest.totalChunks) {
      logger.error('Chunk metadata mismatch', { expected: i, got: chunk.chunkIndex });
      return null;
    }
    
    chunks.push(chunk.data);
  }
  
  return chunks.join('');
}
```

### Validating Firebase Auth Responses

```typescript
import { 
  validateFirebaseAuthResponseSafe,
  type FirebaseAuthResponse 
} from '@/domain/schemas';
import { signInAnonymously } from 'firebase/auth';

async function authenticateUser(): Promise<FirebaseAuthResponse> {
  try {
    const userCredential = await signInAnonymously(auth);
    
    const authData = {
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        isAnonymous: userCredential.user.isAnonymous,
        displayName: userCredential.user.displayName,
      },
    };
    
    // Validate auth response structure
    const validation = validateFirebaseAuthResponseSafe(authData);
    
    if (!validation.success) {
      logger.error('Invalid auth response structure', validation.error);
      return { user: null, error: 'Invalid authentication response' };
    }
    
    return validation.data;
  } catch (error) {
    return { user: null, error: error.message };
  }
}
```

## Bug Report Services

### Validating GitHub API Responses

```typescript
import { 
  validateGitHubIssueResponseSafe,
  type GitHubIssueResponse 
} from '@/domain/schemas';

async function submitBugToGitHub(reportData: BugReportData): Promise<GitHubIssueResponse> {
  try {
    const response = await fetch('/api/github/issues', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
    
    const data = await response.json();
    
    // Validate GitHub API response
    const validation = validateGitHubIssueResponseSafe(data);
    
    if (!validation.success) {
      logger.error('Invalid GitHub API response', validation.error);
      return {
        success: false,
        error: 'Invalid API response structure',
      };
    }
    
    return validation.data;
  } catch (error) {
    logger.error('GitHub API call failed', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### Validating Bug Report Submission Results

```typescript
import { 
  validateBugReportSubmissionResultSafe,
  type BugReportSubmissionResult 
} from '@/domain/schemas';

async function submitBugReport(
  reportData: BugReportData
): Promise<BugReportSubmissionResult> {
  try {
    const result = await BugReportAPIService.submitToGitHub(reportData);
    
    // Validate submission result
    const validation = validateBugReportSubmissionResultSafe(result);
    
    if (!validation.success) {
      logger.error('Invalid submission result structure', validation.error);
      return {
        success: false,
        error: 'Invalid submission result',
      };
    }
    
    // Log successful submission
    if (validation.data.success) {
      logger.info('Bug report submitted', {
        issueNumber: validation.data.issueNumber,
        url: validation.data.url,
      });
    }
    
    return validation.data;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### Validating Screenshot Upload Responses

```typescript
import { 
  validateScreenshotUploadResponseSafe,
  type ScreenshotUploadResponse 
} from '@/domain/schemas';

async function uploadScreenshot(screenshot: string): Promise<ScreenshotUploadResponse> {
  try {
    const response = await fetch('/api/upload/screenshot', {
      method: 'POST',
      body: JSON.stringify({ screenshot }),
    });
    
    const data = await response.json();
    
    // Validate upload response
    const validation = validateScreenshotUploadResponseSafe(data);
    
    if (!validation.success) {
      logger.error('Invalid upload response', validation.error);
      return {
        success: false,
        error: 'Invalid upload response structure',
      };
    }
    
    return validation.data;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

## Sync Services

### Validating Sync Operation Results

```typescript
import { 
  validateSyncOperationResultSafe,
  type SyncOperationResult 
} from '@/domain/schemas';

async function performSyncOperation(
  operation: 'save' | 'load' | 'realtime' | 'chunk',
  data: unknown
): Promise<SyncOperationResult> {
  const startTime = Date.now();
  
  try {
    // Perform sync operation
    await syncService.sync(operation, data);
    
    const result = {
      success: true,
      operation,
      bytesTransferred: JSON.stringify(data).length,
      timestamp: Date.now(),
    };
    
    // Validate result structure
    const validation = validateSyncOperationResultSafe(result);
    
    if (!validation.success) {
      logger.error('Invalid sync result structure', validation.error);
      return {
        success: false,
        operation,
        error: 'Invalid sync result',
      };
    }
    
    return validation.data;
  } catch (error) {
    return {
      success: false,
      operation,
      error: error.message,
      timestamp: Date.now(),
    };
  }
}
```

### Validating Sync Status

```typescript
import { 
  validateFirebaseSyncStatusSafe,
  type FirebaseSyncStatus 
} from '@/domain/schemas';

function getSyncStatus(): FirebaseSyncStatus {
  const status = {
    isOnline: navigator.onLine,
    isInitialized: !!syncService.budgetId,
    queuedOperations: syncService.syncQueue.length,
    lastSyncTimestamp: syncService.lastSyncTimestamp,
    activeUsers: syncService.activeUsers.size,
  };
  
  // Validate status structure
  const validation = validateFirebaseSyncStatusSafe(status);
  
  if (!validation.success) {
    logger.error('Invalid sync status structure', validation.error);
    // Return a safe default
    return {
      isOnline: false,
      isInitialized: false,
      queuedOperations: 0,
      lastSyncTimestamp: null,
      activeUsers: 0,
    };
  }
  
  return validation.data;
}
```

## Best Practices

### 1. Always Use Safe Validation in Service Layer

```typescript
// ✅ Good - Use safeParse for graceful error handling
const validation = validateFirebaseDocumentSafe(data);
if (!validation.success) {
  logger.error('Validation failed', validation.error);
  return null;
}

// ❌ Avoid - Direct parse can crash the app
const document = validateFirebaseDocument(data); // Throws on invalid data
```

### 2. Validate at API Boundaries

```typescript
// Validate immediately after receiving external data
async function loadFromCloud(): Promise<unknown> {
  const docSnap = await getDoc(docRef);
  const cloudData = docSnap.data();
  
  // Validate BEFORE processing
  const validation = validateFirebaseDocumentSafe(cloudData);
  if (!validation.success) {
    throw new Error('Invalid cloud data structure');
  }
  
  // Now safe to process validated data
  return processData(validation.data);
}
```

### 3. Log Validation Failures

```typescript
const validation = validateAPIResponseSafe(data);
if (!validation.success) {
  logger.error('API response validation failed', {
    endpoint: '/api/example',
    errors: validation.error,
    receivedData: data, // Be careful with sensitive data
  });
  return null;
}
```

### 4. Combine with Domain Schemas

```typescript
import { 
  validateFirebaseDocumentSafe,
  validateEnvelopeSafe,
  type Envelope 
} from '@/domain/schemas';

async function loadEnvelopeFromCloud(id: string): Promise<Envelope | null> {
  // First validate API response structure
  const docSnap = await getDoc(doc(db, 'envelopes', id));
  const firebaseValidation = validateFirebaseDocumentSafe(docSnap.data());
  
  if (!firebaseValidation.success) {
    logger.error('Invalid Firebase structure', firebaseValidation.error);
    return null;
  }
  
  // Decrypt the data
  const decryptedData = await decrypt(firebaseValidation.data.encryptedData);
  
  // Then validate domain model
  const envelopeValidation = validateEnvelopeSafe(decryptedData);
  
  if (!envelopeValidation.success) {
    logger.error('Invalid envelope structure', envelopeValidation.error);
    return null;
  }
  
  return envelopeValidation.data;
}
```

### 5. Handle Validation Errors Gracefully

```typescript
async function submitReport(data: BugReportData): Promise<void> {
  const result = await submitBugToGitHub(data);
  const validation = validateGitHubIssueResponseSafe(result);
  
  if (!validation.success) {
    // Log validation error but don't crash
    logger.error('Response validation failed', validation.error);
    
    // Try fallback submission method
    await submitToWebhook(data);
    return;
  }
  
  // Handle validated response
  if (validation.data.success) {
    showSuccessNotification(validation.data.url);
  } else {
    showErrorNotification(validation.data.error);
  }
}
```

### 6. Type-Safe Response Handling

```typescript
import type { 
  APISuccessResponse, 
  APIErrorResponse 
} from '@/domain/schemas';

function handleAPIResponse(response: APISuccessResponse | APIErrorResponse): void {
  if (response.success) {
    // TypeScript knows this is APISuccessResponse
    console.log('Data:', response.data);
  } else {
    // TypeScript knows this is APIErrorResponse
    console.error('Error:', response.error);
  }
}
```

## Migration Guide

For existing services that need to adopt Phase 2 schemas:

1. **Identify API boundaries** - Find places where your service receives data from external sources
2. **Import relevant schemas** - Choose the appropriate validation schema for your data
3. **Add validation** - Use `safeParse` to validate before processing
4. **Handle errors** - Log validation failures and provide fallbacks
5. **Update types** - Use inferred types from schemas instead of `unknown` or `any`

### Example Migration

**Before:**
```typescript
async function loadFromCloud(): Promise<unknown> {
  const docSnap = await getDoc(docRef);
  const cloudData = docSnap.data(); // Type: unknown
  
  // No validation, potential runtime errors
  const decryptedData = await decrypt(cloudData.encryptedData);
  return JSON.parse(decryptedData);
}
```

**After:**
```typescript
import { validateFirebaseDocumentSafe, type FirebaseDocument } from '@/domain/schemas';

async function loadFromCloud(): Promise<unknown | null> {
  const docSnap = await getDoc(docRef);
  const cloudData = docSnap.data();
  
  // Validate structure
  const validation = validateFirebaseDocumentSafe(cloudData);
  if (!validation.success) {
    logger.error('Invalid cloud data', validation.error);
    return null;
  }
  
  const document: FirebaseDocument = validation.data;
  
  // Safe to decrypt with validated structure
  const decryptedData = await decrypt(document.encryptedData);
  return JSON.parse(decryptedData);
}
```

## Related Documentation

- [Phase 1 Domain Schemas](/src/domain/schemas/) - Core data model validation
- [Issue #412](https://github.com/thef4tdaddy/violet-vault/issues/412) - Domain Types & Zod Schemas
- [ChastityOS v4.0.0 Architecture](../../README.md) - Overall architecture patterns
