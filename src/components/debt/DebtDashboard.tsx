import { useDebtDashboard } from "../../hooks/debts/useDebtDashboard";
import { isDebtFeatureEnabled } from "../../utils/debts/debtDebugConfig";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import UpcomingPaymentsModal from "./modals/UpcomingPaymentsModal";
import StandardTabs from "../ui/StandardTabs";
import { DashboardHeader, OverviewTab, StrategiesTab } from "./DebtDashboardComponents";
import { getIcon } from "@/utils";

// Tab configuration
const tabs = [
  { id: "overview", label: "Overview", icon: getIcon("CreditCard"), color: "red" as const },
  {
    id: "strategies",
    label: "Payoff Strategies",
    icon: getIcon("Target"),
    color: "purple" as const,
  },
];

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

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header */}
      <DashboardHeader debtStats={debtStats} handleAddDebt={handleAddDebt} />

      {/* Tab Content with connected navigation */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-black ring-1 ring-gray-800/10">
        {/* Tab Navigation */}
        <div className="border-b-2 border-black">
          <StandardTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="colored"
            className=""
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab
              debtStats={debtStats}
              filteredDebts={filteredDebts}
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
              setShowUpcomingPaymentsModal={setShowUpcomingPaymentsModal}
              handleDebtClick={handleDebtClick}
              handleRecordPayment={handleRecordPayment}
              handleAddDebt={handleAddDebt}
            />
          )}

          {activeTab === "strategies" && <StrategiesTab />}
        </div>
      </div>

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
