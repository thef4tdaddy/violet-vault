import { useState } from "react";

const initialForm = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  amount: "",
  type: "expense",
  envelopeId: "",
  category: "",
  notes: "",
  reconciled: false,
};

export const useTransactionForm = () => {
  const [transactionForm, setTransactionForm] = useState(initialForm);

  const resetForm = () => {
    setTransactionForm(initialForm);
  };

  const populateForm = (transaction) => {
    setTransactionForm({
      date: transaction.date,
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.amount >= 0 ? "income" : "expense",
      envelopeId: transaction.envelopeId || "",
      category: transaction.category || "",
      notes: transaction.notes || "",
      reconciled: transaction.reconciled || false,
    });
  };

  const createTransaction = (currentUser) => {
    return {
      id: Date.now(),
      ...transactionForm,
      amount:
        transactionForm.type === "expense"
          ? -Math.abs(parseFloat(transactionForm.amount))
          : Math.abs(parseFloat(transactionForm.amount)),
      createdBy: currentUser.userName,
      createdAt: new Date().toISOString(),
      importSource: "manual",
    };
  };

  return {
    transactionForm,
    setTransactionForm,
    resetForm,
    populateForm,
    createTransaction,
  };
};