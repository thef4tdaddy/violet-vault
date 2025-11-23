/**
 * useBillManagerUI Hook
 * Additional UI logic extraction from BillManager for Issue #152
 *
 * Handles UI-specific business logic like selection, modal management, and display rules
 */
import { useCallback, useMemo } from "react";
import { getIcon } from "../../utils";
import { useBillManagerHandlers } from "./useBillManagerHandlers";
import { useBillManagerDisplayLogic } from "./useBillManagerDisplayLogic";

interface CategorizedBills {
  upcoming?: unknown[];
  overdue?: unknown[];
  paid?: unknown[];
}

// Helper to create view mode configuration
const createViewMode = (
  id: string,
  label: string,
  count: number,
  icon: string,
  color: string
): { id: string; label: string; count: number; icon: string; color: string } => ({
  id,
  label,
  count,
  icon,
  color,
});

/**
 * Custom hook for BillManager UI logic
 * @param {Object} options - Configuration options
 * @returns {Object} UI logic state and actions
 */
export function useBillManagerUI({
  bills = [],
  categorizedBills = {} as CategorizedBills,
  filteredBills = [],
  selectedBills,
  setSelectedBills,
  setShowAddBillModal,
  setEditingBill,
  setHistoryBill,
}: {
  bills?: unknown[];
  categorizedBills?: CategorizedBills;
  filteredBills?: unknown[];
  selectedBills: Set<string>;
  setSelectedBills: (bills: Set<string>) => void;
  setShowAddBillModal: (show: boolean) => void;
  setEditingBill: (bill: unknown) => void;
  setHistoryBill: (bill: unknown) => void;
}) {
  // View modes configuration with business logic
  const viewModes = useMemo(
    () => [
      createViewMode(
        "upcoming",
        "Upcoming",
        categorizedBills.upcoming?.length || 0,
        getIcon("Calendar"),
        "blue"
      ),
      createViewMode(
        "overdue",
        "Overdue",
        categorizedBills.overdue?.length || 0,
        getIcon("AlertTriangle"),
        "red"
      ),
      createViewMode(
        "paid",
        "Paid",
        categorizedBills.paid?.length || 0,
        getIcon("CheckCircle"),
        "green"
      ),
      createViewMode("all", "All Bills", bills?.length || 0, getIcon("FileText"), "gray"),
    ],
    [categorizedBills, bills]
  );

  // Bill selection logic
  const toggleBillSelection = useCallback(
    (billId: string) => {
      const newSelection = new Set(selectedBills);
      if (newSelection.has(billId)) {
        newSelection.delete(billId);
      } else {
        newSelection.add(billId);
      }
      setSelectedBills(newSelection);
    },
    [selectedBills, setSelectedBills]
  );

  const selectAllBills = useCallback(() => {
    const allBillIds = new Set(filteredBills.map((bill: { id: string }) => bill.id));
    setSelectedBills(allBillIds);
  }, [filteredBills, setSelectedBills]);

  const clearSelection = useCallback(() => {
    setSelectedBills(new Set());
  }, [setSelectedBills]);

  // Modal management logic
  // Get handlers and selection state from custom hook
  const { handleAddNewBill, handleEditBill, handleCloseModal, handleViewHistory, selectionState } =
    useBillManagerHandlers({
      selectedBills,
      filteredBills,
      setEditingBill,
      setShowAddBillModal,
      setHistoryBill,
    });

  // Bill display logic
  // Get display logic functions from custom hook
  const { getBillIcon, getUrgencyColors, getSummaryCards, getBillDisplayData } =
    useBillManagerDisplayLogic(selectedBills);

  return {
    // Configuration
    viewModes,
    getSummaryCards,

    // Selection logic
    toggleBillSelection,
    selectAllBills,
    clearSelection,
    selectionState,

    // Modal management
    handleAddNewBill,
    handleEditBill,
    handleCloseModal,
    handleViewHistory,

    // Display logic
    getBillIcon,
    getUrgencyColors,
    getBillDisplayData,
  };
}
