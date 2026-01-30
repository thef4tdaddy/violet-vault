import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  validatePaycheckAmountSafe,
  validateAllocationsSafe,
  formatValidationError,
  type AllocationStrategy,
} from "@/utils/core/validation/paycheckWizardValidation";
import logger from "@/utils/core/common/logger";

// Types
interface Allocation {
  envelopeId: string;
  amountCents: number;
}

interface PaycheckFlowState {
  // Modal state
  isOpen: boolean;
  currentStep: number; // 0-3

  // Form data
  paycheckAmountCents: number | null; // Store in cents for precision
  selectedStrategy: AllocationStrategy | null;
  allocations: Allocation[];

  // Actions
  openWizard: () => void;
  closeWizard: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  setPaycheckAmountCents: (amountCents: number) => void;
  setSelectedStrategy: (strategy: AllocationStrategy) => void;
  setAllocations: (allocations: Allocation[]) => void;
  reset: () => void;
}

// Initial state
const initialState = {
  isOpen: false,
  currentStep: 0,
  paycheckAmountCents: null,
  selectedStrategy: null,
  allocations: [],
};

// Store creation with middleware stack
export const usePaycheckFlowStore = create<PaycheckFlowState>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // Actions
        openWizard: () =>
          set((state) => {
            state.isOpen = true;
            state.currentStep = 0;
          }),

        closeWizard: () =>
          set((state) => {
            state.isOpen = false;
          }),

        nextStep: () =>
          set((state) => {
            if (state.currentStep < 3) {
              state.currentStep += 1;
            }
          }),

        previousStep: () =>
          set((state) => {
            if (state.currentStep > 0) {
              state.currentStep -= 1;
            }
          }),

        setStep: (step: number) =>
          set((state) => {
            state.currentStep = Math.max(0, Math.min(3, step));
          }),

        setPaycheckAmountCents: (amountCents: number) =>
          set((state) => {
            // Validate amount before setting
            const result = validatePaycheckAmountSafe(amountCents);

            if (!result.success) {
              const errorMessage = formatValidationError(result.error);
              logger.error("Invalid paycheck amount", {
                reason: "validation_failed",
                error: errorMessage,
              });
              // Don't update state if validation fails
              return;
            }

            state.paycheckAmountCents = amountCents;
          }),

        setSelectedStrategy: (strategy: AllocationStrategy) =>
          set((state) => {
            state.selectedStrategy = strategy;
          }),

        setAllocations: (allocations: Allocation[]) =>
          set((state) => {
            // Validate allocations before setting
            const result = validateAllocationsSafe(allocations);

            if (!result.success) {
              const errorMessage = formatValidationError(result.error);
              logger.error("Invalid allocations", {
                reason: "validation_failed",
                error: errorMessage,
                allocationCount: allocations.length,
              });
              // Don't update state if validation fails
              return;
            }

            state.allocations = allocations;
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),
      })),
      {
        name: "paycheck-flow-storage",
        storage: createJSONStorage(() => localStorage),
        version: 1,

        // CRITICAL: Only persist non-sensitive data for privacy
        partialize: (state) => ({
          currentStep: state.currentStep,
          selectedStrategy: state.selectedStrategy,
          // DO NOT persist paycheckAmountCents or allocations (sensitive financial data)
        }),

        // Version migrations
        migrate: (persistedState: unknown, version: number) => {
          if (version === 0) {
            // Migration logic for v0 → v1 if needed
          }
          return persistedState as PaycheckFlowState;
        },

        // Skip hydration on SSR
        skipHydration: false,
      }
    ),
    {
      name: "PaycheckFlowStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors (for performance optimization - prevent unnecessary re-renders)
export const selectIsOpen = (state: PaycheckFlowState) => state.isOpen;
export const selectCurrentStep = (state: PaycheckFlowState) => state.currentStep;
export const selectPaycheckAmountCents = (state: PaycheckFlowState) => state.paycheckAmountCents;
export const selectAllocations = (state: PaycheckFlowState) => state.allocations;
export const selectSelectedStrategy = (state: PaycheckFlowState) => state.selectedStrategy;
