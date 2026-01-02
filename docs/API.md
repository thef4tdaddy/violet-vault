# Violet Vault Backend API Documentation

This document describes the polyglot backend services for Violet Vault v2.0.

## Overview

The backend consists of serverless functions deployed on Vercel:
- **Go**: Bug report proxy to GitHub Issues API
- **Python**: Financial analytics and prediction engine

## API Endpoints

### 1. Bug Report API (`/api/bug-report`)

**Language**: Go 1.22+
**Method**: POST
**Content-Type**: application/json

#### Purpose
Submits bug reports to GitHub Issues with proper formatting and authentication.

#### Request Payload

```json
{
  "title": "string (required)",
  "description": "string",
  "steps": "string",
  "expected": "string",
  "actual": "string",
  "severity": "low|medium|high|critical",
  "labels": ["string"],
  "systemInfo": {
    "appVersion": "string",
    "browser": {
      "name": "string",
      "version": "string"
    },
    "viewport": {
      "width": number,
      "height": number
    },
    "userAgent": "string",
    "performance": {
      "memory": {
        "usedJSHeapSize": number
      }
    },
    "timestamp": "ISO8601 string",
    "errors": {
      "recentErrors": [{
        "type": "string",
        "message": "string",
        "stack": "string",
        "timestamp": "string"
      }]
    }
  },
  "screenshot": "base64 string or URL (optional)",
  "sessionUrl": "string (optional)",
  "contextInfo": {
    "url": "string",
    "userLocation": "string"
  },
  "logs": ["string"]
}
```

#### Response

**Success (200)**:
```json
{
  "success": true,
  "issueNumber": 123,
  "url": "https://github.com/thef4tdaddy/violet-vault/issues/123",
  "provider": "github"
}
```

**Error (4xx/5xx)**:
```json
{
  "success": false,
  "error": "Error message",
  "provider": "github"
}
```

#### Environment Variables

- `GITHUB_TOKEN`: GitHub Personal Access Token with `repo` scope

#### Example Usage

```javascript
const response = await fetch('/api/bug-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
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
      }
    }
  })
});

const result = await response.json();
console.log('Issue created:', result.url);
```

---

### 2. Analytics API (`/api/analytics`)

**Language**: Python 3.12+
**Method**: POST
**Content-Type**: application/json

#### Purpose
Provides financial intelligence including payday prediction and merchant pattern analysis.

#### Request Payload

The request must include a `type` field indicating the analysis to perform:

**Payday Prediction**:
```json
{
  "type": "payday_prediction",
  "transactions": [{
    "date": "ISO8601 string",
    "amount": number,
    "description": "string",
    "category": "string (optional)",
    "envelopeId": "string (optional)"
  }]
}
```

**Merchant Pattern Analysis**:
```json
{
  "type": "merchant_patterns",
  "transactions": [{
    "date": "ISO8601 string",
    "amount": number,
    "description": "string",
    "category": "string (optional)",
    "envelopeId": "string (optional)"
  }],
  "envelopes": [{
    "id": "string",
    "name": "string",
    "category": "string",
    "monthlyAmount": number
  }],
  "monthsOfData": number
}
```

#### Response

**Payday Prediction Success (200)**:
```json
{
  "success": true,
  "data": {
    "nextPayday": "2024-02-15T00:00:00",
    "confidence": 85,
    "pattern": "biweekly",
    "intervalDays": 14,
    "message": "High confidence biweekly pattern detected"
  },
  "error": null
}
```

**Merchant Patterns Success (200)**:
```json
{
  "success": true,
  "data": {
    "suggestions": [{
      "id": "merchant_Coffee & Drinks",
      "type": "merchant_pattern",
      "priority": "medium",
      "title": "Create \"Coffee & Drinks\" Envelope",
      "description": "$85.50 spent across 15 coffee & drinks transactions",
      "suggestedAmount": 94,
      "reasoning": "Detected spending pattern averaging $85.50/month",
      "action": "create_envelope",
      "impact": "tracking",
      "data": {
        "name": "Coffee & Drinks",
        "monthlyAmount": 94,
        "category": "Coffee & Drinks",
        "color": "#06b6d4"
      }
    }]
  },
  "error": null
}
```

**Error (4xx/5xx)**:
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

#### Example Usage

**Payday Prediction**:
```javascript
const response = await fetch('/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'payday_prediction',
    transactions: [
      { date: '2024-01-01T00:00:00Z', amount: 1500, description: 'Paycheck' },
      { date: '2024-01-15T00:00:00Z', amount: 1500, description: 'Paycheck' },
      { date: '2024-01-29T00:00:00Z', amount: 1500, description: 'Paycheck' },
    ]
  })
});

const result = await response.json();
console.log('Next payday:', result.data.nextPayday);
console.log('Confidence:', result.data.confidence);
```

**Merchant Pattern Analysis**:
```javascript
const response = await fetch('/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'merchant_patterns',
    transactions: transactions, // Array of all transactions
    envelopes: envelopes,       // Array of existing envelopes
    monthsOfData: 3             // Number of months to analyze
  })
});

const result = await response.json();
console.log('Suggestions:', result.data.suggestions);
```

---

## Merchant Pattern Detection

The analytics engine detects spending patterns for the following merchant categories:

- **Online Shopping**: Amazon, eBay, Etsy
- **Coffee & Drinks**: Starbucks, Dunkin', coffee shops
- **Gas Stations**: Shell, Exxon, Chevron, BP
- **Subscriptions**: Netflix, Spotify, Hulu
- **Rideshare**: Uber, Lyft
- **Pharmacy**: CVS, Walgreens
- **Fast Food**: McDonald's, Burger King, Taco Bell, etc.
- **Grocery Delivery**: Instacart, Shipt
- **Streaming**: Netflix, Hulu, Disney+, HBO
- **Fitness**: Gyms, Planet Fitness, LA Fitness

---

## Development

### Running Tests

**Go Tests**:
```bash
cd api
go test -v
```

**Python Tests**:
```bash
cd api/tests
python -m pytest test_analytics.py -v
```

### Linting

**Go**:
```bash
golangci-lint run api/
```

**Python**:
```bash
ruff check api/
ruff format api/
mypy api/analytics.py
```

### Local Development

To test serverless functions locally, use the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

Then access:
- Bug Report API: http://localhost:3000/api/bug-report
- Analytics API: http://localhost:3000/api/analytics

---

## Deployment

The backend is automatically deployed to Vercel when changes are pushed to the repository.

### Environment Variables (Vercel)

Required environment variables must be set in the Vercel dashboard:

- `GITHUB_TOKEN`: GitHub Personal Access Token for creating issues

---

## Security Considerations

1. **CORS**: Both endpoints allow all origins (`*`) for development. In production, this should be restricted to your domain.

2. **Rate Limiting**: Consider implementing rate limiting to prevent abuse.

3. **GitHub Token**: The `GITHUB_TOKEN` must have only the minimum required permissions (`public_repo` or `repo` scope).

4. **Input Validation**: All inputs are validated before processing. Invalid requests return 400 Bad Request.

5. **Error Messages**: Error messages do not expose sensitive information.

---

## Performance

- **Bug Report API**: ~1-2 seconds (includes GitHub API call)
- **Analytics API**: ~100-500ms (depending on transaction count)
- **Max Duration**: 30 seconds (Vercel limit)

---

## Future Enhancements

- [ ] Add screenshot upload to cloud storage (S3/Cloudflare R2)
- [ ] Implement caching for analytics results
- [ ] Add more sophisticated ML-based categorization
- [ ] Support multiple languages for merchant detection
- [ ] Add webhook notifications for critical bugs
