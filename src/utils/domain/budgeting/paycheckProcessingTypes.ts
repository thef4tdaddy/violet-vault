/**
 * Types for paycheck processing execution plans
 * These types represent the plan of operations to be executed,
 * keeping the domain logic pure and testable
 */

export interface BalanceUpdate {
  actualBalance: number;
  unassignedCash: number;
}

export interface EnvelopeAllocation {
  envelopeId: string;
  envelopeName?: string;
  amount: number;
}

export interface TransactionCreationPlan {
  paycheckId: string;
  amount: number;
  payerName?: string;
  notes?: string;
  allocations: EnvelopeAllocation[];
}

export interface PaycheckRecordPlan {
  id: string;
  date: Date;
  amount: number;
  payerName: string;
  lastModified: number;
  createdAt: number;
  type: "income";
  category: "Income";
  envelopeId: "unassigned";
  isScheduled: false;
  mode: "allocate" | "leftover";
  unassignedCashBefore: number;
  unassignedCashAfter: number;
  actualBalanceBefore: number;
  actualBalanceAfter: number;
  allocations: Record<string, number>;
  notes: string;
  incomeTransactionId?: string;
  transferTransactionIds?: string[];
}

export interface PaycheckExecutionPlan {
  paycheckId: string;
  balanceUpdates: BalanceUpdate;
  envelopeAllocations: EnvelopeAllocation[];
  transactionCreation: TransactionCreationPlan;
  paycheckRecord: Omit<PaycheckRecordPlan, "incomeTransactionId" | "transferTransactionIds">;
  validation: {
    isValid: boolean;
    errors: Array<{ type: string; message: string; difference?: number }>;
    warnings: Array<{ type: string; message: string; amount?: number }>;
  };
}

export interface CurrentBalances {
  actualBalance: number;
  virtualBalance: number;
  unassignedCash: number;
  isActualBalanceManual: boolean;
}

export interface PaycheckInput {
  amount: number;
  mode: "allocate" | "leftover";
  envelopeAllocations?: EnvelopeAllocation[];
  notes?: string;
  payerName?: string;
}
