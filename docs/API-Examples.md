# Backend API Usage Examples

This document provides practical examples of how to use the VioletVault backend APIs.

## Bug Report API

### Basic Bug Report Submission

```javascript
import { BugReportAPIClient } from '@/services/backendAPI';

// Example 1: Simple bug report
const submitSimpleBug = async () => {
  const result = await BugReportAPIClient.submitBugReport({
    title: 'Login button not working',
    description: 'The login button does not respond to clicks',
    steps: '1. Navigate to login page\n2. Click login button',
    expected: 'Button should submit form',
    actual: 'Button does nothing',
    severity: 'high',
    labels: ['ui', 'auth'],
    systemInfo: {
      appVersion: '1.10.0',
      browser: {
        name: 'Chrome',
        version: '120.0'
      },
      viewport: {
        width: 1920,
        height: 1080
      }
    }
  });

  if (result.success) {
    console.log(`Bug reported: ${result.url}`);
  } else {
    console.error(`Failed to report bug: ${result.error}`);
  }
};
```

### Bug Report with Screenshot

```javascript
import { BugReportAPIClient } from '@/services/backendAPI';
import { ScreenshotService } from '@/services/bugReport/screenshotService';

const submitBugWithScreenshot = async () => {
  // Capture screenshot
  const screenshot = await ScreenshotService.captureScreenshot();

  const result = await BugReportAPIClient.submitBugReport({
    title: 'UI alignment issue',
    description: 'The sidebar is misaligned on mobile',
    screenshot: screenshot, // Base64 string
    severity: 'medium',
    systemInfo: {
      appVersion: '1.10.0',
      viewport: {
        width: 390,
        height: 844
      }
    }
  });

  return result;
};
```

## Analytics API

### Payday Prediction

```javascript
import { usePaydayPrediction } from '@/hooks/analytics/useBackendAnalytics';

// Example 1: Using React hook
const PaydayWidget = () => {
  const transactions = [
    { date: '2024-01-01T00:00:00Z', amount: 1500, description: 'Paycheck' },
    { date: '2024-01-15T00:00:00Z', amount: 1500, description: 'Paycheck' },
    { date: '2024-01-29T00:00:00Z', amount: 1500, description: 'Paycheck' },
  ];

  const { data, isLoading, error } = usePaydayPrediction(transactions);

  if (isLoading) return <div>Analyzing paycheck history...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Next Payday: {data.nextPayday}</h3>
      <p>Confidence: {data.confidence}%</p>
      <p>Pattern: {data.pattern}</p>
    </div>
  );
};
```

### Merchant Pattern Analysis

```javascript
import { useMerchantPatterns } from '@/hooks/analytics/useBackendAnalytics';

const MerchantSuggestions = () => {
  const transactions = [
    { date: '2024-01-01', amount: -5.50, description: 'Starbucks' },
    { date: '2024-01-03', amount: -6.00, description: 'Starbucks Coffee' },
    { date: '2024-01-05', amount: -5.75, description: 'STARBUCKS' },
    { date: '2024-01-07', amount: -5.25, description: 'Starbucks #1234' },
  ];

  const envelopes = [
    { id: '1', name: 'Groceries', monthlyAmount: 500 }
  ];

  const { data, isLoading } = useMerchantPatterns(transactions, envelopes, 1);

  if (isLoading) return <div>Analyzing spending patterns...</div>;

  return (
    <div>
      <h3>Suggested Envelopes:</h3>
      {data?.suggestions.map(suggestion => (
        <div key={suggestion.id}>
          <h4>{suggestion.title}</h4>
          <p>{suggestion.description}</p>
          <p>Suggested amount: ${suggestion.suggestedAmount}/month</p>
        </div>
      ))}
    </div>
  );
};
```

### Comprehensive Analytics

```javascript
import { useBackendAnalytics } from '@/hooks/analytics/useBackendAnalytics';

const FinancialDashboard = () => {
  const transactions = [...]; // Your transaction data
  const envelopes = [...];    // Your envelope data

  const { data, isLoading } = useBackendAnalytics(transactions, envelopes, 3);

  if (isLoading) return <div>Loading analytics...</div>;

  return (
    <div>
      {/* Payday Section */}
      <section>
        <h3>Payday Prediction</h3>
        <p>Next payday: {data.payday.nextPayday}</p>
        <p>Confidence: {data.payday.confidence}%</p>
      </section>

      {/* Merchant Suggestions */}
      <section>
        <h3>Spending Insights</h3>
        {data.merchants.suggestions.map(s => (
          <div key={s.id}>{s.title}</div>
        ))}
      </section>
    </div>
  );
};
```

## Direct API Client Usage (Non-React)

### Payday Prediction

```javascript
import { AnalyticsAPIClient } from '@/services/backendAPI';

const predictPayday = async (transactions) => {
  const result = await AnalyticsAPIClient.predictNextPayday(transactions);

  if (result.success) {
    console.log('Next payday:', result.nextPayday);
    console.log('Confidence:', result.confidence);
    console.log('Pattern:', result.pattern);
    console.log('Message:', result.message);
  } else {
    console.error('Prediction failed:', result.error);
  }

  return result;
};
```

### Merchant Pattern Analysis

```javascript
import { AnalyticsAPIClient } from '@/services/backendAPI';

const analyzeMerchants = async (transactions, envelopes, monthsOfData = 3) => {
  const result = await AnalyticsAPIClient.analyzeMerchantPatterns(
    transactions,
    envelopes,
    monthsOfData
  );

  if (result.success) {
    console.log(`Found ${result.suggestions.length} suggestions`);
    result.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion.title}: $${suggestion.suggestedAmount}/month`);
    });
  } else {
    console.error('Analysis failed:', result.error);
  }

  return result;
};
```

### Mutation Hooks (For Actions)

```javascript
import { usePaydayPredictionMutation } from '@/hooks/analytics/useBackendAnalytics';

const RefreshPaydayButton = () => {
  const mutation = usePaydayPredictionMutation();

  const handleRefresh = async () => {
    const transactions = [...]; // Get latest transactions
    
    try {
      const result = await mutation.mutateAsync(transactions);
      console.log('Prediction updated:', result);
    } catch (error) {
      console.error('Failed to update prediction:', error);
    }
  };

  return (
    <button 
      onClick={handleRefresh} 
      disabled={mutation.isLoading}
    >
      {mutation.isLoading ? 'Analyzing...' : 'Refresh Prediction'}
    </button>
  );
};
```

## Error Handling

### Handling API Errors

```javascript
import { AnalyticsAPIClient } from '@/services/backendAPI';
import logger from '@/utils/common/logger';

const safeAnalytics = async (transactions) => {
  try {
    const result = await AnalyticsAPIClient.predictNextPayday(transactions);
    
    if (!result.success) {
      // API returned error
      logger.error('Analytics API error', result.error);
      return { error: result.error, data: null };
    }
    
    return { error: null, data: result };
  } catch (error) {
    // Network or other error
    logger.error('Analytics request failed', error);
    return { error: error.message, data: null };
  }
};
```

### Fallback Strategy

```javascript
import { AnalyticsAPIClient } from '@/services/backendAPI';
import { predictNextPayday as localPredict } from '@/utils/budgeting/paydayPredictor';

const analyzeWithFallback = async (transactions) => {
  // Try backend first
  const result = await AnalyticsAPIClient.predictNextPayday(transactions);
  
  if (result.success) {
    return { source: 'backend', ...result };
  }
  
  // Fallback to local implementation
  console.warn('Backend analytics unavailable, using local prediction');
  const localResult = localPredict(transactions);
  return { source: 'local', ...localResult };
};
```

## Testing

### Unit Test Example

```javascript
import { describe, it, expect, vi } from 'vitest';
import { BugReportAPIClient } from '@/services/backendAPI';

describe('BugReportAPIClient', () => {
  it('should submit bug report successfully', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          issueNumber: 123,
          url: 'https://github.com/owner/repo/issues/123',
          provider: 'github'
        })
      })
    );

    const result = await BugReportAPIClient.submitBugReport({
      title: 'Test Bug',
      description: 'Test description'
    });

    expect(result.success).toBe(true);
    expect(result.issueNumber).toBe(123);
  });
});
```

## Environment Configuration

### Development

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
```

### Production (Vercel)

```bash
# Environment variables in Vercel dashboard
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

## Best Practices

1. **Always handle errors**: Both network errors and API errors
2. **Use hooks for React components**: Better integration with TanStack Query
3. **Use direct client for utilities**: When hooks aren't appropriate
4. **Implement fallbacks**: Local implementations as backup
5. **Log errors**: Use the logger utility for debugging
6. **Cache results**: TanStack Query handles this automatically with hooks
7. **Validate inputs**: Check data before sending to API

## Performance Tips

1. **Debounce API calls**: Don't call on every keystroke
2. **Use React Query cache**: Avoid unnecessary API calls
3. **Batch requests**: Use comprehensive analytics for multiple analyses
4. **Filter transactions**: Send only relevant data to reduce payload size
5. **Set appropriate stale times**: Balance freshness with performance
