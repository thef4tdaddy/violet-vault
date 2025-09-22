/**
 * BillManager Component - Refactored for Issue #152
 *
 * UI-only component using useBillManager hook for business logic
 * Reduced from 1,156 LOC to ~400 LOC by extracting business logic
 */
import React from "react";
import { useBillManager } from "../../hooks/bills/useBillManager";
import { useBillManagerUI } from "../../hooks/bills/useBillManagerUI";
import useEditLock from "../../hooks/common/useEditLock";
import { useAuthManager } from "../../hooks/auth/useAuthManager";
import AddBillModal from "./AddBillModal";
import BulkBillUpdateModal from "./BulkBillUpdateModal";
import logger from "../../utils/common/logger";
import BillDiscoveryModal from "./BillDiscoveryModal";
import BillDetailModal from "./modals/BillDetailModal";
import ObjectHistoryViewer from "../history/ObjectHistoryViewer";
import ConnectionDisplay, {
  ConnectionItem,
  ConnectionInfo,
  UniversalConnectionManager,
} from "../ui/ConnectionDisplay";
import BillManagerHeader from "./BillManagerHeader";
import BillSummaryCards from "./BillSummaryCards";
import BillViewTabs from "./BillViewTabs";
import BillTable from "./BillTable";

const BillManager = ({
  transactions: propTransactions = [],
  envelopes: propEnvelopes = [],
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
  className = "",
}) => {
  // Use the extracted business logic hook
  const {
    // Data
    bills,
    categorizedBills,
    filteredBills,
    totals,
    envelopes,

    // UI State
    selectedBills,
    viewMode,
    isSearching,
    showBillDetail,
    showAddBillModal,
    editingBill,
    showBulkUpdateModal,
    showDiscoveryModal,
    discoveredBills,
    historyBill,
    filterOptions,
    isLoading,

    // Actions
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    setSelectedBills,
    setViewMode,
    setShowBillDetail,
    setShowAddBillModal,
    setEditingBill,
    setShowBulkUpdateModal,
    setShowDiscoveryModal,
    setHistoryBill,
    setFilterOptions,

    // Bill operations
    billOperations,
    addBill,
    updateBill,
    deleteBill,
  } = useBillManager({
    propTransactions,
    propEnvelopes,
    onUpdateBill,
    onCreateRecurringBill,
    onSearchNewBills,
    onError,
  });

  // UI logic hook
  const {
    viewModes,
    getSummaryCards,
    toggleBillSelection,
    selectAllBills,
    clearSelection,
    selectionState,
    handleAddNewBill,
    handleEditBill,
    handleCloseModal,
    _handleViewHistory,
    getBillDisplayData,
  } = useBillManagerUI({
    bills,
    categorizedBills,
    filteredBills,
    selectedBills,
    setSelectedBills,
    setShowAddBillModal,
    setEditingBill,
    setHistoryBill,
  });

  // Generate summary cards from totals
  const _summaryCards = getSummaryCards(totals);

  // Edit lock for collaborative editing
  const { securityContext: { budgetId }, user: currentUser } = useAuthManager();
  const { isLocked: isEditLocked, currentEditor } = useEditLock(
    `bills-${budgetId}`,
    currentUser?.userName || "User",
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-6 space-y-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm ${className}`}
    >
      {/* Header with Actions */}
      <BillManagerHeader
        isEditLocked={isEditLocked}
        currentEditor={currentEditor}
        isSearching={isSearching}
        searchNewBills={searchNewBills}
        handleAddNewBill={handleAddNewBill}
      />

      {/* Summary Cards */}
      <BillSummaryCards totals={totals} />

      {/* View Tabs and Filters */}
      <BillViewTabs
        viewModes={viewModes}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
      />

      {/* Bills Table */}
      <BillTable
        filteredBills={filteredBills}
        selectionState={selectionState}
        clearSelection={clearSelection}
        selectAllBills={selectAllBills}
        toggleBillSelection={toggleBillSelection}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        setShowBillDetail={setShowBillDetail}
        getBillDisplayData={getBillDisplayData}
        billOperations={billOperations}
        categorizedBills={categorizedBills}
        viewMode={viewMode}
      />

      {/* Modals */}
      {showAddBillModal && (
        <AddBillModal
          isOpen={showAddBillModal}
          onClose={handleCloseModal}
          editingBill={editingBill}
          availableEnvelopes={envelopes}
          onAddBill={addBill}
          onUpdateBill={updateBill}
          onDeleteBill={deleteBill}
          onError={onError}
        />
      )}

      {showBulkUpdateModal && (
        <BulkBillUpdateModal
          isOpen={showBulkUpdateModal}
          onClose={() => setShowBulkUpdateModal(false)}
          selectedBills={Array.from(selectedBills)
            .map((id) => bills.find((b) => b.id === id))
            .filter(Boolean)}
          availableEnvelopes={envelopes}
          onUpdateBills={handleBulkUpdate}
          onError={onError}
        />
      )}

      {showDiscoveryModal && (
        <BillDiscoveryModal
          isOpen={showDiscoveryModal}
          onClose={() => {
            setShowDiscoveryModal(false);
          }}
          discoveredBills={discoveredBills}
          existingBills={bills}
          availableEnvelopes={envelopes}
          onAddBills={handleAddDiscoveredBills}
          onError={onError}
        />
      )}

      {showBillDetail && (
        <BillDetailModal
          bill={showBillDetail}
          isOpen={!!showBillDetail}
          onClose={() => setShowBillDetail(null)}
          onDelete={deleteBill}
          onMarkPaid={billOperations.handlePayBill}
          onEdit={(bill) => {
            setShowBillDetail(null);
            handleEditBill(bill);
          }}
          onCreateRecurring={(bill) => {
            // Handle making a one-time bill recurring
            // TODO: Implement recurring bill functionality
            logger.warn(
              "Recurring bill creation not yet implemented:",
              bill.name,
            );
          }}
        />
      )}

      {historyBill && (
        <ObjectHistoryViewer
          isOpen={!!historyBill}
          onClose={() => setHistoryBill(null)}
          objectId={historyBill.id}
          objectType="bill"
          title={`Bill History: ${historyBill.name}`}
        />
      )}
    </div>
  );
};

export default BillManager;
