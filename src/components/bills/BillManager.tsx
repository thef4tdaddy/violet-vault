/**
 * BillManager Component - Refactored for Issue #152 & #835
 *
 * UI-only component using useBillManager hook for business logic
 * Reduced from 1,156 LOC to ~400 LOC by extracting business logic
 */
import { useBillManager } from "../../hooks/bills/useBillManager";
import { useBillManagerUI } from "../../hooks/bills/useBillManagerUI";
import useEditLock from "../../hooks/common/useEditLock";
import { useAuthManager } from "../../hooks/auth/useAuthManager";
import BillManagerHeader from "./BillManagerHeader";
import BillSummaryCards from "./BillSummaryCards";
import BillViewTabs from "./BillViewTabs";
import BillTable from "./BillTable";
import BillManagerModals from "./BillManagerModals";

// Loading component
const BillManagerLoading = ({ className }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const BillManager = ({
  transactions: propTransactions = [],
  envelopes: propEnvelopes = [],
  onUpdateBill: _onUpdateBill,
  onCreateRecurringBill: _onCreateRecurringBill,
  onSearchNewBills: _onSearchNewBills,
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
    envelopes: _envelopes,

    // UI State
    selectedBills: selectedBillsRaw,
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
  });

  // UI logic hook
  const {
    viewModes,
    toggleBillSelection,
    selectAllBills,
    clearSelection,
    selectionState,
    handleAddNewBill,
    handleEditBill,
    handleCloseModal,
    getBillDisplayData,
  } = useBillManagerUI({
    bills,
    categorizedBills,
    filteredBills,
    selectedBills: selectedBillsRaw as Set<string>,
    setSelectedBills,
    setShowAddBillModal,
    setEditingBill,
    setHistoryBill,
  });

  // Edit lock for collaborative editing
  const {
    securityContext: { budgetId },
    user: currentUser,
  } = useAuthManager();
  const { isLocked: isEditLocked, lockedBy } = useEditLock(
    `bills-${budgetId}`,
    currentUser?.userName || "User"
  );

  const currentEditor = lockedBy;

  // Loading state
  if (isLoading) {
    return <BillManagerLoading className={className} />;
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
        getBillDisplayData={getBillDisplayData as never}
        billOperations={billOperations as never}
        categorizedBills={categorizedBills as never}
        viewMode={viewMode}
      />

      {/* Modals */}
      <BillManagerModals
        showAddBillModal={showAddBillModal}
        showBulkUpdateModal={showBulkUpdateModal}
        showDiscoveryModal={showDiscoveryModal}
        showBillDetail={showBillDetail}
        historyBill={historyBill}
        editingBill={editingBill}
        bills={bills}
        envelopes={_envelopes}
        selectedBills={selectedBillsRaw as Set<string>}
        discoveredBills={discoveredBills}
        handleCloseModal={handleCloseModal}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        setShowDiscoveryModal={setShowDiscoveryModal}
        setShowBillDetail={setShowBillDetail}
        setHistoryBill={setHistoryBill}
        handleEditBill={handleEditBill}
        addBill={addBill as never}
        updateBill={updateBill as never}
        deleteBill={deleteBill as never}
        handleBulkUpdate={handleBulkUpdate}
        handleAddDiscoveredBills={handleAddDiscoveredBills}
        billOperations={billOperations}
        onError={onError}
      />
    </div>
  );
};

export default BillManager;
