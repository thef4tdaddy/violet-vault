# Domain Types Integration Guide

This guide shows how to integrate the new domain types and Zod schemas with existing VioletVault code.

## Overview

The domain types provide:
- **Runtime validation** at API boundaries (Firebase/CSV import)
- **Type safety** for data transformations
- **Consistent data shapes** across the application
- **Error handling** with user-friendly messages

## Integration Points

### 1. Firebase Sync (Data Import/Export)

**Current Pattern:**
```javascript
// src/utils/dataManagement/firebaseUtils.js
const importDataFromFirebase = async (data) => {
  // Direct data usage without validation
  await budgetDb.transactions.bulkAdd(data.transactions);
};
```

**With Domain Types:**
```javascript
import { validateTransactionBatch, validateFirebaseTransaction } from '../types/index.js';

const importDataFromFirebase = async (data) => {
  // Validate before storing
  const result = validateTransactionBatch(data.transactions);
  
  if (result.success) {
    await budgetDb.transactions.bulkAdd(result.validData);
  } else {
    logger.error('Firebase import validation failed', {
      errors: result.errors,
      validCount: result.validCount,
      totalCount: result.totalCount,
    });
    
    // Handle partial success - store valid data, report errors
    if (result.validData.length > 0) {
      await budgetDb.transactions.bulkAdd(result.validData);
    }
    
    throw new ValidationError('Some transactions failed validation', result.errors);
  }
};
```

### 2. CSV Import Validation

**Current Pattern:**
```javascript
// src/hooks/common/useImportData.js
const processCSVData = (csvData) => {
  // Basic validation in validateImportedData
  return csvData.map(row => ({
    id: Date.now(),
    description: row.description,
    amount: parseFloat(row.amount),
    // ... basic transformation
  }));
};
```

**With Domain Types:**
```javascript
import { FinanceSchemas, ValidationUtils } from '../types/index.js';

const processCSVData = (csvData) => {
  const results = [];
  const errors = [];
  
  csvData.forEach((row, index) => {
    const result = ValidationUtils.safeParse(FinanceSchemas.TransactionImport, {
      id: `csv_${Date.now()}_${index}`,
      description: row.description || row.memo || '',
      amount: row.amount || '0',
      date: row.date || new Date().toISOString(),
      category: row.category || 'Other',
      // CSV schema handles flexible date formats and currency symbols
    });
    
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({
        row: index + 1,
        errors: result.formattedErrors,
        originalData: row,
      });
    }
  });
  
  return { validData: results, errors };
};
```

### 3. Form Validation

**Current Pattern:**
```javascript
// src/hooks/transactions/useTransactionForm.js
const validateTransaction = (formData) => {
  const errors = [];
  if (!formData.description) errors.push('Description required');
  if (!formData.amount || isNaN(formData.amount)) errors.push('Valid amount required');
  return { isValid: errors.length === 0, errors };
};
```

**With Domain Types:**
```javascript
import { validateTransactionForm } from '../types/index.js';

const validateTransaction = (formData) => {
  const result = validateTransactionForm(formData);
  
  return {
    isValid: result.success,
    errors: result.success ? [] : Object.values(result.formattedErrors),
    fieldErrors: result.formattedErrors || {},
    data: result.data,
  };
};
```

### 4. Database Operations

**Current Pattern:**
```javascript
// Direct database operations without validation
const saveTransaction = async (transactionData) => {
  await budgetDb.transactions.add(transactionData);
};
```

**With Domain Types:**
```javascript
import { validateTransaction } from '../types/index.js';

const saveTransaction = async (transactionData) => {
  // Validate before saving
  const result = validateTransaction(transactionData);
  
  if (!result.success) {
    throw new ValidationError('Transaction validation failed', result.formattedErrors);
  }
  
  await budgetDb.transactions.add(result.data);
  return result.data;
};
```

## Migration Strategy

### Phase 1: Add Validation at API Boundaries
1. **Firebase sync operations** - Validate data coming from Firebase
2. **CSV import** - Use flexible import schemas
3. **Data export** - Ensure clean data going out

### Phase 2: Form Integration
1. **Transaction forms** - Replace manual validation
2. **Envelope forms** - Use schema defaults and validation
3. **Bill forms** - Leverage frequency and amount validation

### Phase 3: Database Layer
1. **Pre-save validation** - Validate before Dexie operations
2. **Migration scripts** - Clean existing data with schemas
3. **Bulk operations** - Batch validation for performance

## Error Handling Patterns

### Validation Errors
```javascript
import { ValidationError } from '../utils/common/errors.js';

try {
  const result = validateTransaction(data);
  if (!result.success) {
    throw new ValidationError('Validation failed', result.formattedErrors);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    // Show user-friendly error messages
    showFormErrors(error.fieldErrors);
  } else {
    // Handle unexpected errors
    logger.error('Unexpected validation error', error);
    showGenericError();
  }
}
```

### Batch Operations
```javascript
const processBatchData = async (items, validator) => {
  const results = { success: [], errors: [] };
  
  for (const [index, item] of items.entries()) {
    const result = validator(item);
    if (result.success) {
      results.success.push(result.data);
    } else {
      results.errors.push({
        index,
        item,
        errors: result.formattedErrors,
      });
    }
  }
  
  // Save successful items
  if (results.success.length > 0) {
    await budgetDb.transactions.bulkAdd(results.success);
  }
  
  // Report errors for failed items
  if (results.errors.length > 0) {
    logger.warn('Batch validation errors', {
      successCount: results.success.length,
      errorCount: results.errors.length,
      errors: results.errors,
    });
  }
  
  return results;
};
```

## React Component Integration

### Form Validation Hook
```javascript
import { validateTransactionForm } from '../types/index.js';

const useTransactionValidation = (formData) => {
  const [errors, setErrors] = useState({});
  
  const validate = useCallback(() => {
    const result = validateTransactionForm(formData);
    setErrors(result.formattedErrors || {});
    return result.success;
  }, [formData]);
  
  const validateField = useCallback((fieldName, value) => {
    const testData = { ...formData, [fieldName]: value };
    const result = validateTransactionForm(testData);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.formattedErrors?.[fieldName] || null,
    }));
    
    return !result.formattedErrors?.[fieldName];
  }, [formData]);
  
  return { errors, validate, validateField };
};
```

### Usage in Components
```jsx
const TransactionForm = () => {
  const [formData, setFormData] = useState(initialTransactionForm);
  const { errors, validate, validateField } = useTransactionValidation(formData);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        await saveTransaction(formData);
        onSuccess();
      } catch (error) {
        handleError(error);
      }
    }
  };
  
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value); // Real-time validation
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.description}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        className={errors.description ? 'error' : ''}
      />
      {errors.description && <span className="error-message">{errors.description}</span>}
      {/* ... other fields */}
    </form>
  );
};
```

## Testing Integration

### Existing Tests
Most existing tests should continue to work without changes. The schemas are designed to accept the same data structures that are currently used.

### New Test Patterns
```javascript
import { validateTransaction, FinanceSchemas } from '../types/index.js';

describe('Transaction Operations', () => {
  it('should validate transaction data', () => {
    const transaction = createMockTransaction();
    const result = validateTransaction(transaction);
    
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject(transaction);
  });
  
  it('should handle invalid transaction data', () => {
    const invalidTransaction = { amount: 'invalid' };
    const result = validateTransaction(invalidTransaction);
    
    expect(result.success).toBe(false);
    expect(result.formattedErrors).toHaveProperty('description');
    expect(result.formattedErrors).toHaveProperty('amount');
  });
  
  it('should work with form schemas', () => {
    const formData = { name: 'Test', amount: '100.50' };
    const result = FinanceSchemas.TransactionForm.safeParse(formData);
    
    expect(result.success).toBe(true);
    expect(result.data.amount).toBe(100.5); // String converted to number
  });
});
```

## Performance Considerations

### Validation Caching
```javascript
const validationCache = new Map();

const cachedValidate = (schema, data, cacheKey) => {
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey);
  }
  
  const result = ValidationUtils.safeParse(schema, data);
  validationCache.set(cacheKey, result);
  
  return result;
};
```

### Batch Processing
For large data imports, process in chunks:
```javascript
const validateInChunks = async (data, validator, chunkSize = 100) => {
  const results = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const chunkResults = chunk.map(validator);
    results.push(...chunkResults);
    
    // Allow other tasks to run
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};
```

## Next Steps

1. **Start with API boundaries** - Add validation to Firebase sync and CSV import
2. **Update one form at a time** - Replace manual validation with schema validation
3. **Add database validation** - Validate data before saving to Dexie
4. **Create validation utilities** - Build reusable validation hooks and components
5. **Update tests** - Add schema validation tests alongside existing tests

The schemas are designed to be gradually adopted without breaking existing functionality. Start with high-impact areas like data imports and forms, then expand coverage over time.