import React from "react";
import { CreditCard, Plus, TrendingDown, Target } from "lucide-react";
import { useDebtDashboard } from "../../hooks/debts/useDebtDashboard";
import { isDebtFeatureEnabled } from "../../utils/debts/debtDebugConfig";
import DebtSummaryCards from "./ui/DebtSummaryCards";
import DebtList from "./ui/DebtList";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import DebtFilters from "./ui/DebtFilters";
import UpcomingPaymentsModal from "./modals/UpcomingPaymentsModal";

/**
 * Main debt tracking dashboard component
 * Pure UI component - all business logic handled by useDebtDashboard hook
 */
const DebtDashboard = () => {
  const {
    debts: filteredDebts,
    debtStats,
    upcomingPayments,
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
    handleAddDebt,
    handleEditDebt,
    handleDebtClick,
    handleModalSubmit,
    handleDeleteDebt,
    handleRecordPayment,
  } = useDebtDashboard();

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: CreditCard },
    { id: "strategies", label: "Payoff Strategies", icon: Target },
  ];

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
            onClick={handleAddDebt}
            className="btn btn-primary flex items-center"
            data-tour="add-debt"
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
          {isDebtFeatureEnabled("ENABLE_DEBT_SUMMARY_CARDS") ? (
            <DebtSummaryCards
              stats={debtStats}
              onDueSoonClick={() => setShowUpcomingPaymentsModal(true)}
            />
          ) : (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-500">Summary Cards disabled for debugging</p>
            </div>
          )}

          {/* Filters and Controls */}
          {isDebtFeatureEnabled("ENABLE_DEBT_FILTERS") && (
            <DebtFilters filterOptions={filterOptions} setFilterOptions={setFilterOptions} />
          )}

          {/* Debt List */}
          {isDebtFeatureEnabled("ENABLE_DEBT_LIST") ? (
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
                    Start tracking your debts to get insights into your debt payoff journey.
                  </p>
                  <button onClick={handleAddDebt} className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Debt
                  </button>
                </div>
              ) : (
                <DebtList
                  debts={filteredDebts}
                  onDebtClick={handleDebtClick}
                  onRecordPayment={handleRecordPayment}
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-500">Debt List disabled for debugging</p>
            </div>
          )}
        </>
      )}

      {/* Strategies Tab */}
      {activeTab === "strategies" && (
        <div className="glassmorphism rounded-2xl p-6 text-center">
          <p className="text-gray-600">Debt strategies temporarily disabled for debugging</p>
        </div>
      )}

      {/* Modals */}
      {isDebtFeatureEnabled("ENABLE_ADD_DEBT_MODAL") && (
        <AddDebtModal
          isOpen={showAddModal || !!editingDebt}
          onClose={() => setSelectedDebt(null)}
          onSubmit={handleModalSubmit}
          debt={editingDebt}
        />
      )}

      {selectedDebt && isDebtFeatureEnabled("ENABLE_DEBT_DETAIL_MODAL") && (
        <DebtDetailModal
          debt={selectedDebt}
          isOpen={!!selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onDelete={handleDeleteDebt}
          onRecordPayment={handleRecordPayment}
          onEdit={handleEditDebt}
        />
      )}

      <UpcomingPaymentsModal
        isOpen={showUpcomingPaymentsModal}
        onClose={() => setShowUpcomingPaymentsModal(false)}
        upcomingPayments={upcomingPayments}
      />
    </div>
  );
};

export default DebtDashboard;
