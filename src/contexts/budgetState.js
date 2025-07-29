// Shared budget state definitions

export const actionTypes = {
  SET_ENVELOPES: "SET_ENVELOPES",
  SET_BILLS: "SET_BILLS",
  SET_SAVINGS_GOALS: "SET_SAVINGS_GOALS",
  SET_SUPPLEMENTAL_ACCOUNTS: "SET_SUPPLEMENTAL_ACCOUNTS",
  SET_UNASSIGNED_CASH: "SET_UNASSIGNED_CASH",
  SET_PAYCHECK_HISTORY: "SET_PAYCHECK_HISTORY",
  SET_ACTUAL_BALANCE: "SET_ACTUAL_BALANCE",
  SET_TRANSACTIONS: "SET_TRANSACTIONS",
  SET_ALL_TRANSACTIONS: "SET_ALL_TRANSACTIONS",
  SET_BIWEEKLY_ALLOCATION: "SET_BIWEEKLY_ALLOCATION",
  ADD_ENVELOPE: "ADD_ENVELOPE",
  UPDATE_ENVELOPE: "UPDATE_ENVELOPE",
  DELETE_ENVELOPE: "DELETE_ENVELOPE",
  ADD_BILL: "ADD_BILL",
  UPDATE_BILL: "UPDATE_BILL",
  DELETE_BILL: "DELETE_BILL",
  ADD_SAVINGS_GOAL: "ADD_SAVINGS_GOAL",
  UPDATE_SAVINGS_GOAL: "UPDATE_SAVINGS_GOAL",
  DELETE_SAVINGS_GOAL: "DELETE_SAVINGS_GOAL",
  PROCESS_PAYCHECK: "PROCESS_PAYCHECK",
  RECONCILE_TRANSACTION: "RECONCILE_TRANSACTION",
  LOAD_DATA: "LOAD_DATA",
  RESET_ALL_DATA: "RESET_ALL_DATA",
};

export const initialState = {
  envelopes: [],
  bills: [],
  savingsGoals: [],
  supplementalAccounts: [],
  unassignedCash: 0,
  biweeklyAllocation: 0,
  paycheckHistory: [],
  actualBalance: 0,
  transactions: [],
  allTransactions: [],
  dataLoaded: false,
};

export const budgetReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ENVELOPES:
      return {
        ...state,
        envelopes: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_BILLS:
      return {
        ...state,
        bills: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_SAVINGS_GOALS:
      return {
        ...state,
        savingsGoals: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_SUPPLEMENTAL_ACCOUNTS:
      return { ...state, supplementalAccounts: action.payload };
    case actionTypes.SET_UNASSIGNED_CASH:
      return { ...state, unassignedCash: action.payload };
    case actionTypes.SET_PAYCHECK_HISTORY:
      return { ...state, paycheckHistory: action.payload };
    case actionTypes.SET_ACTUAL_BALANCE:
      return { ...state, actualBalance: action.payload };
    case actionTypes.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case actionTypes.SET_ALL_TRANSACTIONS:
      return { ...state, allTransactions: action.payload };
    case actionTypes.SET_BIWEEKLY_ALLOCATION:
      return { ...state, biweeklyAllocation: action.payload };
    case actionTypes.ADD_ENVELOPE:
      return { ...state, envelopes: [...state.envelopes, action.payload] };
    case actionTypes.UPDATE_ENVELOPE:
      return {
        ...state,
        envelopes: state.envelopes.map((env) =>
          env.id === action.payload.id ? action.payload : env
        ),
      };
    case actionTypes.DELETE_ENVELOPE:
      return {
        ...state,
        envelopes: state.envelopes.filter((env) => env.id !== action.payload),
      };
    case actionTypes.ADD_BILL:
      return { ...state, bills: [...state.bills, action.payload] };
    case actionTypes.UPDATE_BILL:
      return {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.payload.id ? action.payload : bill)),
      };
    case actionTypes.DELETE_BILL:
      return {
        ...state,
        bills: state.bills.filter((bill) => bill.id !== action.payload),
      };
    case actionTypes.ADD_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload],
      };
    case actionTypes.UPDATE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };
    case actionTypes.DELETE_SAVINGS_GOAL:
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
      };
    case actionTypes.PROCESS_PAYCHECK:
      return {
        ...state,
        paycheckHistory: [...state.paycheckHistory, action.payload.paycheck],
        envelopes: action.payload.updatedEnvelopes,
        unassignedCash: action.payload.newUnassignedCash,
      };
    case actionTypes.RECONCILE_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload.transaction],
        allTransactions: [...state.allTransactions, action.payload.transaction],
        envelopes: action.payload.updatedEnvelopes || state.envelopes,
        unassignedCash: action.payload.newUnassignedCash ?? state.unassignedCash,
      };
    case actionTypes.LOAD_DATA: {
      const validatedPayload = {
        ...action.payload,
        envelopes: Array.isArray(action.payload.envelopes) ? action.payload.envelopes : [],
        bills: Array.isArray(action.payload.bills) ? action.payload.bills : [],
        savingsGoals: Array.isArray(action.payload.savingsGoals) ? action.payload.savingsGoals : [],
        supplementalAccounts: Array.isArray(action.payload.supplementalAccounts)
          ? action.payload.supplementalAccounts
          : [],
        transactions: Array.isArray(action.payload.transactions) ? action.payload.transactions : [],
        allTransactions: Array.isArray(action.payload.allTransactions)
          ? action.payload.allTransactions
          : [],
        paycheckHistory: Array.isArray(action.payload.paycheckHistory)
          ? action.payload.paycheckHistory
          : [],
      };
      const seen = new Set();
      validatedPayload.allTransactions = validatedPayload.allTransactions.filter((transaction) => {
        if (!transaction || !transaction.id) return false;
        if (seen.has(transaction.id)) {
          console.warn(`Duplicate transaction found and removed: ${transaction.id}`);
          return false;
        }
        seen.add(transaction.id);
        return true;
      });
      validatedPayload.allTransactions = validatedPayload.allTransactions.map((transaction) => ({
        ...transaction,
        amount: typeof transaction.amount === "number" ? transaction.amount : 0,
        description: transaction.description || `Transaction ${transaction.id}`,
        date: transaction.date || new Date().toISOString().split("T")[0],
        type: transaction.type || "transaction",
      }));
      return { ...state, ...validatedPayload, dataLoaded: true };
    }
    case actionTypes.RESET_ALL_DATA:
      return { ...initialState, dataLoaded: false };
    default:
      return state;
  }
};
