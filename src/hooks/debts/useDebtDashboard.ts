/**
 * useDebtDashboard hook - Business logic for DebtDashboard component
 * Handles filtering, sorting, stats calculation, and modal state management
 */

import { useState, useMemo } from "react";
import { useDebtManagement } from "./useDebtManagement";
import logger from "../../utils/common/logger";

export const useDebtDashboard = () => {
  const {
    debts,
    debtStats,
    createDebt,
    updateDebt,
    deleteDebt,
    recordPayment,
    getUpcomingPayments,
  } = useDebtManagement();

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [showUpcomingPaymentsModal, setShowUpcomingPaymentsModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    type: "all",
    status: "all",
    sortBy: "currentBalance",
    sortOrder: "desc",
  });

  // Get upcoming payments
  const upcomingPayments = useMemo(() => {
    if (!debts || debts.length === 0) return [];
    return getUpcomingPayments(30); // Next 30 days
  }, [debts, getUpcomingPayments]);

  // Filter and sort debts
  const filteredDebts = useMemo(() => {
    if (!debts) return [];

    let filtered = [...debts];

    // Filter by type
    if (filterOptions.type !== "all") {
      filtered = filtered.filter((debt) => debt.type === filterOptions.type);
    }

    // Filter by status
    if (filterOptions.status !== "all") {
      filtered = filtered.filter((debt) => debt.status === filterOptions.status);
    }

    // Sort debts
    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = filterOptions;
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle null/undefined values
      if (aValue == null) aValue = 0;
      if (bValue == null) bValue = 0;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [debts, filterOptions]);

  // Modal handlers
  const handleAddDebt = () => {
    setEditingDebt(null);
    setShowAddModal(true);
  };

  const handleEditDebt = (debt) => {
    setEditingDebt(debt);
    setShowAddModal(true);
  };

  const handleDebtClick = (debt) => {
    setSelectedDebt(debt);
  };

  const handleModalSubmit = async (debtData) => {
    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, debtData);
      } else {
        await createDebt(debtData);
      }
      setShowAddModal(false);
      setEditingDebt(null);
    } catch (error) {
      logger.error("Failed to save debt:", error);
      throw error;
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      await deleteDebt(debtId);
      setSelectedDebt(null);
    } catch (error) {
      logger.error("Failed to delete debt:", error);
      throw error;
    }
  };

  const handleRecordPayment = async (debtId, paymentData) => {
    try {
      await recordPayment(debtId, paymentData);
      // Refresh selected debt if it's the one being paid
      if (selectedDebt && selectedDebt.id === debtId) {
        const updatedDebt = debts.find((d) => d.id === debtId);
        setSelectedDebt(updatedDebt);
      }
    } catch (error) {
      logger.error("Failed to record payment:", error);
      throw error;
    }
  };

  return {
    // Data
    debts: filteredDebts,
    debtStats,
    upcomingPayments,

    // UI state
    activeTab,
    setActiveTab,
    showAddModal,
    selectedDebt,
    setSelectedDebt,
    editingDebt,
    showUpcomingPaymentsModal,
    setShowUpcomingPaymentsModal,
    filterOptions,
    setFilterOptions,

    // Actions
    handleAddDebt,
    handleEditDebt,
    handleDebtClick,
    handleModalSubmit,
    handleDeleteDebt,
    handleRecordPayment,
  };
};
