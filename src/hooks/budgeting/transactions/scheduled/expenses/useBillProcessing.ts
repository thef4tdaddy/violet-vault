import { useMemo, useCallback } from "react";
import type { Bill as BillType } from "@/types/bills";
import type { Transaction, Envelope } from "@/db/types";
import {
  useBillCalculations,
  type BillRecord,
  type EnvelopeRecord,
  type FilterOptions,
  type TransactionRecord,
} from "./useBillCalculations";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useBills from "./useBills";
import { useBillDiscovery as useBillDiscoveryHook } from "./useBillDiscovery";
import { useBillBulkMutations } from "./useBillBulkMutations";

type Bill = BillType;

interface UseBillProcessingProps {
  onUpdateBill?: (bill: Bill) => void;
  onCreateRecurringBill?: (bill: Bill) => Promise<void>;
  onSearchNewBills?: () => void;
  onError?: (message: string) => void;
  uiState: {
    filterOptions: FilterOptions;
    viewMode: "list" | "calendar";
    setSelectedBills: (bills: Set<string>) => void;
  };
}

export const useBillProcessing = ({
  onUpdateBill,
  onCreateRecurringBill,
  uiState,
  onSearchNewBills,
  onError,
}: UseBillProcessingProps) => {
  // 1. Domain Data Hooks
  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactionQuery();
  const { envelopes: tanStackEnvelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const {
    bills: tanStackBills = [],
    addBill,
    addBillAsync,
    updateBillAsync,
    deleteBill,
    isLoading: billsLoading,
  } = useBills();

  // 2. Logic & Processing Utility Hooks
  const { processAllBills, getCategorizedBills, getFilteredBills } = useBillCalculations();
  const {
    discoverBills,
    addDiscoveredBills,
    isSearching,
    discoveredBills,
    showDiscoveryModal,
    setShowDiscoveryModal,
  } = useBillDiscoveryHook();
  const { handleBulkUpdate: handleBulkUpdateAction } = useBillBulkMutations();

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
        tanStackTransactions as TransactionRecord[],
        tanStackBills as unknown as BillRecord[],
        onUpdateBill,
        handleUpdateBill
      ) as Bill[],
    [processAllBills, tanStackBills, tanStackTransactions, onUpdateBill, handleUpdateBill]
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
      await discoverBills(
        tanStackTransactions as unknown as TransactionRecord[],
        tanStackBills as unknown as BillRecord[],
        tanStackEnvelopes as unknown as EnvelopeRecord[],
        onSearchNewBills
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to discover bills";
      onError?.(message);
    }
  }, [
    discoverBills,
    tanStackTransactions,
    tanStackBills,
    tanStackEnvelopes,
    onSearchNewBills,
    onError,
  ]);

  const handleAddDiscoveredBills = useCallback(
    async (billsToAdd: BillRecord[]) => {
      try {
        await addDiscoveredBills(
          billsToAdd,
          onCreateRecurringBill
            ? async (b: BillRecord) => {
                await onCreateRecurringBill(b as unknown as Bill);
              }
            : async (b: BillRecord) => {
                await addBillAsync(b as unknown as Bill);
              },
          async (b: BillRecord) => {
            await addBillAsync(b as unknown as Bill);
          }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to add bills";
        onError?.(message);
      }
    },
    [addDiscoveredBills, onCreateRecurringBill, addBillAsync, onError]
  );

  const handleBulkUpdate = useCallback(
    async (updatedBills: Bill[]) => {
      const result = await handleBulkUpdateAction(updatedBills);
      if (result.success) uiState.setSelectedBills(new Set());
    },
    [handleBulkUpdateAction, uiState]
  );

  return {
    // Raw Data
    resolvedTransactions,
    resolvedEnvelopes,
    resolvedBills,
    isLoading: transactionsLoading || envelopesLoading || billsLoading,

    // Processed Data
    bills,
    categorizedBills: categorizedBills as unknown as Record<string, Bill[]>,
    totals,
    filteredBills,

    // Discovery State
    isSearching,
    discoveredBills,
    showDiscoveryModal,
    setShowDiscoveryModal,

    // Action Handlers
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    handleUpdateBill,

    // Direct Mutations (for convenience)
    addBill,
    addBillAsync,
    deleteBill,
  };
};
