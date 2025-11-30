# Violet Vault Test Data

This directory contains comprehensive test data files for testing the import/export functionality of Violet Vault.

## Test Files

### `violet-vault-test-budget.json`

A basic test budget file containing minimal realistic data for quick testing.

### `violet-vault-test-budget-enhanced.json` ⭐ **RECOMMENDED**

A comprehensive test budget file with 236+ transactions over 6 months and full entity connections for thorough testing.

**Enhanced Data Included:**

- **14 Envelopes**: 10 regular + 4 debt payment envelopes with full connections
- **10 Bills**: 6 regular + 4 debt payment bills (all connected to envelopes)
- **236+ Transactions**: 6 months of realistic transactions (Aug 2024 - Jan 2025)
- **5 Savings Goals**: Various priorities and target dates
- **3 Supplemental Accounts**: HSA, FSA, and Commuter Benefits
- **4 Debts**: All connected to envelopes and bills for tracking payments
- **3 Paycheck History Entries**: Biweekly paychecks with allocations
- **8 Audit Log Entries**: Sample change history

**Basic Data (original file):**

- **10 Envelopes**, **6 Bills**, **12 Transactions**
- **5 Savings Goals**, **3 Supplemental Accounts**, **4 Debts**
- **3 Paycheck History Entries**, **8 Audit Log Entries**

**Budget Summary:**

- Total envelope balances: $5,322.00
- Total savings goals progress: $4,200.00 / $12,300.00
- Total debts: $27,300.00
- Unassigned cash: $450.25
- Actual balance: $5,822.00

## Entity Connections (Enhanced File)

The enhanced test data includes proper relationships between all entities:

**Debt → Envelope → Bill → Transaction Chain:**

- `debt-001-credit-card` → `env-debt-001-cc` → `bill-debt-001-cc` → Monthly payment transactions
- `debt-002-student-loan` → `env-debt-002-student` → `bill-debt-002-student` → Monthly payment transactions
- `debt-003-car-loan` → `env-debt-003-auto` → `bill-debt-003-auto` → Monthly payment transactions
- `debt-004-personal-loan` → `env-debt-004-personal` → `bill-debt-004-personal` → Monthly payment transactions

**Connection Fields:**

- **Debt**: `envelopeId` points to payment envelope
- **Bill**: `envelopeId` points to funding envelope, `debtId` points to associated debt
- **Envelope**: `billId` points to connected bill, `debtId` points to connected debt
- **Transaction**: `envelopeId` points to envelope, bill payments also have `billId`

This allows testing:

- Debt payment tracking across all pages
- Bill-to-envelope fund allocation
- Transaction filtering by debt/bill/envelope
- Analytics with full relationship data

## How to Use

### Testing the Import Feature

1. **Navigate to Settings**: Open Violet Vault and go to the Settings menu
2. **Find Data Management**: Navigate to the "Data Management" section
3. **Click Import Data**: Click the "Import Data" button or file upload field
4. **Select Test File**: Choose either:
   - `violet-vault-test-budget-enhanced.json` (recommended - 236+ transactions, full connections)
   - `violet-vault-test-budget.json` (basic - 12 transactions, minimal data)
5. **Confirm Import**: Review the import summary and confirm to load the test data
6. **Verify Data**: Check that all envelopes, bills, transactions, debts, and savings goals loaded correctly

### Testing the Export Feature

1. **Load Test Data**: First import the test budget file (see above)
2. **Navigate to Settings**: Go to the Settings menu
3. **Find Data Management**: Navigate to the "Data Management" section
4. **Click Export Data**: Click the "Export Data" button
5. **Save Export**: Your browser will download a JSON file with the current budget data
6. **Compare Files**: You can compare the exported file with the original to verify data integrity

## File Structure

The JSON file follows the Violet Vault export format:

```json
{
  "envelopes": [...],           // Budget envelopes/categories
  "bills": [...],               // Recurring and one-time bills
  "transactions": [...],        // Pure transactions (no bills)
  "allTransactions": [...],     // Combined transactions + bills
  "savingsGoals": [...],        // Savings targets with progress
  "supplementalAccounts": [...], // HSA, FSA, commuter accounts
  "debts": [...],               // Tracked debts (credit cards, loans)
  "paycheckHistory": [...],     // Income history with allocations
  "auditLog": [...],            // Change history audit trail
  "unassignedCash": 450.25,     // Cash not assigned to envelopes
  "biweeklyAllocation": 1200.00,// Biweekly funding amount
  "actualBalance": 5822.00,     // Total actual balance
  "isActualBalanceManual": false,
  "exportMetadata": {...},      // Export metadata and version info
  "_dataGuide": {...}           // Guide for understanding the data
}
```

## Data Details

### Envelopes

- **Groceries** ($425.50/$600) - Food & Dining
- **Gas & Fuel** ($180.25/$300) - Transportation
- **Rent** ($1,500/$1,500) - Housing
- **Utilities** ($220/$250) - Bills & Utilities
- **Entertainment** ($125.75/$200) - Entertainment
- **Healthcare** ($150/$200) - Health & Medical
- **Pet Care** ($95.50/$150) - Pets
- **Emergency Fund** ($2,500/$10,000) - Emergency
- **Personal Care** ($75/$100) - Personal Care
- **Gifts & Donations** ($50/$150) - Gifts & Donations

### Bills

All bills are monthly recurring with realistic amounts and due dates.

### Transactions

12 transactions spanning various categories with realistic merchants (Kroger, Shell, AMC Theaters, PetSmart, etc.).

### Savings Goals

- **Summer Vacation** ($850/$3,000) - High priority, July 2025
- **New Laptop** ($600/$1,500) - Medium priority, June 2025
- **Car Down Payment** ($2,100/$5,000) - High priority, December 2025
- **Home Repair Fund** ($450/$2,000) - Medium priority, August 2025
- **Holiday Shopping** ($200/$800) - Low priority, December 2025

### Debts

- **Credit Card** ($2,850 @ 18.99% APR) - Min payment $85
- **Student Loan** ($12,500 @ 4.53% APR) - Min payment $150
- **Auto Loan** ($8,750 @ 5.25% APR) - Min payment $285
- **Personal Loan** ($3,200 @ 12.50% APR) - Min payment $125

## Testing Scenarios

Use this test data to verify:

1. **Import Functionality**: All data types import correctly
2. **Data Integrity**: Relationships between entities are maintained (envelopes ↔ transactions)
3. **UI Display**: All UI components render correctly with populated data
4. **Calculations**: Budget totals, savings progress, debt payoff calculations
5. **Export Functionality**: Data can be exported and re-imported without loss
6. **Data Migration**: Handles version 2.0 data format correctly
7. **Encryption Context**: Handles budgetId changes during import

## Notes

- All timestamps are in milliseconds since Unix epoch
- Dates are in ISO 8601 format or YYYY-MM-DD strings
- IDs are descriptive strings for easy identification
- The data represents a realistic budget scenario for testing
- Supplemental accounts include HSA, FSA, and commuter benefits
- Audit log shows sample change tracking for debugging

## Version Information

- **App Version**: 1.8.0
- **Data Version**: 2.0
- **Data Source**: dexie (local IndexedDB)
- **Export Date**: 2025-01-04

## Modification

You can modify this file to test edge cases:

- Edit amounts to test calculations
- Add/remove entries to test list rendering
- Change dates to test date handling
- Modify IDs to test relationship handling
- Adjust categories to test filtering

After modification, re-import to test your changes.
