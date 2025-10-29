# VioletVault API Development Guide

**Version:** 2.0.0  
**Last Updated:** October 2025  
**Status:** Phase 3 - OpenAPI Schema Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [API Architecture](#api-architecture)
3. [Authentication](#authentication)
4. [Available APIs](#available-apis)
5. [Using the OpenAPI Specification](#using-the-openapi-specification)
6. [Request/Response Patterns](#requestresponse-patterns)
7. [Error Handling](#error-handling)
8. [Development Workflow](#development-workflow)
9. [Testing APIs](#testing-apis)
10. [Examples](#examples)

---

## Overview

VioletVault provides a comprehensive API for budget management, encrypted data synchronization, and bug reporting. The API consists of:

- **Cloudflare Worker Endpoints:** Production-ready endpoints for bug reporting and worker management
- **Client-Side APIs:** Local database operations using Dexie IndexedDB
- **Firebase Sync APIs:** Encrypted data synchronization endpoints

All APIs are documented using OpenAPI 3.0 specification, with full TypeScript type safety through Zod schemas.

---

## API Architecture

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Components  │→ │ TanStack     │→ │ Services      │  │
│  │ (UI Only)   │  │ Query Hooks  │  │ (Business     │  │
│  │             │  │              │  │  Logic)       │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────┬───────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              │                                │
     ┌────────▼─────────┐            ┌────────▼──────────┐
     │ Dexie IndexedDB  │            │ Firebase / Worker │
     │ (Local Storage)  │            │ (Cloud Sync)      │
     └──────────────────┘            └───────────────────┘
```

### Data Flow Pattern

**ChastityOS v4.0.0:**

```
Firebase (cloud) ↔ Dexie (local IndexedDB) ↔ TanStack Query (cache) ↔ React Components
```

**Key Principles:**

- All external data flows through Firebase first
- Local data persists in Dexie IndexedDB
- TanStack Query manages server state caching
- Components receive data from TanStack Query hooks only
- ALL business logic resides in services layer

---

## Authentication

### Firebase Authentication

VioletVault uses Firebase Authentication with custom encryption:

1. **User Authentication:** Firebase Auth handles user identity
2. **Encryption Keys:** Derived from user passwords using PBKDF2
3. **Encrypted Storage:** All budget data encrypted before storing in Firebase

### Authentication Flow

```typescript
// Example: User login flow
import { authService } from "@/services/authService";

// 1. User provides credentials
const result = await authService.login(email, password);

// 2. Derive encryption key from password
const encryptionKey = await deriveKeyFromPassword(password, salt);

// 3. Store auth state
if (result.success) {
  // User is authenticated and encryption key is available
}
```

### API Authorization

- **Bug Report Worker:** No authentication required (rate-limited)
- **Firebase Sync:** Requires Firebase Authentication token
- **Local Database:** Client-side access only

---

## Available APIs

### 1. Bug Report API

**Base URL:** `https://bug-report-worker.thef4tdaddy.workers.dev`

#### Endpoints

| Method | Path            | Description             |
| ------ | --------------- | ----------------------- |
| POST   | `/report-issue` | Submit a bug report     |
| GET    | `/stats`        | Get usage statistics    |
| GET    | `/milestones`   | Get GitHub milestones   |
| GET    | `/releases`     | Get release information |

#### Example: Submit Bug Report

```typescript
import { BugReportSchema } from "@/domain/schemas/bug-report";

const bugReport = {
  title: "Login form not working",
  description: "Form submission fails",
  severity: "medium",
  systemInfo: {
    browser: "Chrome",
    version: "120.0.0",
    platform: "Windows",
  },
};

// Validate with Zod
const validated = BugReportSchema.parse(bugReport);

// Submit to API
const response = await fetch("https://bug-report-worker.thef4tdaddy.workers.dev/report-issue", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(validated),
});
```

---

### 2. Cloud Sync API

**Base URL:** Firebase Firestore (configured per environment)

#### Endpoints

| Method | Path                     | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| POST   | `/api/sync/upload`       | Upload encrypted budget data       |
| GET    | `/api/sync/download`     | Download encrypted budget data     |
| POST   | `/api/sync/chunk/upload` | Upload data chunk (large datasets) |
| GET    | `/api/sync/manifest`     | Get sync manifest                  |

#### Example: Sync Data to Cloud

```typescript
import { FirebaseDocumentSchema } from "@/domain/schemas/api-responses";
import { cloudSyncService } from "@/services/cloudSyncService";

// Encrypt and upload data
const result = await cloudSyncService.uploadData(budgetData, encryptionKey);

// Validate response
const validated = FirebaseDocumentSchema.parse(result);
```

---

### 3. Budget Data API (Local)

**Base URL:** Local Dexie IndexedDB

#### Endpoints (Conceptual)

| Method | Path                | Description        |
| ------ | ------------------- | ------------------ |
| GET    | `/api/envelopes`    | List all envelopes |
| POST   | `/api/envelopes`    | Create envelope    |
| GET    | `/api/transactions` | List transactions  |
| POST   | `/api/transactions` | Create transaction |
| GET    | `/api/bills`        | List bills         |
| POST   | `/api/bills`        | Create bill        |

#### Example: Create Envelope

```typescript
import { EnvelopeSchema } from "@/domain/schemas/envelope";
import { db } from "@/db";

const newEnvelope = {
  name: "Groceries",
  balance: 500.0,
  budgetedAmount: 500.0,
  lastModified: Date.now(),
};

// Validate with Zod
const validated = EnvelopeSchema.parse(newEnvelope);

// Save to Dexie
await db.envelopes.add(validated);
```

---

## Using the OpenAPI Specification

### Accessing the Spec

1. **Interactive UI:** Visit `/api-docs` route in the application
2. **JSON Download:** Use the download button in the API docs page
3. **Programmatic Access:**

```typescript
import { getOpenAPISpecObject } from "@/utils/openapi/exportOpenAPISpec";

const spec = getOpenAPISpecObject();
```

### Generating TypeScript Clients

Use tools like `openapi-typescript` to generate type-safe clients:

```bash
# Install generator
npm install --save-dev openapi-typescript

# Generate TypeScript types
npx openapi-typescript violetVault-openapi.json -o src/types/api-types.ts
```

### Using with API Testing Tools

Import the OpenAPI spec into:

- **Postman:** Import > OpenAPI 3.0
- **Insomnia:** Import/Export > Import Data
- **Swagger Editor:** Paste JSON directly

---

## Request/Response Patterns

### Standard Success Response

```typescript
{
  success: true,
  data?: unknown,
  message?: string,
  timestamp?: number
}
```

### Standard Error Response

```typescript
{
  success: false,
  error: string,
  code?: string,
  details?: unknown,
  timestamp?: number
}
```

### Validation Pattern

Always validate requests and responses using Zod schemas:

```typescript
import { validateBugReport, validateBugReportSafe } from "@/domain/schemas/bug-report";

// Throw on invalid data
const validated = validateBugReport(data);

// Handle validation errors gracefully
const result = validateBugReportSafe(data);
if (!result.success) {
  console.error("Validation failed:", result.error);
}
```

---

## Error Handling

### Error Categories

1. **Validation Errors:** Invalid request data (400)
2. **Authentication Errors:** Missing/invalid credentials (401)
3. **Authorization Errors:** Insufficient permissions (403)
4. **Not Found Errors:** Resource not found (404)
5. **Server Errors:** Internal failures (500)

### Error Handling Pattern

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  if (error instanceof ZodError) {
    // Validation error
    logger.error("Validation failed", error);
  } else if (error.code === "NETWORK_ERROR") {
    // Network error - trigger offline fallback
    logger.error("Network error", error);
  } else {
    // Generic error
    logger.error("Operation failed", error);
  }
  throw error;
}
```

---

## Development Workflow

### 1. Define Schema

Create Zod schema in `/src/domain/schemas/`:

```typescript
export const MySchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
});

export type MyType = z.infer<typeof MySchema>;
```

### 2. Register in OpenAPI

Add schema to `/src/utils/openapi/generateOpenAPISpec.ts`:

```typescript
registry.registerComponent("schemas", "MySchema", MySchema);
```

### 3. Create Service

Add business logic in `/src/services/`:

```typescript
export const myService = {
  async getData(): Promise<MyType> {
    const data = await db.myTable.toArray();
    return MySchema.parse(data);
  },
};
```

### 4. Create Query Hook

Add TanStack Query hook in `/src/hooks/api/`:

```typescript
export const useMyData = () => {
  return useQuery({
    queryKey: ["myData"],
    queryFn: () => myService.getData(),
  });
};
```

### 5. Use in Component

```typescript
const MyComponent: React.FC = () => {
  const { data, isLoading } = useMyData();

  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.name}</div>;
};
```

---

## Testing APIs

### Unit Testing Services

```typescript
import { describe, it, expect, vi } from "vitest";
import { myService } from "@/services/myService";

describe("myService", () => {
  it("should fetch data successfully", async () => {
    const result = await myService.getData();
    expect(result).toBeDefined();
  });
});
```

### Testing with Swagger UI

1. Navigate to `/api-docs` in the application
2. Select an endpoint
3. Click "Try it out"
4. Enter request parameters
5. Click "Execute"
6. View response

---

## Examples

### Complete Example: Creating a Transaction

```typescript
// 1. Import schemas and services
import { TransactionSchema } from "@/domain/schemas/transaction";
import { db } from "@/db";
import logger from "@/utils/common/logger";

// 2. Define transaction data
const transactionData = {
  amount: 45.99,
  description: "Grocery shopping",
  date: new Date().toISOString(),
  envelopeId: "env_123",
  type: "expense",
};

// 3. Validate with Zod
const validated = TransactionSchema.parse(transactionData);

// 4. Save to database
try {
  const id = await db.transactions.add(validated);
  logger.info("Transaction created", { id });
} catch (error) {
  logger.error("Failed to create transaction", error);
  throw error;
}
```

### Complete Example: Bug Report Submission

```typescript
import { BugReportSchema } from "@/domain/schemas/bug-report";
import logger from "@/utils/common/logger";

const submitBugReport = async () => {
  const bugReport = {
    title: "App crashes on envelope creation",
    description: "When I try to create a new envelope, the app crashes",
    severity: "high",
    steps: ['Click "Add Envelope"', "Fill in envelope details", 'Click "Save"'],
    systemInfo: {
      browser: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
  };

  // Validate
  const validated = BugReportSchema.parse(bugReport);

  // Submit
  try {
    const response = await fetch("https://bug-report-worker.thef4tdaddy.workers.dev/report-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    });

    const result = await response.json();
    logger.info("Bug report submitted", result);
    return result;
  } catch (error) {
    logger.error("Failed to submit bug report", error);
    throw error;
  }
};
```

---

## Schema Migration Guide

### When Schema Changes

1. **Update Zod Schema:** Modify schema in `/src/domain/schemas/`
2. **Update OpenAPI Registration:** Update in `generateOpenAPISpec.ts`
3. **Update Service Logic:** Update business logic if needed
4. **Regenerate Types:** Re-run TypeScript compiler
5. **Update Tests:** Update test cases
6. **Version API:** Consider versioning if breaking change

### Backward Compatibility

```typescript
// Example: Adding optional field
export const MySchema = z.object({
  id: z.string(),
  name: z.string(),
  // New optional field - backward compatible
  email: z.string().optional(),
});
```

---

## Best Practices

### 1. Always Validate

```typescript
// ✅ GOOD: Validate all external data
const validated = MySchema.parse(externalData);

// ❌ BAD: Trust external data
const data = externalData as MyType;
```

### 2. Use Type Inference

```typescript
// ✅ GOOD: Infer types from schemas
type MyType = z.infer<typeof MySchema>;

// ❌ BAD: Duplicate type definitions
interface MyType { ... }
```

### 3. Handle Errors Gracefully

```typescript
// ✅ GOOD: Graceful error handling
const result = MySchema.safeParse(data);
if (!result.success) {
  logger.error("Validation failed", result.error);
  return { success: false, error: result.error.message };
}

// ❌ BAD: Let validation throw unhandled
const validated = MySchema.parse(data);
```

### 4. Keep Services Pure

```typescript
// ✅ GOOD: Service with single responsibility
export const envelopeService = {
  async getEnvelopes(): Promise<Envelope[]> {
    const data = await db.envelopes.toArray();
    return data.map((e) => EnvelopeSchema.parse(e));
  },
};

// ❌ BAD: Service with component logic
export const envelopeService = {
  async getEnvelopes(): Promise<JSX.Element> {
    // Don't return UI elements from services!
  },
};
```

---

## Support

For questions, issues, or contributions:

- **GitHub Issues:** [https://github.com/thef4tdaddy/violet-vault/issues](https://github.com/thef4tdaddy/violet-vault/issues)
- **Documentation:** [https://github.com/thef4tdaddy/violet-vault/docs](https://github.com/thef4tdaddy/violet-vault/docs)
- **Bug Reports:** Use the in-app bug reporter

---

## Version History

- **v2.0.0** - Initial OpenAPI documentation (October 2025)
  - Complete API documentation with OpenAPI 3.0
  - Swagger UI integration
  - TypeScript client generation support
  - Comprehensive development guide

---

**Last Updated:** October 29, 2025  
**Maintained By:** VioletVault Contributors
