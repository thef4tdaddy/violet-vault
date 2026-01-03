# Test Data for Import API

This directory contains sample CSV and JSON files for testing the Go streaming import service.

## Test Files

### 1. `sample-transactions.csv`

- Standard format with common field names
- Contains 10 transactions (mix of income and expenses)
- Uses various amount formats ($, parentheses for negatives)
- Tests: Date, Description, Amount, Category, Merchant fields

### 2. `bank-export.csv`

- Simulates a typical bank export format
- Uses different field names (Transaction Date, Payee, Amount)
- Tests auto-detection of field mapping
- Contains 5 transactions

### 3. `transactions.json`

- JSON array format
- Contains 5 transactions
- Uses negative numbers for expenses
- Tests JSON parsing capability

### 4. `invalid-rows.csv`

- Contains intentional validation errors
- Tests error handling and validation:
  - Invalid date format (2024-13-45)
  - Missing amount value
  - Future date (2025-12-31)
  - Non-numeric amount ("not a number")
- Should return 2 valid and 4 invalid transactions

## Usage Examples

### Test with cURL

```bash
# Test with sample transactions
curl -X POST http://localhost:3000/api/import \
  -F "file=@api/test-data/sample-transactions.csv"

# Test with bank export format
curl -X POST http://localhost:3000/api/import \
  -F "file=@api/test-data/bank-export.csv"

# Test with JSON format
curl -X POST http://localhost:3000/api/import \
  -F "file=@api/test-data/transactions.json"

# Test validation errors
curl -X POST http://localhost:3000/api/import \
  -F "file=@api/test-data/invalid-rows.csv"
```

### Test with Custom Field Mapping

```bash
curl -X POST http://localhost:3000/api/import \
  -F "file=@api/test-data/bank-export.csv" \
  -F 'fieldMapping={"date":"Transaction Date","description":"Payee","amount":"Amount","category":"Category"}'
```

## Expected Results

### sample-transactions.csv

```json
{
  "success": true,
  "transactions": [
    /* 10 transactions */
  ],
  "invalid": [],
  "message": "Successfully processed 10 transactions (0 invalid)"
}
```

### invalid-rows.csv

```json
{
  "success": true,
  "transactions": [
    /* 2 valid transactions */
  ],
  "invalid": [
    {
      "index": 1,
      "row": "2024-13-45,Invalid Date,$25.00,Dining",
      "errors": ["Invalid date format: unable to parse date: 2024-13-45"]
    },
    {
      "index": 2,
      "row": "2024-01-17,Missing Amount,,Transportation",
      "errors": ["Amount is required"]
    },
    {
      "index": 3,
      "row": "2025-12-31,Future Date,$100.00,Shopping",
      "errors": ["Future dates are not allowed"]
    },
    {
      "index": 4,
      "row": "2024-01-20,Valid Transaction 2,not a number,Utilities",
      "errors": ["Invalid amount: strconv.ParseFloat: parsing \"not a number\": invalid syntax"]
    }
  ],
  "message": "Successfully processed 2 transactions (4 invalid)"
}
```

## Creating Your Own Test Files

### CSV Format

```csv
Date,Description,Amount,Category
2024-01-15,Coffee,$5.99,Dining
2024-01-16,Salary,$2000.00,Income
```

### JSON Format

```json
[
  {
    "date": "2024-01-15",
    "description": "Coffee",
    "amount": -5.99,
    "category": "Dining"
  }
]
```

## Validation Rules

The import service validates:

- ✅ Date must be valid and not in the future (>24 hours)
- ✅ Amount must be a valid number
- ✅ Required fields: date, amount
- ✅ Optional fields: description, category, merchant, notes

## Notes

- All test files are safe to commit to the repository
- No sensitive or real financial data is included
- Files demonstrate various formats and edge cases
- Use these files to test the API during development
