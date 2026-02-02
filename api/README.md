# VioletVault v2.0 Polyglot Backend

This directory contains serverless functions for the VioletVault v2.0 polyglot backend architecture.

## Architecture

The backend is split between Go and Python for optimal performance and maintainability:

- **Go**: Handles bug report proxy (GitHub API), high-performance streaming imports, and demo data generation.
- **Python**: Handles financial intelligence (payday prediction, merchant categorization, autofunding simulation, integrity audits).

### Python Structure

```bash
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
├── analytics/               # Analytics module
│   ├── audit.py             # Integrity audit logic
│   ├── prediction.py
│   └── categorization.py
└── main.py                  # FastAPI application (Dev only)
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

### 3. Demo Data Factory (`demo-factory`)

**Endpoint**: `GET /api/demo-factory`

**Purpose**: High-performance generation of realistic mock financial data for Demo Sandbox mode.

**Features**:
- **Blazing Fast**: 10k+ records in <10ms (93% faster than 100ms requirement)
- **Realistic Data**: 80+ merchant names, balanced budgets (income > expenses)
- **Zero Persistence**: All data generated in-memory, no database writes
- **TypeScript Compatible**: Matches frontend schemas exactly

**Request**:
```bash
GET /api/demo-factory?count=10000
```

**Response**:
```json
{
  "envelopes": [ ... ],
  "transactions": [ ... ],
  "bills": [ ... ],
  "generatedAt": "2026-02-02T13:47:14Z",
  "recordCount": 10000,
  "generationTimeMs": 7
}
```

See [demo-factory/README.md](./demo-factory/README.md) for full documentation.

### 4. Analytics Engine

The analytics functionality is split into separate endpoints for better performance and reduced cold-start times on Vercel:

#### 4a. Payday Prediction (`analytics/prediction.py`)

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

#### 4b. Merchant Categorization (`analytics/categorization.py`)

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

#### 4c. AutoFunding Simulation (`autofunding/index.py`)

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

#### 4d. Envelope Integrity Audit (`analytics/audit.py`)

**Endpoint**: `POST /audit/envelope-integrity`

**Purpose**: Analyzes budget data snapshots for integrity violations: usage of non-existent envelopes, negative balances, and balance leakages.

**Request Body:**

```json
{
  "envelopes": [ ... ],
  "transactions": [ ... ],
  "metadata": { ... }
}
```

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
python -m venv .venv
source .venv/bin/activate
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

### Vercel Auto-Deployment

The API functions are automatically deployed as Vercel serverless functions when code is pushed to the repository.

**Runtime Configuration** (in `vercel.json`):

- `api/**/*.go` → Go Runtime (`go1.x`)
- `api/**/*.py` → Python Runtime (`python3.12`)

**Deployment Flow:**

1. Push code to repository
2. Vercel automatically detects changes
3. Functions are built and deployed based on runtime configuration
4. No manual deployment steps required

### Environment Variables Setup

Configure the following environment variables in your Vercel project settings:

**Required for Bug Report Endpoint:**

```bash
GITHUB_TOKEN=ghp_your_personal_access_token_here
BUG_REPORT_ALLOWED_ORIGINS=https://your-production-domain.vercel.app,https://your-preview-domain.vercel.app
```

**How to Set Environment Variables in Vercel:**

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate scope:
   - **Production**: For main branch deployments
   - **Preview**: For preview deployments (develop, feature branches)
   - **Development**: For local development (optional)

**GitHub Token Setup:**

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic) with `repo` scope
3. Copy the token and add it to Vercel environment variables
4. **Never commit the token to the repository**

### API Endpoints

Once deployed, your endpoints will be available at:

- **Bug Report**: `POST https://your-domain.vercel.app/api/bug-report`
- **Analytics Prediction**: `POST https://your-domain.vercel.app/api/analytics/prediction`
- **Health Check**: `GET https://your-domain.vercel.app/api/health`

### Testing Deployment

After deployment, verify endpoints are working:

```bash
# Test health endpoint
curl https://your-domain.vercel.app/api/health

# Expected response:
# {"status":"healthy","version":"2.0.0-beta","timestamp":"...","service":"VioletVault Backend"}
```
