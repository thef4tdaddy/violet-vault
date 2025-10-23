/**
 * Transaction Operations Utilities
 * Pure functions for transaction data manipulation and preparation
 * Extracted from useTransactions.js for Issue #508
 *
 * Now using Zod schemas for runtime validation (Issue #412)
 */
import logger from "../common/logger.ts";
import { validateTransactionSafe } from "../../domain/schemas/transaction.ts";

/**
 * Validate transaction data using Zod schema
 * Converts Zod errors to legacy format for backward compatibility
 *
 * @param {Object} transactionData - Transaction data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateTransactionData = (transactionData) => {
  try {
    if (!transactionData) {
      return { isValid: false, errors: ["Transaction data is required"] };
    }

    // Use Zod schema for validation
    const result = validateTransactionSafe(transactionData);

    if (!result.success) {
      // Convert Zod errors to user-friendly messages
      const errors = result.error.errors.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    logger.error("Error validating transaction data", error);
    return {
      isValid: false,
      errors: ["Validation error: " + error.message],
    };
  }
};

/**
 * Prepare transaction data for database storage
 * @param {Object} transactionData - Raw transaction data
 * @returns {Object} Prepared transaction data
 */
export const prepareTransactionForStorage = (transactionData) => {
  try {
    const now = new Date().toISOString();

    const prepared = {
      id: transactionData.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: (transactionData.description || "").trim(),
      amount: parseFloat(transactionData.amount) || 0,
      date: new Date(transactionData.date).toISOString(),
      category: (transactionData.category || "").trim(),
      account: (transactionData.account || "").trim() || "default",
      envelopeId: transactionData.envelopeId || null,
      type: determineTransactionType(transactionData),
      isSplit: transactionData.isSplit || false,
      parentTransactionId: transactionData.parentTransactionId || null,
      metadata: {
        ...transactionData.metadata,
        createdAt: transactionData.metadata?.createdAt || now,
        updatedAt: now,
      },
    };

    return prepared;
  } catch (error) {
    logger.error("Error preparing transaction for storage", error);
    throw new Error("Failed to prepare transaction data: " + error.message);
  }
};

/**
 * Calculate transaction type based on amount and metadata
 * @param {Object} transaction - Transaction to analyze
 * @returns {string} Transaction type (income, expense, transfer)
 */
export const determineTransactionType = (transaction) => {
  try {
    if (!transaction) return "expense";

    // Check if explicitly set
    if (transaction.type) return transaction.type;

    // Check metadata for transfer indicators
    if (transaction.metadata?.isTransfer || transaction.parentTransactionId) {
      return "transfer";
    }

    // Determine by amount
    return transaction.amount > 0 ? "income" : "expense";
  } catch (error) {
    logger.error("Error determining transaction type", error);
    return "expense";
  }
};

/**
 * Create transfer transaction pair
 * @param {Object} transferData - Transfer details
 * @param {string} transferData.fromAccount - Source account
 * @param {string} transferData.toAccount - Destination account
 * @param {number} transferData.amount - Transfer amount (positive)
 * @param {string} transferData.description - Transfer description
 * @param {string} transferData.date - Transfer date
 * @returns {Array} Array of two transactions (outgoing and incoming)
 */
export const createTransferPair = (transferData) => {
  try {
    const validation = validateTransactionData({
      ...transferData,
      amount: Math.abs(transferData.amount),
    });

    if (!validation.isValid) {
      throw new Error("Invalid transfer data: " + validation.errors.join(", "));
    }

    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const amount = Math.abs(transferData.amount);

    const outgoingTransaction = {
      id: `${transferId}_out`,
      description: transferData.description || `Transfer to ${transferData.toAccount}`,
      amount: -amount, // Negative for outgoing
      date: new Date(transferData.date).toISOString(),
      category: "Transfer",
      account: transferData.fromAccount,
      type: "transfer",
      envelopeId: transferData.fromEnvelopeId || null,
      metadata: {
        isTransfer: true,
        transferId,
        transferType: "outgoing",
        fromAccount: transferData.fromAccount,
        toAccount: transferData.toAccount,
        createdAt: now,
        updatedAt: now,
        ...transferData.metadata,
      },
    };

    const incomingTransaction = {
      id: `${transferId}_in`,
      description: transferData.description || `Transfer from ${transferData.fromAccount}`,
      amount: amount, // Positive for incoming
      date: new Date(transferData.date).toISOString(),
      category: "Transfer",
      account: transferData.toAccount,
      type: "transfer",
      envelopeId: transferData.toEnvelopeId || null,
      metadata: {
        isTransfer: true,
        transferId,
        transferType: "incoming",
        fromAccount: transferData.fromAccount,
        toAccount: transferData.toAccount,
        createdAt: now,
        updatedAt: now,
        ...transferData.metadata,
      },
    };

    return [outgoingTransaction, incomingTransaction];
  } catch (error) {
    logger.error("Error creating transfer pair", error);
    throw error;
  }
};

/**
 * Categorize transaction based on description and rules
 * @param {Object} transaction - Transaction to categorize
 * @param {Array} categoryRules - Array of categorization rules
 * @returns {Object} Transaction with suggested category
 */
export const categorizeTransaction = (transaction, categoryRules = []) => {
  try {
    if (!transaction || transaction.category) {
      return transaction; // Already has category
    }

    const description = (transaction.description || "").toLowerCase();

    // Apply category rules
    for (const rule of categoryRules) {
      if (rule.keywords && Array.isArray(rule.keywords)) {
        const matches = rule.keywords.some((keyword) =>
          description.includes(keyword.toLowerCase())
        );

        if (matches) {
          return {
            ...transaction,
            category: rule.category,
            metadata: {
              ...transaction.metadata,
              autoCategorized: true,
              categoryRule: rule.name || rule.category,
            },
          };
        }
      }
    }

    // Default categorization based on common patterns
    const defaultRules = [
      { keywords: ["grocery", "supermarket", "food"], category: "Groceries" },
      { keywords: ["gas", "fuel", "gasoline"], category: "Transportation" },
      { keywords: ["restaurant", "cafe", "dine", "eat"], category: "Dining" },
      { keywords: ["rent", "mortgage"], category: "Housing" },
      {
        keywords: ["utility", "electric", "water", "internet"],
        category: "Utilities",
      },
      { keywords: ["salary", "payroll", "income"], category: "Income" },
      { keywords: ["atm", "withdrawal", "cash"], category: "Cash" },
    ];

    for (const rule of defaultRules) {
      const matches = rule.keywords.some((keyword) => description.includes(keyword));

      if (matches) {
        return {
          ...transaction,
          category: rule.category,
          metadata: {
            ...transaction.metadata,
            autoCategorized: true,
            categoryRule: "default",
          },
        };
      }
    }

    // Return original if no category found
    return {
      ...transaction,
      category: transaction.amount > 0 ? "Income" : "Uncategorized",
    };
  } catch (error) {
    logger.error("Error categorizing transaction", error);
    return transaction;
  }
};

/**
 * Check if two transactions are duplicates based on criteria
 */
const areDuplicateTransactions = (transaction, existing, options) => {
  const { timeWindowMs, amountTolerance, checkDescription, checkAccount } = options;

  const timeDiff = Math.abs(new Date(transaction.date) - new Date(existing.date));
  const amountDiff = Math.abs(transaction.amount - existing.amount);
  const sameDescription = !checkDescription || transaction.description === existing.description;
  const sameAccount = !checkAccount || transaction.account === existing.account;

  return (
    timeDiff <= timeWindowMs && amountDiff <= amountTolerance && sameDescription && sameAccount
  );
};

/**
 * Merge duplicate transaction metadata
 */
const mergeDuplicateMetadata = (existing, transaction) => {
  existing.metadata = {
    ...existing.metadata,
    duplicates: existing.metadata.duplicates || [],
    mergedAt: new Date().toISOString(),
  };

  existing.metadata.duplicates.push({
    id: transaction.id,
    originalDate: transaction.date,
    mergedAt: new Date().toISOString(),
  });
};

/**
 * Merge duplicate transactions
 * @param {Array} transactions - Transactions to check for duplicates
 * @param {Object} options - Merge options
 * @returns {Array} Transactions with duplicates merged
 */
export const mergeDuplicateTransactions = (transactions = [], options = {}) => {
  try {
    const {
      timeWindowMinutes = 5,
      amountTolerance = 0.01,
      checkDescription = true,
      checkAccount = true,
    } = options;

    const processed = [];
    const timeWindowMs = timeWindowMinutes * 60 * 1000;
    const mergeOptions = { timeWindowMs, amountTolerance, checkDescription, checkAccount };

    for (const transaction of transactions) {
      let isDuplicate = false;

      for (const existing of processed) {
        if (areDuplicateTransactions(transaction, existing, mergeOptions)) {
          mergeDuplicateMetadata(existing, transaction);
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        processed.push({ ...transaction });
      }
    }

    logger.debug(`Merged duplicates: ${transactions.length} -> ${processed.length}`);
    return processed;
  } catch (error) {
    logger.error("Error merging duplicate transactions", error);
    return transactions;
  }
};

/**
 * Calculate running balance for transactions
 * @param {Array} transactions - Sorted transactions (oldest first)
 * @param {number} startingBalance - Starting account balance
 * @returns {Array} Transactions with running balance added
 */
export const calculateRunningBalance = (transactions = [], startingBalance = 0) => {
  try {
    let runningBalance = startingBalance;

    return transactions.map((transaction) => {
      runningBalance += transaction.amount;

      return {
        ...transaction,
        runningBalance: Math.round(runningBalance * 100) / 100,
      };
    });
  } catch (error) {
    logger.error("Error calculating running balance", error);
    return transactions;
  }
};

/**
 * Format transaction for display
 * @param {Object} transaction - Transaction to format
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted transaction
 */
export const formatTransactionForDisplay = (transaction, options = {}) => {
  try {
    const { currency = "USD", dateFormat = "short", includeTime = false } = options;

    const formatted = { ...transaction };

    // Format amount
    formatted.formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Math.abs(transaction.amount));

    formatted.amountDisplay =
      transaction.amount < 0 ? `-${formatted.formattedAmount}` : formatted.formattedAmount;

    // Format date
    const date = new Date(transaction.date);
    formatted.formattedDate = date.toLocaleDateString("en-US", {
      year: dateFormat === "long" ? "numeric" : "2-digit",
      month: dateFormat === "long" ? "long" : "short",
      day: "numeric",
    });

    if (includeTime) {
      formatted.formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Add display properties
    formatted.isIncome = transaction.amount > 0;
    formatted.isExpense = transaction.amount < 0;
    formatted.isTransfer = transaction.type === "transfer";
    formatted.categoryDisplay = transaction.category || "Uncategorized";
    formatted.accountDisplay = transaction.account || "Default";

    return formatted;
  } catch (error) {
    logger.error("Error formatting transaction for display", error);
    return transaction;
  }
};
