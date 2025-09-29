/**
 * Usage Examples for VioletVault Domain Types & Schemas
 * Demonstrates how to use schemas at API boundaries (Firebase/CSV import)
 */

import {
  validateTransaction,
  validateEnvelope,
  validateBill,
  validateDebtAccount,
  validateTransactionBatch,
  FinanceSchemas,
  ValidationUtils,
} from "./index.js";
import logger from "../utils/common/logger.js";

/**
 * Example: Firebase Data Validation
 * Use when syncing data from Firebase to ensure data integrity
 */
export const validateFirebaseSync = {
  /**
   * Validate transactions from Firebase before storing in Dexie
   */
  transactions: (firebaseTransactions) => {
    logger.info("Validating transactions from Firebase", {
      count: firebaseTransactions.length,
    });

    const results = validateTransactionBatch(firebaseTransactions);
    
    if (!results.success) {
      logger.error("Firebase transaction validation failed", {
        totalCount: results.totalCount,
        validCount: results.validCount,
        errorCount: results.errorCount,
        errors: results.errors,
      });
    }

    return results;
  },

  /**
   * Validate individual Firebase document
   */
  document: (type, data) => {
    const validators = {
      transaction: validateTransaction,
      envelope: validateEnvelope,
      bill: validateBill,
      debt: validateDebtAccount,
    };

    const validator = validators[type];
    if (!validator) {
      throw new Error(`Unknown document type: ${type}`);
    }

    const result = validator(data);
    
    if (!result.success) {
      logger.warn(`Firebase ${type} validation failed`, {
        id: data.id,
        errors: result.formattedErrors,
      });
    }

    return result;
  },
};

/**
 * Example: CSV Import Data Validation
 * Use when importing transactions from CSV files
 */
export const validateCSVImport = {
  /**
   * Validate CSV transaction data with flexible parsing
   */
  transactions: (csvData) => {
    logger.info("Validating CSV transaction import", {
      rowCount: csvData.length,
    });

    const results = [];
    const errors = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        // Use the more flexible CSV import schema
        const result = ValidationUtils.safeParse(FinanceSchemas.TransactionImport, {
          id: `csv_import_${Date.now()}_${i}`,
          description: row.description || row.memo || row.payee || "",
          amount: row.amount || row.debit || row.credit || "0",
          date: row.date || row.transaction_date || new Date().toISOString(),
          category: row.category || "Other",
          type: determineTransactionType(row),
          account: row.account || "default",
          notes: row.notes || "",
        });

        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({
            row: i + 1,
            data: row,
            errors: result.formattedErrors,
          });
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          data: row,
          errors: { general: error.message },
        });
      }
    }

    return {
      success: errors.length === 0,
      validData: results,
      errors: errors,
      validCount: results.length,
      errorCount: errors.length,
      totalCount: csvData.length,
    };
  },
};

/**
 * Helper function to determine transaction type from CSV data
 */
const determineTransactionType = (row) => {
  // Check for common CSV patterns
  if (row.type) {
    return row.type.toLowerCase();
  }
  
  // Infer from amount fields
  if (row.debit && parseFloat(row.debit) > 0) return "expense";
  if (row.credit && parseFloat(row.credit) > 0) return "income";
  
  // Infer from amount sign
  const amount = parseFloat(row.amount || "0");
  return amount >= 0 ? "income" : "expense";
};

/**
 * Example: Form Validation
 * Use in React components for real-time form validation
 */
export const validateFormData = {
  /**
   * Validate transaction form with user-friendly error messages
   */
  transactionForm: (formData) => {
    const result = ValidationUtils.safeParse(FinanceSchemas.TransactionForm, formData);
    
    if (!result.success) {
      // Transform technical Zod errors into user-friendly messages
      const userFriendlyErrors = {};
      
      Object.entries(result.formattedErrors).forEach(([field, message]) => {
        userFriendlyErrors[field] = getFriendlyErrorMessage(field, message);
      });
      
      return {
        ...result,
        userFriendlyErrors,
      };
    }
    
    return result;
  },

  /**
   * Validate envelope form
   */
  envelopeForm: (formData) => {
    return ValidationUtils.safeParse(FinanceSchemas.EnvelopeForm, formData);
  },

  /**
   * Validate bill form
   */
  billForm: (formData) => {
    return ValidationUtils.safeParse(FinanceSchemas.BillForm, formData);
  },
};

/**
 * Convert technical validation errors to user-friendly messages
 */
const getFriendlyErrorMessage = (field, technicalMessage) => {
  const friendlyMessages = {
    description: "Please enter a description for this transaction",
    amount: "Please enter a valid amount",
    date: "Please select a valid date",
    category: "Please select a category",
    name: "Please enter a name",
    monthlyAmount: "Please enter a valid monthly budget amount",
    dueDate: "Please select a due date",
  };

  return friendlyMessages[field] || technicalMessage;
};

/**
 * Example: Data Migration/Upgrade Validation
 * Use when migrating data between schema versions
 */
export const validateDataMigration = {
  /**
   * Validate and clean data during migration
   */
  cleanAndValidate: (type, data) => {
    const schemas = {
      transaction: FinanceSchemas.Transaction,
      envelope: FinanceSchemas.Envelope,
      bill: FinanceSchemas.Bill,
      debt: FinanceSchemas.DebtAccount,
    };

    const schema = schemas[type];
    if (!schema) {
      throw new Error(`Unknown migration type: ${type}`);
    }

    // First attempt - try to parse as-is
    let result = ValidationUtils.safeParse(schema, data);
    
    if (result.success) {
      return result;
    }

    // Second attempt - clean and retry
    const cleanedData = cleanDataForMigration(type, data);
    result = ValidationUtils.safeParse(schema, cleanedData);
    
    if (result.success) {
      logger.info(`Successfully cleaned data during migration`, {
        type,
        id: data.id,
      });
    } else {
      logger.warn(`Migration validation failed after cleaning`, {
        type,
        id: data.id,
        errors: result.formattedErrors,
      });
    }

    return result;
  },
};

/**
 * Clean data during migration to handle common issues
 */
const cleanDataForMigration = (type, data) => {
  const cleaned = { ...data };

  // Common cleaning operations
  if (cleaned.amount) {
    // Ensure amount is a number
    cleaned.amount = parseFloat(cleaned.amount) || 0;
  }

  if (cleaned.date) {
    // Ensure date is in ISO format
    try {
      cleaned.date = new Date(cleaned.date).toISOString();
    } catch {
      cleaned.date = new Date().toISOString();
    }
  }

  // Type-specific cleaning
  switch (type) {
    case "transaction":
      cleaned.type = cleaned.type || "expense";
      cleaned.category = cleaned.category || "Other";
      break;
    case "envelope":
      cleaned.envelopeType = cleaned.envelopeType || "variable";
      cleaned.color = cleaned.color || "#a855f7";
      break;
    case "bill":
      cleaned.frequency = cleaned.frequency || "monthly";
      cleaned.color = cleaned.color || "#3B82F6";
      break;
    case "debt":
      cleaned.type = cleaned.type || "personal";
      cleaned.status = cleaned.status || "active";
      break;
  }

  return cleaned;
};

/**
 * Example: Real-time Validation Hook
 * For use in React components with real-time validation
 */
export const createRealtimeValidator = (schemaName) => {
  const schemas = {
    transaction: FinanceSchemas.TransactionForm,
    envelope: FinanceSchemas.EnvelopeForm,
    bill: FinanceSchemas.BillForm,
    debt: FinanceSchemas.DebtForm,
  };

  const schema = schemas[schemaName];
  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }

  return {
    validate: (data) => ValidationUtils.safeParse(schema, data),
    validateField: (fieldName, value, currentData = {}) => {
      const testData = { ...currentData, [fieldName]: value };
      const result = ValidationUtils.safeParse(schema, testData);
      
      return {
        isValid: !result.formattedErrors[fieldName],
        error: result.formattedErrors[fieldName],
      };
    },
  };
};