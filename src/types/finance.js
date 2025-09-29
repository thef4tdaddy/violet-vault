/**
 * Finance Domain Types & Zod Schemas
 * Core data models for VioletVault finance operations
 * 
 * Supports API boundaries (Firebase/CSV import) with runtime validation
 */
import { z } from "zod";
import { CommonSchemas, ValidationUtils } from "./validation.js";
import { STANDARD_CATEGORIES } from "../constants/categories.js";
import { DEBT_TYPES, DEBT_STATUS, PAYMENT_FREQUENCIES } from "../constants/debts.js";

// Category validation
const CategorySchema = z.enum([...STANDARD_CATEGORIES, "Other"]).default("Other");

// Transaction Type Schema
const TransactionTypeSchema = z.enum([
  "income",
  "expense", 
  "transfer",
  "split",
  "refund",
  "adjustment"
]).default("expense");

// Envelope Type Schema  
const EnvelopeTypeSchema = z.enum([
  "bill",
  "variable", 
  "savings",
  "emergency"
]).default("variable");

// Priority Schema
const PrioritySchema = z.enum([
  "low",
  "medium", 
  "high",
  "critical"
]).default("medium");

/**
 * Transaction Domain Schema
 * Represents a financial transaction
 */
export const TransactionSchema = ValidationUtils.withTimestamps(
  ValidationUtils.withAuditFields(
    z.object({
      id: CommonSchemas.id,
      description: CommonSchemas.nonEmptyString,
      amount: CommonSchemas.monetaryAmount,
      date: CommonSchemas.dateField,
      category: CategorySchema,
      type: TransactionTypeSchema,
      
      // Optional fields
      envelopeId: CommonSchemas.optionalString,
      account: CommonSchemas.optionalString.default("default"),
      notes: CommonSchemas.optionalString,
      reconciled: CommonSchemas.booleanDefault(false),
      
      // Split transaction support
      isSplit: CommonSchemas.booleanDefault(false),
      parentTransactionId: CommonSchemas.optionalString,
      splitDetails: z.array(z.object({
        amount: CommonSchemas.monetaryAmount,
        category: CategorySchema,
        envelopeId: CommonSchemas.optionalString,
        description: CommonSchemas.optionalString,
      })).optional(),

      // Transfer metadata
      isTransfer: CommonSchemas.booleanDefault(false),
      transferId: CommonSchemas.optionalString,
      transferType: z.enum(["incoming", "outgoing"]).optional(),
      fromAccount: CommonSchemas.optionalString,
      toAccount: CommonSchemas.optionalString,

      // Additional metadata
      metadata: z.record(z.any()).optional(),
      tags: z.array(z.string()).optional(),
      receiptUrl: CommonSchemas.optionalString,
      location: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        address: CommonSchemas.optionalString,
      }).optional(),
    })
  )
);

/**
 * Envelope Domain Schema
 * Represents a budget envelope for expense tracking
 */
export const EnvelopeSchema = ValidationUtils.withTimestamps(
  ValidationUtils.withAuditFields(
    z.object({
      id: CommonSchemas.id,
      name: CommonSchemas.nonEmptyString,
      category: CategorySchema,
      envelopeType: EnvelopeTypeSchema,
      
      // Financial data
      monthlyAmount: CommonSchemas.positiveAmount.default(0),
      currentBalance: CommonSchemas.monetaryAmount.default(0),
      targetAmount: CommonSchemas.positiveAmount.optional(),
      
      // Budget allocation
      frequency: CommonSchemas.frequency,
      biweeklyAllocation: CommonSchemas.positiveAmount.optional(),
      priority: PrioritySchema,
      
      // Display & behavior
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default("#a855f7"),
      icon: CommonSchemas.optionalString.default("Target"),
      description: CommonSchemas.optionalString,
      
      // Settings
      autoAllocate: CommonSchemas.booleanDefault(true),
      archived: CommonSchemas.booleanDefault(false),
      isHidden: CommonSchemas.booleanDefault(false),
      
      // Bill association
      billId: CommonSchemas.optionalString,
      
      // Goals & tracking
      targetDate: CommonSchemas.optionalDate,
      isCompleted: CommonSchemas.booleanDefault(false),
      isPaused: CommonSchemas.booleanDefault(false),
      
      // History tracking
      allocationHistory: z.array(z.object({
        date: CommonSchemas.dateField,
        amount: CommonSchemas.monetaryAmount,
        source: CommonSchemas.optionalString,
        type: z.enum(["allocation", "spending", "adjustment"]),
      })).optional(),
      
      // Monthly budget planning
      monthlyBudget: CommonSchemas.positiveAmount.optional(),
    })
  )
);

/**
 * Budget Domain Schema
 * Represents overall budget configuration and metadata
 */
export const BudgetSchema = ValidationUtils.withTimestamps(
  ValidationUtils.withAuditFields(
    z.object({
      id: CommonSchemas.id,
      name: CommonSchemas.nonEmptyString.default("My Budget"),
      description: CommonSchemas.optionalString,
      version: z.number().default(1),
      
      // Budget settings
      currency: z.string().default("USD"),
      timezone: CommonSchemas.optionalString,
      fiscalYearStart: z.number().min(1).max(12).default(1), // January
      
      // Income configuration
      monthlyIncome: CommonSchemas.positiveAmount.default(0),
      paycheckFrequency: CommonSchemas.frequency,
      
      // Budget allocation strategy
      allocationStrategy: z.enum([
        "percentage",
        "fixed_amount", 
        "priority_based",
        "zero_based"
      ]).default("percentage"),
      
      // Emergency fund settings
      emergencyFundTarget: CommonSchemas.positiveAmount.optional(),
      emergencyFundCurrent: CommonSchemas.positiveAmount.default(0),
      
      // Sharing & collaboration
      isShared: CommonSchemas.booleanDefault(false),
      sharedWith: z.array(z.string()).optional(),
      shareSettings: z.object({
        allowEdit: CommonSchemas.booleanDefault(false),
        allowView: CommonSchemas.booleanDefault(true),
        requireApproval: CommonSchemas.booleanDefault(true),
      }).optional(),
      
      // Status & metadata
      isActive: CommonSchemas.booleanDefault(true),
      tags: z.array(z.string()).optional(),
    })
  )
);

/**
 * DebtAccount Domain Schema  
 * Represents a debt/liability account
 */
export const DebtAccountSchema = ValidationUtils.withTimestamps(
  ValidationUtils.withAuditFields(
    z.object({
      id: CommonSchemas.id,
      name: CommonSchemas.nonEmptyString,
      creditor: CommonSchemas.nonEmptyString,
      type: z.enum(Object.values(DEBT_TYPES)).default(DEBT_TYPES.PERSONAL),
      status: z.enum(Object.values(DEBT_STATUS)).default(DEBT_STATUS.ACTIVE),
      
      // Financial details
      currentBalance: CommonSchemas.positiveAmount.default(0),
      originalBalance: CommonSchemas.positiveAmount.optional(),
      minimumPayment: CommonSchemas.positiveAmount.default(0),
      interestRate: z.number().min(0).max(100).default(0), // APR percentage
      
      // Terms
      paymentFrequency: z.enum(Object.values(PAYMENT_FREQUENCIES)).default(PAYMENT_FREQUENCIES.MONTHLY),
      paymentDueDate: CommonSchemas.optionalDate,
      maturityDate: CommonSchemas.optionalDate,
      termLength: z.number().positive().optional(), // months
      
      // Special fields for specific debt types
      creditLimit: CommonSchemas.positiveAmount.optional(), // Credit cards
      availableCredit: CommonSchemas.positiveAmount.optional(),
      pmi: CommonSchemas.positiveAmount.optional(), // Mortgage PMI
      escrowPayment: CommonSchemas.positiveAmount.optional(), // Mortgage escrow
      planDuration: z.number().positive().optional(), // Chapter 13 duration (months)
      trusteePayment: CommonSchemas.positiveAmount.optional(), // Chapter 13 trustee
      priorityAmount: CommonSchemas.positiveAmount.optional(), // Chapter 13 priority
      
      // Display & categorization
      category: CategorySchema.optional(),
      priority: PrioritySchema,
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
      icon: CommonSchemas.optionalString,
      
      // Payment history
      paymentHistory: z.array(z.object({
        date: CommonSchemas.dateField,
        amount: CommonSchemas.positiveAmount,
        principalPortion: CommonSchemas.positiveAmount.optional(),
        interestPortion: CommonSchemas.positiveAmount.optional(),
        balanceAfter: CommonSchemas.positiveAmount.optional(),
        notes: CommonSchemas.optionalString,
      })).optional(),
      
      // Strategy & goals
      payoffStrategy: z.enum([
        "minimum",
        "avalanche", // Highest interest first
        "snowball",  // Lowest balance first
        "custom"
      ]).default("minimum"),
      extraPayment: CommonSchemas.positiveAmount.default(0),
      payoffGoalDate: CommonSchemas.optionalDate,
      
      // Status tracking
      isArchived: CommonSchemas.booleanDefault(false),
      notes: CommonSchemas.optionalString,
      
      // Associated envelope for payments
      envelopeId: CommonSchemas.optionalString,
    })
  )
);

/**
 * Bill Domain Schema
 * Represents a recurring bill or payment
 */
export const BillSchema = ValidationUtils.withTimestamps(
  ValidationUtils.withAuditFields(
    z.object({
      id: CommonSchemas.id,
      name: CommonSchemas.nonEmptyString,
      provider: CommonSchemas.optionalString,
      category: CategorySchema,
      
      // Financial details
      amount: CommonSchemas.positiveAmount,
      frequency: CommonSchemas.frequency,
      customFrequency: CommonSchemas.optionalString, // For custom frequencies
      
      // Due date information
      dueDate: CommonSchemas.dateField,
      nextDueDate: CommonSchemas.optionalDate,
      
      // Payment tracking
      isPaid: CommonSchemas.booleanDefault(false),
      isRecurring: CommonSchemas.booleanDefault(true),
      autopayEnabled: CommonSchemas.booleanDefault(false),
      
      // Display & organization  
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default("#3B82F6"),
      icon: CommonSchemas.optionalString.default("FileText"),
      iconName: CommonSchemas.optionalString, // For icon storage
      priority: PrioritySchema,
      
      // Envelope integration
      envelopeId: CommonSchemas.optionalString,
      createEnvelope: CommonSchemas.booleanDefault(false),
      
      // Notification settings
      reminderDays: z.number().min(0).max(30).default(3),
      enableReminders: CommonSchemas.booleanDefault(true),
      
      // Bill variations
      isVariable: CommonSchemas.booleanDefault(false),
      estimatedAmount: CommonSchemas.positiveAmount.optional(),
      typicalRange: z.object({
        min: CommonSchemas.positiveAmount,
        max: CommonSchemas.positiveAmount,
      }).optional(),
      
      // Payment history
      paymentHistory: z.array(z.object({
        date: CommonSchemas.dateField,
        amount: CommonSchemas.positiveAmount,
        actualAmount: CommonSchemas.positiveAmount.optional(),
        method: CommonSchemas.optionalString,
        confirmationNumber: CommonSchemas.optionalString,
        notes: CommonSchemas.optionalString,
      })).optional(),
      
      // Status & metadata
      isArchived: CommonSchemas.booleanDefault(false),
      notes: CommonSchemas.optionalString,
      tags: z.array(z.string()).optional(),
      
      // Account association
      accountId: CommonSchemas.optionalString,
      
      // Budget impact
      budgetImpact: z.enum([
        "fixed",     // Fixed monthly expense
        "variable",  // Variable monthly expense  
        "seasonal",  // Seasonal/quarterly
        "annual"     // Annual expense
      ]).default("fixed"),
    })
  )
);

// Export individual schemas for specific use cases
export const FinanceSchemas = {
  Transaction: TransactionSchema,
  Envelope: EnvelopeSchema, 
  Budget: BudgetSchema,
  DebtAccount: DebtAccountSchema,
  Bill: BillSchema,
  
  // Form-specific schemas (relaxed validation for user input)
  TransactionForm: TransactionSchema.partial({
    id: true,
    date: true, // Make date optional for forms
    createdAt: true,
    lastModified: true,
    updatedAt: true,
  }).extend({
    // Override date to be optional with default
    date: CommonSchemas.dateField.optional().default(() => new Date().toISOString()),
  }),
  
  EnvelopeForm: EnvelopeSchema.partial({
    id: true,
    createdAt: true,
    lastModified: true,
    updatedAt: true,
  }),
  
  BillForm: BillSchema.partial({
    id: true,
    createdAt: true,
    lastModified: true,
    updatedAt: true,
  }),
  
  DebtForm: DebtAccountSchema.partial({
    id: true,
    createdAt: true,
    lastModified: true,
    updatedAt: true,
  }),
  
  // CSV Import schemas (more flexible for data import)
  TransactionImport: TransactionSchema.extend({
    // Allow more flexible date formats for CSV import
    date: z.union([
      CommonSchemas.dateField,
      z.string().transform((val) => {
        // Try to parse various date formats
        try {
          // Try ISO format first
          let date = new Date(val);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
          
          // Try MM/DD/YYYY format
          const mmddyyyy = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (mmddyyyy) {
            date = new Date(mmddyyyy[3], mmddyyyy[1] - 1, mmddyyyy[2]);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
          
          // If all else fails, return current date
          return new Date().toISOString();
        } catch {
          return new Date().toISOString();
        }
      })
    ]),
    
    // Allow empty/missing amounts to default to 0 with currency symbol handling
    amount: z.union([
      CommonSchemas.monetaryAmount,
      z.string().transform((val) => {
        if (!val || val.trim() === "") return 0;
        // Remove currency symbols, commas, and whitespace
        let cleaned = val.replace(/[\$,\s]/g, "");
        
        // Handle negative currency like "$-45.67" or "-$45.67"
        let isNegative = cleaned.includes('-');
        let numberStr = cleaned.replace(/-/g, "");
        
        const parsed = parseFloat(numberStr);
        if (isNaN(parsed)) return 0;
        
        return isNegative ? -Math.abs(parsed) : parsed;
      })
    ]),
  }).partial({
    category: true,
    type: true,
  }),
  
  // Firebase sync schemas (handle readonly objects)
  FirebaseTransaction: TransactionSchema.transform((data) => {
    // Create a new extensible object to avoid Firebase readonly issues
    return { ...data };
  }),
  
  FirebaseEnvelope: EnvelopeSchema.transform((data) => {
    return { ...data };
  }),
  
  FirebaseBill: BillSchema.transform((data) => {
    return { ...data };
  }),
  
  FirebaseDebt: DebtAccountSchema.transform((data) => {
    return { ...data };
  }),
};

// Export type inference helpers (for TypeScript when fully converted)
export const FinanceTypes = {
  // These would become actual TypeScript types in the future
  Transaction: "TransactionType",
  Envelope: "EnvelopeType", 
  Budget: "BudgetType",
  DebtAccount: "DebtAccountType",
  Bill: "BillType",
};