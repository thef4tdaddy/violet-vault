# Testing Guide for v2.0 Polyglot Backend

This document describes how to test the Go and Python serverless functions.

## Prerequisites

1. **Go**: Version 1.22+
2. **Python**: Version 3.12+
3. **Environment Variables**: `GITHUB_TOKEN` (for bug report API)

## Testing Go Bug Report API

### Option 1: Local Testing with Go HTTP Server

Create a simple test server:

```bash
cd api
cat > test_server.go << 'EOF'
package main

import (
    "log"
    "net/http"
    handler "github.com/thef4tdaddy/violet-vault/api"
)

func main() {
    http.HandleFunc("/api/bug-report", handler.Handler)
    log.Println("Test server listening on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
EOF

# Set environment variable
export GITHUB_TOKEN="your_github_token_here"

# Run test server
go run test_server.go
```

In another terminal, test with curl:

```bash
curl -X POST http://localhost:8080/api/bug-report \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bug Report from v2.0 Polyglot Backend",
    "description": "Testing the Go serverless function integration",
    "steps": "1. Created polyglot backend\n2. Implemented Go function\n3. Testing submission",
    "expected": "Should create GitHub issue",
    "actual": "Testing...",
    "severity": "low",
    "labels": ["test", "backend"],
    "systemInfo": {
      "appVersion": "2.0.0-alpha.4",
      "userAgent": "Test/1.0",
      "platform": "Linux",
      "viewport": {"width": 1920, "height": 1080}
    },
    "screenshot": ""
  }'
```

### Option 2: Unit Test (Create test file)

```bash
cd api
cat > bug-report_test.go << 'EOF'
package handler

import (
    "testing"
)

func TestGetSeverityLabel(t *testing.T) {
    tests := []struct {
        input    string
        expected string
    }{
        {"critical", "🔴 Critical"},
        {"high", "🟠 High"},
        {"medium", "🟡 Medium"},
        {"low", "🟢 Low"},
        {"unknown", "⚪ Unknown"},
    }

    for _, tt := range tests {
        t.Run(tt.input, func(t *testing.T) {
            result := getSeverityLabel(tt.input)
            if result != tt.expected {
                t.Errorf("getSeverityLabel(%s) = %s; want %s", tt.input, result, tt.expected)
            }
        })
    }
}
EOF

go test -v ./...
```

## Testing Python Analytics API

### Option 1: Local Testing with Python HTTP Server

```bash
cd api

# Create test server
cat > test_analytics_server.py << 'EOF'
from http.server import HTTPServer
from analytics import handler

if __name__ == "__main__":
    server = HTTPServer(("localhost", 8081), handler)
    print("Analytics API server listening on http://localhost:8081")
    server.serve_forever()
EOF

# Run server
python test_analytics_server.py
```

In another terminal, test with curl:

#### Test Payday Prediction

```bash
curl -X POST http://localhost:8081 \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "predictPayday",
    "paychecks": [
      {"date": "2025-12-15T00:00:00", "amount": 2500},
      {"date": "2025-12-01T00:00:00", "amount": 2500},
      {"date": "2025-11-15T00:00:00", "amount": 2500}
    ]
  }'
```

Expected response:

```json
{
  "success": true,
  "prediction": {
    "nextPayday": "2025-12-29T00:00:00",
    "confidence": 100,
    "pattern": "biweekly",
    "intervalDays": 14,
    "message": "High confidence biweekly pattern detected"
  }
}
```

#### Test Merchant Analysis

```bash
curl -X POST http://localhost:8081 \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "analyzeMerchants",
    "transactions": [
      {"description": "Starbucks Coffee #1234", "amount": -5.50, "envelopeId": ""},
      {"description": "Starbucks Downtown", "amount": -6.00, "envelopeId": ""},
      {"description": "Amazon.com Order", "amount": -45.00, "envelopeId": ""},
      {"description": "Amazon Prime", "amount": -55.00, "envelopeId": ""},
      {"description": "Shell Gas Station", "amount": -40.00, "envelopeId": ""},
      {"description": "Shell 24/7", "amount": -45.00, "envelopeId": ""}
    ],
    "monthsOfData": 1
  }'
```

Expected response:

```json
{
  "success": true,
  "suggestions": [
    {
      "category": "Online Shopping",
      "amount": 100.0,
      "count": 2,
      "suggestedBudget": 110,
      "monthlyAverage": 100.0
    },
    {
      "category": "Gas Stations",
      "amount": 85.0,
      "count": 2,
      "suggestedBudget": 93,
      "monthlyAverage": 85.0
    }
  ]
}
```

### Option 2: Python Unit Tests

```bash
cd api

# Create test file
cat > test_analytics.py << 'EOF'
import unittest
from analytics import predict_next_payday, analyze_merchant_patterns

class TestAnalytics(unittest.TestCase):
    def test_predict_payday_biweekly(self):
        paychecks = [
            {"date": "2025-12-15", "amount": 2500},
            {"date": "2025-12-01", "amount": 2500},
            {"date": "2025-11-15", "amount": 2500},
        ]
        result = predict_next_payday(paychecks)

        self.assertIsNotNone(result["nextPayday"])
        self.assertGreater(result["confidence"], 70)
        self.assertEqual(result["pattern"], "biweekly")

    def test_predict_payday_insufficient_data(self):
        paychecks = [{"date": "2025-12-15", "amount": 2500}]
        result = predict_next_payday(paychecks)

        self.assertIsNone(result["nextPayday"])
        self.assertEqual(result["confidence"], 0)

    def test_analyze_merchants(self):
        transactions = [
            {"description": "Starbucks Coffee", "amount": -5.50, "envelopeId": ""},
            {"description": "Starbucks Downtown", "amount": -6.00, "envelopeId": ""},
            {"description": "Coffee Bean", "amount": -5.00, "envelopeId": ""},
            {"description": "Amazon.com", "amount": -60.00, "envelopeId": ""},
        ]
        result = analyze_merchant_patterns(transactions, 1)

        self.assertGreater(len(result), 0)
        categories = [s["category"] for s in result]
        self.assertIn("Coffee & Drinks", categories)

if __name__ == "__main__":
    unittest.main()
EOF

# Run tests
python -m unittest test_analytics.py
```

## Integration Testing with Frontend

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Deploy to Vercel preview:

   ```bash
   git push origin copilot/migrate-bug-report-go
   ```

3. Test bug report submission:
   - Navigate to the app
   - Trigger a bug report (usually via a feedback form)
   - Check GitHub issues for the newly created issue

4. Test analytics:
   - Add paycheck history
   - Check if payday predictions appear
   - Add transactions with merchant names
   - Check if envelope suggestions appear

## Vercel Deployment Testing

Once deployed to Vercel:

1. **Bug Report API**:

   ```bash
   curl -X POST https://your-app.vercel.app/api/bug-report \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "description": "Test", "severity": "low", "systemInfo": {}}'
   ```

2. **Analytics API**:

   ```bash
   curl -X GET https://your-app.vercel.app/api/analytics
   ```

   Should return health check response:

   ```json
   {
     "success": true,
     "message": "VioletVault Analytics API v2.0",
     "endpoints": {
       "POST /api/analytics": {
         "operations": ["predictPayday", "analyzeMerchants"]
       }
     }
   }
   ```

## Troubleshooting

### Go API Issues

1. **GITHUB_TOKEN not found**:
   - Set environment variable in Vercel dashboard
   - For local testing: `export GITHUB_TOKEN="your_token"`

2. **Compilation errors**:
   - Ensure Go 1.22+ is installed
   - Run `go mod tidy` to sync dependencies

### Python API Issues

1. **Module import errors**:
   - Ensure Python 3.12+ is installed
   - Check Vercel Python runtime configuration

2. **Type checking errors**:
   - Run `mypy api/` to check types
   - Fix any type annotations

## Performance Testing

Use Apache Bench or similar tools:

```bash
# Test bug report API
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:8080/api/bug-report

# Test analytics API
ab -n 100 -c 10 -p analytics_payload.json -T application/json http://localhost:8081/
```

## Security Testing

1. **Input validation**: Test with malformed JSON
2. **Large payloads**: Test with very large screenshot data
3. **Rate limiting**: Test repeated requests
4. **CORS**: Test from different origins

## Next Steps

- Add automated tests to CI/CD pipeline
- Add request/response logging
- Implement rate limiting
- Add caching for analytics results
- Monitor API performance and errors
