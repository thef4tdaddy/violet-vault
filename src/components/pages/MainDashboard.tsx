// components/Dashboard.jsx
import React from "react";
import ReconcileTransactionModal from "../dashboard/ReconcileTransactionModal";
import { useActualBalance } from "@/hooks/budgeting/useBudgetMetadata";
import { useUnassignedCash } from "@/hooks/budgeting/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useSavingsGoals } from "@/hooks/common/useSavingsGoals";
import { useTransactions } from "@/hooks/common/useTransactions";
import useBudgetData from "@/hooks/budgeting/useBudgetData";
import { useDebts } from "@/hooks/debts/useDebts";
import useBills from "@/hooks/bills/useBills";
import {
  useMainDashboardUI,
  useDashboardCalculations,
  useTransactionReconciliation,
  usePaydayManager,
  useDashboardHelpers,
} from "@/hooks/dashboard/useMainDashboard";
import {
  useEnvelopeSpendingData,
  useBiweeklyStatus,
  useDebtTrackerData,
  useUpcomingBills,
} from "@/hooks/dashboard/useDashboardData";
import { useDashboardInsights } from "@/hooks/dashboard/useDashboardInsights";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { MainDashboardPropsSchema } from "@/domain/schemas/component-props";

// New dashboard sections
import BalanceRow from "../dashboard/sections/BalanceRow";
import NextPaydayBanner from "../dashboard/sections/NextPaydayBanner";
import BiweeklyStatusCard from "../dashboard/sections/BiweeklyStatusCard";
import EnvelopeSpendingCard from "../dashboard/sections/EnvelopeSpendingCard";
import QuickAddCard from "../dashboard/sections/QuickAddCard";
import DebtTrackerSection from "../dashboard/sections/DebtTrackerSection";
import ActivitySnapshotSection from "../dashboard/sections/ActivitySnapshotSection";
import InsightsSection from "../dashboard/sections/InsightsSection";

interface DashboardProps {
  setActiveView: (view: string) => void;
}

const Dashboard = ({ setActiveView }: DashboardProps) => {
  // Validate props in development
  validateComponentProps("MainDashboard", { setActiveView }, MainDashboardPropsSchema);

  // Enhanced TanStack Query integration with optimistic updates
  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const { savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();
  const { transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { debts = [], isLoading: debtsLoading } = useDebts();
  const { bills = [], isLoading: billsLoading } = useBills();

  // Use TanStack Query for budget metadata
  const { unassignedCash, isLoading: unassignedCashLoading } = useUnassignedCash();
  const {
    actualBalance,
    updateActualBalance,
    isLoading: actualBalanceLoading,
  } = useActualBalance();

  // Get reconcileTransaction and paycheckHistory from useBudgetData
  const { reconcileTransaction, paycheckHistory } = useBudgetData();

  // UI state management
  const {
    showReconcileModal,
    newTransaction,
    openReconcileModal,
    closeReconcileModal,
    updateNewTransaction,
    resetNewTransaction,
  } = useMainDashboardUI();

  // Dashboard calculations
  const { totalEnvelopeBalance, totalSavingsBalance, totalVirtualBalance, difference, isBalanced } =
    useDashboardCalculations(envelopes, savingsGoals, unassignedCash, actualBalance);

  // Transaction reconciliation logic
  const { handleReconcileTransaction, getEnvelopeOptions } = useTransactionReconciliation(
    reconcileTransaction,
    envelopes,
    savingsGoals
  );

  // Payday management
  const { paydayPrediction, handleProcessPaycheck, handlePrepareEnvelopes } = usePaydayManager(
    paycheckHistory,
    setActiveView
  );

  // Dashboard helpers
  const { getRecentTransactions } = useDashboardHelpers();

  // Get recent transactions
  const recentTransactions = getRecentTransactions(transactions, 10);

  const handleUpdateBalance = async (newBalance) => {
    await updateActualBalance(newBalance, {
      isManual: true,
      author: "Family Member", // Generic name for family budgeting
    });
    // No need to call setActualBalance since TanStack Query will handle the update
  };

  const onReconcileTransaction = () => {
    handleReconcileTransaction(newTransaction, () => {
      resetNewTransaction();
      closeReconcileModal();
    });
  };

  // Calculate dashboard data using extracted hooks
  const envelopeSpendingData = useEnvelopeSpendingData(envelopes);
  const biweeklyStatus = useBiweeklyStatus(totalEnvelopeBalance, totalSavingsBalance);
  const debtTrackerData = useDebtTrackerData(debts);
  const upcomingBills = useUpcomingBills(bills);
  const insights = useDashboardInsights(unassignedCash, debts, paydayPrediction, setActiveView);

  // Show loading state while TanStack queries are fetching
  if (
    envelopesLoading ||
    savingsLoading ||
    transactionsLoading ||
    unassignedCashLoading ||
    actualBalanceLoading ||
    debtsLoading ||
    billsLoading
  ) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Row */}
      <BalanceRow
        actualBalance={actualBalance}
        totalVirtualBalance={totalVirtualBalance}
        unassignedCash={unassignedCash}
        difference={difference}
        isBalanced={isBalanced}
        onUpdateBalance={handleUpdateBalance}
        onOpenReconcileModal={openReconcileModal}
      />

      {/* Next Payday Banner */}
      {paydayPrediction && (
        <NextPaydayBanner
          prediction={paydayPrediction}
          onProcessPaycheck={handleProcessPaycheck}
          onPrepareEnvelopes={handlePrepareEnvelopes}
        />
      )}

      {/* Middle Section: Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BiweeklyStatusCard
          amountNeeded={biweeklyStatus.amountNeeded}
          totalGoal={biweeklyStatus.totalGoal}
          onPlanAllocations={() => setActiveView("envelopes")}
          onAdjustGoals={() => setActiveView("envelopes")}
        />

        <EnvelopeSpendingCard
          spendingData={envelopeSpendingData}
          onViewFullEnvelopes={() => setActiveView("envelopes")}
        />

        <QuickAddCard
          onAddTransaction={openReconcileModal}
          onAddPaycheck={handleProcessPaycheck}
          onAddBill={() => setActiveView("bills")}
        />
      </div>

      {/* Debt Tracker Section */}
      {debtTrackerData.length > 0 && (
        <DebtTrackerSection
          debts={debtTrackerData}
          onViewAllDebts={() => setActiveView("debts")}
        />
      )}

      {/* Activity Snapshot Section */}
      <ActivitySnapshotSection
        recentTransactions={recentTransactions}
        upcomingBills={upcomingBills}
        recentPaychecks={paycheckHistory?.slice(0, 3) || []}
        onViewTransactions={() => setActiveView("transactions")}
        onViewBills={() => setActiveView("bills")}
        onViewPaychecks={() => setActiveView("paycheck")}
      />

      {/* Insights Section */}
      {insights.length > 0 && <InsightsSection insights={insights} />}

      {/* Reconcile Transaction Modal */}
      <ReconcileTransactionModal
        isOpen={showReconcileModal}
        onClose={closeReconcileModal}
        newTransaction={newTransaction}
        onUpdateTransaction={updateNewTransaction}
        onReconcile={onReconcileTransaction}
        getEnvelopeOptions={getEnvelopeOptions}
      />
    </div>
  );
};

export default React.memo(Dashboard);
