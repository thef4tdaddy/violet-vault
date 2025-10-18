/**
 * useBillManagerUI Hook
 * Additional UI logic extraction from BillManager for Issue #152
 *
 * Handles UI-specific business logic like selection, modal management, and display rules
 */
import { useCallback, useMemo } from "react";
import { getIconByName } from "../../utils/common/billIcons";

// Urgency color mapping
const URGENCY_COLORS = {
  overdue: "text-red-600 bg-red-50",
  urgent: "text-orange-600 bg-orange-50",
  soon: "text-yellow-600 bg-yellow-50",
  normal: "text-green-600 bg-green-50",
};

// Helper to create view mode configuration
const createViewMode = (id, label, count, icon, color) => ({
  id,
  label,
  count,
  icon,
  color,
});

// Helper to create summary card configuration
const createSummaryCard = (label, value, color, bg, priority) => ({
  label,
  value,
  color,
  bg,
  priority,
});

// Helper to format days display
const formatDaysDisplay = (daysUntilDue) => {
  if (daysUntilDue === null) return null;
  if (daysUntilDue < 0) {
    return `${Math.abs(daysUntilDue)} days overdue`;
  }
  return `${daysUntilDue} days left`;
};

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
      createViewMode("upcoming", "Upcoming", categorizedBills.upcoming?.length || 0, "Calendar", "blue"),
      createViewMode("overdue", "Overdue", categorizedBills.overdue?.length || 0, "AlertTriangle", "red"),
      createViewMode("paid", "Paid", categorizedBills.paid?.length || 0, "CheckCircle", "green"),
      createViewMode("all", "All Bills", bills?.length || 0, "FileText", "gray"),
    ],
    [categorizedBills, bills]
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
    [selectedBills, setSelectedBills]
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
    [setEditingBill, setShowAddBillModal]
  );

  const handleCloseModal = useCallback(() => {
    setShowAddBillModal(false);
    setEditingBill(null);
  }, [setShowAddBillModal, setEditingBill]);

  const handleViewHistory = useCallback(
    (bill) => {
      setHistoryBill(bill);
    },
    [setHistoryBill]
  );

  // Bill display logic
  const getBillIcon = useCallback((bill) => {
    return getIconByName(bill.iconName) || "FileText";
  }, []);

  const getUrgencyColors = useCallback((urgency) => {
    return URGENCY_COLORS[urgency] || URGENCY_COLORS.normal;
  }, []);

  // Selection state helpers
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

  // Summary card configuration factory
  const getSummaryCards = useCallback((totals = {}) => {
    const { overdue = 0, upcoming = 0, paid = 0, total = 0 } = totals;

    return [
      createSummaryCard("Overdue", overdue, "text-red-600", "bg-red-50", 1),
      createSummaryCard("Upcoming", upcoming, "text-blue-600", "bg-blue-50", 2),
      createSummaryCard("Paid This Month", paid, "text-green-600", "bg-green-50", 3),
      createSummaryCard("Total", total, "text-gray-600", "bg-gray-50", 4),
    ];
  }, []);

  // Bill row display logic
  const getBillDisplayData = useCallback(
    (bill) => {
      const Icon = getBillIcon(bill);
      const urgencyColors = getUrgencyColors(bill.urgency);
      const isSelected = selectedBills.has(bill.id);

      const dueDateDisplay = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "Not set";
      const daysDisplay = formatDaysDisplay(bill.daysUntilDue);

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
    [getBillIcon, getUrgencyColors, selectedBills]
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
