import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { queryKeys, optimisticHelpers } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";

/**
 * Specialized hook for bill management
 * Provides bill operations with smart filtering, due date tracking, and envelope integration
 */
const useBills = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    status = "all", // 'all', 'upcoming', 'overdue', 'paid'
    daysAhead = 30,
    category,
    sortBy = "dueDate",
    sortOrder = "asc",
  } = options;

  // Removed Zustand dependencies - data now handled by TanStack Query → Dexie

  // TanStack Query function - hydrates from Dexie, Dexie syncs with Firebase
  const queryFunction = useCallback(async () => {
    logger.debug("TanStack Query: Fetching bills from Dexie");

    let bills = [];

    try {
      // Always fetch from Dexie (single source of truth for local data)
      bills = await budgetDb.bills.toArray();

      logger.debug("TanStack Query: Loaded from Dexie", {
        count: bills.length,
        firstBill: bills[0],
        billTitles: bills
          .map((b) => b.name || b.title || b.billName || "No Name")
          .slice(0, 3),
        billStructure: bills[0] ? Object.keys(bills[0]) : "No bills",
      });
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error);
      // Return empty array when Dexie fails (no fallback to Zustand)
      return [];
    }

    // Apply status filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredBills = bills;

    logger.debug("Bills filtering debug", {
      inputBillsCount: bills.length,
      status,
      today: today.toISOString(),
      firstBillData: bills[0],
    });

    if (status === "upcoming") {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      filteredBills = filteredBills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= futureDate && !bill.isPaid;
      });
    } else if (status === "overdue") {
      filteredBills = filteredBills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate < today && !bill.isPaid;
      });
    } else if (status === "paid") {
      filteredBills = filteredBills.filter((bill) => bill.isPaid);
    } else if (status === "unpaid") {
      filteredBills = filteredBills.filter((bill) => !bill.isPaid);
    }

    // Apply category filter
    if (category) {
      filteredBills = filteredBills.filter(
        (bill) => bill.category === category,
      );
    }

    // Apply sorting
    filteredBills.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle date fields
      if (sortBy === "dueDate" || sortBy === "lastPaid") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle numeric fields
      if (sortBy === "amount" || sortBy === "estimatedAmount") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      // Handle string fields
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "desc") {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });

    logger.debug("TanStack Query returning filtered bills", {
      originalBillsLength: bills.length,
      filteredBillsLength: filteredBills.length,
      status,
      billsStillExist: bills.length > 0,
      filteredStillExist: filteredBills.length > 0,
      firstOriginalBill: bills[0],
      firstFilteredBill: filteredBills[0],
      filterApplied:
        status !== "all" ? `Applied ${status} filter` : "No filter applied",
    });

    return filteredBills;
  }, [status, daysAhead, category, sortBy, sortOrder]);

  // Main bills query
  const billsQuery = useQuery({
    queryKey: queryKeys.billsList({
      status,
      daysAhead,
      category,
      sortBy,
      sortOrder,
    }),
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    placeholderData: (previousData) => previousData, // Use previous data during refetch
    initialData: undefined, // Remove initialData to prevent persister errors
    enabled: true,
  });

  // Listen for import completion to force refresh
  useEffect(() => {
    const handleImportCompleted = () => {
      logger.debug("Import detected, invalidating bills cache");
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
    };

    const handleInvalidateAll = () => {
      logger.debug("Invalidating all bill queries");
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.billsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  // Upcoming bills query (separate for dashboard widgets)
  const upcomingBillsQuery = useQuery({
    queryKey: queryKeys.upcomingBills(daysAhead),
    queryFn: async () => {
      const bills = billsQuery.data || [];
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      return bills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= futureDate && !bill.isPaid;
      });
    },
    enabled: !!billsQuery.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Add bill mutation
  const addBillMutation = useMutation({
    mutationKey: ["bills", "add"],
    mutationFn: async (billData) => {
      // Generate unique ID with better collision resistance
      const uniqueId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newBill = {
        id: uniqueId,
        isPaid: false,
        isRecurring: false,
        category: "utilities",
        createdAt: new Date().toISOString(),
        ...billData,
      };

      // Apply optimistic update
      await optimisticHelpers.addBill(newBill);

      // Use put() instead of add() to handle duplicates gracefully
      await budgetDb.bills.put(newBill);

      return newBill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to add bill:", error);
      // TODO: Implement rollback logic
    },
  });

  // Update bill mutation
  const updateBillMutation = useMutation({
    mutationKey: ["bills", "update"],
    mutationFn: async ({ id, updates }) => {
      // Apply optimistic update
      await optimisticHelpers.updateBill(id, updates);

      // Apply to Dexie directly
      await budgetDb.bills.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to update bill:", error);
      // TODO: Implement rollback logic
    },
  });

  // Delete bill mutation
  const deleteBillMutation = useMutation({
    mutationKey: ["bills", "delete"],
    mutationFn: async (billId) => {
      // Apply optimistic update
      await optimisticHelpers.removeBill(billId);

      // Apply to Dexie directly
      await budgetDb.bills.delete(billId);

      return billId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to delete bill:", error);
      // TODO: Implement rollback logic
    },
  });

  // Mark bill paid mutation
  const markBillPaidMutation = useMutation({
    mutationKey: ["bills", "markPaid"],
    mutationFn: async ({ billId, paidAmount, paidDate, envelopeId }) => {
      const bill = await budgetDb.bills.get(billId);
      if (!bill) {
        throw new Error(`Bill with ID ${billId} not found`);
      }

      const paymentDate = paidDate || new Date().toISOString().split("T")[0];

      const paidData = {
        isPaid: true,
        paidAmount: paidAmount,
        paidDate: paymentDate,
        envelopeId: envelopeId,
        lastPaid: new Date().toISOString(),
      };

      // Apply optimistic update
      await optimisticHelpers.updateBill(billId, paidData);

      // Apply to Dexie directly
      await budgetDb.bills.update(billId, {
        ...paidData,
        updatedAt: new Date().toISOString(),
      });

      // Create transaction record for the bill payment
      const paymentTransaction = {
        id: `${billId}_payment_${Date.now()}`,
        date: paymentDate,
        description:
          bill.provider || bill.description || bill.name || "Bill Payment",
        amount: -Math.abs(paidAmount), // Negative for expense
        envelopeId: envelopeId || "unassigned",
        category: bill.category || "Bills & Utilities",
        type: "expense",
        source: "bill_payment",
        billId: billId,
        notes: `Payment for ${bill.provider || bill.description || bill.name}`,
        createdAt: new Date().toISOString(),
      };

      // Add transaction to Dexie (use put to handle duplicates)
      await budgetDb.transactions.put(paymentTransaction);
      await optimisticHelpers.addTransaction(paymentTransaction);

      // If bill is linked to envelope, update envelope balance
      if (envelopeId && paidAmount) {
        const envelope = await budgetDb.envelopes.get(envelopeId);
        if (envelope) {
          const newBalance = (envelope.currentBalance || 0) - paidAmount;
          await budgetDb.envelopes.update(envelopeId, {
            currentBalance: newBalance,
            updatedAt: new Date().toISOString(),
            lastTransaction: {
              type: "bill_payment",
              amount: -paidAmount,
              date: paymentDate,
              billId: billId,
              transactionId: paymentTransaction.id,
            },
          });
          await optimisticHelpers.updateEnvelope(envelopeId, {
            currentBalance: newBalance,
          });
        }
      }

      return { billId, paidData, transaction: paymentTransaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error) => {
      logger.error("Failed to mark bill paid:", error);
      // TODO: Implement rollback logic
    },
  });

  // Computed values and analytics
  const bills = billsQuery.data || [];
  const upcomingBills = upcomingBillsQuery.data || [];

  const analytics = {
    totalBills: bills.length,
    upcomingCount: upcomingBills.length,
    overdueCount: bills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && !bill.isPaid;
    }).length,
    paidThisMonth: bills.filter((bill) => {
      if (!bill.isPaid || !bill.paidDate) return false;
      const paidDate = new Date(bill.paidDate);
      const today = new Date();
      return (
        paidDate.getMonth() === today.getMonth() &&
        paidDate.getFullYear() === today.getFullYear()
      );
    }).length,

    // Amount calculations
    upcomingAmount: upcomingBills.reduce(
      (sum, bill) => sum + (bill.amount || bill.estimatedAmount || 0),
      0,
    ),
    monthlyBudget: bills
      .filter((bill) => bill.isRecurring)
      .reduce(
        (sum, bill) => sum + (bill.amount || bill.estimatedAmount || 0),
        0,
      ),

    // Category breakdown
    categoryBreakdown: bills.reduce((acc, bill) => {
      const category = bill.category || "other";
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0, paid: 0, upcoming: 0 };
      }

      acc[category].count += 1;
      acc[category].amount += bill.amount || bill.estimatedAmount || 0;

      if (bill.isPaid) {
        acc[category].paid += 1;
      } else if (upcomingBills.some((ub) => ub.id === bill.id)) {
        acc[category].upcoming += 1;
      }

      return acc;
    }, {}),

    // Due date distribution
    dueDateDistribution: {
      thisWeek: 0,
      nextWeek: 0,
      thisMonth: 0,
      nextMonth: 0,
    },
  };

  // Calculate due date distribution
  const today = new Date();
  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(today.getDate() + 7);
  const nextWeekEnd = new Date(today);
  nextWeekEnd.setDate(today.getDate() + 14);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  upcomingBills.forEach((bill) => {
    const dueDate = new Date(bill.dueDate);

    if (dueDate <= thisWeekEnd) {
      analytics.dueDateDistribution.thisWeek++;
    } else if (dueDate <= nextWeekEnd) {
      analytics.dueDateDistribution.nextWeek++;
    } else if (dueDate <= thisMonthEnd) {
      analytics.dueDateDistribution.thisMonth++;
    } else if (dueDate <= nextMonthEnd) {
      analytics.dueDateDistribution.nextMonth++;
    }
  });

  // Utility functions
  const getBillById = (id) => bills.find((bill) => bill.id === id);

  const getBillsByCategory = (cat) =>
    bills.filter((bill) => bill.category === cat);

  const getBillsByStatus = (stat) => {
    if (stat === "paid") return bills.filter((bill) => bill.isPaid);
    if (stat === "unpaid") return bills.filter((bill) => !bill.isPaid);
    if (stat === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return bills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate < today && !bill.isPaid;
      });
    }
    return bills;
  };

  const getAvailableCategories = () => {
    const categories = new Set(bills.map((bill) => bill.category));
    return Array.from(categories).filter(Boolean).sort();
  };

  // Bill scheduling helpers
  const getNextDueDate = (bill) => {
    if (!bill.isRecurring || !bill.frequency) return null;

    const lastDate = new Date(bill.dueDate);
    const today = new Date();

    // Calculate next occurrence based on frequency
    switch (bill.frequency) {
      case "weekly":
        lastDate.setDate(lastDate.getDate() + 7);
        break;
      case "biweekly":
        lastDate.setDate(lastDate.getDate() + 14);
        break;
      case "monthly":
        lastDate.setMonth(lastDate.getMonth() + 1);
        break;
      case "quarterly":
        lastDate.setMonth(lastDate.getMonth() + 3);
        break;
      case "yearly":
        lastDate.setFullYear(lastDate.getFullYear() + 1);
        break;
      default:
        return null;
    }

    return lastDate > today ? lastDate : null;
  };

  return {
    // Data
    bills,
    upcomingBills,
    ...analytics,
    availableCategories: getAvailableCategories(),

    // Loading states
    isLoading: billsQuery.isLoading,
    isFetching: billsQuery.isFetching,
    isError: billsQuery.isError,
    error: billsQuery.error,

    // Upcoming bills specific states
    upcomingLoading: upcomingBillsQuery.isLoading,
    upcomingError: upcomingBillsQuery.error,

    // Mutation functions
    addBill: addBillMutation.mutate,
    addBillAsync: addBillMutation.mutateAsync,
    updateBill: updateBillMutation.mutate,
    updateBillAsync: updateBillMutation.mutateAsync,
    deleteBill: deleteBillMutation.mutate,
    deleteBillAsync: deleteBillMutation.mutateAsync,
    markBillPaid: markBillPaidMutation.mutate,
    markBillPaidAsync: markBillPaidMutation.mutateAsync,

    // Mutation states
    isAdding: addBillMutation.isPending,
    isUpdating: updateBillMutation.isPending,
    isDeleting: deleteBillMutation.isPending,
    isMarkingPaid: markBillPaidMutation.isPending,

    // Utility functions
    getBillById,
    getBillsByCategory,
    getBillsByStatus,
    getNextDueDate,

    // Query controls
    refetch: billsQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.bills }),
  };
};

export default useBills;
