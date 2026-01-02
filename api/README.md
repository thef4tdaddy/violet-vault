# VioletVault v2.0 Polyglot Backend

This directory contains serverless functions for the VioletVault v2.0 polyglot backend architecture.

## Architecture

The backend is split between Go and Python for optimal performance and maintainability:

- **Go**: Handles bug report proxy (GitHub API) and high-performance streaming imports.
- **Python**: Handles financial intelligence (payday prediction, merchant categorization, autofunding simulation).

### Python Structure

```
api/
├── __init__.py              # Main API module
├── requirements.txt         # Python dependencies
├── autofunding/             # Autofunding module
│   ├── index.py             # Main autofunding endpoint (Vercel handler)
│   ├── __init__.py          # Module exports
│   ├── models.py            # Pydantic models (data validation)
│   ├── simulation.py        # Core simulation logic
│   ├── rules.py             # Rule processing utilities
│   ├── currency.py          # Currency utilities
│   └── conditions.py        # Condition evaluation utilities
└── analytics/               # Analytics module
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
    "userAgent": "..."
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

### 2. Import API - Streaming Service (`import.go`)

**Endpoint**: `POST /api/import`

**Purpose**: High-performance Go-based serverless function for parsing and validating large CSV/JSON transaction imports. Reads input streams line-by-line to minimize memory usage.

**Features**:

- **Streaming Parse**: Line-by-line parsing for large files
- **CSV & JSON Support**: Handles both formats
- **Auto Field Detection**: Detects date, amount, description, etc.
- **Validation**: Filters invalid rows directly in stream

**Request**:
Multipart Form Data:

- `file`: CSV or JSON file
- `fieldMapping`: Optional JSON string mapping fields

**Response**:

```json
{
  "success": true,
  "transactions": [ ... ],
  "invalid": [ ... ],
  "message": "Successfully processed 150 transactions"
}
```

### 3. Analytics Engine

The analytics functionality is split into separate endpoints for better performance and reduced cold-start times on Vercel:

#### 3a. Payday Prediction (`analytics/prediction.py`)

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

#### 3b. Merchant Categorization (`analytics/categorization.py`)

**Endpoint**: `POST /api/analytics/categorization`

**Purpose**: Analyze merchant patterns and suggest envelope budgets.

**Request**:

```json
{
  "transactions": [
    { "description": "Starbucks Coffee", "amount": -5.5 },
    { "description": "Amazon.com", "amount": -45.0 }
  ],
  "monthsOfData": 3
}
```

#### 3c. AutoFunding Simulation (`autofunding/index.py`)

**Endpoint**: `POST /api/autofunding`

**Purpose**: Simulates the execution of AutoFunding rules without making actual changes.

**Request Payload**:

```json
{
  "rules": [ ... ],
  "context": {
    "data": {
      "unassignedCash": 1000,
      "envelopes": [ ... ]
    },
    "trigger": "manual"
  }
}
```

## Development

### Prerequisites

- Go 1.22+
- Python 3.12+
- Node.js 18+

### Setup

```bash
# Go
cd api
go mod download
go test ./...

# Python
pip install -r api/requirements.txt
ruff check api/
mypy -p api
```

### Multi-Language Verification

Run the full salvo script to verify all languages:

```bash
./scripts/full_salvo.sh
```

## Deployment

### Vercel

The API functions are deployed as Vercel serverless functions.

- `api/*.go` -> Go Runtime
- `api/**/*.py` -> Python Runtime (configured in `vercel.json`)
