# 🧾 Receipt Scanning System (Phase 1 - MVP)

This implements the foundation of the Universal OCR System as outlined in GitHub issue #116. The current implementation covers Phase 1 (MVP) functionality with basic receipt processing and transaction creation.

## 📋 What's Implemented

### Core Components

1. **`OCRProcessor`** (`src/utils/ocrProcessor.js`)
   - Tesseract.js integration for client-side OCR
   - Pattern matching for receipts (merchant, amount, date, tax, items)
   - Confidence scoring and data validation
   - Optimized for receipt processing

2. **`ReceiptScanner`** (`src/components/receipts/ReceiptScanner.jsx`)
   - File upload and camera capture support
   - Drag & drop interface
   - Real-time OCR processing with progress indicators
   - Extracted data display with confidence indicators

3. **`ReceiptToTransactionModal`** (`src/components/receipts/ReceiptToTransactionModal.jsx`)
   - 3-step wizard: Edit data → Select envelope → Confirm
   - Smart envelope suggestions based on merchant
   - Transaction creation with receipt attachment

4. **`ReceiptButton`** (`src/components/receipts/ReceiptButton.jsx`)
   - Configurable button component (primary, secondary, icon, fab)
   - OCR preloading for better performance
   - Integration with existing UI components

5. **`useReceipts` Hook** (`src/hooks/useReceipts.js`)
   - Full CRUD operations for receipts
   - TanStack Query integration with caching
   - Receipt-to-transaction linking
   - Search and filtering utilities

### Database Integration

- **New receipts table** (schema version 8):
  ```sql
  receipts: "id, merchant, amount, date, transactionId, imageData, ocrData, processingStatus, lastModified, [date+amount], [merchant+date], [transactionId], [processingStatus]"
  ```
- **Query keys** added to `queryClient.js` for caching
- **Clear data** function updated to include receipts

### UI Integration

- **Transaction Form**: Receipt scanning option appears for new transactions
- **Smart suggestions**: Auto-suggests envelopes based on merchant patterns
- **Visual feedback**: Confidence indicators, processing states, error handling

## 🎯 Key Features

### Privacy & Security

- ✅ **Client-side only**: All OCR processing happens in the browser
- ✅ **No cloud services**: Never sends images to external APIs
- ✅ **Encrypted storage**: Receipt data stored in encrypted IndexedDB

### User Experience

- ✅ **Mobile-first**: Camera capture support for mobile devices
- ✅ **Drag & drop**: Desktop-friendly file upload
- ✅ **Progressive enhancement**: Works without OCR if needed
- ✅ **Smart defaults**: Auto-fills form fields from extracted data

### Technical Performance

- ✅ **Lazy loading**: OCR worker initialized on first use
- ✅ **Bundle optimization**: +43KB for full OCR functionality
- ✅ **Error handling**: Graceful degradation for failed processing
- ✅ **Caching**: TanStack Query for receipt data management

## 📊 Pattern Recognition

The OCR system recognizes these patterns from receipts:

### Financial Data

- **Total amounts**: `total: $25.99`, `amount: $25.99`
- **Tax**: `tax: $2.08`, `sales tax: $2.08`
- **Subtotal**: `subtotal: $23.91`
- **Date formats**: `12/25/2023`, `Dec 25, 2023`, `2023-12-25`

### Merchant Detection

- **All caps lines**: `WALMART SUPERCENTER`
- **Title case**: `Target Store #1234`
- **Common patterns**: Filters out obvious non-merchant text

### Line Items

- **Item + price**: `Bananas $3.45`
- **Filtering**: Removes totals, taxes, and system text
- **Quantity detection**: Basic quantity/price parsing

## 🔗 Integration Points

### Transaction System

- Creates transaction with extracted receipt data
- Links receipt to transaction for audit trail
- Supports editing extracted data before saving

### Envelope System

- Smart envelope suggestions based on merchant
- Category auto-detection for common merchants
- Balance checking before transaction creation

### Analytics Integration

- Receipt data contributes to spending analytics
- Merchant-based categorization for insights
- Historical receipt search and filtering

## 🚀 Usage Examples

### Basic Receipt Scan

```jsx
import ReceiptButton from "./components/receipts/ReceiptButton";

// Simple button integration
<ReceiptButton
  onTransactionCreated={(transaction, receipt) => {
    console.log("Receipt processed:", receipt);
    console.log("Transaction created:", transaction);
  }}
/>;
```

### Custom Integration

```jsx
import { processReceiptImage } from "./utils/ocrProcessor";

const handleReceiptUpload = async (file) => {
  try {
    const result = await processReceiptImage(file);
    console.log("Extracted data:", result);

    if (result.total && result.merchant) {
      // Create transaction automatically
    }
  } catch (error) {
    console.error("OCR failed:", error);
  }
};
```

## 📈 Performance Metrics

- **OCR Processing**: ~3-8 seconds for typical receipts
- **Bundle Size Impact**: +43KB (2,158KB → 2,201KB)
- **Accuracy**: High confidence for amounts/dates, medium for merchants
- **Memory Usage**: ~50MB during OCR processing (temporary)

## 🛣️ Next Steps (Phase 2)

Based on user feedback and testing:

1. **Enhanced Patterns**: Improve merchant and item detection
2. **Multiple Formats**: Support for bank statements, bills, etc.
3. **Batch Processing**: Handle multiple receipts at once
4. **ML Improvements**: Learn from user corrections
5. **Advanced UI**: Receipt gallery, search, and management

## 🐛 Known Limitations

- **Image quality**: Requires reasonably clear receipt images
- **Handwriting**: Limited handwriting recognition
- **Complex layouts**: Multi-column receipts may have issues
- **Languages**: English only in current implementation
- **Memory usage**: Large images may cause performance issues

## 📱 Testing Notes

To test the receipt scanning:

1. Use the "Scan Receipt" button in the transaction form
2. Try both file upload and camera capture
3. Test with various receipt formats and quality levels
4. Verify transaction creation and receipt attachment
5. Check envelope suggestions for known merchants

The system gracefully handles errors and provides feedback throughout the process.
