// components/Dashboard.jsx
import React, { useMemo } from "react";
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

  // Calculate envelope spending data
  const envelopeSpendingData = useMemo(() => {
    if (envelopes.length === 0) return [];

    const totalSpent = envelopes.reduce((sum, env) => {
      const balance =
        typeof env?.currentBalance === "string"
          ? parseFloat(env.currentBalance)
          : env?.currentBalance || 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
    ];

    return envelopes
      .map((env, index) => {
        const balance =
          typeof env?.currentBalance === "string"
            ? parseFloat(env.currentBalance)
            : env?.currentBalance || 0;
        const amount = isNaN(balance) ? 0 : balance;
        const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        return {
          name: env.name,
          amount,
          percentage,
          color: colors[index % colors.length],
        };
      })
      .filter((item) => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [envelopes]);

  // Calculate biweekly status (placeholder values - should be calculated from actual data)
  const biweeklyStatus = useMemo(() => {
    const totalGoal = 1753.95;
    const currentProgress = totalEnvelopeBalance + totalSavingsBalance;
    const amountNeeded = Math.max(0, totalGoal - currentProgress);
    return { amountNeeded, totalGoal };
  }, [totalEnvelopeBalance, totalSavingsBalance]);

  // Prepare debt data for tracker
  const debtTrackerData = useMemo(() => {
    return debts
      .filter((debt) => debt.status === "active")
      .map((debt) => ({
        id: debt.id,
        name: debt.name,
        currentBalance: debt.currentBalance || 0,
        originalBalance: debt.originalBalance || debt.currentBalance || 0,
        percentPaid:
          debt.originalBalance > 0
            ? Math.round(
                ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100
              )
            : 0,
      }));
  }, [debts]);

  // Prepare upcoming bills (next 7 days)
  const upcomingBills = useMemo(() => {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return bills
      .filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= sevenDaysLater;
      })
      .slice(0, 3);
  }, [bills]);

  // Prepare insights
  const insights = useMemo(() => {
    const insightsList = [];

    if (unassignedCash > 0) {
      insightsList.push({
        id: "unassigned-cash",
        type: "info" as const,
        message: `You have $${unassignedCash.toFixed(2)} unallocated`,
        action: {
          label: "Suggest Envelopes",
          onClick: () => setActiveView("envelopes"),
        },
      });
    }

    if (debts.length > 0) {
      const totalDebt = debts.reduce((sum, debt) => sum + (debt.currentBalance || 0), 0);
      insightsList.push({
        id: "debt-summary",
        type: "info" as const,
        message: `Total debt: $${totalDebt.toFixed(2)}. Stay on track with your payments.`,
      });
    }

    if (paydayPrediction && paydayPrediction.confidence >= 80) {
      insightsList.push({
        id: "payday-confidence",
        type: "success" as const,
        message: "High confidence payday prediction. You're managing your budget well!",
      });
    }

    return insightsList;
  }, [unassignedCash, debts, paydayPrediction, setActiveView]);

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
