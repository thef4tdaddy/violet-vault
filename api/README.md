# VioletVault v2.0 Polyglot Backend

This directory contains serverless functions for the VioletVault v2.0 polyglot backend architecture.

## Architecture

The backend is split between Go and Python for optimal performance and maintainability:

- **Go**: Handles bug report proxy to GitHub API (secrets, authentication)
- **Python**: Handles financial intelligence (payday prediction, merchant categorization, autofunding simulation)

### Python Structure

```
api/
├── __init__.py              # Main API module
├── requirements.txt         # Python dependencies
├── autofunding.py          # Main autofunding endpoint (Vercel handler)
└── autofunding/            # Autofunding module
    ├── __init__.py         # Module exports
    ├── models.py           # Pydantic models (data validation)
    ├── simulation.py       # Core simulation logic
    ├── rules.py            # Rule processing utilities
    ├── currency.py         # Currency utilities
    └── conditions.py       # Condition evaluation utilities
```

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

### 2. Analytics Engine

The analytics functionality is split into separate endpoints for better performance and reduced cold-start times on Vercel:

#### 2a. Payday Prediction (`analytics/prediction.py`)

**Endpoint**: `POST /api/analytics/prediction`

**Purpose**: Predict next payday based on paycheck history.

**Request**:

```json
{
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
  "error": null,
  "prediction": {
    "nextPayday": "2025-12-29T00:00:00",
    "confidence": 85,
    "pattern": "biweekly",
    "intervalDays": 14,
    "message": "High confidence biweekly pattern detected"
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Missing required field: paychecks"
}
```

#### 2b. Merchant Categorization (`analytics/categorization.py`)

**Endpoint**: `POST /api/analytics/categorization`

**Purpose**: Analyze merchant patterns and suggest envelope budgets.

**Request**:

```json
{
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
  "error": null,
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

**Error Response**:

```json
{
  "success": false,
  "error": "monthsOfData must be a positive integer"
}
```

#### 2c. AutoFunding Simulation (`autofunding.py`)

**Endpoint**: `POST /api/autofunding`

**Purpose**: Simulates the execution of AutoFunding rules without making actual changes. This allows the frontend to preview what transfers would occur based on the current rules and context.

**Request Payload**:

```json
{
  "rules": [
    {
      "id": "rule1",
      "name": "Groceries Top-up",
      "description": "Fill groceries envelope",
      "type": "fixed_amount",
      "trigger": "manual",
      "priority": 1,
      "enabled": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastExecuted": null,
      "executionCount": 0,
      "config": {
        "sourceType": "unassigned",
        "sourceId": null,
        "targetType": "envelope",
        "targetId": "env1",
        "targetIds": [],
        "amount": 200,
        "percentage": 0,
        "conditions": [],
        "scheduleConfig": {}
      }
    }
  ],
  "context": {
    "data": {
      "unassignedCash": 1000,
      "newIncomeAmount": 2500,
      "envelopes": [
        {
          "id": "env1",
          "name": "Groceries",
          "currentBalance": 150,
          "monthlyAmount": 400
        }
      ]
    },
    "trigger": "manual",
    "currentDate": "2024-01-15T12:00:00.000Z"
  }
}
```

**Response**:

```json
{
  "success": true,
  "simulation": {
    "totalPlanned": 200,
    "rulesExecuted": 1,
    "plannedTransfers": [
      {
        "fromEnvelopeId": "unassigned",
        "toEnvelopeId": "env1",
        "amount": 200,
        "description": "Auto-funding: Groceries Top-up",
        "ruleId": "rule1",
        "ruleName": "Groceries Top-up"
      }
    ],
    "ruleResults": [
      {
        "ruleId": "rule1",
        "ruleName": "Groceries Top-up",
        "success": true,
        "amount": 200,
        "plannedTransfers": [...],
        "targetEnvelopes": ["env1"]
      }
    ],
    "remainingCash": 800,
    "errors": []
  }
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
# Install dependencies
pip install -r api/requirements.txt

# Install tooling
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

#### Payday Prediction API

```bash
curl -X POST http://localhost:3000/api/analytics/prediction \
  -H "Content-Type: application/json" \
  -d '{
    "paychecks": [
      {"date": "2025-12-15", "amount": 2500},
      {"date": "2025-12-01", "amount": 2500}
    ]
  }'
```

#### Merchant Categorization API

```bash
curl -X POST http://localhost:3000/api/analytics/categorization \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {"description": "Starbucks", "amount": -5.50, "envelopeId": ""},
      {"description": "Amazon", "amount": -45.00, "envelopeId": ""}
    ],
    "monthsOfData": 3
  }'
```

#### AutoFunding Simulation API

```bash
curl -X POST http://localhost:3000/api/autofunding \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [],
    "context": {
        "data": {
            "unassignedCash": 1000,
            "newIncomeAmount": 0,
            "envelopes": []
        },
        "trigger": "manual",
        "currentDate": "2024-03-20T12:00:00Z"
    }
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

## Key Features (AutoFunding)

### Stateless Design

- Does not read from Firebase
- All context provided in the request payload
- Pure function simulation

### Request Validation

- Uses Pydantic for automatic request validation
- Type-safe with full schema enforcement
- Provides clear error messages for invalid requests

### Ported Logic

The following functions have been ported from TypeScript:

1. **`simulate_rule_execution`**: Main simulation orchestrator
2. **`simulate_single_rule`**: Single rule simulation
3. **`plan_rule_transfers`**: Transfer planning
4. **`calculate_funding_amount`**: Amount calculation
5. **`calculate_priority_fill_amount`**: Priority fill logic
6. **`calculate_transfer_impact`**: Impact calculation

### Rule Types Supported

- `fixed_amount`: Fixed dollar amount transfers
- `percentage`: Percentage-based transfers
- `priority_fill`: Fill envelope to monthly amount
- `split_remainder`: Split remaining cash evenly
- `conditional`: Conditional rule execution

## Future Enhancements

- Add caching layer for analytics results
- Implement rate limiting
- Add authentication/authorization
- Add request logging and monitoring
- Expand analytics capabilities (budgeting AI, spending insights)
- Machine learning models for smart funding recommendations
- Optimization algorithms for rule ordering
- Advanced scheduling logic
- Rule conflict detection
