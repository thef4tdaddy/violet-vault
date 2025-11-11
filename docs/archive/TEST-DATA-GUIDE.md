# Violet Vault Test Data Guide

This guide explains how to use the comprehensive test data files for testing Violet Vault's import/export functionality.

## Overview

The test data provides a complete, realistic budget scenario that covers all major features of Violet Vault. This allows developers and testers to quickly populate the application with meaningful data for testing, development, and demonstration purposes.

## Test Data Location

The test data is located at:

```
/public/test-data/violet-vault-test-budget.json
```

This location makes it easily accessible for:

- Manual testing via the import UI
- Automated testing scripts
- Development environment setup
- Demo/showcase scenarios

## What's Included

The test budget includes comprehensive data across all Violet Vault features:

### Budget Envelopes (10 items)

- Groceries ($425.50/$600 target)
- Gas & Fuel ($180.25/$300 target)
- Rent ($1,500/$1,500 target)
- Utilities ($220/$250 target)
- Entertainment ($125.75/$200 target)
- Healthcare ($150/$200 target)
- Pet Care ($95.50/$150 target)
- Emergency Fund ($2,500/$10,000 target)
- Personal Care ($75/$100 target)
- Gifts & Donations ($50/$150 target)

### Bills (6 items)

- Monthly Rent ($1,500)
- Electric Bill ($85.50)
- Internet Service ($79.99)
- Car Insurance ($125.00)
- Cell Phone ($55.00)
- Streaming Services ($24.99)

### Transactions (12 items)

Realistic transactions with merchants including:

- Grocery shopping at Kroger, Costco, Whole Foods
- Gas purchases at Shell, Chevron
- Entertainment at AMC Theaters, Steam
- Pet care at PetSmart
- Healthcare at Walgreens
- Personal care services
- Charitable donations

### Savings Goals (5 items)

- Summer Vacation: $850/$3,000 (high priority)
- New Laptop: $600/$1,500 (medium priority)
- Car Down Payment: $2,100/$5,000 (high priority)
- Home Repair Fund: $450/$2,000 (medium priority)
- Holiday Shopping: $200/$800 (low priority)

### Debts (4 items)

- Chase Freedom Credit Card: $2,850 @ 18.99% APR
- Federal Student Loan: $12,500 @ 4.53% APR
- Auto Loan (Honda Civic): $8,750 @ 5.25% APR
- Personal Loan: $3,200 @ 12.50% APR

### Supplemental Accounts (3 items)

- Health Savings Account (HSA): $3,250.75
- Flexible Spending Account (FSA): $875.00
- Commuter Benefits: $150.00

### Paycheck History (3 entries)

Three biweekly paychecks with:

- Gross amount: $2,500 each
- Allocations to all envelopes
- Realistic deductions (taxes, 401k, insurance)

### Audit Log (8 entries)

Sample change history showing:

- Envelope creation
- Bill setup
- Transaction recording
- Debt tracking
- Savings goal creation
- Payment processing

## How to Import Test Data

### Via UI (Manual Testing)

1. **Open Violet Vault** in your browser
2. **Navigate to Settings** → Click the gear icon or settings menu
3. **Go to Data Management** → Find the "Data Management" section
4. **Click Import Data** → Click the "Import Data" button
5. **Select File** → Choose `violet-vault-test-budget.json`
6. **Review Summary** → Check the import preview showing:
   - 10 envelopes
   - 6 bills
   - 12 transactions
   - 5 savings goals
   - 4 debts
   - 3 supplemental accounts
   - 3 paycheck history entries
   - 8 audit log entries
7. **Confirm Import** → Click "Import Data" to load the test data
8. **Verify** → Navigate through the app to verify all data loaded correctly

### Via Code (Automated Testing)

```typescript
import { validateImportedData } from "@/utils/dataManagement/validationUtils";

// Load test data
const testData = await fetch("/test-data/violet-vault-test-budget.json").then((res) => res.json());

// Validate structure
const { validatedData } = validateImportedData(testData, currentUser);

// Import to database
await importDataToDexie(validatedData);
```

### Via Development Scripts

```bash
# Copy test data to local development
cp public/test-data/violet-vault-test-budget.json /tmp/import-test.json

# Import via CLI (if available)
npm run import-test-data /tmp/import-test.json
```

## Testing Scenarios

Use this test data to verify:

### 1. Import/Export Functionality

- ✓ All data types import correctly
- ✓ Relationships maintained (envelopes ↔ transactions)
- ✓ Data can be exported and re-imported without loss
- ✓ Encryption context changes handled properly

### 2. UI Display

- ✓ Dashboard shows correct summary cards
- ✓ Envelope list displays all envelopes
- ✓ Bills calendar shows upcoming bills
- ✓ Transaction history displays correctly
- ✓ Savings goals show progress bars
- ✓ Debt tracker displays all debts
- ✓ Supplemental accounts visible

### 3. Calculations

- ✓ Total budget calculations accurate
- ✓ Envelope balances correct
- ✓ Savings goal progress percentages
- ✓ Debt payoff projections
- ✓ Biweekly allocation totals
- ✓ Unassigned cash calculations

### 4. Business Logic

- ✓ Bill payments update envelope balances
- ✓ Transactions deduct from envelopes
- ✓ Recurring bills generate correctly
- ✓ Savings goal contributions track
- ✓ Debt minimum payments calculate
- ✓ Paycheck allocations distribute

### 5. Edge Cases

- ✓ Large number of transactions (12+)
- ✓ Multiple debts tracked simultaneously
- ✓ Various bill frequencies (monthly, quarterly, annually)
- ✓ Different transaction types (income, expense, transfer)
- ✓ Mixed priority levels for savings goals
- ✓ Various debt types (credit card, loan, student)

## Modifying Test Data

You can customize the test data for specific testing scenarios:

### Add More Transactions

```json
{
  "id": "txn-013",
  "date": "2025-01-15",
  "amount": 42.99,
  "envelopeId": "env-001-groceries",
  "category": "Food & Dining",
  "type": "expense",
  "description": "Restaurant dinner",
  "merchant": "Local Restaurant"
}
```

### Add New Envelope

```json
{
  "id": "env-011-new",
  "name": "New Envelope",
  "category": "Other",
  "archived": false,
  "currentBalance": 100.0,
  "targetAmount": 200,
  "lastModified": 1735995461000
}
```

### Test Different Amounts

Adjust `currentBalance` values to test:

- Negative balances (overspending)
- Zero balances (empty envelopes)
- Large balances (significant savings)
- Target vs actual variations

## Data Validation

The test data is validated against Zod schemas:

- ✓ All required fields present
- ✓ Correct data types
- ✓ Valid ranges (amounts ≥ 0, etc.)
- ✓ Proper relationships (envelope IDs valid)
- ✓ Valid categories
- ✓ Proper date formats

## Best Practices

### For Developers

1. **Start Fresh**: Clear existing data before importing test data
2. **Test Scenarios**: Use test data for each feature branch
3. **Verify Calculations**: Check that totals match expected values
4. **Test Export**: Export after import to verify roundtrip

### For Testers

1. **Multiple Imports**: Test importing multiple times
2. **Data Modification**: Edit imported data and verify persistence
3. **Edge Cases**: Test with modified test data (edge values)
4. **Performance**: Measure import/load times with test data

### For Demos

1. **Clean State**: Import fresh test data before demos
2. **Realistic Scenario**: Test data represents typical budget
3. **Visual Appeal**: Amounts and descriptions are realistic
4. **Feature Coverage**: All features have example data

## Troubleshooting

### Import Fails

- Verify JSON is valid: `cat test-data.json | json_pp`
- Check console for validation errors
- Ensure all required fields present
- Verify envelope IDs match in transactions

### Missing Data

- Check import summary for counts
- Verify relationships (envelope IDs, etc.)
- Look for validation errors in console
- Check audit log for import events

### Incorrect Calculations

- Verify transaction amounts
- Check envelope target amounts
- Validate savings goal calculations
- Review debt interest rates

## Related Documentation

- [Import/Export Feature Documentation](./import-export.md)
- [Data Validation Guide](./data-validation.md)
- [Testing Guide](./testing-guide.md)
- [Development Setup](../README.md)

## File Structure Reference

```
public/test-data/
├── violet-vault-test-budget.json  # Main test data file
├── sample-receipts/                # Sample receipt images for OCR testing
│   ├── grocery-receipt-1.jpg      # Standard grocery store receipt
│   ├── gas-station-receipt.jpg    # Gas station receipt
│   ├── restaurant-receipt.jpg     # Restaurant receipt with tip
│   └── README.md                  # Receipt samples documentation
└── README.md                       # Test data documentation
```

## Sample Receipt Images

Sample receipt images are provided in the `/public/test-data/sample-receipts/` directory for testing the OCR receipt scanning workflow.

### Available Sample Receipts

1. **grocery-receipt-1.jpg** - Standard grocery store receipt
   - Merchant: Local Supermarket
   - Total: $67.42
   - Multiple line items with clear text
   - Good for testing multi-item extraction

2. **gas-station-receipt.jpg** - Gas station receipt
   - Merchant: Shell Gas Station
   - Total: $45.89
   - Simple format, single item
   - Good for testing basic OCR accuracy

3. **restaurant-receipt.jpg** - Restaurant receipt with tip
   - Merchant: Local Restaurant
   - Subtotal, tax, and tip breakdown
   - Good for testing field extraction

### Using Sample Receipts

#### Via Import Modal

1. **Open Import Modal** → Navigate to Transactions and click "Import"
2. **Click "Scan Receipt"** → Opens receipt scanner interface
3. **Upload Sample Receipt** → Choose one of the sample images
4. **Review Extracted Data** → Verify OCR results with confidence indicators
5. **Adjust if Needed** → Manual entry fallback available
6. **Confirm Import** → Transaction created from receipt data

#### Via Receipt Scanner Directly

1. **Open Transaction Form** → Click "+" to add new transaction
2. **Click Receipt Icon** → Opens receipt scanner
3. **Upload Sample** → Select a sample receipt image
4. **Processing** → OCR extracts merchant, total, date, items
5. **Review & Confirm** → Check confidence scores and edit if needed

### OCR Testing Scenarios

Use sample receipts to test:

- ✓ Image upload and preview
- ✓ OCR accuracy for different receipt formats
- ✓ Confidence indicator display
- ✓ Manual correction workflow
- ✓ Field mapping to transaction data
- ✓ Performance metrics (processing time)
- ✓ Privacy settings (save raw text, encryption)
- ✓ Idle preloading performance

### Performance Expectations

- **First Scan**: 2-5 seconds (includes Tesseract initialization)
- **Subsequent Scans**: 1-3 seconds (worker already initialized)
- **With Preloading**: < 2 seconds (optimal performance)

### Creating Custom Test Receipts

To add your own test receipts:

1. Use clear, high-contrast images (JPG or PNG)
2. Ensure text is legible and not blurry
3. Keep file size under 5MB
4. Name descriptively: `merchant-type-description.jpg`
5. Add to `/public/test-data/sample-receipts/`

## File Structure Reference

```
public/test-data/
├── violet-vault-test-budget.json  # Main test data file
└── README.md                       # Test data documentation
```

## Version Information

- **Test Data Version**: 2.0
- **Compatible App Version**: 1.8.0+
- **Data Format**: Violet Vault Export Format v2.0
- **Last Updated**: 2025-01-04

## Feedback

If you encounter issues with the test data or have suggestions for additional test scenarios, please:

1. Open an issue on GitHub
2. Label it with `test-data` and `testing`
3. Describe the scenario or problem
4. Suggest modifications to test data

## Summary

The Violet Vault test data provides a comprehensive, realistic budget scenario that:

- Covers all major features (envelopes, bills, transactions, debts, savings, etc.)
- Uses realistic amounts and descriptions
- Includes proper relationships between entities
- Validates against all schemas
- Serves as an excellent starting point for testing and development

Use this test data to quickly set up a functional budget for testing, development, and demonstration purposes.
