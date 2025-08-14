import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  Filter,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  Target,
  X,
} from "lucide-react";
import { useDebtManagement } from "../../hooks/useDebtManagement";
import DebtSummaryCards from "./ui/DebtSummaryCards";
import DebtList from "./ui/DebtList";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import DebtFilters from "./ui/DebtFilters";
import DebtStrategies from "./DebtStrategies";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [showUpcomingPaymentsModal, setShowUpcomingPaymentsModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    type: "all", // all, mortgage, auto, credit_card, etc.
    status: "all", // all, active, paid_off, etc.
    sortBy: "balance_desc", // balance_desc, balance_asc, payment_desc, rate_desc, name
    showPaidOff: false,
  });

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: CreditCard },
    { id: "strategies", label: "Payoff Strategies", icon: Target },
  ];

  // Get filtered and sorted debts
  const filteredDebts = React.useMemo(() => {
    let filtered = [...debts];

    // Filter by type
    if (filterOptions.type !== "all") {
      filtered = filtered.filter((debt) => debt.type === filterOptions.type);
    }

    // Filter by status
    if (filterOptions.status !== "all") {
      filtered = filtered.filter((debt) => debt.status === filterOptions.status);
    }

    // Hide paid off unless explicitly shown
    if (!filterOptions.showPaidOff) {
      filtered = filtered.filter((debt) => debt.status !== DEBT_STATUS.PAID_OFF);
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

  const handleEditDebt = (debtId, debtData) => {
    updateDebt(debtId, debtData);
    setEditingDebt(null);
    // Refresh selected debt if it was updated
    if (selectedDebt?.id === debtId) {
      const updatedDebt = debts.find((d) => d.id === debtId);
      setSelectedDebt(updatedDebt);
    }
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
            {debtStats.activeDebtCount} active debts • Total: ${debtStats.totalDebt.toFixed(2)}
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

      {/* Tab Navigation */}
      <div className="glassmorphism rounded-2xl p-1 border border-white/20 ring-1 ring-gray-800/10">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-white shadow-md text-purple-600"
                    : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Summary Cards */}
          <DebtSummaryCards 
            stats={debtStats}
            onDueSoonClick={() => setShowUpcomingPaymentsModal(true)}
          />

          {/* Filters and Controls */}
          <DebtFilters
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
            debtTypes={DEBT_TYPES}
            debtsByType={debtsByType}
          />


          {/* Debt List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 ring-1 ring-gray-800/10">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                Your Debts ({filteredDebts.length})
              </h3>
            </div>

            {filteredDebts.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Debts Found</h3>
                <p className="text-gray-500 mb-4">
                  {debts.length === 0
                    ? "Start tracking your debts to get insights into your debt payoff journey."
                    : "No debts match your current filters."}
                </p>
                {debts.length === 0 && (
                  <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
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
        </>
      )}

      {/* Strategies Tab */}
      {activeTab === "strategies" && <DebtStrategies debts={debts} />}

      {/* Modals */}
      <AddDebtModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDebt}
      />

      <AddDebtModal
        isOpen={!!editingDebt}
        onClose={() => setEditingDebt(null)}
        onSubmit={handleEditDebt}
        debt={editingDebt}
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
          onEdit={(debt) => setEditingDebt(debt)}
        />
      )}

      {/* Upcoming Payments Modal */}
      {showUpcomingPaymentsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Upcoming Debt Payments</h3>
                <p className="text-gray-600">Payments due in the next 30 days</p>
              </div>
              <button 
                onClick={() => setShowUpcomingPaymentsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {upcomingPayments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Payments</h4>
                <p className="text-gray-500">You have no debt payments due in the next 30 days.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map((debt) => (
                  <div 
                    key={debt.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowUpcomingPaymentsModal(false);
                      handleDebtClick(debt);
                    }}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{debt.name}</h4>
                      <p className="text-sm text-gray-600">{debt.creditor}</p>
                      {debt.nextPaymentDate && (
                        <p className="text-xs text-orange-600">
                          Due: {new Date(debt.nextPaymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        ${debt.minimumPayment?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500">minimum payment</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowUpcomingPaymentsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtDashboard;
