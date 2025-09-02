// components/Dashboard.jsx
import React from "react";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Calendar,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import PaydayPrediction from "../budgeting/PaydayPrediction";
import EditableBalance from "../ui/EditableBalance";
import { useActualBalance } from "../../hooks/budgeting/useBudgetMetadata";
import { useUnassignedCash } from "../../hooks/budgeting/useBudgetMetadata";
import { useEnvelopes } from "../../hooks/budgeting/useEnvelopes";
import { useSavingsGoals } from "../../hooks/common/useSavingsGoals";
import { useTransactions } from "../../hooks/common/useTransactions";
import useBudgetData from "../../hooks/budgeting/useBudgetData";
import DebtSummaryWidget from "../debt/ui/DebtSummaryWidget";
import {
  useMainDashboardUI,
  useDashboardCalculations,
  useTransactionReconciliation,
  usePaydayManager,
  useDashboardHelpers,
} from "../../hooks/dashboard/useMainDashboard";

const Dashboard = ({ setActiveView }) => {
  // Enhanced TanStack Query integration with optimistic updates
  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();

  const { data: savingsGoals = [], isLoading: savingsLoading } =
    useSavingsGoals();

  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions();

  // Use TanStack Query for budget metadata
  const { unassignedCash, isLoading: unassignedCashLoading } =
    useUnassignedCash();
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
  const {
    totalEnvelopeBalance,
    totalSavingsBalance,
    safeUnassignedCash,
    totalVirtualBalance,
    difference,
    isBalanced,
  } = useDashboardCalculations(
    envelopes,
    savingsGoals,
    unassignedCash,
    actualBalance,
  );

  // Transaction reconciliation logic
  const {
    handleReconcileTransaction,
    handleAutoReconcileDifference,
    getEnvelopeOptions,
  } = useTransactionReconciliation(
    reconcileTransaction,
    envelopes,
    savingsGoals,
  );

  // Payday management
  const { paydayPrediction, handleProcessPaycheck, handlePrepareEnvelopes } =
    usePaydayManager(paycheckHistory, setActiveView);

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
    const success = handleReconcileTransaction(newTransaction, () => {
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
    <div className="space-y-6">
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
            logger.debug(
              "Navigate to debts requested - setActiveView not available",
            );
          }
        }}
      />

      {/* Account Balance Overview */}
      <div className="glassmorphism rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
          Checking Account Dashboard
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actual Balance */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-blue-900">Actual Bank Balance</h3>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <EditableBalance
              value={actualBalance}
              onChange={handleUpdateBalance}
              title="Bank Balance"
              subtitle="Click to edit your current checking account balance"
              className="text-blue-900"
              currencyClassName="text-2xl font-bold text-blue-900"
              subtitleClassName="text-sm text-blue-700"
            />
          </div>

          {/* Virtual Balance */}
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-green-900">Virtual Balance</h3>
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-900">
                ${totalVirtualBalance.toFixed(2)}
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>Envelopes: ${totalEnvelopeBalance.toFixed(2)}</div>
                <div>Savings: ${totalSavingsBalance.toFixed(2)}</div>
                <div>Unassigned: ${unassignedCash.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Difference */}
          <div
            className={`rounded-lg p-6 ${
              isBalanced
                ? "bg-green-50"
                : Math.abs(difference) > 10
                  ? "bg-red-50"
                  : "bg-yellow-50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`font-medium ${
                  isBalanced
                    ? "text-green-900"
                    : Math.abs(difference) > 10
                      ? "text-red-900"
                      : "text-yellow-900"
                }`}
              >
                Difference
              </h3>
              {isBalanced ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle
                  className={`h-5 w-5 ${
                    Math.abs(difference) > 10
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                />
              )}
            </div>
            <div className="space-y-3">
              <div
                className={`text-2xl font-bold ${
                  isBalanced
                    ? "text-green-900"
                    : difference > 0
                      ? "text-green-900"
                      : "text-red-900"
                }`}
              >
                {isBalanced
                  ? "Accounts Balanced!"
                  : `${difference > 0 ? "+" : ""}$${difference.toFixed(2)}`}
              </div>
              <p
                className={`text-sm ${
                  isBalanced
                    ? "text-green-700"
                    : Math.abs(difference) > 10
                      ? "text-red-700"
                      : "text-yellow-700"
                }`}
              >
                {isBalanced
                  ? "Accounts are balanced!"
                  : difference > 0
                    ? "Extra money available"
                    : "Virtual balance exceeds actual"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={openReconcileModal}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconcile Transaction
          </button>

          {!isBalanced && Math.abs(difference) > 0.01 && (
            <button
              onClick={() => {
                if (difference > 0) {
                  // Add difference to unassigned cash
                  reconcileTransaction({
                    id: Date.now(),
                    amount: difference,
                    description: "Balance reconciliation - added extra funds",
                    type: "income",
                    envelopeId: "unassigned",
                    date: new Date().toISOString().split("T")[0],
                    reconciledAt: new Date().toISOString(),
                  });
                } else {
                  // Subtract difference from unassigned cash
                  reconcileTransaction({
                    id: Date.now(),
                    amount: difference,
                    description:
                      "Balance reconciliation - adjusted for discrepancy",
                    type: "expense",
                    envelopeId: "unassigned",
                    date: new Date().toISOString().split("T")[0],
                    reconciledAt: new Date().toISOString(),
                  });
                }
              }}
              className="btn btn-secondary flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Auto-Reconcile Difference
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="glassmorphism rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.envelopeId &&
                        transaction.envelopeId !== "unassigned" && (
                          <span className="ml-2">
                            →{" "}
                            {getEnvelopeOptions().find(
                              (opt) => opt.id === transaction.envelopeId,
                            )?.name || "Unknown"}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    transaction.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reconcile Transaction Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">
              Reconcile Transaction
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateNewTransaction({ type: "expense" })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      newTransaction.type === "expense"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <Minus className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm">Expense</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateNewTransaction({ type: "income" })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      newTransaction.type === "income"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <Plus className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-sm">Income</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    updateNewTransaction({ amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    updateNewTransaction({ description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What was this transaction for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Envelope
                </label>
                <select
                  value={newTransaction.envelopeId}
                  onChange={(e) =>
                    updateNewTransaction({ envelopeId: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select envelope...</option>
                  {getEnvelopeOptions().map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    updateNewTransaction({ date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeReconcileModal}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onReconcileTransaction}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Reconcile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
