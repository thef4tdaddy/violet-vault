/**
 * useBillManagerUI Hook
 * Additional UI logic extraction from BillManager for Issue #152
 *
 * Handles UI-specific business logic like selection, modal management, and display rules
 */
import { useCallback, useMemo } from "react";
import { getIconByName } from "../../utils/common/billIcons";

/**
 * Custom hook for BillManager UI logic
 * @param {Object} options - Configuration options
 * @returns {Object} UI logic state and actions
 */
export const useBillManagerUI = ({
  bills = [],
  categorizedBills = {},
  filteredBills = [],
  selectedBills,
  setSelectedBills,
  setShowAddBillModal,
  setEditingBill,
  setHistoryBill,
}) => {
  // View modes configuration with business logic
  const viewModes = useMemo(
    () => [
      {
        id: "upcoming",
        label: "Upcoming",
        count: categorizedBills.upcoming?.length || 0,
        icon: "Calendar",
        color: "blue",
      },
      {
        id: "overdue",
        label: "Overdue",
        count: categorizedBills.overdue?.length || 0,
        icon: "AlertTriangle",
        color: "red",
      },
      {
        id: "paid",
        label: "Paid",
        count: categorizedBills.paid?.length || 0,
        icon: "CheckCircle",
        color: "green",
      },
      {
        id: "all",
        label: "All Bills",
        count: bills?.length || 0,
        icon: "FileText",
        color: "gray",
      },
    ],
    [categorizedBills, bills],
  );

  // Bill selection logic
  const toggleBillSelection = useCallback(
    (billId) => {
      const newSelection = new Set(selectedBills);
      if (newSelection.has(billId)) {
        newSelection.delete(billId);
      } else {
        newSelection.add(billId);
      }
      setSelectedBills(newSelection);
    },
    [selectedBills, setSelectedBills],
  );

  const selectAllBills = useCallback(() => {
    const allBillIds = new Set(filteredBills.map((bill) => bill.id));
    setSelectedBills(allBillIds);
  }, [filteredBills, setSelectedBills]);

  const clearSelection = useCallback(() => {
    setSelectedBills(new Set());
  }, [setSelectedBills]);

  // Modal management logic
  const handleAddNewBill = useCallback(() => {
    setEditingBill(null);
    setShowAddBillModal(true);
  }, [setEditingBill, setShowAddBillModal]);

  const handleEditBill = useCallback(
    (bill) => {
      setEditingBill(bill);
      setShowAddBillModal(true);
    },
    [setEditingBill, setShowAddBillModal],
  );

  const handleCloseModal = useCallback(() => {
    setShowAddBillModal(false);
    setEditingBill(null);
  }, [setShowAddBillModal, setEditingBill]);

  const handleViewHistory = useCallback(
    (bill) => {
      setHistoryBill(bill);
    },
    [setHistoryBill],
  );

  // Bill display logic
  const getBillIcon = useCallback((bill) => {
    return getIconByName(bill.iconName) || "FileText";
  }, []);

  const getUrgencyColors = useCallback((urgency) => {
    const urgencyColors = {
      overdue: "text-red-600 bg-red-50",
      urgent: "text-orange-600 bg-orange-50",
      soon: "text-yellow-600 bg-yellow-50",
      normal: "text-green-600 bg-green-50",
    };
    return urgencyColors[urgency] || urgencyColors.normal;
  }, []);

  // Selection state helpers
  const selectionState = useMemo(() => {
    const hasSelection = selectedBills.size > 0;
    const isAllSelected =
      filteredBills.length > 0 && selectedBills.size === filteredBills.length;

    return {
      hasSelection,
      isAllSelected,
      selectedCount: selectedBills.size,
      selectedBillIds: Array.from(selectedBills),
    };
  }, [selectedBills, filteredBills]);

  // Summary card configuration factory
  const getSummaryCards = useCallback((totals = {}) => {
    const { overdue = 0, upcoming = 0, paid = 0, total = 0 } = totals;

    return [
      {
        label: "Overdue",
        value: overdue,
        color: "text-red-600",
        bg: "bg-red-50",
        priority: 1,
      },
      {
        label: "Upcoming",
        value: upcoming,
        color: "text-blue-600",
        bg: "bg-blue-50",
        priority: 2,
      },
      {
        label: "Paid This Month",
        value: paid,
        color: "text-green-600",
        bg: "bg-green-50",
        priority: 3,
      },
      {
        label: "Total",
        value: total,
        color: "text-gray-600",
        bg: "bg-gray-50",
        priority: 4,
      },
    ];
  }, []);

  // Bill row display logic
  const getBillDisplayData = useCallback(
    (bill) => {
      const Icon = getBillIcon(bill);
      const urgencyColors = getUrgencyColors(bill.urgency);
      const isSelected = selectedBills.has(bill.id);

      const dueDateDisplay = bill.dueDate
        ? new Date(bill.dueDate).toLocaleDateString()
        : "Not set";

      const daysDisplay =
        bill.daysUntilDue !== null
          ? bill.daysUntilDue < 0
            ? `${Math.abs(bill.daysUntilDue)} days overdue`
            : `${bill.daysUntilDue} days left`
          : null;

      return {
        Icon,
        urgencyColors,
        isSelected,
        dueDateDisplay,
        daysDisplay,
        statusText: bill.isPaid ? "Paid" : bill.urgency,
        amount: Math.abs(bill.amount).toFixed(2),
      };
    },
    [getBillIcon, getUrgencyColors, selectedBills],
  );

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
};
