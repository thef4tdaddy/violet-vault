// src/components/budgeting/EnvelopeGrid.jsx - Refactored with separated logic
import { useState, useMemo, lazy, Suspense } from "react";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useUnassignedCash } from "../../hooks/budgeting/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useTransactions } from "@/hooks/common/useTransactions";
import useBills from "../../hooks/bills/useBills";
import {
  calculateEnvelopeData,
  sortEnvelopes,
  filterEnvelopes,
  calculateEnvelopeTotals,
} from "@/utils/budgeting";
import EnvelopeGridView from "./envelope/EnvelopeGridView";
import logger from "../../utils/common/logger";
import usePullToRefresh from "../../hooks/mobile/usePullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { EnvelopeGridPropsSchema } from "@/domain/schemas/component-props";

// Lazy load modals for better performance
const EnvelopeCreateModal = lazy(() => import("./CreateEnvelopeModal"));
const EnvelopeEditModal = lazy(() => import("./EditEnvelopeModal"));
const EnvelopeHistoryModal = lazy(() => import("./envelope/EnvelopeHistoryModal"));
const QuickFundModal = lazy(() => import("../modals/QuickFundModal"));

// Modals container component
interface EnvelopeRef { id: string }

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
  updateBill: _updateBill,
  bills: _bills,
  historyEnvelope,
  setHistoryEnvelope,
  quickFundModal,
  closeQuickFundModal,
  handleQuickFundConfirm,
}: {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  handleCreateEnvelope: (data: unknown) => Promise<void>;
  envelopes: unknown[];
  budget: { currentUser: unknown; updateBill: (bill: unknown) => void };
  unassignedCash: number;
  editingEnvelope: EnvelopeRef | null;
  setEditingEnvelope: (env: EnvelopeRef | null) => void;
  handleUpdateEnvelope: (data: unknown) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  updateBill: (data: { id: string; updates: unknown }) => Promise<void>;
  bills: unknown[];
  historyEnvelope: EnvelopeRef | null;
  setHistoryEnvelope: (env: EnvelopeRef | null) => void;
  quickFundModal: { isOpen: boolean; envelope: EnvelopeRef | null; suggestedAmount: number };
  closeQuickFundModal: () => void;
  handleQuickFundConfirm: (id: string, amount: number) => Promise<void>;
}) => (
  <Suspense fallback={<div>Loading...</div>}>
    {showCreateModal && (
      <EnvelopeCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEnvelope={handleCreateEnvelope}
        onCreateBill={() => {}}
        existingEnvelopes={envelopes}
        currentUser={
          (budget.currentUser as { userName: string; userColor: string } | undefined) || {
            userName: "User",
            userColor: "#000000",
          }
        }
      />
    )}

    {editingEnvelope && (
      <EnvelopeEditModal
        isOpen={!!editingEnvelope}
        onClose={() => setEditingEnvelope(null)}
        envelope={editingEnvelope as EnvelopeRef}
        onUpdateEnvelope={handleUpdateEnvelope}
        onDeleteEnvelope={deleteEnvelope}
        existingEnvelopes={envelopes}
        currentUser={
          (budget.currentUser as { userName: string; userColor: string } | undefined) || {
            userName: "User",
            userColor: "#000000",
          }
        }
      />
    )}

    {historyEnvelope && (
      <EnvelopeHistoryModal
        isOpen={!!historyEnvelope}
        onClose={() => setHistoryEnvelope(null)}
        envelope={historyEnvelope as EnvelopeRef}
      />
    )}

    {quickFundModal.isOpen && (
      <QuickFundModal
        isOpen={quickFundModal.isOpen}
        onClose={closeQuickFundModal}
        onConfirm={handleQuickFundConfirm}
        envelope={quickFundModal.envelope as EnvelopeRef}
        suggestedAmount={quickFundModal.suggestedAmount}
        unassignedCash={unassignedCash}
      />
    )}
  </Suspense>
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

  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactions();
  const { bills: tanStackBills = [], updateBill, isLoading: billsLoading } = useBills();
  const { unassignedCash: tanStackUnassignedCash } = useUnassignedCash();
  // Selective subscriptions - only subscribe to specific properties needed
  const budgetEnvelopes = useBudgetStore((state) => state.envelopes);
  const budgetTransactions = useBudgetStore((state) => state.transactions);
  const budgetBills = useBudgetStore((state) => state.bills);
  const budgetCurrentUser = useBudgetStore((state) => state.currentUser);
  const budgetUpdateBill = useBudgetStore((state) => state.updateBill);

  const envelopes = useMemo(
    () =>
      propEnvelopes?.length
        ? propEnvelopes
        : tanStackEnvelopes.length
          ? tanStackEnvelopes
          : budgetEnvelopes || [],
    [propEnvelopes, tanStackEnvelopes, budgetEnvelopes]
  );

  const transactions = useMemo(
    () =>
      propTransactions?.length
        ? propTransactions
        : tanStackTransactions.length
          ? tanStackTransactions
          : budgetTransactions || [],
    [propTransactions, tanStackTransactions, budgetTransactions]
  );

  const unassignedCash =
    propUnassignedCash !== undefined ? propUnassignedCash : tanStackUnassignedCash || 0;

  const bills = useMemo(() => {
    const result = tanStackBills.length ? tanStackBills : budgetBills || [];
    logger.debug("🔍 EnvelopeGrid bills debug:", {
      tanStackBills,
      tanStackBillsLength: tanStackBills.length,
      budgetBills: budgetBills,
      budgetBillsLength: budgetBills?.length,
      finalResult: result,
      finalLength: result.length,
    });
    return result;
  }, [tanStackBills, budgetBills]);

  const isLoading = envelopesLoading || transactionsLoading || billsLoading;

  return {
    envelopes,
    transactions,
    bills,
    unassignedCash,
    budget: {
      currentUser: budgetCurrentUser,
      updateBill: budgetUpdateBill,
    },
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
  // Validate props in development
  validateComponentProps(
    "EnvelopeGrid",
    {
      envelopes: propEnvelopes,
      transactions: propTransactions,
      unassignedCash: propUnassignedCash,
      className,
    },
    EnvelopeGridPropsSchema
  );

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
    >
      <EnvelopeModals
        showCreateModal={uiState.showCreateModal}
        setShowCreateModal={uiState.setShowCreateModal}
        handleCreateEnvelope={uiState.handleCreateEnvelope}
        envelopes={envelopes}
        budget={budget}
        unassignedCash={unassignedCash}
        editingEnvelope={uiState.editingEnvelope}
        setEditingEnvelope={uiState.setEditingEnvelope}
        handleUpdateEnvelope={uiState.handleUpdateEnvelope}
        deleteEnvelope={(id: string) => Promise.resolve(deleteEnvelope(id))}
        updateBill={async (data: { id: string; updates: unknown }) => {
          updateBill(data.updates as never);
        }}
        bills={bills}
        historyEnvelope={uiState.historyEnvelope}
        setHistoryEnvelope={uiState.setHistoryEnvelope}
        quickFundModal={uiState.quickFundModal}
        closeQuickFundModal={uiState.closeQuickFundModal}
        handleQuickFundConfirm={uiState.handleQuickFundConfirm}
      />
    </EnvelopeGridView>
  );
};

export default UnifiedEnvelopeManager;
