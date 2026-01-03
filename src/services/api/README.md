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
