// components/Dashboard.jsx
import React from "react";
import logger from "@/utils/common/logger";
import PaydayPrediction from "../budgeting/PaydayPrediction";
import AccountBalanceOverview from "../dashboard/AccountBalanceOverview";
import RecentTransactionsWidget from "../dashboard/RecentTransactionsWidget";
import ReconcileTransactionModal from "../dashboard/ReconcileTransactionModal";
import { useActualBalance } from "@/hooks/budgeting/useBudgetMetadata";
import { useUnassignedCash } from "@/hooks/budgeting/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useSavingsGoals } from "@/hooks/common/useSavingsGoals";
import { useTransactions } from "@/hooks/common/useTransactions";
import useBudgetData from "@/hooks/budgeting/useBudgetData";
import DebtSummaryWidget from "../debt/ui/DebtSummaryWidget";
import PullToRefreshIndicator from "../mobile/PullToRefreshIndicator";
import usePullToRefresh from "@/hooks/mobile/usePullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMainDashboardUI,
  useDashboardCalculations,
  useTransactionReconciliation,
  usePaydayManager,
  useDashboardHelpers,
} from "@/hooks/dashboard/useMainDashboard";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { MainDashboardPropsSchema } from "@/domain/schemas/component-props";

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
  const { handleReconcileTransaction, handleAutoReconcileDifference, getEnvelopeOptions } =
    useTransactionReconciliation(reconcileTransaction, envelopes, savingsGoals);

  // Payday management
  const { paydayPrediction, handleProcessPaycheck, handlePrepareEnvelopes } = usePaydayManager(
    paycheckHistory,
    setActiveView
  );

  // Dashboard helpers
  const { getRecentTransactions } = useDashboardHelpers();

  // Get recent transactions
  const recentTransactions = getRecentTransactions(transactions, 10);

  // Pull-to-refresh functionality
  const queryClient = useQueryClient();
  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["envelopes"] });
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    await queryClient.invalidateQueries({ queryKey: ["savingsGoals"] });
    await queryClient.invalidateQueries({ queryKey: ["budgetMetadata"] });
    await queryClient.invalidateQueries({ queryKey: ["bills"] });
  };

  const {
    isPulling,
    isRefreshing,
    pullProgress,
    pullRotation,
    isReady,
    touchHandlers,
    containerRef,
    pullStyles,
  } = usePullToRefresh(refreshData, {
    threshold: 80,
    enabled: true,
  });

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

  // Show loading state while TanStack queries are fetching
  if (
    envelopesLoading ||
    savingsLoading ||
    transactionsLoading ||
    unassignedCashLoading ||
    actualBalanceLoading
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
    <div
      ref={containerRef}
      {...touchHandlers}
      className="relative rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6 overflow-hidden"
      style={pullStyles}
    >
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator
        isVisible={isPulling || isRefreshing}
        isRefreshing={isRefreshing}
        pullProgress={pullProgress}
        pullRotation={pullRotation}
        isReady={isReady}
      />
      {/* Payday Prediction */}
      {paydayPrediction && (
        <PaydayPrediction
          prediction={paydayPrediction}
          className="mb-6"
          onProcessPaycheck={handleProcessPaycheck}
          onPrepareEnvelopes={handlePrepareEnvelopes}
        />
      )}

      {/* Debt Summary Widget */}
      <DebtSummaryWidget
        onNavigateToDebts={() => {
          if (setActiveView) {
            setActiveView("debts");
          } else {
            logger.debug("Navigate to debts requested - setActiveView not available");
          }
        }}
      />

      {/* Account Balance Overview */}
      <AccountBalanceOverview
        actualBalance={actualBalance}
        totalVirtualBalance={totalVirtualBalance}
        totalEnvelopeBalance={totalEnvelopeBalance}
        totalSavingsBalance={totalSavingsBalance}
        unassignedCash={unassignedCash}
        difference={difference}
        isBalanced={isBalanced}
        onUpdateBalance={handleUpdateBalance}
        onOpenReconcileModal={openReconcileModal}
        onAutoReconcileDifference={handleAutoReconcileDifference}
      />

      {/* Recent Transactions */}
      <RecentTransactionsWidget
        transactions={recentTransactions}
        getEnvelopeOptions={getEnvelopeOptions}
      />

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
