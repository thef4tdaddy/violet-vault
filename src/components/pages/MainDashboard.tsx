// components/Dashboard.jsx
import React from "react";
import logger from "@/utils/core/common/logger";
import PaydayPrediction from "../budgeting/PaydayPrediction";
import AccountBalanceOverview from "../dashboard/AccountBalanceOverview";
import RecentTransactionsWidget from "../dashboard/RecentTransactionsWidget";
import ReconcileTransactionModal from "../dashboard/ReconcileTransactionModal";
import { useActualBalance } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useSavingsGoals from "@/hooks/budgeting/envelopes/goals/useSavingsGoals";
import { useTransactionQuery as useTransactions } from "@/hooks/budgeting/transactions/useTransactionQuery";
import useBudgetData from "@/hooks/budgeting/core/useBudgetData";
import DebtSummaryWidget from "../debt/ui/DebtSummaryWidget";
import {
  useDashboardUI,
  useDashboardCalculations,
  useReconciliation,
  usePaydayManager,
  useDashboardHelpers,
} from "@/hooks/platform/ux/dashboard";

import { validateComponentProps } from "@/utils/core/validation/propValidator";
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

  // Dashboard Hooks
  const {
    showReconcileModal,
    newTransaction,
    openReconcileModal,
    closeReconcileModal,
    updateNewTransaction,
    resetNewTransaction,
  } = useDashboardUI();

  const { totalEnvelopeBalance, totalSavingsBalance, totalVirtualBalance, difference, isBalanced } =
    useDashboardCalculations(envelopes, savingsGoals, unassignedCash, actualBalance);

  const { handleReconcileTransaction, handleAutoReconcileDifference, getEnvelopeOptions } =
    useReconciliation(reconcileTransaction, envelopes, savingsGoals);

  // Payday management
  const { paydayPrediction, handleProcessPaycheck, handlePrepareEnvelopes } = usePaydayManager(
    paycheckHistory,
    setActiveView
  );

  // Dashboard helpers
  const { getRecentTransactions } = useDashboardHelpers();

  // Get recent transactions
  const recentTransactions = getRecentTransactions(transactions, 10);

  const handleUpdateBalance = async (newBalance: number) => {
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
    <div className="relative rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6 overflow-hidden">
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
        transactions={recentTransactions as never}
        getEnvelopeOptions={getEnvelopeOptions}
      />

      {/* Reconcile Transaction Modal */}
      <ReconcileTransactionModal
        isOpen={showReconcileModal}
        onClose={closeReconcileModal}
        newTransaction={newTransaction}
        onUpdateTransaction={
          updateNewTransaction as (
            updates: Partial<{
              type?: string;
              amount?: string;
              description?: string;
              envelopeId?: string;
              date?: string;
            }>
          ) => void
        }
        onReconcile={onReconcileTransaction}
        getEnvelopeOptions={getEnvelopeOptions}
      />
    </div>
  );
};

export default React.memo(Dashboard);
