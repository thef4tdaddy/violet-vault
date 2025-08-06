// src/new/UnifiedBillTracker.jsx
import React, { useState, useMemo } from "react";
import { useBudget } from "../../hooks/useBudget";
import {
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Search,
  RefreshCw,
  Plus,
  Settings,
  Target,
  Filter,
  Eye,
} from "lucide-react";
import { getBillIcon, getIconByName } from "../../utils/billIcons";
import AddBillModal from "./AddBillModal";

const BillManager = ({
  transactions: propTransactions = [], // Unified data source - filters for bills
  envelopes: propEnvelopes = [],
  onPayBill,
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
  className = "",
}) => {
  const budget = useBudget();

  const transactions = useMemo(
    () =>
      propTransactions && propTransactions.length
        ? propTransactions
        : budget.allTransactions || [],
    [propTransactions, budget.allTransactions],
  );

  const envelopes = useMemo(
    () =>
      propEnvelopes && propEnvelopes.length
        ? propEnvelopes
        : budget.envelopes || [],
    [propEnvelopes, budget.envelopes],
  );

  const reconcileTransaction = budget.reconcileTransaction;
  const handlePayBillAction = onPayBill || budget.updateBill;
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [viewMode, setViewMode] = useState("upcoming");
  const [isSearching, setIsSearching] = useState(false);
  const [showBillDetail, setShowBillDetail] = useState(null);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    billTypes: ["all"],
    providers: [],
    envelopes: [],
    sortBy: "due_date",
    showPaid: false,
  });

  const bills = useMemo(() => {
    // Combine bills from transactions and the dedicated bills store
    const billsFromTransactions = transactions.filter(
      (t) => t && (t.type === "bill" || t.type === "recurring_bill"),
    );
    const billsFromStore = budget.bills || [];

    // Merge both sources, prioritizing store bills over transaction bills with same ID
    const combinedBills = [...billsFromStore];
    billsFromTransactions.forEach((bill) => {
      if (!combinedBills.find((b) => b.id === bill.id)) {
        combinedBills.push(bill);
      }
    });

    return combinedBills.map((bill) => {
      let daysUntilDue = null;
      let urgency = "normal";

      if (bill.dueDate) {
        try {
          const today = new Date();

          // Fix 2-digit year parsing by converting to 4-digit years
          let normalizedDate = bill.dueDate;

          // Handle various date formats and convert 2-digit years to 4-digit
          if (typeof normalizedDate === "string") {
            // Match patterns like MM/DD/YY, MM-DD-YY, etc.
            normalizedDate = normalizedDate.replace(
              /(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/,
              (match, month, day, year) => {
                const fullYear =
                  parseInt(year) <= 30 ? `20${year}` : `19${year}`;
                return `${month}/${day}/${fullYear}`;
              },
            );
          }

          const due = new Date(normalizedDate);

          // Validate date is valid
          if (!isNaN(due.getTime())) {
            daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

            if (daysUntilDue < 0) urgency = "overdue";
            else if (daysUntilDue <= 3) urgency = "urgent";
            else if (daysUntilDue <= 7) urgency = "soon";
          }
        } catch (error) {
          console.warn(
            `Invalid due date for bill ${bill.id}:`,
            bill.dueDate,
            error,
          );
        }
      }

      return {
        ...bill,
        // Ensure required fields have valid values
        amount: typeof bill.amount === "number" ? bill.amount : 0,
        description: bill.description || bill.provider || `Bill ${bill.id}`,
        isPaid: Boolean(bill.isPaid),
        daysUntilDue,
        urgency,
      };
    });
  }, [transactions, budget.bills]);

  const categorizedBills = useMemo(() => {
    const upcomingBills = bills.filter((b) => !b.isPaid && b.daysUntilDue >= 0);
    const overdueBills = bills.filter((b) => !b.isPaid && b.daysUntilDue < 0);
    const paidBills = bills.filter((b) => b.isPaid);

    return {
      upcoming: upcomingBills.sort(
        (a, b) => (a.daysUntilDue || 999) - (b.daysUntilDue || 999),
      ),
      overdue: overdueBills.sort(
        (a, b) => (a.daysUntilDue || 0) - (b.daysUntilDue || 0),
      ),
      paid: paidBills.sort(
        (a, b) =>
          new Date(b.paidDate || b.date) - new Date(a.paidDate || a.date),
      ),
      all: bills,
    };
  }, [bills]);

  const totals = useMemo(() => {
    const overdueTotal = categorizedBills.overdue.reduce(
      (sum, b) => sum + Math.abs(b.amount),
      0,
    );

    // Calculate "due soon" as bills due within 7 days (urgent + soon)
    const dueSoonBills = categorizedBills.upcoming.filter(
      (b) => b.urgency === "urgent" || b.urgency === "soon",
    );
    const dueSoonTotal = dueSoonBills.reduce(
      (sum, b) => sum + Math.abs(b.amount),
      0,
    );

    const paidThisMonth = categorizedBills.paid
      .filter(
        (b) =>
          new Date(b.paidDate || b.date).getMonth() === new Date().getMonth(),
      )
      .reduce((sum, b) => sum + Math.abs(b.amount), 0);

    return {
      upcoming: dueSoonTotal, // Changed to only include bills due within 7 days
      dueSoonCount: dueSoonBills.length,
      overdue: overdueTotal,
      paidThisMonth,
      totalBills: bills.length,
    };
  }, [categorizedBills, bills]);

  const displayBills = useMemo(() => {
    let billsToShow = categorizedBills[viewMode] || [];

    if (
      filterOptions.billTypes.length > 0 &&
      !filterOptions.billTypes.includes("all")
    ) {
      billsToShow = billsToShow.filter((bill) =>
        filterOptions.billTypes.includes(
          bill.metadata?.type || bill.category?.toLowerCase(),
        ),
      );
    }

    if (filterOptions.providers.length > 0) {
      billsToShow = billsToShow.filter((bill) =>
        filterOptions.providers.includes(bill.provider),
      );
    }

    if (filterOptions.envelopes.length > 0) {
      billsToShow = billsToShow.filter((bill) =>
        filterOptions.envelopes.includes(bill.envelopeId),
      );
    }

    switch (filterOptions.sortBy) {
      case "due_date":
        billsToShow.sort(
          (a, b) =>
            new Date(a.dueDate || a.date) - new Date(b.dueDate || b.date),
        );
        break;
      case "amount_desc":
        billsToShow.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case "amount_asc":
        billsToShow.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
      case "provider":
        billsToShow.sort((a, b) =>
          (a.provider || "").localeCompare(b.provider || ""),
        );
        break;
      case "urgency": {
        const urgencyOrder = { overdue: 0, urgent: 1, soon: 2, normal: 3 };
        billsToShow.sort(
          (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency],
        );
        break;
      }
    }

    return billsToShow;
  }, [categorizedBills, viewMode, filterOptions]);

  const getUrgencyStyle = (urgency, isPaid = false) => {
    if (isPaid) return "border-green-200 bg-green-50";

    switch (urgency) {
      case "overdue":
        return "border-red-500 bg-red-50";
      case "urgent":
        return "border-orange-500 bg-orange-50";
      case "soon":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-gray-200 bg-white/60";
    }
  };

  const getUrgencyIcon = (urgency, isPaid = false) => {
    if (isPaid) return <CheckCircle className="h-4 w-4 text-green-600" />;

    switch (urgency) {
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "urgent":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "soon":
        return <Bell className="h-4 w-4 text-yellow-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (bill) => {
    // First priority: Check if bill has a stored iconName
    if (bill.iconName && typeof bill.iconName === "string") {
      const IconComponent = getIconByName(bill.iconName);
      return <IconComponent className="h-6 w-6" />;
    }

    // Second priority: Check if bill has a stored icon component (legacy)
    if (bill.icon && typeof bill.icon === "function") {
      const IconComponent = bill.icon;
      return <IconComponent className="h-6 w-6" />;
    }

    // Third priority: Check metadata for legacy icon reference
    if (bill.metadata?.categoryIcon) {
      // If it's a string emoji, return it
      if (typeof bill.metadata.categoryIcon === "string") {
        return bill.metadata.categoryIcon;
      }
      // If it's a component, render it
      if (typeof bill.metadata.categoryIcon === "function") {
        const IconComponent = bill.metadata.categoryIcon;
        return <IconComponent className="h-6 w-6" />;
      }
    }

    // Fourth priority: Use smart icon detection from billIcons utility
    const IconComponent = getBillIcon(
      bill.provider || "",
      bill.description || "",
      bill.category || "",
    );

    // Ensure we have a valid React component
    if (typeof IconComponent === "function") {
      return <IconComponent className="h-6 w-6" />;
    }

    // Fallback to a default icon if getBillIcon returns something unexpected
    return <FileText className="h-6 w-6" />;
  };

  const handlePayBill = (billId) => {
    try {
      const bill = bills.find((b) => b.id === billId);
      if (!bill) {
        onError?.("Bill not found");
        return;
      }

      if (bill.isPaid) {
        onError?.("Bill is already paid");
        return;
      }

      // Check if there are sufficient funds
      if (bill.envelopeId) {
        const envelope = envelopes.find((env) => env.id === bill.envelopeId);
        if (!envelope) {
          onError?.("Assigned envelope not found");
          return;
        }

        // Allow envelopes to have more money than their budget
        // Only check if the envelope has any balance at all (currentBalance can exceed budget)
        const availableBalance = envelope.currentBalance || 0;
        const billAmount = Math.abs(bill.amount);

        if (availableBalance < billAmount) {
          onError?.(
            `Insufficient funds in envelope "${envelope.name}". Available: $${availableBalance.toFixed(2)}, Required: $${billAmount.toFixed(2)}`,
          );
          return;
        }
      } else {
        const unassignedCash = budget.unassignedCash || 0;
        const billAmount = Math.abs(bill.amount);

        if (unassignedCash < billAmount) {
          onError?.(
            `Insufficient unassigned cash. Available: $${unassignedCash.toFixed(2)}, Required: $${billAmount.toFixed(2)}`,
          );
          return;
        }
      }

      const updatedBill = {
        ...bill,
        isPaid: true,
        paidDate: new Date().toISOString().split("T")[0],
      };

      handlePayBillAction?.(updatedBill);

      // Create transaction record and update balances
      const paymentTxn = {
        id: `${bill.id}_payment_${Date.now()}`,
        date: updatedBill.paidDate,
        description: bill.provider || bill.description || "Bill Payment",
        amount: -Math.abs(bill.amount),
        envelopeId: bill.envelopeId || "unassigned",
        category: bill.category,
        type: "transaction",
        source: "bill_payment",
      };

      if (bill.envelopeId) {
        const billAmount = Math.abs(bill.amount);
        const updatedEnvelopes = envelopes.map((env) => {
          if (env.id === bill.envelopeId) {
            const currentBalance = env.currentBalance || 0;
            const newBalance = currentBalance - billAmount; // Allow negative balances if needed

            return {
              ...env,
              currentBalance: newBalance,
              // Track last transaction for debugging
              lastTransaction: {
                type: "bill_payment",
                amount: -billAmount,
                date: paymentTxn.date,
                billId: bill.id,
              },
            };
          }
          return env;
        });

        reconcileTransaction({
          transaction: paymentTxn,
          updatedEnvelopes,
        });
      } else {
        const billAmount = Math.abs(bill.amount);
        const currentUnassigned = budget.unassignedCash || 0;
        const newUnassigned = currentUnassigned - billAmount; // Allow negative unassigned cash if needed

        reconcileTransaction({
          transaction: paymentTxn,
          newUnassignedCash: newUnassigned,
        });
      }
    } catch (error) {
      console.error("Error paying bill:", error);
      onError?.(error.message || "Failed to pay bill");
    }
  };

  const searchNewBills = async () => {
    setIsSearching(true);
    try {
      await onSearchNewBills?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleBillSelection = (billId) => {
    setSelectedBills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  };

  const paySelectedBills = () => {
    if (selectedBills.size === 0) {
      onError?.("No bills selected");
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      selectedBills.forEach((billId) => {
        try {
          handlePayBill(billId);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Bill ${billId}: ${error.message}`);
        }
      });

      setSelectedBills(new Set());

      if (errorCount > 0) {
        onError?.(
          `${successCount} bills paid successfully, ${errorCount} failed:\n${errors.join("\n")}`,
        );
      } else {
        console.log(`Successfully paid ${successCount} bills`);
      }
    } catch (error) {
      console.error("Error paying selected bills:", error);
      onError?.(error.message || "Failed to pay selected bills");
    }
  };

  const viewModes = [
    {
      id: "upcoming",
      label: "Upcoming",
      count: categorizedBills.upcoming.length,
      color: "blue",
    },
    {
      id: "overdue",
      label: "Overdue",
      count: categorizedBills.overdue.length,
      color: "red",
    },
    {
      id: "paid",
      label: "Paid",
      count: categorizedBills.paid.length,
      color: "green",
    },
    { id: "all", label: "All Bills", count: bills.length, color: "gray" },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-blue-500 p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            Bill Tracker
          </h2>
          <p className="text-gray-600 mt-1">
            Manage bills, due dates, and payments
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={searchNewBills}
            disabled={isSearching}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          >
            {isSearching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" /> Find New Bills
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddBillModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Overdue</p>
              <p className="text-2xl font-bold">${totals.overdue.toFixed(2)}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
          <p className="text-xs text-red-100 mt-2">
            {categorizedBills.overdue.length} bills overdue
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Due Soon</p>
              <p className="text-2xl font-bold">
                ${totals.upcoming.toFixed(2)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-200" />
          </div>
          <p className="text-xs text-orange-100 mt-2">
            {totals.dueSoonCount} bills due soon
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Paid This Month</p>
              <p className="text-2xl font-bold">
                ${totals.paidThisMonth.toFixed(2)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
          <p className="text-xs text-green-100 mt-2">
            {categorizedBills.paid.length} bills paid
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Bills</p>
              <p className="text-2xl font-bold">{totals.totalBills}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
          <p className="text-xs text-blue-100 mt-2">All tracked bills</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex flex-wrap gap-2 mb-4">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                viewMode === mode.id
                  ? `bg-${mode.color}-600 text-white`
                  : `text-${mode.color}-700 hover:bg-${mode.color}-50`
              }`}
            >
              <span className="font-medium">{mode.label}</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  viewMode === mode.id ? "bg-white/20" : `bg-${mode.color}-100`
                }`}
              >
                {mode.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </h4>

          <div className="flex gap-3">
            <select
              value={filterOptions.sortBy}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  sortBy: e.target.value,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="due_date">Due Date</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="provider">Provider Name</option>
              <option value="urgency">Urgency</option>
            </select>

            {selectedBills.size > 0 && (
              <button
                onClick={paySelectedBills}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Pay{" "}
                {selectedBills.size} Selected
              </button>
            )}
          </div>
        </div>
      </div>

      {displayBills.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No bills found</p>
          <p className="text-sm mt-1">
            {viewMode === "upcoming"
              ? "All caught up! No upcoming bills."
              : viewMode === "overdue"
                ? "Great! No overdue bills."
                : viewMode === "paid"
                  ? "No paid bills in this period."
                  : "No bills match your current filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayBills.map((bill) => {
            const envelope = envelopes.find(
              (env) => env.id === bill.envelopeId,
            );
            const urgencyStyle = getUrgencyStyle(bill.urgency, bill.isPaid);

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${urgencyStyle} ${
                  selectedBills.has(bill.id) ? "ring-2 ring-blue-500" : ""
                } flex flex-col`}
              >
                {/* Header with checkbox, icon, and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBills.has(bill.id)}
                      onChange={() => toggleBillSelection(bill.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div className="text-xl">{getCategoryIcon(bill)}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    {getUrgencyIcon(bill.urgency, bill.isPaid)}
                    <button
                      onClick={() => setShowBillDetail(bill)}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingBill(bill)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      title="Edit bill"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Bill info */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight">
                      {bill.provider || bill.description}
                    </h3>
                    <p className="text-xs text-gray-600">{bill.category}</p>
                  </div>

                  {envelope && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mb-2">
                      → {envelope.name}
                    </span>
                  )}

                  <div className="space-y-1 text-xs text-gray-500">
                    {bill.dueDate && (
                      <p className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {bill.daysUntilDue !== null && !bill.isPaid && (
                      <p>
                        {bill.daysUntilDue < 0
                          ? `${Math.abs(bill.daysUntilDue)} days overdue`
                          : bill.daysUntilDue === 0
                            ? "Due today"
                            : `${bill.daysUntilDue} days remaining`}
                      </p>
                    )}
                    {bill.isPaid && bill.paidDate && (
                      <p className="text-green-600">
                        Paid: {new Date(bill.paidDate).toLocaleDateString()}
                      </p>
                    )}
                    {bill.accountNumber && <p>Account: {bill.accountNumber}</p>}
                  </div>
                </div>

                {/* Amount and actions */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        ${Math.abs(bill.amount).toFixed(2)}
                      </p>
                      {bill.metadata?.minimumPayment &&
                        bill.metadata.minimumPayment !==
                          Math.abs(bill.amount) && (
                          <p className="text-xs text-gray-500">
                            Min: ${bill.metadata.minimumPayment.toFixed(2)}
                          </p>
                        )}
                    </div>

                    {!bill.isPaid && (
                      <button
                        onClick={() => handlePayBill(bill.id)}
                        className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> Pay
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional metadata - only show if present */}
                {(bill.metadata?.statementPeriod ||
                  bill.metadata?.serviceAddress) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 space-y-1">
                      {bill.metadata.statementPeriod && (
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span className="text-right">
                            {bill.metadata.statementPeriod.start} -{" "}
                            {bill.metadata.statementPeriod.end}
                          </span>
                        </div>
                      )}
                      {bill.metadata.serviceAddress && (
                        <div>
                          <span>Address:</span>
                          <span className="block text-right text-xs truncate">
                            {bill.metadata.serviceAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showBillDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bill Details</h3>
                <button
                  onClick={() => setShowBillDetail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getCategoryIcon(showBillDetail)}
                  </div>
                  <div>
                    <p className="font-medium text-lg">
                      {showBillDetail.provider || showBillDetail.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {showBillDetail.category}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Due
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Math.abs(showBillDetail.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <p className="text-sm">
                      {showBillDetail.dueDate
                        ? new Date(showBillDetail.dueDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {showBillDetail.accountNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <p className="text-sm font-mono">
                      {showBillDetail.accountNumber}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status & Urgency
                  </label>
                  <div className="flex items-center gap-2">
                    {getUrgencyIcon(
                      showBillDetail.urgency,
                      showBillDetail.isPaid,
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        showBillDetail.isPaid
                          ? "bg-green-100 text-green-700"
                          : showBillDetail.urgency === "overdue"
                            ? "bg-red-100 text-red-700"
                            : showBillDetail.urgency === "urgent"
                              ? "bg-orange-100 text-orange-700"
                              : showBillDetail.urgency === "soon"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {showBillDetail.isPaid
                        ? "Paid"
                        : showBillDetail.urgency === "overdue"
                          ? "Overdue"
                          : showBillDetail.urgency === "urgent"
                            ? "Due Soon"
                            : showBillDetail.urgency === "soon"
                              ? "Due This Week"
                              : "Upcoming"}
                    </span>
                  </div>
                </div>

                {showBillDetail.envelopeId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Envelope
                    </label>
                    <p className="text-sm">
                      {envelopes.find(
                        (env) => env.id === showBillDetail.envelopeId,
                      )?.name || "Unknown"}
                    </p>
                  </div>
                )}

                {showBillDetail.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <p className="text-sm text-gray-600">
                      {showBillDetail.notes}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Source:</strong>{" "}
                    {showBillDetail.source === "bill_tracker"
                      ? "Email Detection"
                      : showBillDetail.source === "manual"
                        ? "Manual Entry"
                        : "Imported"}
                  </p>
                  {showBillDetail.metadata?.confidence && (
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>Detection Confidence:</strong>{" "}
                      {Math.round(showBillDetail.metadata.confidence * 100)}%
                    </p>
                  )}
                </div>

                {!showBillDetail.isPaid && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        handlePayBill(showBillDetail.id);
                        setShowBillDetail(null);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark as Paid
                    </button>
                    <button
                      onClick={() => {
                        setEditingBill(showBillDetail);
                        setShowBillDetail(null);
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4 mr-2" /> Edit Bill
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBillModal && (
        <AddBillModal
          isOpen={showAddBillModal}
          onClose={() => setShowAddBillModal(false)}
          availableEnvelopes={envelopes}
          onAddBill={(newBill) => {
            if (onCreateRecurringBill) {
              onCreateRecurringBill(newBill);
            } else {
              // Fallback to budget context
              budget.addTransaction(newBill);
            }
            setShowAddBillModal(false);
          }}
          onAddEnvelope={(envelopeData) => {
            // Add envelope to budget context
            budget.addEnvelope(envelopeData);
          }}
        />
      )}

      {/* Edit Bill Modal */}
      {editingBill && (
        <AddBillModal
          isOpen={!!editingBill}
          onClose={() => setEditingBill(null)}
          editingBill={editingBill}
          availableEnvelopes={envelopes}
          onUpdateBill={(updatedBillData) => {
            console.log("🔄 [DIRECT] BillManager onUpdateBill called", {
              billId: updatedBillData.id,
              envelopeId: updatedBillData.envelopeId,
              hasOnUpdateBillProp: !!onUpdateBill,
            });

            if (onUpdateBill) {
              console.log("🔄 [DIRECT] Using prop onUpdateBill");
              try {
                console.log("🔄 [DIRECT] About to call onUpdateBill prop", {
                  propType: typeof onUpdateBill,
                  billData: updatedBillData
                });
                onUpdateBill(updatedBillData);
                console.log("🔄 [DIRECT] onUpdateBill prop call completed successfully");
              } catch (error) {
                console.error("❌ [DIRECT] Error calling onUpdateBill prop", error);
                throw error;
              }
            } else {
              console.log("🔄 [DIRECT] Using budget.updateBill fallback");
              // Fallback to budget context
              budget.updateBill(updatedBillData);
            }
            setEditingBill(null);
          }}
          onDeleteBill={(billId) => {
            // Use budget store's deleteBill function
            budget.deleteBill(billId);
            setEditingBill(null);
          }}
          onAddEnvelope={(envelopeData) => {
            // Add envelope to budget context
            budget.addEnvelope(envelopeData);
          }}
        />
      )}
    </div>
  );
};

export default BillManager;
