import { useMemo, useCallback } from "react";
import type { Bill as BillType } from "@/types/bills";
import type { Transaction, Envelope } from "@/db/types";
import {
  useBillCalculations,
  type BillRecord,
  type FilterOptions,
  type TransactionRecord,
} from "./useBillCalculations";

type Bill = BillType;

interface UseBillProcessingProps {
  tanStackTransactions?: TransactionRecord[];
  tanStackEnvelopes?: Envelope[];
  tanStackBills?: BillRecord[];
  onUpdateBill?: (bill: Bill) => void;
  updateBillAsync?: (data: { billId: string; updates: Record<string, unknown> }) => Promise<void>;
  uiState: {
    filterOptions: FilterOptions;
    viewMode: "list" | "calendar";
    setSelectedBills: (bills: Set<string>) => void;
  };
  discoverBills: (
    transactions: Transaction[],
    bills: Bill[],
    envelopes: Envelope[],
    callback?: () => void
  ) => Promise<void>;
  performAddDiscoveredBills: (
    bills: Bill[],
    onRecurring: (bill: Bill) => Promise<void>,
    onStandard: (bill: Bill) => Promise<void>
  ) => Promise<void>;
  handleBulkUpdateAction: (bills: Bill[]) => Promise<{ success: boolean }>;
  onCreateRecurringBill?: (bill: Bill) => Promise<void>;
  addBillAsync: (bill: Bill) => Promise<void>;
  onSearchNewBills?: () => void;
  onError?: (message: string) => void;
}

export const useBillProcessing = ({
  tanStackTransactions = [],
  tanStackEnvelopes = [],
  tanStackBills = [],
  onUpdateBill,
  updateBillAsync,
  uiState,
  discoverBills,
  performAddDiscoveredBills,
  handleBulkUpdateAction,
  onCreateRecurringBill,
  addBillAsync,
  onSearchNewBills,
  onError,
}: UseBillProcessingProps) => {
  const { processAllBills, getCategorizedBills, getFilteredBills } = useBillCalculations();

  const resolvedTransactions = useMemo(
    () => tanStackTransactions as Transaction[],
    [tanStackTransactions]
  );

  const resolvedEnvelopes = useMemo(() => tanStackEnvelopes as Envelope[], [tanStackEnvelopes]);

  const resolvedBills = useMemo(() => tanStackBills as unknown as Bill[], [tanStackBills]);

  const handleUpdateBill = useCallback(
    async ({ billId, updates }: { billId: string; updates: Record<string, unknown> }) => {
      if (updateBillAsync) {
        await updateBillAsync({ billId, updates });
      }
    },
    [updateBillAsync]
  );

  // 5. Bill Processing
  const bills = useMemo(
    () =>
      processAllBills(
        resolvedTransactions as TransactionRecord[],
        resolvedBills as unknown as BillRecord[],
        onUpdateBill,
        handleUpdateBill
      ) as Bill[],
    [processAllBills, resolvedBills, resolvedTransactions, onUpdateBill, handleUpdateBill]
  );

  // Categorize & Total

  const { categorizedBills, totals } = useMemo(
    () => getCategorizedBills(bills),
    [bills, getCategorizedBills]
  );

  // Filter for View
  const filteredBills = useMemo(
    () =>
      getFilteredBills(
        categorizedBills as unknown as Record<string, BillType[]>,
        uiState.viewMode,
        uiState.filterOptions
      ) as Bill[],
    [getFilteredBills, categorizedBills, uiState.viewMode, uiState.filterOptions]
  );

  // Action Handlers
  const searchNewBills = useCallback(async () => {
    try {
      await discoverBills(resolvedTransactions, bills, resolvedEnvelopes, onSearchNewBills);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to discover bills";
      onError?.(message);
    }
  }, [discoverBills, resolvedTransactions, bills, resolvedEnvelopes, onSearchNewBills, onError]);

  const handleAddDiscoveredBills = useCallback(
    async (billsToAdd: Bill[]) => {
      try {
        await performAddDiscoveredBills(
          billsToAdd,
          onCreateRecurringBill
            ? async (b: Bill) => {
                await onCreateRecurringBill(b);
              }
            : async (b: Bill) => {
                await addBillAsync(b);
              },
          async (b: Bill) => {
            await addBillAsync(b);
          }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add bills";
        onError?.(message);
      }
    },
    [performAddDiscoveredBills, onCreateRecurringBill, addBillAsync, onError]
  );

  const handleBulkUpdate = useCallback(
    async (updatedBills: Bill[]) => {
      const result = await handleBulkUpdateAction(updatedBills);
      if (result.success) uiState.setSelectedBills(new Set());
    },
    [handleBulkUpdateAction, uiState]
  );

  return {
    resolvedTransactions,
    resolvedEnvelopes,
    resolvedBills,
    bills,
    categorizedBills: categorizedBills as unknown as Record<string, Bill[]>,
    totals,
    filteredBills,
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    handleUpdateBill,
  };
};
