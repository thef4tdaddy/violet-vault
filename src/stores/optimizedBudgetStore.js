import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Optimized Zustand store with middleware
const useOptimizedBudgetStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // State
          envelopes: [],
          bills: [],
          transactions: [],
          allTransactions: [],
          savingsGoals: [],
          unassignedCash: 0,
          biweeklyAllocation: 0,
          isOnline: true, // Add isOnline state, default to true
          dataLoaded: false,

          // Optimized actions - direct state mutations with Immer
          setEnvelopes: (envelopes) =>
            set((state) => {
              state.envelopes = envelopes;
            }),

          addEnvelope: (envelope) =>
            set((state) => {
              state.envelopes.push(envelope);
            }),

          updateEnvelope: (envelope) =>
            set((state) => {
              const index = state.envelopes.findIndex(
                (e) => e.id === envelope.id,
              );
              if (index !== -1) {
                state.envelopes[index] = envelope;
              }
            }),

          deleteEnvelope: (id) =>
            set((state) => {
              state.envelopes = state.envelopes.filter((e) => e.id !== id);
            }),

          // Optimized bulk operations
          bulkUpdateEnvelopes: (updates) =>
            set((state) => {
              updates.forEach((update) => {
                const index = state.envelopes.findIndex(
                  (e) => e.id === update.id,
                );
                if (index !== -1) {
                  Object.assign(state.envelopes[index], update);
                }
              });
            }),

          // Computed selectors for better performance
          getEnvelopeById: (id) => {
            return get().envelopes.find((e) => e.id === id);
          },

          getEnvelopesByCategory: (category) => {
            return get().envelopes.filter((e) => e.category === category);
          },

          getTotalEnvelopeBalance: () => {
            return get().envelopes.reduce(
              (sum, e) => sum + (e.currentBalance || 0),
              0,
            );
          },

          // Add an action to set the online status
          setOnlineStatus: (status) =>
            set((state) => {
              state.isOnline = status;
            }),

          // Reset functionality
          resetStore: () =>
            set((state) => {
              state.envelopes = [];
              state.bills = [];
              state.transactions = [];
              state.allTransactions = [];
              state.savingsGoals = [];
              state.unassignedCash = 0;
              state.isOnline = true; // Also reset isOnline status
              state.dataLoaded = false;
            }),
        })),
      ),
      {
        name: "violet-vault-store", // localStorage key
        partialize: (state) => ({
          // Only persist essential data
          envelopes: state.envelopes,
          bills: state.bills,
          unassignedCash: state.unassignedCash,
          biweeklyAllocation: state.biweeklyAllocation,
        }),
      },
    ),
    {
      name: "violet-vault-devtools",
    },
  ),
);

export default useOptimizedBudgetStore;
