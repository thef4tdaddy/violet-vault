import { useState, useMemo } from "react";
import { useDebtManagement } from "@/hooks/budgeting/envelopes/liabilities/useDebtManagement";
import logger from "@/utils/core/common/logger";
import type { DebtSubmissionData } from "./useDebtForm";
import type { DebtAccount } from "@/types/debt";

// Helper function to process debt updates
const processDebtUpdateHelper = async (
  debtId: string,
  rawUpdates: Record<string, unknown>,
  updateDebt: (id: string, updates: unknown) => Promise<void>,
  linkDebtToBill?: (debtId: string, billId: string) => Promise<void>
): Promise<void> => {
  const {
    connectionData,
    paymentMethod,
    createBill: _createBill,
    existingBillId,
    newEnvelopeName: _newEnvelopeName,
    ...debtUpdates
  } = rawUpdates;

  await updateDebt(debtId, debtUpdates);

  const connectionPayload =
    connectionData && typeof connectionData === "object"
      ? (connectionData as { existingBillId?: string | number; paymentMethod?: string })
      : null;

  const targetBillId = existingBillId ?? connectionPayload?.existingBillId;

  if (
    linkDebtToBill &&
    targetBillId &&
    (paymentMethod === "connect_existing_bill" ||
      connectionPayload?.paymentMethod === "connect_existing_bill")
  ) {
    await linkDebtToBill(debtId, String(targetBillId));
  }
};

export const useDebtDashboard = () => {
  const {
    debts,
    debtStats,
    createDebt,
    updateDebt,
    deleteDebt,
    recordPayment,
    getUpcomingPayments,
    linkDebtToBill,
  } = useDebtManagement();

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtAccount | null>(null);
  const [editingDebt, setEditingDebt] = useState<DebtAccount | null>(null);
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
  const filterAndSortDebts = useMemo(() => {
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
      let aValue = a[sortBy as keyof typeof a] as number | undefined;
      let bValue = b[sortBy as keyof typeof b] as number | undefined;

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

  const filteredDebts = filterAndSortDebts;

  // Modal handlers
  const handleAddDebt = (): void => {
    setEditingDebt(null);
    setShowAddModal(true);
  };
  const handleEditDebt = (debt: DebtAccount): void => {
    setEditingDebt(debt);
    setShowAddModal(true);
  };
  const handleDebtClick = (debt: DebtAccount): void => setSelectedDebt(debt);
  const handleCloseModal = (): void => {
    setShowAddModal(false);
    setEditingDebt(null);
  };

  const handleModalSubmit = async (
    debtIdOrData: DebtSubmissionData | string,
    maybeUpdates?: DebtSubmissionData
  ): Promise<void> => {
    try {
      const isUpdatePayload = typeof debtIdOrData === "string" || typeof debtIdOrData === "number";

      if (isUpdatePayload) {
        await processDebtUpdateHelper(
          String(debtIdOrData),
          (maybeUpdates ?? {}) as Record<string, unknown>,
          updateDebt as (id: string, updates: unknown) => Promise<void>,
          linkDebtToBill
        );
      } else {
        await createDebt(debtIdOrData as Parameters<typeof createDebt>[0]);
      }
      handleCloseModal();
    } catch (error) {
      logger.error("Failed to save debt:", error);
      throw error;
    }
  };

  const handleDeleteDebt = async (debtId: string): Promise<void> => {
    try {
      await deleteDebt(debtId);
      setSelectedDebt(null);
    } catch (error) {
      logger.error("Failed to delete debt:", error);
      throw error;
    }
  };
  const handleRecordPayment = async (
    debtId: string,
    paymentData: { amount: number; date?: string }
  ): Promise<void> => {
    try {
      await recordPayment(debtId, {
        amount: paymentData.amount,
        paymentDate: paymentData.date || new Date().toISOString().split("T")[0],
      });
      if (selectedDebt && selectedDebt.id === debtId) {
        setSelectedDebt(debts.find((d) => d.id === debtId) ?? null);
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
    handleCloseModal,
    handleModalSubmit,
    handleDeleteDebt,
    handleRecordPayment,
  };
};
