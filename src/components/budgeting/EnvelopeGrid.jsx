// src/new/UnifiedEnvelopeManager.jsx
import React, { useState, useMemo } from "react";
import { useBudgetStore } from "../../stores/budgetStore";
import { useEnvelopes } from "../../hooks/useEnvelopes";
import { useTransactions } from "../../hooks/useTransactions";
import { useBills } from "../../hooks/useBills";
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
  Calculator,
} from "lucide-react";
import CreateEnvelopeModal from "./CreateEnvelopeModal";
import EditEnvelopeModal from "./EditEnvelopeModal";
import {
  ENVELOPE_TYPES,
  ENVELOPE_TYPE_CONFIG,
  AUTO_CLASSIFY_ENVELOPE_TYPE,
} from "../../constants/categories";
import { BIWEEKLY_MULTIPLIER } from "../../constants/frequency";

const UnifiedEnvelopeManager = ({
  envelopes: propEnvelopes = [],
  transactions: propTransactions = [], // Unified transactions including bills
  unassignedCash: propUnassignedCash,
  className = "",
}) => {
  // Enhanced TanStack Query integration with loading states
  const {
    data: tanStackEnvelopes = [],
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { data: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactions();

  const {
    data: tanStackBills = [],
    updateBill,
    isLoading: billsLoading,
  } = useBills();

  // Keep Zustand for non-migrated operations and fallbacks
  const budget = useBudgetStore();

  const envelopes = useMemo(
    () =>
      propEnvelopes && propEnvelopes.length
        ? propEnvelopes
        : tanStackEnvelopes.length
          ? tanStackEnvelopes
          : budget.envelopes || [],
    [propEnvelopes, tanStackEnvelopes, budget.envelopes],
  );

  const transactions = useMemo(
    () =>
      propTransactions && propTransactions.length
        ? propTransactions
        : tanStackTransactions.length
          ? tanStackTransactions
          : budget.transactions || [],
    [propTransactions, tanStackTransactions, budget.transactions],
  );
  const unassignedCash =
    propUnassignedCash !== undefined
      ? propUnassignedCash
      : budget.unassignedCash || 0;

  // Get bills for envelope linking
  const bills = useMemo(
    () => (tanStackBills.length ? tanStackBills : budget.bills || []),
    [tanStackBills, budget.bills],
  );

  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState(null);
  const [viewMode, setViewMode] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    timeRange: "current_month",
    showEmpty: true,
    sortBy: "usage_desc",
    envelopeType: "all", // all, bill, variable, savings
  });

  // Calculate envelope data with unified transactions
  const envelopeData = useMemo(() => {
    return envelopes.map((envelope) => {
      const envelopeTransactions = transactions.filter(
        (t) => t.envelopeId === envelope.id,
      );

      // Also get bills assigned to this envelope
      const envelopeBills = bills.filter((b) => b.envelopeId === envelope.id);

      const paidTransactions = envelopeTransactions.filter(
        (t) => t.type === "transaction" || (t.type === "bill" && t.isPaid),
      );

      // Combine bills from transactions and the bills array, removing duplicates
      const allUnpaidBills = [
        ...envelopeTransactions.filter(
          (t) =>
            (t.type === "bill" || t.type === "recurring_bill") && !t.isPaid,
        ),
        ...envelopeBills.filter((b) => !b.isPaid),
      ];

      // Deduplicate bills based on provider/name and due date to prevent showing same bill twice
      const unpaidBillsMap = new Map();
      allUnpaidBills.forEach((bill) => {
        const key = `${bill.provider || bill.name || bill.description}-${bill.dueDate}`;
        // Keep the first occurrence, or prefer bills array over transaction bills
        if (!unpaidBillsMap.has(key) || !bill.type) {
          unpaidBillsMap.set(key, bill);
        }
      });

      const unpaidBills = Array.from(unpaidBillsMap.values()).sort((a, b) => {
        // Sort by due date (earliest first)
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
        return dateA - dateB;
      });

      const upcomingBills = unpaidBills.filter(
        (t) => t.dueDate && new Date(t.dueDate) > new Date(),
      );

      const overdueBills = unpaidBills.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date(),
      );

      const totalSpent = paidTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0,
      );

      const totalUpcoming = upcomingBills.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0,
      );

      const totalOverdue = overdueBills.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0,
      );

      const allocated = envelope.budget || 0;
      const currentBalance = envelope.currentBalance || 0;
      const committed = totalUpcoming + totalOverdue;

      // Use actual current balance instead of budget allocation for availability
      const available = currentBalance - committed;

      // Calculate utilization rate based on envelope type and purpose
      let utilizationRate = 0;
      const envelopeType =
        envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

      if (envelopeType === ENVELOPE_TYPES.BILL && envelope.biweeklyAllocation) {
        // For bill envelopes, show progress toward next bill payment
        // Progress = current balance / amount needed for next bill
        let nextBillAmount = 0;

        if (upcomingBills.length > 0) {
          // Use the actual upcoming bill amount
          nextBillAmount = Math.abs(upcomingBills[0].amount);
        } else {
          // No upcoming bills, check if there are ANY bills for this envelope
          const allEnvelopeBills = unpaidBills.concat(paidTransactions);
          if (allEnvelopeBills.length > 0) {
            // Use the most recent bill amount as reference
            const mostRecentBill = allEnvelopeBills.sort(
              (a, b) =>
                new Date(b.date || b.dueDate) - new Date(a.date || a.dueDate),
            )[0];
            nextBillAmount = Math.abs(mostRecentBill.amount);
          } else {
            // Fallback to biweekly calculation (monthly equivalent)
            nextBillAmount = envelope.biweeklyAllocation * 2;
          }
        }

        utilizationRate =
          nextBillAmount > 0 ? currentBalance / nextBillAmount : 0;
      } else if (
        envelopeType === ENVELOPE_TYPES.SAVINGS &&
        envelope.targetAmount
      ) {
        // For savings envelopes, show progress toward target
        utilizationRate =
          envelope.targetAmount > 0
            ? currentBalance / envelope.targetAmount
            : 0;
      } else {
        // For variable envelopes, use traditional spending-based calculation
        const budgetAmount =
          envelope.monthlyBudget || allocated || envelope.monthlyAmount || 0;
        utilizationRate =
          budgetAmount > 0 ? (totalSpent + committed) / budgetAmount : 0;
      }

      let status = "healthy";
      if (totalOverdue > 0) status = "overdue";
      else if (available < 0) status = "overspent";
      else if (envelopeType === ENVELOPE_TYPES.BILL) {
        // For bill envelopes, status based on readiness for next payment
        if (utilizationRate >= 1.0)
          status = "healthy"; // Fully funded
        else if (utilizationRate >= 0.75)
          status = "caution"; // Mostly funded
        else if (utilizationRate >= 0.5)
          status = "warning"; // Partially funded
        else status = "overspent"; // Significantly underfunded
      } else if (envelopeType === ENVELOPE_TYPES.SAVINGS) {
        // For savings envelopes, status based on progress toward goal
        if (utilizationRate >= 0.9)
          status = "healthy"; // Close to goal
        else if (utilizationRate >= 0.75)
          status = "caution"; // Good progress
        else if (utilizationRate >= 0.5) status = "warning"; // Some progress
        // else remains "healthy" for early savings
      } else {
        // Traditional spending-based status for variable envelopes
        if (utilizationRate > 0.9) status = "warning";
        else if (utilizationRate > 0.75) status = "caution";
      }

      return {
        ...envelope,
        totalSpent,
        totalUpcoming,
        totalOverdue,
        available,
        allocated,
        currentBalance,
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
  }, [envelopes, transactions, bills]);

  const getEnvelopeTypeStyle = (envelope) => {
    const envelopeType =
      envelope.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
    const config = ENVELOPE_TYPE_CONFIG[envelopeType];

    if (!config) {
      return "border-gray-200 bg-white/60";
    }

    return `${config.borderColor} ${config.bgColor}`;
  };

  const getStatusStyle = (envelope) => {
    const { status } = envelope;

    // Status overrides envelope type styling for critical states
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
        // Use envelope type styling for healthy envelopes
        return getEnvelopeTypeStyle(envelope);
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
      case "status": {
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
    }

    if (!filterOptions.showEmpty) {
      sorted = sorted.filter((env) => env.allocated > 0);
    }

    // Filter by envelope type
    if (filterOptions.envelopeType !== "all") {
      sorted = sorted.filter((env) => {
        const envelopeType =
          env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);
        return envelopeType === filterOptions.envelopeType;
      });
    }

    return sorted;
  }, [envelopeData, filterOptions]);

  const totals = useMemo(() => {
    return envelopeData.reduce(
      (acc, env) => {
        const envelopeType =
          env.envelopeType || AUTO_CLASSIFY_ENVELOPE_TYPE(env.category);

        // Calculate biweekly funding need for each envelope type
        let biweeklyNeed = 0;
        if (envelopeType === ENVELOPE_TYPES.BILL && env.biweeklyAllocation) {
          biweeklyNeed = Math.max(
            0,
            env.biweeklyAllocation - env.currentBalance,
          );
        } else if (
          envelopeType === ENVELOPE_TYPES.VARIABLE &&
          env.monthlyBudget
        ) {
          const biweeklyTarget = env.monthlyBudget / BIWEEKLY_MULTIPLIER;
          biweeklyNeed = Math.max(0, biweeklyTarget - env.currentBalance);
        } else if (
          envelopeType === ENVELOPE_TYPES.SAVINGS &&
          env.targetAmount
        ) {
          // For savings, calculate a reasonable biweekly contribution (could be customizable)
          const remainingToTarget = Math.max(
            0,
            env.targetAmount - env.currentBalance,
          );
          biweeklyNeed = Math.min(
            remainingToTarget,
            env.biweeklyAllocation || 0,
          );
        }

        return {
          allocated: acc.allocated + env.allocated,
          currentBalance: acc.currentBalance + env.currentBalance,
          spent: acc.spent + env.totalSpent,
          upcoming: acc.upcoming + env.totalUpcoming,
          overdue: acc.overdue + env.totalOverdue,
          available: acc.available + env.available,
          biweeklyNeed: acc.biweeklyNeed + biweeklyNeed,
        };
      },
      {
        allocated: 0,
        currentBalance: 0,
        spent: 0,
        upcoming: 0,
        overdue: 0,
        available: 0,
        biweeklyNeed: 0,
      },
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

  // Show loading state while TanStack queries are fetching
  const isLoading = envelopesLoading || transactionsLoading || billsLoading;
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600 mt-1">
            Budget allocation with real-time bill tracking
          </p>
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
              <p className="text-sm text-gray-600">Biweekly Funding Need</p>
              <p className="text-2xl font-bold text-purple-600">
                ${totals.biweeklyNeed.toFixed(2)}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Total needed for all envelope types
            </p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totals.currentBalance.toFixed(2)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Spent This Period</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totals.spent.toFixed(2)}
              </p>
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
              <p className="text-sm text-gray-600">Bills Due</p>
              <p className="text-2xl font-bold text-orange-600">
                ${totals.upcoming.toFixed(2)}
              </p>
            </div>
            <FileText className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                ${totals.overdue.toFixed(2)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available After Bills</p>
              <p
                className={`text-2xl font-bold ${totals.available >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${totals.available.toFixed(2)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white/20">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center text-sm">
            <Filter className="h-3 w-3 mr-2" />
            Filters & Sorting
          </h4>

          <div className="flex gap-2">
            <select
              value={filterOptions.envelopeType}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  envelopeType: e.target.value,
                }))
              }
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="all">All Types</option>
              <option value={ENVELOPE_TYPES.BILL}>📝 Bills</option>
              <option value={ENVELOPE_TYPES.VARIABLE}>🔄 Variable</option>
              <option value={ENVELOPE_TYPES.SAVINGS}>💰 Savings</option>
            </select>

            <select
              value={filterOptions.sortBy}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  sortBy: e.target.value,
                }))
              }
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="usage_desc">Highest Usage First</option>
              <option value="usage_asc">Lowest Usage First</option>
              <option value="amount_desc">Largest Budget First</option>
              <option value="name">Alphabetical</option>
              <option value="status">Status Priority</option>
            </select>

            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={filterOptions.showEmpty}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    showEmpty: e.target.checked,
                  }))
                }
                className="mr-1"
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
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (unassignedCash > 0) {
                    budget.openUnassignedCashModal();
                  }
                }}
                className={`text-gray-400 hover:text-gray-600 ${
                  unassignedCash <= 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={unassignedCash <= 0}
                title={
                  unassignedCash > 0
                    ? "Distribute cash to envelopes"
                    : "No cash available to distribute"
                }
              >
                <DollarSign className="h-4 w-4" />
              </button>
              <Wallet className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">${unassignedCash.toFixed(2)}</p>
        </div>

        {sortedEnvelopes.map((envelope) => (
          <div
            key={envelope.id}
            className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${getStatusStyle(envelope)} ${
              selectedEnvelopeId === envelope.id ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => setSelectedEnvelopeId(envelope.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{envelope.name}</h3>
                <p className="text-sm text-gray-600">{envelope.category}</p>
                {(() => {
                  const envelopeType =
                    envelope.envelopeType ||
                    AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);
                  const config = ENVELOPE_TYPE_CONFIG[envelopeType];
                  if (config) {
                    return (
                      <div className="flex items-center gap-1 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full bg-${config.color}-500`}
                        ></div>
                        <span
                          className={`text-xs font-medium ${config.textColor}`}
                        >
                          {config.name.replace(" Envelope", "")}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(envelope.status)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEnvelope(envelope);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {(() => {
              const envelopeType =
                envelope.envelopeType ||
                AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

              // Only show progress bar for bill and savings envelopes
              if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
                return null; // No progress bar for variable envelopes
              }

              return (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {envelopeType === ENVELOPE_TYPES.BILL
                        ? "Payment Readiness"
                        : "Goal Progress"}
                    </span>
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
              );
            })()}

            <div className="space-y-2">
              {(() => {
                const envelopeType =
                  envelope.envelopeType ||
                  AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

                if (
                  envelopeType === ENVELOPE_TYPES.BILL &&
                  envelope.biweeklyAllocation
                ) {
                  return (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Due Biweekly:
                      </span>
                      <span className="text-sm font-medium">
                        ${envelope.biweeklyAllocation.toFixed(2)}
                      </span>
                    </div>
                  );
                } else if (
                  envelopeType === ENVELOPE_TYPES.VARIABLE &&
                  envelope.monthlyBudget
                ) {
                  return (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Monthly Budget:
                      </span>
                      <span className="text-sm font-medium">
                        ${envelope.monthlyBudget.toFixed(2)}
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Budget Allocated:
                      </span>
                      <span className="text-sm font-medium">
                        ${envelope.allocated.toFixed(2)}
                      </span>
                    </div>
                  );
                }
              })()}
              {(() => {
                const envelopeType =
                  envelope.envelopeType ||
                  AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

                // For variable envelopes, make current balance more prominent
                if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
                  return (
                    <div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3 mb-2">
                      <span className="text-base font-semibold text-gray-900">
                        Available Balance:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ${envelope.currentBalance.toFixed(2)}
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Current Balance:
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        ${envelope.currentBalance.toFixed(2)}
                      </span>
                    </div>
                  );
                }
              })()}
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
                <span className="text-sm font-medium text-gray-900">
                  Available After Bills:
                </span>
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
                {(() => {
                  const envelopeType =
                    envelope.envelopeType ||
                    AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category);

                  if (envelopeType === ENVELOPE_TYPES.BILL) {
                    return (
                      <>
                        <span>{envelope.unpaidBills.length} pending bills</span>
                        <span>{envelope.paidTransactions.length} payments</span>
                      </>
                    );
                  } else if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
                    return (
                      <>
                        <span>
                          {envelope.paidTransactions.length} transactions
                        </span>
                        <span>${envelope.totalSpent.toFixed(2)} spent</span>
                      </>
                    );
                  } else {
                    // Savings envelopes might have some bills
                    return (
                      <>
                        <span>
                          {envelope.paidTransactions.length} transactions
                        </span>
                        <span>{envelope.unpaidBills.length} pending bills</span>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed view moved up - appears right below the envelope grid */}
      {selectedEnvelope && (
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20 mt-4">
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

          <div
            className={`grid grid-cols-1 ${selectedEnvelope.envelopeType === ENVELOPE_TYPES.BILL ? "lg:grid-cols-1" : "lg:grid-cols-2"} gap-6`}
          >
            {selectedEnvelope.envelopeType !== ENVELOPE_TYPES.BILL && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  Recent Transactions (
                  {selectedEnvelope.paidTransactions.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedEnvelope.paidTransactions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent transactions</p>
                    </div>
                  ) : (
                    selectedEnvelope.paidTransactions
                      .slice(0, 10)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-center p-3 bg-white/50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-red-600">
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {(() => {
              const envelopeType =
                selectedEnvelope.envelopeType ||
                AUTO_CLASSIFY_ENVELOPE_TYPE(selectedEnvelope.category);

              // Don't show bills section for variable envelopes
              if (envelopeType === ENVELOPE_TYPES.VARIABLE) {
                return null;
              }

              return (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {envelopeType === ENVELOPE_TYPES.BILL
                      ? "Next Bills"
                      : "Upcoming Bills"}{" "}
                    ({selectedEnvelope.unpaidBills.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedEnvelope.unpaidBills.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No upcoming bills</p>
                      </div>
                    ) : (
                      selectedEnvelope.unpaidBills.map((bill, index) => (
                        <div
                          key={bill.id}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            index === 0 &&
                            selectedEnvelope.envelopeType ===
                              ENVELOPE_TYPES.BILL
                              ? "bg-blue-50 border border-blue-200"
                              : bill.urgency === "overdue"
                                ? "bg-red-50"
                                : bill.urgency === "urgent"
                                  ? "bg-orange-50"
                                  : "bg-white/50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {bill.provider ||
                                bill.description ||
                                bill.name ||
                                `Bill #${bill.id}`}
                              {index === 0 &&
                                selectedEnvelope.envelopeType ===
                                  ENVELOPE_TYPES.BILL && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    Next Due
                                  </span>
                                )}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">
                                Due:{" "}
                                {bill.dueDate
                                  ? new Date(bill.dueDate).toLocaleDateString()
                                  : "No date set"}
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
                            $
                            {bill.amount
                              ? Math.abs(bill.amount).toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Create Envelope Modal */}
      {showCreateModal && (
        <CreateEnvelopeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateEnvelope={(envelope) => {
            // Use TanStack mutation with Zustand fallback
            try {
              addEnvelope(envelope);
            } catch (error) {
              console.warn(
                "TanStack addEnvelope failed, using Zustand fallback",
                error,
              );
              budget.addEnvelope(envelope);
            }
            setShowCreateModal(false);
          }}
          unassignedCash={unassignedCash}
        />
      )}

      {/* Edit Envelope Modal */}
      {editingEnvelope && (
        <EditEnvelopeModal
          isOpen={!!editingEnvelope}
          onClose={() => setEditingEnvelope(null)}
          envelope={editingEnvelope}
          onUpdateEnvelope={(envelope) => {
            if (envelope.id === "unassigned") {
              // Handle unassigned cash update - keep using Zustand for UI state
              budget.setUnassignedCash(envelope.currentBalance);
            } else {
              // Use TanStack mutation with Zustand fallback
              try {
                updateEnvelope({ id: envelope.id, updates: envelope });
              } catch (error) {
                console.warn(
                  "TanStack updateEnvelope failed, using Zustand fallback",
                  error,
                );
                budget.updateEnvelope(envelope);
              }
            }
            setEditingEnvelope(null);
          }}
          onDeleteEnvelope={(envelopeId) => {
            // Use TanStack mutation with Zustand fallback
            try {
              deleteEnvelope(envelopeId);
            } catch (error) {
              console.warn(
                "TanStack deleteEnvelope failed, using Zustand fallback",
                error,
              );
              budget.deleteEnvelope(envelopeId);
            }
            setEditingEnvelope(null);
          }}
          onUpdateBill={(bill) => {
            // Use TanStack mutation with Zustand fallback
            try {
              updateBill({ id: bill.id, updates: bill });
            } catch (error) {
              console.warn(
                "TanStack updateBill failed, using Zustand fallback",
                error,
              );
              budget.updateBill(bill);
            }
          }}
          existingEnvelopes={envelopes}
          allBills={bills}
          currentUser={budget.currentUser}
        />
      )}
    </div>
  );
};

export default UnifiedEnvelopeManager;
