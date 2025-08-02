// src/contexts/BudgetContext.jsx (Updated)

import React, { createContext } from "react";
import useBudgetStore from "../stores/budgetStore";

// The context now simply provides a direct reference to your optimized store.
export const BudgetContext = createContext(useBudgetStore);

// The provider now just renders its children, as Zustand handles the state.
export const BudgetProvider = ({ children }) => {
  return <>{children}</>;
};
