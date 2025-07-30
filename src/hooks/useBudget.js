// src/hooks/useBudget.js (Updated)

import { useContext } from "react";
import { BudgetContext } from "../contexts/BudgetContext";

export const useBudget = () => {
  // The context now provides the store hook directly. We call it here.
  const useStore = useContext(BudgetContext);

  if (!useStore) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }

  // Return the state and actions from the store.
  return useStore();
};
