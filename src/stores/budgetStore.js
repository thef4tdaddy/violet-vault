import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  actionTypes,
  budgetReducer,
  initialState,
} from "../contexts/budgetState";

const useBudgetStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      dispatch: (action) => set((state) => budgetReducer(state, action)),

      setEnvelopes: (envelopes) =>
        get().dispatch({ type: actionTypes.SET_ENVELOPES, payload: envelopes }),
      setBills: (bills) =>
        get().dispatch({ type: actionTypes.SET_BILLS, payload: bills }),
      setSavingsGoals: (goals) =>
        get().dispatch({ type: actionTypes.SET_SAVINGS_GOALS, payload: goals }),
      setSupplementalAccounts: (accounts) =>
        get().dispatch({
          type: actionTypes.SET_SUPPLEMENTAL_ACCOUNTS,
          payload: accounts,
        }),
      setUnassignedCash: (amount) =>
        get().dispatch({
          type: actionTypes.SET_UNASSIGNED_CASH,
          payload: amount,
        }),
      setPaycheckHistory: (history) =>
        get().dispatch({
          type: actionTypes.SET_PAYCHECK_HISTORY,
          payload: history,
        }),
      setActualBalance: (balance) =>
        get().dispatch({
          type: actionTypes.SET_ACTUAL_BALANCE,
          payload: balance,
        }),
      setTransactions: (transactions) =>
        get().dispatch({
          type: actionTypes.SET_TRANSACTIONS,
          payload: transactions,
        }),
      setAllTransactions: (transactions) =>
        get().dispatch({
          type: actionTypes.SET_ALL_TRANSACTIONS,
          payload: transactions,
        }),
      setBiweeklyAllocation: (amount) =>
        get().dispatch({
          type: actionTypes.SET_BIWEEKLY_ALLOCATION,
          payload: amount,
        }),
      addEnvelope: (env) =>
        get().dispatch({ type: actionTypes.ADD_ENVELOPE, payload: env }),
      updateEnvelope: (env) =>
        get().dispatch({ type: actionTypes.UPDATE_ENVELOPE, payload: env }),
      deleteEnvelope: (id) =>
        get().dispatch({ type: actionTypes.DELETE_ENVELOPE, payload: id }),
      addBill: (bill) =>
        get().dispatch({ type: actionTypes.ADD_BILL, payload: bill }),
      updateBill: (bill) =>
        get().dispatch({ type: actionTypes.UPDATE_BILL, payload: bill }),
      deleteBill: (id) =>
        get().dispatch({ type: actionTypes.DELETE_BILL, payload: id }),
      addSavingsGoal: (goal) =>
        get().dispatch({ type: actionTypes.ADD_SAVINGS_GOAL, payload: goal }),
      updateSavingsGoal: (goal) =>
        get().dispatch({
          type: actionTypes.UPDATE_SAVINGS_GOAL,
          payload: goal,
        }),
      deleteSavingsGoal: (id) =>
        get().dispatch({ type: actionTypes.DELETE_SAVINGS_GOAL, payload: id }),
      processPaycheck: (data) =>
        get().dispatch({ type: actionTypes.PROCESS_PAYCHECK, payload: data }),
      reconcileTransaction: (data) =>
        get().dispatch({
          type: actionTypes.RECONCILE_TRANSACTION,
          payload: data,
        }),
      loadData: (data) =>
        get().dispatch({ type: actionTypes.LOAD_DATA, payload: data }),
      resetAllData: () => get().dispatch({ type: actionTypes.RESET_ALL_DATA }),
    }),
    {
      name: "budget-store",
    },
  ),
);

export default useBudgetStore;
