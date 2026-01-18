/**
 * API wrapper functions for debt management operations
 * Extracted from debtManagementHelpers.ts to maintain file size limits
 */
import type { DebtAccount } from "@/types/debt";

/**
 * Create wrapper functions for external hook APIs
 * Extracted to reduce line count in main hook
 */
export const createAPIWrappers = (
  addEnvelopeAsync: ((data: unknown) => unknown) | undefined,
  createEnvelope: (data: unknown) => unknown,
  addBillAsync: (data: unknown) => unknown,
  updateBillAsync: (id: string, updates: unknown) => unknown,
  createTransaction: (data: unknown) => unknown
) => {
  const makeCreateEnvelopeWrapper =
    (fn: (...args: unknown[]) => unknown) =>
    async (data: unknown): Promise<{ id: string }> => {
      const res = await Promise.resolve(fn(data) as unknown);
      return res as unknown as { id: string };
    };

  const makeCreateBillWrapper =
    (fn: (...args: unknown[]) => unknown) =>
    async (
      data: unknown
    ): Promise<{
      id: string;
      debtId?: string;
      envelopeId?: string;
      amount?: number;
      dueDate?: string;
    }> => {
      const res = await Promise.resolve(fn(data) as unknown);
      const raw = res as unknown as Record<string, unknown>;
      const rawDue = raw.dueDate as unknown;
      const dueDate =
        typeof rawDue === "string"
          ? (rawDue as string)
          : rawDue instanceof Date
            ? (rawDue as Date).toISOString()
            : undefined;
      return {
        ...raw,
        dueDate,
      } as { id: string; debtId?: string; envelopeId?: string; amount?: number; dueDate?: string };
    };

  const makeUpdateBillWrapper =
    (fn: (id: string, data: unknown) => unknown) =>
    async (id: string, data: unknown): Promise<void> => {
      await Promise.resolve(fn(id, data));
    };

  const makeCreateTransactionWrapper =
    (fn: (...args: unknown[]) => unknown) =>
    async (data: unknown): Promise<void> => {
      await Promise.resolve(fn(data));
    };

  return {
    createEnvelopeWrapper: makeCreateEnvelopeWrapper(addEnvelopeAsync || createEnvelope),
    createBillWrapper: makeCreateBillWrapper(addBillAsync),
    updateBillWrapper: makeUpdateBillWrapper(updateBillAsync),
    createTransactionWrapper: makeCreateTransactionWrapper(createTransaction),
  };
};

/**
 * Calculate grouped debts by status
 */
export const groupDebtsByStatus = (
  enrichedDebts: DebtAccount[],
  statusValues: Record<string, string>
) => {
  const grouped: Record<string, DebtAccount[]> = {};
  Object.values(statusValues).forEach((status) => {
    grouped[status] = enrichedDebts.filter((debt) => debt.status === status);
  });
  return grouped;
};

/**
 * Calculate grouped debts by type
 */
export const groupDebtsByType = (
  enrichedDebts: DebtAccount[],
  typeValues: Record<string, string>
) => {
  const grouped: Record<string, DebtAccount[]> = {};
  Object.values(typeValues).forEach((type) => {
    grouped[type] = enrichedDebts.filter((debt) => debt.type === type);
  });
  return grouped;
};
