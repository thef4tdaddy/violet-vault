# Budget Calculation API

High-performance, stateless Go backend for VioletVault envelope budget calculations.

## 🚀 Quick Start

### Single Calculation

```bash
curl -X POST https://violet-vault.vercel.app/api/budget \
  -H "Content-Type: application/json" \
  -d '{
    "envelopes": [
      {
        "id": "env1",
        "name": "Groceries",
        "currentBalance": 500,
        "monthlyBudget": 600
      }
    ],
    "transactions": [
      {
        "id": "tx1",
        "envelopeId": "env1",
        "type": "expense",
        "amount": -50,
        "date": "2026-01-01"
      }
    ],
    "bills": []
  }'
```

### Batch Calculation

```bash
curl -X POST https://violet-vault.vercel.app/api/budget/batch \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "userId": "user1",
        "envelopes": [...],
        "transactions": [...],
        "bills": [...]
      },
      {
        "userId": "user2",
        "envelopes": [...],
        "transactions": [...],
        "bills": [...]
      }
    ]
  }'
```

## 📚 Documentation

- **[API Documentation](./API.md)** - Complete API reference with examples
- **[OpenAPI Specification](./openapi.yaml)** - Machine-readable API spec
- **[Performance Benchmarks](./PERFORMANCE.md)** - Detailed performance analysis

## ✨ Features

- ✅ **Stateless & Privacy-First**: No data stored, all calculations in-memory
- ✅ **High Performance**: <2ms for typical workloads, <50ms for large datasets
- ✅ **Batch Processing**: Process multiple users in a single request
- ✅ **Request Validation**: Comprehensive input validation and sanitization
- ✅ **Security Headers**: CSP, XSS protection, and more
- ✅ **Multi-User Ready**: Isolated processing for concurrent users
- ✅ **Comprehensive Tests**: 100% test coverage with benchmarks

## 🔧 Development

### Prerequisites

- Go 1.22+
- Make (optional)

### Install Dependencies

```bash
cd api
go mod download
```

### Run Tests

```bash
# Unit tests
go test ./budget -v

# With coverage
go test ./budget -v -cover

# Benchmarks
go test ./budget -bench=. -benchmem

# Specific test
go test ./budget -v -run TestCalculate
```

### Test Coverage

```bash
go test ./budget -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Local Development

The API can be tested locally using the Go test suite or by running a local Vercel dev server:

```bash
# From repository root
npm install -g vercel
vercel dev
```

Then access the API at `http://localhost:3000/api/budget`

## 📊 Performance

| Dataset Size                                 | Processing Time | Memory Usage |
| -------------------------------------------- | --------------- | ------------ |
| Small (2 envelopes, 2 transactions)          | ~2 µs           | 2.4 KB       |
| Medium (50 envelopes, 500 transactions)      | ~382 µs         | 522 KB       |
| Standard (100 envelopes, 1,000 transactions) | ~1.1 ms         | 1.05 MB      |
| Large (500 envelopes, 5,000 transactions)    | ~21 ms          | 5.2 MB       |

**Batch Processing**: 100 users in ~2.5ms

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed analysis.

## 🏗️ Architecture

### Core Components

```
api/budget/
├── index.go           # Main API handler
├── batch.go           # Batch processing handler
├── validation.go      # Request validation & security
├── budget_test.go     # Core calculation tests
├── batch_test.go      # Batch processing tests
├── benchmark_test.go  # Performance benchmarks
├── API.md             # API documentation
├── openapi.yaml       # OpenAPI 3.0 specification
├── PERFORMANCE.md     # Performance analysis
└── README.md          # This file
```

### Data Flow

```
HTTP Request
    ↓
CORS & Security Headers
    ↓
Request Validation
    ↓
Calculate()
    ├── Filter by envelope
    ├── Partition bills (upcoming/overdue)
    ├── Calculate totals
    ├── Determine status
    └── Compute biweekly needs
    ↓
JSON Response
```

### Calculation Logic

The core `Calculate()` function:

1. **Filter Data**: Group transactions/bills by envelope
2. **Partition Bills**: Separate upcoming vs overdue bills
3. **Compute Totals**: Sum spent, upcoming, overdue amounts
4. **Calculate Utilization**: Based on envelope type
5. **Determine Status**: healthy, underfunded, overspent, overdue
6. **Biweekly Needs**: Calculate funding requirements
7. **Aggregate**: Sum global totals across all envelopes

## 🔒 Security

### Privacy Guarantees

- ✅ **No Persistence**: All data is in-memory only
- ✅ **No Logging**: User data never logged
- ✅ **No Analytics**: No tracking or user profiling
- ✅ **Immediate Disposal**: Data garbage-collected after response

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'none'
```

### Request Validation

- Maximum envelope count: 1,000
- Maximum transaction count: 10,000
- Maximum bill count: 5,000
- Maximum batch size: 100 users
- ID length limit: 100 characters
- Name length limit: 200 characters

### Rate Limiting (Recommended)

For production deployments:

- 100 requests/minute per IP (recommended)
- 60 second timeout per request

## 📦 Deployment

### Vercel (Production)

The API is deployed as a Vercel serverless function. Configuration in `vercel.json`:

```json
{
  "functions": {
    "api/**/*.go": {
      "runtime": "go1.x"
    }
  }
}
```

Deploy with:

```bash
vercel deploy --prod
```

### Custom Deployment

The API can be deployed to any Go-compatible platform:

1. **AWS Lambda**: Use Go Lambda runtime
2. **Google Cloud Functions**: Use Go 1.22 runtime
3. **Azure Functions**: Use custom Go handler
4. **Standalone**: Run as HTTP server with `http.ListenAndServe`

Example standalone server:

```go
package main

import (
    "log"
    "net/http"
    "github.com/thef4tdaddy/violet-vault/api/budget"
)

func main() {
    http.HandleFunc("/api/budget", budget.Handler)
    http.HandleFunc("/api/budget/batch", budget.BatchHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## 🧪 Testing

### Test Structure

- **Unit Tests**: `*_test.go` files
- **Benchmarks**: `benchmark_test.go`
- **Integration**: Test against live API endpoint

### Running Specific Tests

```bash
# Core calculations
go test ./budget -v -run TestCalculate

# Batch processing
go test ./budget -v -run TestProcessBatch

# Validation
go test ./budget -v -run TestValidate

# All tests with coverage
go test ./budget -v -cover -coverprofile=coverage.out
```

### Benchmark Commands

```bash
# All benchmarks
go test ./budget -bench=.

# Specific benchmark
go test ./budget -bench=BenchmarkCalculateSmall

# With memory statistics
go test ./budget -bench=. -benchmem

# Extended run
go test ./budget -bench=. -benchtime=10s
```

## 🔗 Integration

### TypeScript/JavaScript

```typescript
import { BudgetEngineService } from "@/services/api/budgetEngineService";

const response = await BudgetEngineService.calculateBudget(envelopes, transactions, bills);

if (response.success) {
  const { data, totals } = response.data;
  console.log(`Calculated ${totals.envelopeCount} envelopes`);
}
```

### Python

```python
import requests

response = requests.post(
    'https://violet-vault.vercel.app/api/budget',
    json={
        'envelopes': [...],
        'transactions': [...],
        'bills': [...]
    }
)

data = response.json()
if data['success']:
    print(f"Calculated {data['totals']['envelopeCount']} envelopes")
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func calculateBudget(envelopes []Envelope, transactions []Transaction, bills []Bill) (*BudgetCalculationResponse, error) {
    payload := BudgetCalculationRequest{
        Envelopes:    envelopes,
        Transactions: transactions,
        Bills:        bills,
    }

    body, _ := json.Marshal(payload)
    resp, err := http.Post(
        "https://violet-vault.vercel.app/api/budget",
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result BudgetCalculationResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}
```

## 📈 Monitoring

### Recommended Metrics

1. **Response Time**
   - P50, P95, P99 percentiles
   - Alert: P95 > 50ms

2. **Error Rate**
   - Validation failures
   - Calculation errors
   - Alert: >1% error rate

3. **Request Rate**
   - Requests per second
   - Alert: >80% capacity

4. **Memory Usage**
   - Peak memory per request
   - Alert: >10MB per request

### Health Check

Add a health check endpoint:

```bash
curl https://violet-vault.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

## 🤝 Contributing

### Code Style

- Follow Go standard formatting (`go fmt`)
- Add tests for all new features
- Update documentation
- Run benchmarks for performance changes

### Pull Request Checklist

- [ ] Tests pass: `go test ./budget -v`
- [ ] Benchmarks run: `go test ./budget -bench=.`
- [ ] Documentation updated
- [ ] API spec updated (if API changes)
- [ ] Performance analysis (if relevant)

## 📄 License

CC-BY-NC-SA-4.0 - See [LICENSE](../../LICENSE) for details.

## 🔗 Links

- **Repository**: https://github.com/thef4tdaddy/violet-vault
- **Issues**: https://github.com/thef4tdaddy/violet-vault/issues
- **Discussions**: https://github.com/thef4tdaddy/violet-vault/discussions

## 📞 Support

- Create an issue: https://github.com/thef4tdaddy/violet-vault/issues/new
- Discussions: https://github.com/thef4tdaddy/violet-vault/discussions

---

**Version**: 2.0.0  
**Last Updated**: 2026-01-06  
**Maintainer**: VioletVault Contributors
