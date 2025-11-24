import { useDebtDashboard } from "@/hooks/debts/useDebtDashboard";
import { isDebtFeatureEnabled } from "@/utils/debts/debtDebugConfig";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import UpcomingPaymentsModal from "./modals/UpcomingPaymentsModal";
import StandardTabs from "../ui/StandardTabs";
import { DashboardHeader, OverviewTab, StrategiesTab } from "./DebtDashboardComponents";
import DebtSummaryCards from "./ui/DebtSummaryCards";
import DebtFilters from "./ui/DebtFilters";
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
    handleCloseModal,
    handleModalSubmit,
    handleDeleteDebt,
    handleRecordPayment,
  } = useDebtDashboard();

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header */}
      <DashboardHeader debtStats={debtStats} handleAddDebt={handleAddDebt} />

      {/* Summary Cards - Outside white block */}
      {isDebtFeatureEnabled("ENABLE_DEBT_SUMMARY_CARDS") && (
        <DebtSummaryCards
          stats={debtStats}
          onDueSoonClick={() => setShowUpcomingPaymentsModal(true)}
        />
      )}

      {/* Filters - Outside white block */}
      {isDebtFeatureEnabled("ENABLE_DEBT_FILTERS") && (
        <DebtFilters filterOptions={filterOptions} setFilterOptions={setFilterOptions} />
      )}

      {/* Floating Tabs (no background container) */}
      <div className="space-y-0">
        <StandardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="colored"
          className="pl-4"
        />

        {/* Tab Content - White block */}
        <div className="bg-white rounded-b-xl shadow-sm border-2 border-black ring-1 ring-gray-800/10 p-6">
          {activeTab === "overview" && (
            <OverviewTab
              debtStats={debtStats}
              filteredDebts={filteredDebts}
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
              setShowUpcomingPaymentsModal={setShowUpcomingPaymentsModal}
              handleDebtClick={handleDebtClick}
              handleRecordPayment={
                handleRecordPayment as unknown as (
                  debt: import("@/types/debt").DebtAccount,
                  amount: number
                ) => void
              }
              handleAddDebt={handleAddDebt}
            />
          )}

          {activeTab === "strategies" && <StrategiesTab debts={filteredDebts} />}
        </div>
      </div>

      {/* Modals */}
      {isDebtFeatureEnabled("ENABLE_ADD_DEBT_MODAL") && (
        <AddDebtModal
          isOpen={showAddModal || !!editingDebt}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          debt={editingDebt}
        />
      )}

      {selectedDebt && isDebtFeatureEnabled("ENABLE_DEBT_DETAIL_MODAL") && (
        <DebtDetailModal
          debt={selectedDebt as unknown as Record<string, unknown> & { id: string }}
          isOpen={!!selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onDelete={handleDeleteDebt}
          onRecordPayment={async (debtId: string, amount: number) => {
            await handleRecordPayment(debtId, {
              amount,
              paymentDate: new Date().toISOString().split("T")[0],
            });
          }}
          onEdit={handleEditDebt as unknown as (debt: Record<string, unknown>) => void}
        />
      )}

      <UpcomingPaymentsModal
        isOpen={showUpcomingPaymentsModal}
        onClose={() => setShowUpcomingPaymentsModal(false)}
        upcomingPayments={
          upcomingPayments as unknown as import("./modals/UpcomingPaymentsModal").UpcomingPayment[]
        }
      />
    </div>
  );
};

export default DebtDashboard;
