import { useTransactionFormValidated } from "../useTransactionFormValidated";
import type { TransactionInput } from "../useTransactionOperations";
import logger from "@/utils/common/logger";
import { type Transaction as FinanceTransaction, type Envelope } from "@/types/finance";

export interface BillPayment {
  billId: string;
  amount: number;
  paidDate: string;
  transactionId: string | number;
  notes: string;
}

interface UseLedgerFormProps {
  ledgerState: {
    editingTransaction: FinanceTransaction | null;
    setEditingTransaction: (t: FinanceTransaction | null) => void;
    setShowAddModal: (show: boolean) => void;
  };
  actions: {
    addTransactionAsync: (t: TransactionInput) => Promise<void>;
    updateTransactionAsync: (id: string, updates: Partial<TransactionInput>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    handlePayBill: (billPayment: BillPayment) => void;
  };
  envelopes: Envelope[];
}

export const useLedgerForm = ({ ledgerState, actions, envelopes }: UseLedgerFormProps) => {
  const { editingTransaction, setEditingTransaction, setShowAddModal } = ledgerState;
  const { addTransactionAsync, updateTransactionAsync, deleteTransaction, handlePayBill } = actions;

  return useTransactionFormValidated({
    editingTransaction,
    onAddTransaction: async (transaction) => {
      await addTransactionAsync({
        date: transaction.date,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        envelopeId: transaction.envelopeId !== undefined ? String(transaction.envelopeId) : "",
        type: transaction.type,
        notes: transaction.notes,
      } as TransactionInput);
    },
    onUpdateTransaction: async (transaction) => {
      await updateTransactionAsync(String(transaction.id), {
        date: new Date(transaction.date).toISOString().split("T")[0],
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        envelopeId:
          transaction.envelopeId !== undefined ? String(transaction.envelopeId) : undefined,
        notes: transaction.notes,
        type: transaction.type,
      });
    },
    onDeleteTransaction: async (id) => {
      await deleteTransaction(id);
    },
    onPayBill: handlePayBill,
    onClose: () => {
      setShowAddModal(false);
      setEditingTransaction(null);
    },
    onError: (error) => logger.error("Transaction form error", { error }),
    envelopes: envelopes.map((env) => ({
      id: String(env.id),
      name: env.name,
      envelopeType: env.envelopeType as string | undefined, // Cast to string | undefined
    })),
  });
};
