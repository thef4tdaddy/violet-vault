import { useDebtDashboard } from "../../hooks/debts/useDebtDashboard";
import { isDebtFeatureEnabled } from "../../utils/debts/debtDebugConfig";
import AddDebtModal from "./modals/AddDebtModal";
import DebtDetailModal from "./modals/DebtDetailModal";
import UpcomingPaymentsModal from "./modals/UpcomingPaymentsModal";
import StandardTabs from "../ui/StandardTabs";
import StandardFilters from "../ui/StandardFilters";
import { DashboardHeader, OverviewTab, StrategiesTab } from "./DebtDashboardComponents";
import DebtSummaryCards from "./ui/DebtSummaryCards";
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

      {/* Summary Cards - Outside white block */}
      {isDebtFeatureEnabled("ENABLE_DEBT_SUMMARY_CARDS") && (
        <DebtSummaryCards
          stats={debtStats}
          onDueSoonClick={() => setShowUpcomingPaymentsModal(true)}
        />
      )}

      {/* Filters - Outside white block */}
      {isDebtFeatureEnabled("ENABLE_DEBT_FILTERS") && (
        <StandardFilters
          filters={filterOptions}
          onFilterChange={(key, value) =>
            setFilterOptions((prev) => ({ ...prev, [key]: value }))
          }
          filterConfigs={[
            {
              key: "type",
              type: "select",
              label: "Debt Type",
              defaultValue: "all",
              options: [
                { value: "all", label: "All Types" },
                { value: "credit_card", label: "Credit Card" },
                { value: "student_loan", label: "Student Loan" },
                { value: "mortgage", label: "Mortgage" },
                { value: "auto_loan", label: "Auto Loan" },
                { value: "personal_loan", label: "Personal Loan" },
              ],
            },
            {
              key: "status",
              type: "select",
              label: "Status",
              defaultValue: "all",
              options: [
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "paid_off", label: "Paid Off" },
                { value: "deferred", label: "Deferred" },
              ],
            },
            {
              key: "sortBy",
              type: "select",
              label: "Sort By",
              defaultValue: "balance_desc",
              options: [
                { value: "balance_desc", label: "Highest Balance" },
                { value: "balance_asc", label: "Lowest Balance" },
                { value: "payment_desc", label: "Highest Payment" },
                { value: "rate_desc", label: "Highest Rate" },
                { value: "name", label: "Name A-Z" },
              ],
            },
          ]}
          searchPlaceholder="Search debts..."
          size="md"
          collapsible={true}
          config={{
            showToggle: {
              key: "showPaidOff",
              label: "Show Paid Off",
            },
          }}
        />
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
              handleRecordPayment={handleRecordPayment}
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
