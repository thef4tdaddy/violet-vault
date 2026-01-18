import { type Transaction as FinanceTransaction } from "@/types/finance";
import type { TransactionInput } from "../useTransactionOperations";
import logger from "@/utils/core/common/logger";

interface UseTransactionHandlersProps {
  currentUser: unknown;
  ledgerState: {
    editingTransaction: FinanceTransaction | null;
    setEditingTransaction: (t: FinanceTransaction | null) => void;
    setShowAddModal: (show: boolean) => void;
    setShowImportModal: (show: boolean) => void;
  };
  actions: {
    createTransaction: (user: { userName: string }) => FinanceTransaction;
    addTransactionAsync: (t: TransactionInput) => Promise<void>;
    updateTransactionAsync: (id: string, updates: Partial<TransactionInput>) => Promise<void>;
    resetForm: () => void;
    populateForm: (t: unknown) => void;
    resetImport: () => void;
  };
}

export const useTransactionHandlers = ({
  currentUser,
  ledgerState,
  actions,
}: UseTransactionHandlersProps) => {
  const {
    createTransaction,
    addTransactionAsync,
    updateTransactionAsync,
    resetForm,
    populateForm,
    resetImport,
  } = actions;
  const { editingTransaction, setEditingTransaction, setShowAddModal, setShowImportModal } =
    ledgerState;

  const handleSubmitTransaction = async (): Promise<void> => {
    const user = currentUser as { userName: string };
    const newTransaction = createTransaction(user);

    if (editingTransaction) {
      const transactionWithId = {
        ...newTransaction,
        id: (editingTransaction as { id: string | number }).id,
      };
      try {
        await updateTransactionAsync(String(transactionWithId.id), {
          date: new Date(transactionWithId.date).toISOString().split("T")[0],
          amount: transactionWithId.amount,
          category: transactionWithId.category,
          description: transactionWithId.description,
          envelopeId:
            transactionWithId.envelopeId !== undefined
              ? String(transactionWithId.envelopeId)
              : undefined,
          notes: transactionWithId.notes,
          type: transactionWithId.type as FinanceTransaction["type"] | undefined,
        });
        logger.info("✅ Transaction updated", {
          id: transactionWithId.id,
          amount: transactionWithId.amount,
        });
        setEditingTransaction(null);
      } catch (error) {
        logger.error("Failed to update transaction", { error });
        return;
      }
    } else {
      try {
        await addTransactionAsync(newTransaction as TransactionInput);
        logger.info("✅ Transaction added", {
          amount: newTransaction.amount,
          type: newTransaction.type,
        });
      } catch (error) {
        logger.error("Failed to add transaction", { error });
        return;
      }
    }

    setShowAddModal(false);
    resetForm();
  };

  const startEdit = (transaction: FinanceTransaction): void => {
    populateForm(transaction as unknown as Parameters<typeof populateForm>[0]);
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleCloseModal = (): void => {
    setShowAddModal(false);
    setEditingTransaction(null);
    resetForm();
  };

  const handleCloseImportModal = (): void => {
    setShowImportModal(false);
    resetImport();
  };

  return {
    handleSubmitTransaction,
    startEdit,
    handleCloseModal,
    handleCloseImportModal,
  };
};
