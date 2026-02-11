/**
 * BillManager Component - Refactored for Issue #152 & #835
 * Migrated to use PageHeader primitive (Issue #1594)
 *
 * UI-only component using useBillManager hook for business logic
 * Reduced from 1,156 LOC to ~400 LOC by extracting business logic
 */
import React, { useMemo } from "react";
import PageHeader from "@/components/primitives/headers/PageHeader";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useBillManager } from "../../hooks/budgeting/transactions/scheduled/expenses/useBillManager";
import { useBillManagerUI } from "../../hooks/budgeting/transactions/scheduled/expenses/useBillManagerUI";
import useEditLock from "../../hooks/core/auth/security/useEditLock";
import { useAuth } from "@/hooks/auth/useAuth";
import BillSummaryCards from "./BillSummaryCards";
import BillViewTabs from "./BillViewTabs";
import BillTable from "./BillTable";
import BillManagerModals from "./BillManagerModals";
import type { Bill } from "@/types/bills";
import type { BillRecord } from "../../hooks/budgeting/transactions/scheduled/expenses/useBillCalculations";

interface Transaction {
  id: string;
  date: Date | string;
  amount: number;
  [key: string]: unknown;
}

import type { Envelope as EnvelopeFromTypes } from "@/types/bills";

type Envelope = EnvelopeFromTypes & {
  id: string | number;
  [key: string]: unknown;
};

interface BillManagerProps {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  onUpdateBill?: (bill: Bill) => void | Promise<void>;
  onCreateRecurringBill?: (bill: Bill) => void | Promise<void>;
  onSearchNewBills?: () => void | Promise<void>;
  onError?: (error: string) => void;
  className?: string;
}

// Loading component
const BillManagerLoading: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const BillManager: React.FC<BillManagerProps> = ({
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
    onUpdateBill,
    onCreateRecurringBill,
    onSearchNewBills,
    onError,
  });

  const payBillHandler = billOperations.handlePayBill;
  const billTableOperations = useMemo<{
    handlePayBill: (
      billId: string,
      overrides?: { amount?: number; paidDate?: string; envelopeId?: string }
    ) => Promise<void>;
  }>(
    () => ({
      handlePayBill: (billId, overrides) => payBillHandler(billId, overrides),
    }),
    [payBillHandler]
  );

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
    setEditingBill: (bill) => setEditingBill(bill as Bill | null),
    setHistoryBill: (bill) => setHistoryBill(bill as Bill | null),
  });

  // Edit lock for collaborative editing
  const { budgetId, user: currentUser } = useAuth();
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
      <PageHeader
        title="Bill Manager"
        subtitle="Track and manage your recurring bills and payments"
        icon="FileText"
        actions={
          <div className="flex items-center gap-2">
            {isEditLocked && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg flex items-center gap-2">
                {React.createElement(getIcon("Clock"), { className: "h-4 w-4" })}
                Editing: {currentEditor}
              </div>
            )}

            <Button
              onClick={searchNewBills}
              disabled={isSearching}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 border-2 border-black"
            >
              {isSearching
                ? React.createElement(getIcon("RefreshCw"), {
                    className: "h-4 w-4 animate-spin",
                  })
                : React.createElement(getIcon("Search"), { className: "h-4 w-4" })}
              Discover Bills
            </Button>

            <Button
              onClick={handleAddNewBill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 border-2 border-black"
            >
              {React.createElement(getIcon("Plus"), { className: "h-4 w-4" })}
              Add Bill
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <BillSummaryCards totals={totals} />

      {/* View Tabs and Filters */}
      <BillViewTabs
        viewModes={
          viewModes as unknown as Array<{
            id: string;
            label: string;
            count?: number;
            icon?: React.ComponentType<{ className?: string }>;
            disabled?: boolean;
            color?: "blue" | "green" | "red" | "amber" | "purple" | "cyan" | "gray";
          }>
        }
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        envelopes={_envelopes as Array<{ id: string | number; name?: string }>}
      />

      {/* Bills Table */}
      <BillTable
        filteredBills={filteredBills}
        selectionState={selectionState}
        clearSelection={clearSelection}
        selectAllBills={selectAllBills}
        toggleBillSelection={toggleBillSelection}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        setShowBillDetail={(bill) => setShowBillDetail(bill as unknown as Bill | null)}
        getBillDisplayData={getBillDisplayData as never}
        billOperations={billTableOperations}
        categorizedBills={categorizedBills as never}
        viewMode={viewMode}
      />

      {/* Modals */}
      <BillManagerModals
        showAddBillModal={showAddBillModal}
        showBulkUpdateModal={showBulkUpdateModal}
        showDiscoveryModal={showDiscoveryModal}
        showBillDetail={
          showBillDetail as { id: string; name: string; [key: string]: unknown } | null
        }
        historyBill={historyBill as { id: string; name: string; [key: string]: unknown } | null}
        editingBill={editingBill as { id: string; name: string; [key: string]: unknown } | null}
        bills={bills as { id: string; name: string; [key: string]: unknown }[]}
        envelopes={_envelopes as { id: string; name: string; [key: string]: unknown }[]}
        selectedBills={selectedBillsRaw as Set<string>}
        discoveredBills={discoveredBills as { id: string; name: string; [key: string]: unknown }[]}
        handleCloseModal={handleCloseModal}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        setShowDiscoveryModal={setShowDiscoveryModal}
        setShowBillDetail={(bill) => setShowBillDetail(bill as unknown as Bill | null)}
        setHistoryBill={(bill) => setHistoryBill(bill as unknown as Bill | null)}
        handleEditBill={(bill) => handleEditBill(bill as unknown)}
        addBill={addBill as never}
        updateBill={updateBill as never}
        deleteBill={deleteBill as never}
        handleBulkUpdate={(entities) => handleBulkUpdate(entities as never)}
        handleAddDiscoveredBills={(entities) => handleAddDiscoveredBills(entities as BillRecord[])}
        billOperations={billOperations}
        onError={onError ?? (() => {})}
      />
    </div>
  );
};

export default BillManager;
