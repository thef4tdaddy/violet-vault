// src/components/budgeting/EnvelopeGrid.jsx - Refactored with separated logic
import React, { useState, useMemo, lazy, Suspense } from "react";
import { useBudgetStore } from "../../stores/budgetStore";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import { useTransactions } from "../../hooks/useTransactions";
import useBills from "../../hooks/useBills";
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
import logger from "../../utils/logger";

// Lazy load modals for better performance
const EnvelopeCreateModal = lazy(() => import("./CreateEnvelopeModal"));
const EnvelopeEditModal = lazy(() => import("./EditEnvelopeModal"));
const EnvelopeHistoryModal = lazy(() => import("./envelope/EnvelopeHistoryModal"));

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
    propUnassignedCash !== undefined ? propUnassignedCash : budget.unassignedCash || 0;

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
  const [filterOptions, setFilterOptions] = useState({
    timeRange: "current_month",
    showEmpty: true,
    sortBy: "usage_desc",
    envelopeType: "all",
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
    <div className={`space-y-6 ${className}`}>
      <EnvelopeHeader
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        setShowCreateModal={setShowCreateModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <EnvelopeSummary totals={totals} />

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
            isSelected={selectedEnvelopeId === envelope.id}
            bills={bills}
          />
        ))}
      </div>

      {sortedEnvelopes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No envelopes found</div>
          <p className="text-gray-400 mt-2">
            {filterOptions.envelopeType !== "all" || !filterOptions.showEmpty
              ? "Try adjusting your filters"
              : "Create your first envelope to get started"}
          </p>
        </div>
      )}

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
      </Suspense>
    </div>
  );
};

export default UnifiedEnvelopeManager;
