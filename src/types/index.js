/**
 * VioletVault Domain Types & Schemas
 * Central export point for all types and validation schemas
 */

// Core finance schemas
export {
  TransactionSchema,
  EnvelopeSchema,
  BudgetSchema,
  DebtAccountSchema,
  BillSchema,
  FinanceSchemas,
  FinanceTypes,
} from "./finance.js";

// Validation utilities
export {
  CommonSchemas,
  ValidationUtils,
} from "./validation.js";

// Re-export Zod for convenience
export { z } from "zod";

// Import for helper functions
import { ValidationUtils } from "./validation.js";
import { FinanceSchemas } from "./finance.js";

/**
 * Validation helper functions for common use cases
 */

// Validate transaction data for API boundaries
export const validateTransaction = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.Transaction, data);
};

// Validate envelope data for API boundaries  
export const validateEnvelope = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.Envelope, data);
};

// Validate budget data for API boundaries
export const validateBudget = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.Budget, data);
};

// Validate debt account data for API boundaries
export const validateDebtAccount = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.DebtAccount, data);
};

// Validate bill data for API boundaries
export const validateBill = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.Bill, data);
};

// Validate form data (more permissive)
export const validateTransactionForm = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.TransactionForm, data);
};

export const validateEnvelopeForm = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.EnvelopeForm, data);
};

export const validateBillForm = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.BillForm, data);
};

export const validateDebtForm = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.DebtForm, data);
};

// CSV Import validation (most permissive)
export const validateTransactionImport = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.TransactionImport, data);
};

// Firebase sync validation (handles readonly objects)
export const validateFirebaseTransaction = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.FirebaseTransaction, data);
};

export const validateFirebaseEnvelope = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.FirebaseEnvelope, data);
};

export const validateFirebaseBill = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.FirebaseBill, data);
};

export const validateFirebaseDebt = (data) => {
  return ValidationUtils.safeParse(FinanceSchemas.FirebaseDebt, data);
};

/**
 * Batch validation for collections
 */
export const validateTransactionBatch = (transactions) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < transactions.length; i++) {
    const result = validateTransaction(transactions[i]);
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({
        index: i,
        data: transactions[i],
        errors: result.formattedErrors,
      });
    }
  }
  
  return {
    success: errors.length === 0,
    validData: results,
    errors: errors,
    validCount: results.length,
    errorCount: errors.length,
    totalCount: transactions.length,
  };
};

export const validateEnvelopeBatch = (envelopes) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < envelopes.length; i++) {
    const result = validateEnvelope(envelopes[i]);
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({
        index: i,
        data: envelopes[i],
        errors: result.formattedErrors,
      });
    }
  }
  
  return {
    success: errors.length === 0,
    validData: results,
    errors: errors,
    validCount: results.length,
    errorCount: errors.length,
    totalCount: envelopes.length,
  };
};

export const validateBillBatch = (bills) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < bills.length; i++) {
    const result = validateBill(bills[i]);
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({
        index: i,
        data: bills[i],
        errors: result.formattedErrors,
      });
    }
  }
  
  return {
    success: errors.length === 0,
    validData: results,
    errors: errors,
    validCount: results.length,
    errorCount: errors.length,
    totalCount: bills.length,
  };
};

export const validateDebtBatch = (debts) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < debts.length; i++) {
    const result = validateDebtAccount(debts[i]);
    if (result.success) {
      results.push(result.data);
    } else {
      errors.push({
        index: i,
        data: debts[i],
        errors: result.formattedErrors,
      });
    }
  }
  
  return {
    success: errors.length === 0,
    validData: results,
    errors: errors,
    validCount: results.length,
    errorCount: errors.length,
    totalCount: debts.length,
  };
};