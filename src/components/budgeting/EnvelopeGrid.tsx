// src/components/budgeting/EnvelopeGrid.jsx - Refactored with separated logic
import { Select } from "@/components/ui";
import React, { useState, useMemo, lazy, Suspense } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useUnassignedCash } from "../../hooks/budgeting/useBudgetMetadata";
import { useEnvelopes } from "../../hooks/budgeting/useEnvelopes";
import { useTransactions } from "../../hooks/common/useTransactions";
import useBills from "../../hooks/bills/useBills";
import {
  calculateEnvelopeData,
  sortEnvelopes,
  filterEnvelopes,
  calculateEnvelopeTotals,
} from "../../utils/budgeting";
import EnvelopeHeader from "./envelope/EnvelopeHeader";
import EnvelopeSummary from "./envelope/EnvelopeSummary";
import EnvelopeItem from "./envelope/EnvelopeItem";
import UnassignedCashEnvelope from "./envelope/UnassignedCashEnvelope";
import EmptyStateHints from "../onboarding/EmptyStateHints";
import logger from "../../utils/common/logger";
import PullToRefreshIndicator from "../mobile/PullToRefreshIndicator";
import usePullToRefresh from "../../hooks/mobile/usePullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

// Lazy load modals for better performance
const EnvelopeCreateModal = lazy(() => import("./CreateEnvelopeModal"));
const EnvelopeEditModal = lazy(() => import("./EditEnvelopeModal"));
const EnvelopeHistoryModal = lazy(() => import("./envelope/EnvelopeHistoryModal"));
const QuickFundModal = lazy(() => import("../modals/QuickFundModal"));

// Empty state component
const EmptyStateView = ({ filterOptions, setShowCreateModal }) => {
  const isAllFilters = filterOptions.envelopeType === "all" && filterOptions.showEmpty;
  
  if (isAllFilters) {
    return <EmptyStateHints type="envelopes" onAction={() => setShowCreateModal(true)} />;
  }
  
  return (
    <div className="text-center py-12">
      <div className="text-gray-500 text-lg">No envelopes found</div>
      <p className="text-gray-400 mt-2">Try adjusting your filters</p>
    </div>
  );
};

// Modals container component
const EnvelopeModals = ({
  showCreateModal,
  setShowCreateModal,
  handleCreateEnvelope,
  envelopes,
  budget,
  unassignedCash,
  editingEnvelope,
  setEditingEnvelope,
  handleUpdateEnvelope,
  deleteEnvelope,
  updateBill,
  bills,
  historyEnvelope,
  setHistoryEnvelope,
  quickFundModal,
  closeQuickFundModal,
  handleQuickFundConfirm,
}) => (
  <Suspense fallback={<div>Loading...</div>}>
    {showCreateModal && (
      <EnvelopeCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEnvelope={handleCreateEnvelope}
        existingEnvelopes={envelopes}
        currentUser={budget.currentUser}
        unassignedCash={unassignedCash}
      />
    )}

    {editingEnvelope && (
      <EnvelopeEditModal
        isOpen={!!editingEnvelope}
        onClose={() => setEditingEnvelope(null)}
        envelope={editingEnvelope}
        onUpdateEnvelope={handleUpdateEnvelope}
        onDeleteEnvelope={deleteEnvelope}
        onUpdateBill={(bill) => {
          try {
            updateBill({ id: bill.id, updates: bill });
          } catch (error) {
            logger.warn("TanStack updateBill failed, using Zustand fallback", error);
            budget.updateBill(bill);
          }
        }}
        existingEnvelopes={envelopes}
        allBills={bills}
        currentUser={budget.currentUser}
      />
    )}

    {historyEnvelope && (
      <EnvelopeHistoryModal
        isOpen={!!historyEnvelope}
        onClose={() => setHistoryEnvelope(null)}
        envelope={historyEnvelope}
      />
    )}

    {quickFundModal.isOpen && (
      <QuickFundModal
        isOpen={quickFundModal.isOpen}
        onClose={closeQuickFundModal}
        onConfirm={handleQuickFundConfirm}
        envelope={quickFundModal.envelope}
        suggestedAmount={quickFundModal.suggestedAmount}
        unassignedCash={unassignedCash}
      />
    )}
  </Suspense>
);

// Main grid view component
const EnvelopeGridView = ({
  containerRef,
  touchHandlers,
  pullStyles,
  className,
  isPulling,
  isRefreshing,
  pullProgress,
  isReady,
  pullRotation,
  totals,
  unassignedCash,
  filterOptions,
  setFilterOptions,
  setShowCreateModal,
  viewMode,
  setViewMode,
  handleViewHistory,
  sortedEnvelopes,
  handleEnvelopeSelect,
  handleEnvelopeEdit,
  handleQuickFund,
  selectedEnvelopeId,
  bills,
  ...modalProps
}) => (
  <div
    ref={containerRef}
    {...touchHandlers}
    className={`space-y-6 ${className} relative`}
    style={pullStyles}
  >
    <PullToRefreshIndicator
      isPulling={isPulling}
      isRefreshing={isRefreshing}
      pullProgress={pullProgress}
      isReady={isReady}
      pullRotation={pullRotation}
    />

    <EnvelopeSummary totals={totals} unassignedCash={unassignedCash} />

    <EnvelopeHeader
      filterOptions={filterOptions}
      setFilterOptions={setFilterOptions}
      setShowCreateModal={setShowCreateModal}
      viewMode={viewMode}
      setViewMode={setViewMode}
    />

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <UnassignedCashEnvelope unassignedCash={unassignedCash} onViewHistory={handleViewHistory} />
      {sortedEnvelopes.map((envelope) => (
        <EnvelopeItem
          key={envelope.id}
          envelope={envelope}
          onSelect={handleEnvelopeSelect}
          onEdit={handleEnvelopeEdit}
          onViewHistory={handleViewHistory}
          onQuickFund={handleQuickFund}
          isSelected={selectedEnvelopeId === envelope.id}
          bills={bills}
          unassignedCash={unassignedCash}
        />
      ))}
    </div>

    {sortedEnvelopes.length === 0 && (
      <EmptyStateView filterOptions={filterOptions} setShowCreateModal={setShowCreateModal} />
    )}

    <EnvelopeModals {...modalProps} />
  </div>
);

// Hook for envelope UI state and handlers
const useEnvelopeUIState = (envelopeData, updateEnvelope, addEnvelope) => {
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState(null);
  const [viewMode, setViewMode] = useState("overview");
  const [historyEnvelope, setHistoryEnvelope] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState(null);
  const [quickFundModal, setQuickFundModal] = useState({
    isOpen: false,
    envelope: null,
    suggestedAmount: 0,
  });
  const [filterOptions, setFilterOptions] = useState({
    timeRange: "current_month",
    showEmpty: true,
    sortBy: "usage_desc",
    envelopeType: "all",
  });

  const handleEnvelopeSelect = (envelopeId) => {
    setSelectedEnvelopeId(envelopeId === selectedEnvelopeId ? null : envelopeId);
  };

  const handleQuickFund = (envelopeId, suggestedAmount) => {
    const envelope = envelopeData.find((env) => env.id === envelopeId);
    if (envelope) {
      setQuickFundModal({ isOpen: true, envelope, suggestedAmount });
    }
  };

  const handleQuickFundConfirm = async (envelopeId, amount) => {
    try {
      const currentAllocated = envelopeData.find((env) => env.id === envelopeId)?.allocated || 0;
      await updateEnvelope({
        envelopeId,
        updates: { allocated: currentAllocated + amount },
      });
      logger.info(`Quick funded $${amount} to envelope ${envelopeId}`);
    } catch (error) {
      logger.error("Failed to quick fund envelope:", error);
    }
  };

  const closeQuickFundModal = () => {
    setQuickFundModal({ isOpen: false, envelope: null, suggestedAmount: 0 });
  };

  const handleEnvelopeEdit = (envelope) => setEditingEnvelope(envelope);
  const handleViewHistory = (envelope) => setHistoryEnvelope(envelope);

  const handleCreateEnvelope = async (envelopeData) => {
    try {
      await addEnvelope(envelopeData);
      setShowCreateModal(false);
    } catch (error) {
      logger.error("Failed to create envelope:", error);
    }
  };

  const handleUpdateEnvelope = async (envelopeData) => {
    try {
      await updateEnvelope({ id: envelopeData.id, updates: envelopeData });
      setEditingEnvelope(null);
    } catch (error) {
      logger.error("Failed to update envelope:", error);
    }
  };

  return {
    selectedEnvelopeId,
    viewMode,
    setViewMode,
    historyEnvelope,
    setHistoryEnvelope,
    showCreateModal,
    setShowCreateModal,
    editingEnvelope,
    setEditingEnvelope,
    quickFundModal,
    filterOptions,
    setFilterOptions,
    handleEnvelopeSelect,
    handleQuickFund,
    handleQuickFundConfirm,
    closeQuickFundModal,
    handleEnvelopeEdit,
    handleViewHistory,
    handleCreateEnvelope,
    handleUpdateEnvelope,
  };
};

// Hook to resolve data from multiple sources with priority
const useResolvedData = (propEnvelopes, propTransactions, propUnassignedCash) => {
  const {
    envelopes: tanStackEnvelopes = [],
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { data: tanStackTransactions = [], isLoading: transactionsLoading } = useTransactions();
  const { bills: tanStackBills = [], updateBill, isLoading: billsLoading } = useBills();
  const { unassignedCash: tanStackUnassignedCash } = useUnassignedCash();
  const budget = useBudgetStore();

  const envelopes = useMemo(
    () =>
      propEnvelopes?.length
        ? propEnvelopes
        : tanStackEnvelopes.length
          ? tanStackEnvelopes
          : budget.envelopes || [],
    [propEnvelopes, tanStackEnvelopes, budget.envelopes]
  );

  const transactions = useMemo(
    () =>
      propTransactions?.length
        ? propTransactions
        : tanStackTransactions.length
          ? tanStackTransactions
          : budget.transactions || [],
    [propTransactions, tanStackTransactions, budget.transactions]
  );

  const unassignedCash =
    propUnassignedCash !== undefined ? propUnassignedCash : tanStackUnassignedCash || 0;

  const bills = useMemo(() => {
    const result = tanStackBills.length ? tanStackBills : budget.bills || [];
    logger.debug("🔍 EnvelopeGrid bills debug:", {
      tanStackBills,
      tanStackBillsLength: tanStackBills.length,
      budgetBills: budget.bills,
      budgetBillsLength: budget.bills?.length,
      finalResult: result,
      finalLength: result.length,
    });
    return result;
  }, [tanStackBills, budget.bills]);

  const isLoading = envelopesLoading || transactionsLoading || billsLoading;

  return {
    envelopes,
    transactions,
    bills,
    unassignedCash,
    budget,
    isLoading,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    updateBill,
  };
};

const UnifiedEnvelopeManager = ({
  envelopes: propEnvelopes = [],
  transactions: propTransactions = [],
  unassignedCash: propUnassignedCash,
  className = "",
}) => {
  const {
    envelopes,
    transactions,
    bills,
    unassignedCash,
    budget,
    isLoading,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    updateBill,
  } = useResolvedData(propEnvelopes, propTransactions, propUnassignedCash);

  // Calculate envelope data
  const envelopeData = useMemo(
    () => calculateEnvelopeData(envelopes, transactions, bills),
    [envelopes, transactions, bills]
  );

  // UI state and handlers
  const uiState = useEnvelopeUIState(envelopeData, updateEnvelope, addEnvelope);

  // Computed envelope data
  const sortedEnvelopes = useMemo(() => {
    const filtered = filterEnvelopes(envelopeData, uiState.filterOptions);
    return sortEnvelopes(filtered, uiState.filterOptions.sortBy);
  }, [envelopeData, uiState.filterOptions]);

  const totals = useMemo(() => calculateEnvelopeTotals(envelopeData), [envelopeData]);

  // Pull-to-refresh
  const queryClient = useQueryClient();
  const refreshEnvelopeData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["envelopes"] }),
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      queryClient.invalidateQueries({ queryKey: ["bills"] }),
      queryClient.invalidateQueries({ queryKey: ["unassignedCash"] }),
    ]);
  };

  const pullToRefresh = usePullToRefresh(refreshEnvelopeData, {
    threshold: 80,
    resistance: 2.5,
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <EnvelopeGridView
      containerRef={pullToRefresh.containerRef}
      touchHandlers={pullToRefresh.touchHandlers}
      pullStyles={pullToRefresh.pullStyles}
      className={className}
      isPulling={pullToRefresh.isPulling}
      isRefreshing={pullToRefresh.isRefreshing}
      pullProgress={pullToRefresh.pullProgress}
      isReady={pullToRefresh.isReady}
      pullRotation={pullToRefresh.pullRotation}
      totals={totals}
      unassignedCash={unassignedCash}
      filterOptions={uiState.filterOptions}
      setFilterOptions={uiState.setFilterOptions}
      setShowCreateModal={uiState.setShowCreateModal}
      viewMode={uiState.viewMode}
      setViewMode={uiState.setViewMode}
      handleViewHistory={uiState.handleViewHistory}
      sortedEnvelopes={sortedEnvelopes}
      handleEnvelopeSelect={uiState.handleEnvelopeSelect}
      handleEnvelopeEdit={uiState.handleEnvelopeEdit}
      handleQuickFund={uiState.handleQuickFund}
      selectedEnvelopeId={uiState.selectedEnvelopeId}
      bills={bills}
      showCreateModal={uiState.showCreateModal}
      handleCreateEnvelope={uiState.handleCreateEnvelope}
      envelopes={envelopes}
      budget={budget}
      editingEnvelope={uiState.editingEnvelope}
      setEditingEnvelope={uiState.setEditingEnvelope}
      handleUpdateEnvelope={uiState.handleUpdateEnvelope}
      deleteEnvelope={deleteEnvelope}
      updateBill={updateBill}
      historyEnvelope={uiState.historyEnvelope}
      setHistoryEnvelope={uiState.setHistoryEnvelope}
      quickFundModal={uiState.quickFundModal}
      closeQuickFundModal={uiState.closeQuickFundModal}
      handleQuickFundConfirm={uiState.handleQuickFundConfirm}
    />
  );
};

export default UnifiedEnvelopeManager;
