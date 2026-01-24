// components/pages/MainDashboard.tsx
import React from "react";
import { DashboardShell } from "../dashboard/DashboardShell";
import { AccountCard } from "../dashboard/AccountCard";
import PaydayBanner from "../dashboard/PaydayBanner";
import RecentTransactionsWidget from "../dashboard/RecentTransactionsWidget";
import ReconcileTransactionModal from "../dashboard/ReconcileTransactionModal";
import DebtSummaryWidget from "../debt/ui/DebtSummaryWidget";
import QuickActions from "../dashboard/QuickActions";
import InsightsWidget from "../dashboard/InsightsWidget";

import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useSavingsGoals from "@/hooks/budgeting/envelopes/goals/useSavingsGoals";
import { useTransactionQuery as useTransactions } from "@/hooks/budgeting/transactions/useTransactionQuery";
import useBudgetData from "@/hooks/budgeting/core/useBudgetData";
import { useAnalytics } from "@/hooks/api/useAnalytics";
import { useAccountBalances } from "@/hooks/dashboard/useAccountBalances";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";
import type { BudgetHealthResult } from "@/domain/schemas";

import {
  useDashboardUI,
  useDashboardCalculations,
  useReconciliation,
  useDashboardHelpers,
} from "@/hooks/platform/ux/dashboard";

import { validateComponentProps } from "@/utils/core/validation/propValidator";
import { MainDashboardPropsSchema } from "@/domain/schemas/component-props";

interface DashboardProps {
  setActiveView: (view: string) => void;
}

/**
 * Dashboard Loader - Modular skeleton for the redesign
 */
const DashboardLoader = () => (
  <DashboardShell className="animate-pulse">
    <div className="md:col-span-2 lg:col-span-3 h-8 bg-gray-200 rounded w-1/2 mb-6" />
    <div className="h-48 bg-gray-200 rounded border-2 border-black" />
    <div className="h-48 bg-gray-200 rounded border-2 border-black" />
    <div className="h-48 bg-gray-200 rounded border-2 border-black" />
  </DashboardShell>
);

/**
 * Budget Health Widget - Performance visualization
 */
const BudgetHealthWidget = ({ health }: { health: BudgetHealthResult }) => (
  <article className="p-6 bg-white border-2 border-black rounded-xl shadow-xl">
    <h3 className="font-black text-black text-lg mb-2 uppercase">Budget Health</h3>
    <div className="flex items-end gap-2">
      <span className="text-4xl font-black text-purple-600">{health.overallScore}</span>
      <span className="text-xl font-bold text-gray-500 mb-1">/ 100 ({health.grade})</span>
    </div>
    <p className="text-sm text-gray-600 mt-2">
      {health.breakdown.spendingPace > 80
        ? "Your spending is well within limits."
        : "Watch your daily spending velocity."}
    </p>
  </article>
);

interface AccountOverviewProps {
  balances: {
    checking: { balance: number; isManual: boolean };
    unassigned: { amount: number; isHigh: boolean; isNegative: boolean };
    savings: { balance: number };
  };
  savingsCount: number;
  onUpdateChecking: () => void;
  onAllocateUnassigned: () => void;
  onTrackSavings: () => void;
}

/**
 * Account Overview Section - Checking, Unassigned, Savings cards
 */
const AccountOverview = ({
  balances,
  savingsCount,
  onUpdateChecking,
  onAllocateUnassigned,
  onTrackSavings,
}: AccountOverviewProps) => (
  <>
    <AccountCard
      type="checking"
      balance={balances.checking.balance}
      subtitle={balances.checking.isManual ? "Manual Balance" : "Bank Synced"}
      action={{
        label: "Update",
        onClick: onUpdateChecking,
        icon: "Edit3",
      }}
    />

    <AccountCard
      type="unassigned"
      balance={balances.unassigned.amount}
      isWarning={balances.unassigned.isHigh || balances.unassigned.isNegative}
      subtitle={balances.unassigned.isNegative ? "Over-allocated" : "Available to budget"}
      action={{
        label: "Allocate",
        onClick: onAllocateUnassigned,
        icon: "ArrowRight",
      }}
    />

    <AccountCard
      type="savings"
      balance={balances.savings.balance}
      subtitle={`${savingsCount} active goals`}
      action={{
        label: "Track",
        onClick: onTrackSavings,
        icon: "Target",
      }}
    />
  </>
);

const Dashboard = ({ setActiveView }: DashboardProps) => {
  // Validate props in development
  validateComponentProps("MainDashboard", { setActiveView }, MainDashboardPropsSchema);

  // TanStack Query integration
  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();
  const { savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();
  const { transactions = [], isLoading: transactionsLoading } = useTransactions();

  // Modern Hooks
  const { accountBalances, isLoading: balancesLoading } = useAccountBalances();
  const { isLoading: paydayLoading } = usePaydayProgress();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  // Legacy/Support Hooks
  const { reconcileTransaction } = useBudgetData();

  const {
    showReconcileModal,
    newTransaction,
    openReconcileModal,
    closeReconcileModal,
    updateNewTransaction,
    resetNewTransaction,
  } = useDashboardUI();

  // Unified Dashboard Calculations
  const { totalSavingsBalance } = useDashboardCalculations(
    envelopes,
    savingsGoals,
    accountBalances.unassigned.amount,
    accountBalances.checking.balance
  );

  const { handleReconcileTransaction, getEnvelopeOptions } = useReconciliation(
    reconcileTransaction,
    envelopes,
    savingsGoals
  );

  const { getRecentTransactions } = useDashboardHelpers();

  // Global Loading State
  const isGlobalLoading =
    envelopesLoading ||
    savingsLoading ||
    transactionsLoading ||
    balancesLoading ||
    paydayLoading ||
    analyticsLoading;

  if (isGlobalLoading) {
    return <DashboardLoader />;
  }

  // Event Handlers
  const onReconcileTransaction = () => {
    handleReconcileTransaction(newTransaction, () => {
      resetNewTransaction();
      closeReconcileModal();
    });
  };

  return (
    <DashboardShell paydayBanner={<PaydayBanner />}>
      <div className="md:col-span-2 lg:col-span-3">
        <QuickActions setActiveView={setActiveView} />
      </div>

      <AccountOverview
        balances={{
          ...accountBalances,
          savings: { balance: totalSavingsBalance },
        }}
        savingsCount={savingsGoals.length}
        onUpdateChecking={openReconcileModal}
        onAllocateUnassigned={() => setActiveView("envelopes")}
        onTrackSavings={() => setActiveView("savings")}
      />

      <div className="md:col-span-2 lg:col-span-2 space-y-4">
        <DebtSummaryWidget onNavigateToDebts={() => setActiveView("debts")} />
        {analytics?.budgetHealth && <BudgetHealthWidget health={analytics.budgetHealth} />}
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <RecentTransactionsWidget
          transactions={getRecentTransactions(transactions, 10) as never}
          getEnvelopeOptions={getEnvelopeOptions}
        />
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        <InsightsWidget />
      </div>

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
    </DashboardShell>
  );
};

export default React.memo(Dashboard);
