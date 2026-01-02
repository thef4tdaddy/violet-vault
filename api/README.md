# VioletVault Analytics API

Python-based analytics service for VioletVault, providing heavy compute endpoints for budget data analysis.

## Overview

This service implements the "Polyglot Backend" architecture for VioletVault, handling computationally intensive tasks that are better suited for Python than JavaScript/TypeScript.

## Features

### Envelope Integrity Audit

Analyzes budget data snapshots for integrity violations:

- **Orphaned Transactions**: Detects transactions pointing to non-existent envelopes
- **Negative Balances**: Identifies envelopes with negative balances (with severity based on envelope type)
- **Balance Leakage**: Verifies that sum of envelope balances + unassigned cash equals total account balance

## Setup

### Prerequisites

- Python 3.11 or higher
- pip

### Installation

1. **Create virtual environment:**

```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

### Running the Service

**Development mode:**

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:

- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI schema**: http://localhost:8000/openapi.json

## Endpoints

### `POST /audit/envelope-integrity`

Performs integrity audit on budget data snapshot.

**Request Body:**

```json
{
  "envelopes": [
    {
      "id": "env-1",
      "name": "Groceries",
      "category": "Food",
      "archived": false,
      "lastModified": 1672531200000,
      "currentBalance": 500.00
    }
  ],
  "transactions": [
    {
      "id": "txn-1",
      "date": "2024-01-01",
      "amount": -50.00,
      "envelopeId": "env-1",
      "category": "Food",
      "type": "expense",
      "lastModified": 1672531200000,
      "description": "Grocery shopping"
    }
  ],
  "metadata": {
    "id": "budget-1",
    "lastModified": 1672531200000,
    "actualBalance": 1000.00,
    "unassignedCash": 500.00
  }
}
```

**Response:**

```json
{
  "violations": [
    {
      "severity": "error",
      "type": "balance_leakage",
      "message": "Balance leakage detected...",
      "entityId": "budget-1",
      "entityType": "budget",
      "details": {
        "actualBalance": 1000.00,
        "expectedBalance": 1000.00,
        "discrepancy": 0.00
      }
    }
  ],
  "summary": {
    "total": 1,
    "by_severity": {
      "error": 1,
      "warning": 0,
      "info": 0
    },
    "by_type": {
      "balance_leakage": 1
    }
  },
  "timestamp": "2024-01-01T12:00:00.000000",
  "snapshotSize": {
    "envelopes": 1,
    "transactions": 1,
    "metadata": 1
  }
}
```

### `GET /health`

Health check endpoint for service monitoring.

**Response:**

```json
{
  "status": "healthy",
  "service": "VioletVault Analytics API",
  "version": "1.0.0",
  "endpoints": {
    "audit": "/audit/envelope-integrity"
  }
}
```

## Data Models

### Envelope

Represents budget allocation containers (e.g., "Groceries", "Gas"). Mirrors TypeScript schema from `src/domain/schemas/envelope.ts`.

### Transaction

Represents financial operations (income, expenses, transfers). Mirrors TypeScript schema from `src/domain/schemas/transaction.ts`.

### BudgetMetadata

High-level budget information including total balance and unassigned cash. Mirrors TypeScript schema from `src/domain/schemas/budget-record.ts`.

## Integration with Frontend

The frontend can call this service to perform integrity audits:

```typescript
// Example TypeScript/React integration
const performIntegrityAudit = async () => {
  const snapshot = {
    envelopes: await db.envelopes.toArray(),
    transactions: await db.transactions.toArray(),
    metadata: await db.budgetRecords.get('main'),
  };

  const response = await fetch('http://localhost:8000/audit/envelope-integrity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  });

  const result = await response.json();
  return result;
};
```

## Development

### Project Structure

```
api/
├── __init__.py              # Package initialization
├── main.py                  # FastAPI application
├── models.py                # Pydantic data models
├── requirements.txt         # Python dependencies
├── analytics/
│   ├── __init__.py
│   └── audit.py            # Integrity audit logic
└── README.md               # This file
```

### Adding New Analytics Endpoints

1. Create logic in `api/analytics/`
2. Define request/response models in `api/models.py`
3. Add endpoint to `api/main.py`
4. Update this README

## Testing

### Manual Testing

Run the included test script:

```bash
# From repository root
python api/test_audit.py

# Or with the virtual environment
api/venv/bin/python api/test_audit.py
```

Test using curl:

```bash
# Health check
curl http://localhost:8000/health

# Integrity audit (example)
curl -X POST http://localhost:8000/audit/envelope-integrity \
  -H "Content-Type: application/json" \
  -d @api/test_snapshot_valid.json
```

### Future Improvements

- Add pytest-based unit tests
- Add integration tests
- Add CI/CD pipeline for Python service

## Architecture

This service implements the "Polyglot Backend" architecture mentioned in `GEMINI.md`:

- **Python**: Heavy compute tasks like data analysis, audits, and future ML features
- **TypeScript/React**: UI and client-side logic
- **Firebase**: Cloud storage and real-time sync

## Future Enhancements

- [ ] Add unit tests with pytest
- [ ] Add ML-based spending predictions
- [ ] Add budget optimization recommendations
- [ ] Add transaction pattern analysis
- [ ] Add Docker deployment configuration
- [ ] Add production deployment documentation
- [ ] Add authentication/authorization
- [ ] Add rate limiting
- [ ] Add caching for expensive operations

## License

Same as parent project - CC BY-NC-SA 4.0
