# Sample Receipt Images for OCR Testing

## Overview

This directory contains sample receipt images for testing the OCR receipt scanning functionality in Violet Vault. These images can be used for:

- Manual testing of the receipt scanner
- Automated testing of OCR accuracy
- Demonstrating the receipt scanning feature
- Debugging OCR extraction issues

## Available Samples

Currently, this directory contains placeholders for sample receipts. To add actual receipt images:

### 1. Creating Test Receipts

You can create test receipts in several ways:

#### Option A: Use Real Receipt Images
1. Take photos of actual receipts (remove sensitive information)
2. Ensure clear, high-contrast images
3. Save as JPG or PNG format
4. Name descriptively: `{merchant}-{type}-{description}.jpg`

Example: `grocery-store-sample-1.jpg`

#### Option B: Generate Synthetic Receipts
1. Use receipt generator tools online
2. Create realistic-looking receipts with test data
3. Export as high-resolution images
4. Ensure text is clear and legible

#### Option C: Use Sample Receipt Templates
1. Create receipts using image editing software
2. Use receipt templates from design resources
3. Add realistic merchant names and amounts
4. Export as JPG or PNG

### 2. Image Requirements

For optimal OCR performance:

- **Format**: JPG or PNG
- **Resolution**: 1200x1600 pixels or higher
- **File Size**: < 5MB per image
- **Text Quality**: Clear, high contrast, non-blurry
- **Orientation**: Portrait (vertical)
- **Background**: Clean, minimal noise

### 3. Recommended Test Receipts

Create receipts covering these scenarios:

1. **Simple Receipt** (`simple-receipt.jpg`)
   - Single merchant
   - 1-3 line items
   - Clear total amount
   - Good for basic OCR testing

2. **Grocery Receipt** (`grocery-receipt.jpg`)
   - Multiple line items (5-10)
   - Subtotal, tax, total breakdown
   - Store name and date
   - Good for multi-item extraction

3. **Restaurant Receipt** (`restaurant-receipt.jpg`)
   - Food items with prices
   - Subtotal, tax, tip
   - Total amount
   - Good for tip calculation testing

4. **Gas Station Receipt** (`gas-receipt.jpg`)
   - Simple format
   - Single transaction
   - Date and time
   - Good for date/time extraction

5. **Complex Receipt** (`complex-receipt.jpg`)
   - Many line items (15+)
   - Multiple categories
   - Discounts and promotions
   - Good for stress testing OCR

## Using Sample Receipts

### Via Import Modal

1. **Open Violet Vault** in browser
2. **Navigate to Transactions** → Click "Import Transactions"
3. **Click "SCAN RECEIPT"** → Opens receipt scanner
4. **Upload sample image** → Select from this directory
5. **Review extracted data** → Check OCR accuracy
6. **Confirm or edit** → Create transaction from receipt

### Via Receipt Button (Transaction Form)

1. **Open Transaction Form** → Click "+" to add transaction
2. **Click Receipt Icon** → Opens receipt scanner
3. **Upload sample** → Select receipt image
4. **Process** → OCR extracts data
5. **Review & Confirm** → Verify accuracy

## Privacy & Security

When using real receipts:

- **Redact Personal Info**: Remove names, addresses, phone numbers
- **Redact Card Info**: Remove credit card numbers, partial card digits
- **Redact Sensitive Items**: Remove potentially sensitive purchases
- **Use Test Data**: Prefer synthetic/generated receipts when possible

---

**Note**: Actual sample receipt images are not included in the repository by default. Follow the instructions above to create or add your own test receipts.
