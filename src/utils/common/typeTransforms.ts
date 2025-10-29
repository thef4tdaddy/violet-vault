/**
 * Type transformation utilities to bridge between database and UI type systems
 * Resolves conflicts between src/db/types.ts and src/types/finance.ts
 */

// Database to UI transformations
export const transformEnvelopeFromDB = (dbEnv: import('@/db/types').Envelope): import('@/types/finance').Envelope => ({
  id: dbEnv.id,
  name: dbEnv.name,
  category: dbEnv.category,
  currentBalance: dbEnv.currentBalance ?? 0,
  targetAmount: dbEnv.targetAmount ?? 0,
  color: undefined, // Not in DB schema yet
  icon: undefined, // Not in DB schema yet
  description: dbEnv.description,
  createdAt: dbEnv.createdAt ? new Date(dbEnv.createdAt).toISOString() : undefined,
  updatedAt: undefined, // DB uses lastModified
  lastActivity: undefined,
  priority: undefined,
  isArchived: dbEnv.archived,
});

export const transformTransactionFromDB = (dbTx: import('@/db/types').Transaction): import('@/types/finance').Transaction => ({
  id: dbTx.id,
  date: dbTx.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
  description: dbTx.description ?? '',
  amount: dbTx.amount,
  category: dbTx.category,
  envelopeId: dbTx.envelopeId,
  notes: undefined, // Not in DB schema yet
  reconciled: undefined, // Not in DB schema yet
  account: undefined, // Not in DB schema yet
  type: dbTx.type,
  createdBy: undefined,
  createdAt: dbTx.createdAt ? new Date(dbTx.createdAt).toISOString() : undefined,
  updatedAt: undefined,
  importSource: undefined,
  isSplit: false, // Not in DB schema yet
  splitIndex: undefined,
  splitTotal: undefined,
  parentTransactionId: undefined,
  originalAmount: dbTx.amount,
  metadata: undefined,
  source: undefined,
  fromEnvelopeId: undefined,
  toEnvelopeId: undefined,
});

export const transformBillFromDB = (dbBill: import('@/db/types').Bill): import('@/db/types').Bill & Record<string, unknown> => {
  const transformed = {
    id: dbBill.id,
    name: dbBill.name,
    category: dbBill.category,
    amount: dbBill.amount,
    dueDate: dbBill.dueDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
    isPaid: dbBill.isPaid,
    isRecurring: dbBill.isRecurring,
    frequency: dbBill.frequency,
    envelopeId: dbBill.envelopeId,
    createdAt: dbBill.createdAt ? new Date(dbBill.createdAt).toISOString() : undefined,
    description: dbBill.description,
    paymentMethod: dbBill.paymentMethod,
  };
  return makeRecordCompatible(transformed);
};

// UI to Database transformations (reverse)
export const transformEnvelopeToDB = (uiEnv: Partial<import('@/types/finance').Envelope>): Partial<import('@/db/types').Envelope> => ({
  id: typeof uiEnv.id === 'string' ? uiEnv.id : undefined,
  name: uiEnv.name,
  category: uiEnv.category,
  currentBalance: uiEnv.currentBalance ?? uiEnv.currentBalance,
  targetAmount: uiEnv.targetAmount,
  description: uiEnv.description,
  archived: uiEnv.isArchived,
});

// Utility to make types Record-compatible
export const makeRecordCompatible = <T extends object>(obj: T): T & Record<string, unknown> => {
  return { ...obj, [Symbol.toStringTag]: undefined } as T & Record<string, unknown>;
};
