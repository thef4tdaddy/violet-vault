import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Filter,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useDebtManagement } from "../../hooks/useDebtManagement";
import DebtSummaryCards from "./ui/DebtSummaryCards";
import DebtList from "./ui/DebtList";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import DebtFilters from "./ui/DebtFilters";

/**
 * Main debt tracking dashboard component
 * Pure UI component - business logic handled by useDebtManagement hook
 */
const DebtDashboard = () => {
  const {
    debts,
    debtStats,
    debtsByType,
    debtsByStatus: _debtsByStatus,
    createDebt,
    updateDebt,
    deleteDebt,
    recordPayment,
    linkDebtToBill,
    getUpcomingPayments,
    DEBT_TYPES,
    DEBT_STATUS,
  } = useDebtManagement();

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    type: "all", // all, mortgage, auto, credit_card, etc.
    status: "all", // all, active, paid_off, etc.
    sortBy: "balance_desc", // balance_desc, balance_asc, payment_desc, rate_desc, name
    showPaidOff: false,
  });

  // Get filtered and sorted debts
  const filteredDebts = React.useMemo(() => {
    let filtered = [...debts];

    // Filter by type
    if (filterOptions.type !== "all") {
      filtered = filtered.filter((debt) => debt.type === filterOptions.type);
    }

    // Filter by status
    if (filterOptions.status !== "all") {
      filtered = filtered.filter(
        (debt) => debt.status === filterOptions.status,
      );
    }

    // Hide paid off unless explicitly shown
    if (!filterOptions.showPaidOff) {
      filtered = filtered.filter(
        (debt) => debt.status !== DEBT_STATUS.PAID_OFF,
      );
    }

    // Sort debts
    filtered.sort((a, b) => {
      switch (filterOptions.sortBy) {
        case "balance_desc":
          return (b.currentBalance || 0) - (a.currentBalance || 0);
        case "balance_asc":
          return (a.currentBalance || 0) - (b.currentBalance || 0);
        case "payment_desc":
          return (b.minimumPayment || 0) - (a.minimumPayment || 0);
        case "rate_desc":
          return (b.interestRate || 0) - (a.interestRate || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [debts, filterOptions, DEBT_STATUS.PAID_OFF]);

  // Get upcoming payments for next 30 days
  const upcomingPayments = getUpcomingPayments(30);

  const handleAddDebt = (debtData) => {
    createDebt(debtData);
    setShowAddModal(false);
  };

  const handleDebtClick = (debt) => {
    setSelectedDebt(debt);
  };

  const handleCloseDetailModal = () => {
    setSelectedDebt(null);
  };

  const handleUpdateDebt = (debtId, updates) => {
    updateDebt(debtId, updates);
    // Refresh selected debt if it was updated
    if (selectedDebt?.id === debtId) {
      const updatedDebt = debts.find((d) => d.id === debtId);
      setSelectedDebt(updatedDebt);
    }
  };

  const handleDeleteDebt = (debtId) => {
    deleteDebt(debtId);
    if (selectedDebt?.id === debtId) {
      setSelectedDebt(null);
    }
  };

  const handleRecordPayment = (debtId, paymentData) => {
    recordPayment(debtId, paymentData);
  };

  const handleLinkToBill = (debtId, billData) => {
    return linkDebtToBill(debtId, billData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center text-gray-900">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-red-500 p-3 rounded-2xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            Debt Tracking
          </h2>
          <p className="text-gray-600 mt-1">
            {debtStats.activeDebtCount} active debts • Total: $
            {debtStats.totalDebt.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Debt
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <DebtSummaryCards stats={debtStats} upcomingPayments={upcomingPayments} />

      {/* Filters and Controls */}
      <DebtFilters
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        debtTypes={DEBT_TYPES}
        debtsByType={debtsByType}
      />

      {/* Upcoming Payments Alert */}
      {upcomingPayments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-orange-800">
                Upcoming Payments ({upcomingPayments.length})
              </h4>
              <p className="text-sm text-orange-600 mt-1">
                You have {upcomingPayments.length} debt payments due in the next
                30 days.
              </p>
              <div className="flex gap-2 mt-2">
                {upcomingPayments.slice(0, 3).map((debt) => (
                  <span
                    key={debt.id}
                    className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded cursor-pointer hover:bg-orange-200"
                    onClick={() => handleDebtClick(debt)}
                  >
                    {debt.name}: ${debt.minimumPayment?.toFixed(2)}
                  </span>
                ))}
                {upcomingPayments.length > 3 && (
                  <span className="text-xs text-orange-600">
                    +{upcomingPayments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
            Your Debts ({filteredDebts.length})
          </h3>
        </div>

        {filteredDebts.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Debts Found
            </h3>
            <p className="text-gray-500 mb-4">
              {debts.length === 0
                ? "Start tracking your debts to get insights into your debt payoff journey."
                : "No debts match your current filters."}
            </p>
            {debts.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Debt
              </button>
            )}
          </div>
        ) : (
          <DebtList
            debts={filteredDebts}
            onDebtClick={handleDebtClick}
            onRecordPayment={handleRecordPayment}
          />
        )}
      </div>

      {/* Modals */}
      <AddDebtModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDebt}
      />

      {selectedDebt && (
        <DebtDetailModal
          debt={selectedDebt}
          isOpen={!!selectedDebt}
          onClose={handleCloseDetailModal}
          onUpdate={handleUpdateDebt}
          onDelete={handleDeleteDebt}
          onRecordPayment={handleRecordPayment}
          onLinkToBill={handleLinkToBill}
        />
      )}
    </div>
  );
};

export default DebtDashboard;
