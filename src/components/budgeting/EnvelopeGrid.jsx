// src/components/budgeting/EnvelopeGrid.jsx - Refactored with separated logic
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

const UnifiedEnvelopeManager = ({
  envelopes: propEnvelopes = [],
  transactions: propTransactions = [],
  unassignedCash: propUnassignedCash,
  className = "",
}) => {
  // Enhanced TanStack Query integration with loading states
  const {
    envelopes: tanStackEnvelopes = [],
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { data: tanStackTransactions = [], isLoading: transactionsLoading } = useTransactions();
  const { bills: tanStackBills = [], updateBill, isLoading: billsLoading } = useBills();

  // Use TanStack Query for unassigned cash
  const { unassignedCash: tanStackUnassignedCash } = useUnassignedCash();

  // Keep Zustand for non-migrated operations and fallbacks
  const budget = useBudgetStore();

  // Data resolution with fallbacks
  const envelopes = useMemo(
    () =>
      propEnvelopes && propEnvelopes.length
        ? propEnvelopes
        : tanStackEnvelopes.length
          ? tanStackEnvelopes
          : budget.envelopes || [],
    [propEnvelopes, tanStackEnvelopes, budget.envelopes]
  );

  const transactions = useMemo(
    () =>
      propTransactions && propTransactions.length
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

  // UI State
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

  // Pull-to-refresh functionality for envelope data
  const queryClient = useQueryClient();

  const refreshEnvelopeData = async () => {
    // Invalidate and refetch all envelope-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["envelopes"] }),
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      queryClient.invalidateQueries({ queryKey: ["bills"] }),
      queryClient.invalidateQueries({ queryKey: ["unassignedCash"] }),
    ]);
  };

  const {
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    isReady,
    touchHandlers,
    containerRef,
    pullStyles,
    pullRotation,
  } = usePullToRefresh(refreshEnvelopeData, {
    threshold: 80,
    resistance: 2.5,
    enabled: true,
  });

  // Calculate envelope data using utility functions
  const envelopeData = useMemo(() => {
    return calculateEnvelopeData(envelopes, transactions, bills);
  }, [envelopes, transactions, bills]);

  const sortedEnvelopes = useMemo(() => {
    const filtered = filterEnvelopes(envelopeData, filterOptions);
    return sortEnvelopes(filtered, filterOptions.sortBy);
  }, [envelopeData, filterOptions]);

  const totals = useMemo(() => {
    return calculateEnvelopeTotals(envelopeData);
  }, [envelopeData]);

  // Event Handlers
  const handleEnvelopeSelect = (envelopeId) => {
    setSelectedEnvelopeId(envelopeId === selectedEnvelopeId ? null : envelopeId);
  };

  const handleQuickFund = (envelopeId, suggestedAmount) => {
    const envelope = envelopeData.find((env) => env.id === envelopeId);
    if (envelope) {
      setQuickFundModal({
        isOpen: true,
        envelope,
        suggestedAmount,
      });
    }
  };

  const handleQuickFundConfirm = async (envelopeId, amount) => {
    try {
      await updateEnvelope({
        envelopeId,
        updates: {
          allocated: (envelopeData.find((env) => env.id === envelopeId)?.allocated || 0) + amount,
        },
      });
      logger.info(`Quick funded $${amount} to envelope ${envelopeId}`);
    } catch (error) {
      logger.error("Failed to quick fund envelope:", error);
    }
  };

  const closeQuickFundModal = () => {
    setQuickFundModal({
      isOpen: false,
      envelope: null,
      suggestedAmount: 0,
    });
  };

  const handleEnvelopeEdit = (envelope) => {
    setEditingEnvelope(envelope);
  };

  const handleViewHistory = (envelope) => {
    setHistoryEnvelope(envelope);
  };

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

  if (envelopesLoading || transactionsLoading || billsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      {...touchHandlers}
      className={`space-y-6 ${className} relative`}
      style={pullStyles}
    >
      {/* Pull-to-refresh indicator */}
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

      {/* Envelopes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Unassigned Cash Envelope - Always shown first */}
        <UnassignedCashEnvelope unassignedCash={unassignedCash} onViewHistory={handleViewHistory} />

        {/* Regular Envelopes */}
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

      {sortedEnvelopes.length === 0 &&
        (filterOptions.envelopeType === "all" && filterOptions.showEmpty ? (
          <EmptyStateHints type="envelopes" onAction={() => setShowCreateModal(true)} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No envelopes found</div>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ))}

      {/* Modals */}
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
              // Use TanStack mutation with Zustand fallback
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
    </div>
  );
};

export default UnifiedEnvelopeManager;
