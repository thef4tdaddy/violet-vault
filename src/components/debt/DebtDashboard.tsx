import React from "react";
import { getIcon } from "../../utils";
import { useDebtDashboard } from "../../hooks/debts/useDebtDashboard";
import { isDebtFeatureEnabled } from "../../utils/debts/debtDebugConfig";
import DebtSummaryCards from "./ui/DebtSummaryCards";
import DebtList from "./ui/DebtList";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import DebtFilters from "./ui/DebtFilters";
import UpcomingPaymentsModal from "./modals/UpcomingPaymentsModal";
import StandardTabs from "../ui/StandardTabs";

/**
 * Main debt tracking dashboard component
 * Pure UI component - all business logic handled by useDebtDashboard hook
 */
const DebtDashboard: React.FC = () => {
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
    { id: "overview", label: "Overview", icon: "CreditCard", color: "red" },
    {
      id: "strategies",
      label: "Payoff Strategies",
      icon: "Target",
      color: "purple",
    },
  ];

  if (!isDebtFeatureEnabled("ENABLE_DEBT_DASHBOARD")) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Debt Dashboard Disabled
        </h2>
        <p className="text-yellow-700">
          The debt dashboard is currently disabled for debugging. Enable it in
          debtDebugConfig.js
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-black mb-2">
              <span className="text-3xl">D</span>EBT{" "}
              <span className="text-3xl">T</span>RACKING
            </h1>
            <p className="text-purple-900">
              Manage your debt payoff strategy and track progress
            </p>
          </div>

          <div className="flex items-center gap-3">
            {upcomingPayments.length > 0 && (
              <button
                onClick={() => setShowUpcomingPaymentsModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg border-2 border-black font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                {React.createElement(getIcon("Clock"), {
                  className: "w-4 h-4",
                })}
                {upcomingPayments.length} Due Soon
              </button>
            )}

            <button
              onClick={handleAddDebt}
              className="px-4 py-2 bg-red-500 text-white rounded-lg border-2 border-black font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              {React.createElement(getIcon("Plus"), { className: "w-4 h-4" })}
              Add Debt
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="rounded-lg p-6 border-2 border-black bg-white/90 backdrop-blur-sm">
        <StandardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {isDebtFeatureEnabled("ENABLE_DEBT_SUMMARY_CARDS") && (
              <DebtSummaryCards debtStats={debtStats} />
            )}

            {/* Filters */}
            {isDebtFeatureEnabled("ENABLE_DEBT_FILTERS") && (
              <DebtFilters
                filterOptions={filterOptions}
                setFilterOptions={setFilterOptions}
                debtStats={debtStats}
              />
            )}

            {/* Debt List */}
            {isDebtFeatureEnabled("ENABLE_DEBT_LIST") && (
              <DebtList
                debts={filteredDebts}
                onDebtClick={handleDebtClick}
                onEditDebt={handleEditDebt}
                onDeleteDebt={handleDeleteDebt}
                onRecordPayment={handleRecordPayment}
              />
            )}
          </div>
        )}

        {activeTab === "strategies" && (
          <div className="p-6">
            <div className="text-center text-gray-500">
              <p>Debt payoff strategies feature is currently disabled.</p>
              <p className="text-sm mt-2">
                Enable ENABLE_DEBT_STRATEGIES in debtDebugConfig.js to use this
                feature.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isDebtFeatureEnabled("ENABLE_DEBT_MODALS") && (
        <>
          {showAddModal && (
            <AddDebtModal
              isOpen={showAddModal}
              onSubmit={handleModalSubmit}
              onClose={() => setSelectedDebt(null)}
              editingDebt={editingDebt}
            />
          )}

          {selectedDebt && !showAddModal && (
            <DebtDetailModal
              debt={selectedDebt}
              isOpen={!!selectedDebt}
              onClose={() => setSelectedDebt(null)}
              onEdit={handleEditDebt}
              onDelete={handleDeleteDebt}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {showUpcomingPaymentsModal && (
            <UpcomingPaymentsModal
              payments={upcomingPayments}
              isOpen={showUpcomingPaymentsModal}
              onClose={() => setShowUpcomingPaymentsModal(false)}
              onRecordPayment={handleRecordPayment}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DebtDashboard;