// src/new/UnifiedEnvelopeManager.jsx
import React, { useState, useMemo } from "react";
import { useBudget } from "../contexts/BudgetContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  BarChart3,
  PieChart,
  ArrowRight,
  Wallet,
  CreditCard,
  Receipt,
  FileText,
  Eye,
  Settings,
  Filter,
} from "lucide-react";

const UnifiedEnvelopeManager = ({
  envelopes: propEnvelopes = [],
  transactions: propTransactions = [], // Unified transactions including bills
  unassignedCash: propUnassignedCash,
  onUpdateEnvelope,
  onCreateEnvelope,
  onAssignTransaction,
  className = "",
}) => {
  const budget = useBudget();
  const { currentUser } = useAuth();

  const envelopes = propEnvelopes && propEnvelopes.length ? propEnvelopes : budget.envelopes || [];
  const transactions =
    propTransactions && propTransactions.length ? propTransactions : budget.transactions || [];
  const unassignedCash =
    propUnassignedCash !== undefined ? propUnassignedCash : budget.unassignedCash || 0;

  const handleUpdateEnvelope = onUpdateEnvelope || budget.updateEnvelope;
  const handleCreateEnvelope = onCreateEnvelope || budget.addEnvelope;
  const handleAssignTransaction = onAssignTransaction || budget.reconcileTransaction;
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("overview");
  const [filterOptions, setFilterOptions] = useState({
    timeRange: "current_month",
    showEmpty: true,
    sortBy: "usage_desc",
  });

  // Calculate envelope data with unified transactions
  const envelopeData = useMemo(() => {
    return envelopes.map((envelope) => {
      const envelopeTransactions = transactions.filter((t) => t.envelopeId === envelope.id);

      const paidTransactions = envelopeTransactions.filter(
        (t) => t.type === "transaction" || (t.type === "bill" && t.isPaid)
      );

      const unpaidBills = envelopeTransactions.filter(
        (t) => (t.type === "bill" || t.type === "recurring_bill") && !t.isPaid
      );

      const upcomingBills = unpaidBills.filter(
        (t) => t.dueDate && new Date(t.dueDate) > new Date()
      );

      const overdueBills = unpaidBills.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());

      const totalSpent = paidTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalUpcoming = upcomingBills.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const totalOverdue = overdueBills.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const allocated = envelope.budget || 0;
      const committed = totalUpcoming + totalOverdue;
      const available = allocated - totalSpent - committed;
      const utilizationRate = allocated > 0 ? (totalSpent + committed) / allocated : 0;

      let status = "healthy";
      if (totalOverdue > 0) status = "overdue";
      else if (available < 0) status = "overspent";
      else if (utilizationRate > 0.9) status = "warning";
      else if (utilizationRate > 0.75) status = "caution";

      return {
        ...envelope,
        totalSpent,
        totalUpcoming,
        totalOverdue,
        available,
        allocated,
        committed,
        utilizationRate,
        status,
        transactions: envelopeTransactions,
        paidTransactions,
        unpaidBills,
        upcomingBills,
        overdueBills,
      };
    });
  }, [envelopes, transactions]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "overdue":
        return "border-red-500 bg-red-50";
      case "overspent":
        return "border-red-400 bg-red-50";
      case "warning":
        return "border-orange-400 bg-orange-50";
      case "caution":
        return "border-yellow-400 bg-yellow-50";
      default:
        return "border-gray-200 bg-white/60";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
      case "overspent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "caution":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const sortedEnvelopes = useMemo(() => {
    let sorted = [...envelopeData];

    switch (filterOptions.sortBy) {
      case "usage_desc":
        sorted.sort((a, b) => b.utilizationRate - a.utilizationRate);
        break;
      case "usage_asc":
        sorted.sort((a, b) => a.utilizationRate - b.utilizationRate);
        break;
      case "amount_desc":
        sorted.sort((a, b) => b.allocated - a.allocated);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "status":
        const statusOrder = {
          overdue: 0,
          overspent: 1,
          warning: 2,
          caution: 3,
          healthy: 4,
        };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }

    if (!filterOptions.showEmpty) {
      sorted = sorted.filter((env) => env.allocated > 0);
    }

    return sorted;
  }, [envelopeData, filterOptions]);

  const totals = useMemo(() => {
    return envelopeData.reduce(
      (acc, env) => ({
        allocated: acc.allocated + env.allocated,
        spent: acc.spent + env.totalSpent,
        upcoming: acc.upcoming + env.totalUpcoming,
        overdue: acc.overdue + env.totalOverdue,
      }),
      { allocated: 0, spent: 0, upcoming: 0, overdue: 0 }
    );
  }, [envelopeData]);

  const selectedEnvelope =
    selectedEnvelopeId === "unassigned"
      ? {
          id: "unassigned",
          name: "Unassigned Cash",
          available: unassignedCash,
          allocated: 0,
          totalSpent: 0,
          totalUpcoming: 0,
          totalOverdue: 0,
          paidTransactions: [],
          unpaidBills: [],
        }
      : envelopeData.find((env) => env.id === selectedEnvelopeId);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-green-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-green-500 p-2 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            Envelope Manager
          </h2>
          <p className="text-gray-600 mt-1">Budget allocation with real-time bill tracking</p>
        </div>

        <div className="flex gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed View</option>
            <option value="analytics">Analytics</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Envelope
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Allocated</p>
              <p className="text-2xl font-bold text-gray-900">${totals.allocated.toFixed(2)}</p>
            </div>
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Spent This Period</p>
              <p className="text-2xl font-bold text-gray-900">${totals.spent.toFixed(2)}</p>
            </div>
            <Receipt className="h-8 w-8 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((totals.spent / totals.allocated) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unassigned Cash</p>
              <p className="text-2xl font-bold text-gray-900">${unassignedCash.toFixed(2)}</p>
            </div>
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bills Due</p>
              <p className="text-2xl font-bold text-orange-600">${totals.upcoming.toFixed(2)}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${totals.overdue.toFixed(2)}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters & Sorting
          </h4>

          <div className="flex gap-3">
            <select
              value={filterOptions.sortBy}
              onChange={(e) => setFilterOptions((prev) => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="usage_desc">Highest Usage First</option>
              <option value="usage_asc">Lowest Usage First</option>
              <option value="amount_desc">Largest Budget First</option>
              <option value="name">Alphabetical</option>
              <option value="status">Status Priority</option>
            </select>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={filterOptions.showEmpty}
                onChange={(e) =>
                  setFilterOptions((prev) => ({ ...prev, showEmpty: e.target.checked }))
                }
                className="mr-2"
              />
              Show Empty
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg bg-white/60 border-gray-200 ${
            selectedEnvelopeId === "unassigned" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setSelectedEnvelopeId("unassigned")}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Unassigned Cash</h3>
            </div>
            <Wallet className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-3xl font-bold">${unassignedCash.toFixed(2)}</p>
        </div>

        {sortedEnvelopes.map((envelope) => (
          <div
            key={envelope.id}
            className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${getStatusStyle(envelope.status)} ${
              selectedEnvelopeId === envelope.id ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => setSelectedEnvelopeId(envelope.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{envelope.name}</h3>
                <p className="text-sm text-gray-600">{envelope.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(envelope.status)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Budget Progress</span>
                <span className="text-sm font-medium">
                  {Math.round(envelope.utilizationRate * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    envelope.status === "overspent"
                      ? "bg-red-500"
                      : envelope.status === "warning"
                        ? "bg-orange-500"
                        : envelope.status === "caution"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(envelope.utilizationRate * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Allocated:</span>
                <span className="text-sm font-medium">${envelope.allocated.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Spent:</span>
                <span className="text-sm font-medium text-red-600">
                  -${envelope.totalSpent.toFixed(2)}
                </span>
              </div>
              {envelope.totalUpcoming > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bills Due:</span>
                  <span className="text-sm font-medium text-orange-600">
                    -${envelope.totalUpcoming.toFixed(2)}
                  </span>
                </div>
              )}
              {envelope.totalOverdue > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overdue:</span>
                  <span className="text-sm font-medium text-red-600">
                    -${envelope.totalOverdue.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Available:</span>
                <span
                  className={`text-sm font-bold ${
                    envelope.available < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ${envelope.available.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{envelope.paidTransactions.length} transactions</span>
                <span>{envelope.unpaidBills.length} pending bills</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEnvelope && (
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedEnvelope.name} - Detailed View
            </h3>
            <button
              onClick={() => setSelectedEnvelopeId(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                Recent Transactions ({selectedEnvelope.paidTransactions.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedEnvelope.paidTransactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 bg-white/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Upcoming Bills ({selectedEnvelope.unpaidBills.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedEnvelope.unpaidBills.map((bill) => (
                  <div
                    key={bill.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      bill.urgency === "overdue"
                        ? "bg-red-50"
                        : bill.urgency === "urgent"
                          ? "bg-orange-50"
                          : "bg-white/50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {bill.provider || bill.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                        {bill.urgency === "overdue" && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Overdue
                          </span>
                        )}
                        {bill.urgency === "urgent" && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Due Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-orange-600">
                      ${Math.abs(bill.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedEnvelopeManager;
