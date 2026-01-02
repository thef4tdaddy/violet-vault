# VioletVault v2.0 Polyglot Backend

This directory contains serverless functions for the VioletVault v2.0 polyglot backend architecture.

## Architecture

The backend is split between Go and Python for optimal performance and maintainability:

- **Go**: Handles bug report proxy to GitHub API (secrets, authentication)
- **Python**: Handles financial intelligence (payday prediction, merchant categorization)

## Serverless Functions

### 1. Bug Report Proxy (`bug-report.go`)

**Endpoint**: `POST /api/bug-report`

**Purpose**: Offload GitHub Issue creation and secret handling to a secure backend.

**Payload**:

```json
{
  "title": "Bug report title",
  "description": "Bug description",
  "steps": "Steps to reproduce",
  "expected": "Expected behavior",
  "actual": "Actual behavior",
  "severity": "low|medium|high|critical",
  "labels": ["bug", "frontend"],
  "systemInfo": {
    "appVersion": "2.0.0",
    "userAgent": "...",
    "platform": "...",
    "viewport": { "width": 1920, "height": 1080 },
    "recentErrors": []
  },
  "screenshot": "base64_encoded_image"
}
```

**Response**:

```json
{
  "success": true,
  "provider": "github",
  "issueNumber": 123,
  "url": "https://github.com/thef4tdaddy/violet-vault/issues/123"
}
```

**Environment Variables**:

- `GITHUB_TOKEN`: Personal access token with `repo` scope

### 2. Analytics Engine (`analytics.py`)

**Endpoint**: `POST /api/analytics`

**Purpose**: Provide financial intelligence using Python for data analysis.

**Operations**:

#### Predict Payday

```json
{
  "operation": "predictPayday",
  "paychecks": [
    { "date": "2025-12-15", "amount": 2500 },
    { "date": "2025-12-01", "amount": 2500 }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "prediction": {
    "nextPayday": "2025-12-29T00:00:00",
    "confidence": 85,
    "pattern": "biweekly",
    "intervalDays": 14,
    "message": "High confidence biweekly pattern detected"
  }
}
```

#### Analyze Merchants

```json
{
  "operation": "analyzeMerchants",
  "transactions": [
    { "description": "Starbucks Coffee", "amount": -5.5, "envelopeId": "" },
    { "description": "Amazon.com", "amount": -45.0, "envelopeId": "" }
  ],
  "monthsOfData": 3
}
```

**Response**:

```json
{
  "success": true,
  "suggestions": [
    {
      "category": "Coffee & Drinks",
      "amount": 165.0,
      "count": 30,
      "suggestedBudget": 182,
      "monthlyAverage": 55.0
    }
  ]
}
```

## Development

### Prerequisites

- Go 1.22+
- Python 3.12+
- Node.js 18+

### Go Setup

```bash
cd api
go mod download
go build ./...
go test ./...
```

### Python Setup

```bash
# Install Python tooling
pip install ruff mypy

# Lint Python code
ruff check api/
ruff format api/

# Type check
mypy api/
```

### Multi-Language Verification

Run the full salvo script to verify all languages:

```bash
./scripts/full_salvo.sh
```

This will run:

- ESLint, TypeScript, and Prettier for JavaScript/TypeScript
- go fmt, go vet, go build, and golangci-lint for Go
- ruff and mypy for Python

## Deployment

### Vercel

The API functions are automatically deployed as Vercel serverless functions:

1. Push to GitHub
2. Vercel detects `api/` directory
3. Go files are built as Go runtime functions
4. Python files are built as Python runtime functions

### Environment Variables

Configure in Vercel dashboard:

- `GITHUB_TOKEN`: GitHub personal access token (for bug reports)

## Testing

### Local Testing

#### Bug Report API

```bash
curl -X POST http://localhost:3000/api/bug-report \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bug",
    "description": "Test description",
    "severity": "low",
    "systemInfo": {}
  }'
```

#### Analytics API

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "predictPayday",
    "paychecks": [
      {"date": "2025-12-15", "amount": 2500},
      {"date": "2025-12-01", "amount": 2500}
    ]
  }'
```

## Security

- **Secrets**: Never commit `GITHUB_TOKEN` or any secrets to the repository
- **CORS**: APIs are configured for CORS to allow frontend requests
- **Validation**: All inputs are validated before processing
- **Rate Limiting**: Consider implementing rate limiting in production

## Monitoring

- Check Vercel function logs for errors
- Use Vercel Analytics for performance monitoring
- Frontend logs API failures with detailed context

## Future Enhancements

- Add caching layer for analytics results
- Implement rate limiting
- Add authentication/authorization
- Add request logging and monitoring
- Expand analytics capabilities (budgeting AI, spending insights)
