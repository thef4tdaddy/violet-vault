# V2 Polyglot API Client

This directory contains the typed API client for consuming V2 Polyglot Backend endpoints (Go and Python serverless functions).

## Architecture

The API client follows the **Offline-First** pattern:

1. **Reads**: Always read from Dexie/Cache first
2. **Writes**: Optimistic updates to Dexie/UI, then sync via API
3. **Fallback**: When offline or API fails, fallback to local implementations

## Usage

### Basic Usage

```typescript
import { ApiClient } from "@/services/api/client";

// GET request
const response = await ApiClient.get<MyDataType>("/api/endpoint");
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}

// POST request
const response = await ApiClient.post<ResponseType>("/api/endpoint", { key: "value" });
```

### Analytics API Integration

```typescript
import { AnalyticsApiService } from "@/services/analytics/analyticsApiService";

// Payday Prediction (with offline fallback)
const prediction = await AnalyticsApiService.predictNextPayday(paychecks);
// Returns prediction from backend or falls back to local algorithm

// Merchant Categorization
const suggestions = await AnalyticsApiService.analyzeMerchantPatterns(
  transactions,
  3 // months of data
);
```

### Bug Report Integration

```typescript
import { BugReportingService } from "@/services/logging/bugReportingService";

// Submit bug report via Go backend
const result = await BugReportingService.submitBugReport({
  title: "Bug title",
  description: "Bug description",
  severity: "medium",
  includeScreenshot: true,
});
```

## Available Endpoints

### Python Endpoints (Analytics)

- `POST /api/analytics/prediction` - Payday prediction
- `POST /api/analytics/categorization` - Merchant categorization
- `POST /api/autofunding` - AutoFunding simulation

### Go Endpoints

- `POST /api/bug-report` - Bug report proxy to GitHub
- `POST /api/import` - High-performance transaction import
- `POST /api/budget` - Budget engine calculations
- `POST /api/budget/batch` - Batch budget calculations for multiple users

## New V2 Services

### BudgetEngineService

High-performance budget calculations using Go backend.

**Features:**

- Envelope balance calculations
- Bill due date tracking
- Utilization rate computation
- Global budget totals

**Usage:**

```typescript
import { BudgetEngineService } from "@/services/api/budgetEngineService";

const response = await BudgetEngineService.calculateBudget(envelopes, transactions, bills);

if (response.success) {
  const { data, totals } = response.data;
  // Use calculated envelope data and totals
}
```

### BatchBudgetService

Batch budget calculations for multiple users with automatic chunking.

**Features:**

- Process multiple users in a single request
- Automatic chunking for large batches (>100 users)
- User isolation and privacy
- Per-user metadata support

**Usage:**

```typescript
import { BatchBudgetService } from "@/services/api/batchBudgetService";

// Create batch items
const items = users.map((user) =>
  BatchBudgetService.createBatchItem(
    user.id,
    user.envelopes,
    user.transactions,
    user.bills,
    { source: "dashboard" } // Optional metadata
  )
);

// Process batch
const response = await BatchBudgetService.processBatchChunked(items);

if (response.success) {
  const { results, summary } = response.data;

  // Access specific user's result
  const userResult = BatchBudgetService.getResultForUser(response.data, "user1");

  // Get all successful results
  const successful = BatchBudgetService.getSuccessfulResults(response.data);

  // Get all failed results
  const failed = BatchBudgetService.getFailedResults(response.data);
}
```

**Batch Processing Benefits:**

- **Performance**: ~2.5ms for 100 users vs 100+ individual requests
- **Reduced Latency**: Single network round-trip
- **Lower Overhead**: Shared JSON parsing and validation
- **Better UX**: Faster dashboard loads for multi-user scenarios

### BudgetCalculationService (Hybrid)

Automatic backend/client fallback for budget calculations.

**Usage:**

```typescript
import { BudgetCalculationService } from "@/services/budget/budgetCalculationService";

// Automatic backend/client selection
const result = await BudgetCalculationService.calculate(
  envelopes,
  transactions,
  bills,
  { preferBackend: true } // Default: true
);

console.log(`Calculated using: ${result.source}`); // "backend" or "client"

// Force client-side calculation
const clientResult = await BudgetCalculationService.calculate(envelopes, transactions, bills, {
  forceClientSide: true,
});
```

### ImportService

High-performance CSV/JSON parsing using Go backend.

**Features:**

- CSV and JSON file parsing
- Automatic field mapping detection
- Transaction validation
- Invalid row reporting

**Usage:**

```typescript
import { ImportService } from "@/services/api/importService";

// Validate file first
const validation = ImportService.validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Import transactions
const response = await ImportService.importTransactions(file, fieldMapping);

if (response.success) {
  const { transactions, invalid } = response.data;
  // Process valid transactions
}
```

## Offline Behavior

The API client automatically detects offline status using `navigator.onLine`:

- **Analytics**: Falls back to local `paydayPredictor.ts`
- **Bug Reports**: Returns error, allows retry when online
- **Import**: Client-side fallback available

## Error Handling

All API methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Errors are logged automatically via the `logger` utility.

## Testing

To test API integration:

1. **Online Mode**: Normal API calls to backend
2. **Offline Mode**: Toggle network in DevTools, verify fallbacks
3. **Error Mode**: Mock API failures, verify error handling

## Configuration

Set the API base URL via environment variable:

```env
VITE_API_BASE_URL=https://api.violetvault.app
```

If not set, defaults to same-origin (relative URLs).
