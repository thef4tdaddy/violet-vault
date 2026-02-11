import { useCallback, useMemo } from "react";

interface BillManagerHandlersProps {
  selectedBills: Set<string>;
  filteredBills: unknown[];
  setEditingBill: (bill: unknown) => void;
  setShowAddBillModal: (show: boolean) => void;
  setHistoryBill: (bill: unknown) => void;
}

export function useBillManagerHandlers({
  selectedBills,
  filteredBills,
  setEditingBill,
  setShowAddBillModal,
  setHistoryBill,
}: BillManagerHandlersProps) {
  const handleAddNewBill = useCallback(() => {
    setEditingBill(null);
    setShowAddBillModal(true);
  }, [setEditingBill, setShowAddBillModal]);

  const handleEditBill = useCallback(
    (bill: unknown) => {
      setEditingBill(bill);
      setShowAddBillModal(true);
    },
    [setEditingBill, setShowAddBillModal]
  );

  const handleCloseModal = useCallback(() => {
    setShowAddBillModal(false);
    setEditingBill(null);
  }, [setShowAddBillModal, setEditingBill]);

  const handleViewHistory = useCallback(
    (bill: unknown) => {
      setHistoryBill(bill);
    },
    [setHistoryBill]
  );

  const selectionState = useMemo(() => {
    const hasSelection = selectedBills.size > 0;
    const isAllSelected = filteredBills.length > 0 && selectedBills.size === filteredBills.length;

    return {
      hasSelection,
      isAllSelected,
      selectedCount: selectedBills.size,
      selectedBillIds: Array.from(selectedBills),
    };
  }, [selectedBills, filteredBills]);

  return {
    handleAddNewBill,
    handleEditBill,
    handleCloseModal,
    handleViewHistory,
    selectionState,
  };
}
