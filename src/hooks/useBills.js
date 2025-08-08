import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBudgetStore } from "../stores/budgetStore";
import { queryKeys, optimisticHelpers } from "../utils/queryClient";
import { budgetDb } from "../db/budgetDb";

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

  // Get Zustand store for mutations
  const {
    bills: zustandBills,
    addBill: zustandAddBill,
    updateBill: zustandUpdateBill,
    deleteBill: zustandDeleteBill,
    markBillPaid: zustandMarkBillPaid,
  } = useBudgetStore();

  // Smart query function with filtering and due date logic
  const queryFunction = async () => {
    let bills = [];

    // Try Zustand first for real-time data
    if (zustandBills && zustandBills.length > 0) {
      bills = [...zustandBills];
    } else {
      // Fallback to Dexie for offline support
      bills = await budgetDb.bills.toArray();
    }

    // Apply status filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredBills = bills;

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

    return filteredBills;
  };

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
    enabled: true,
  });

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
      const newBill = {
        id: Date.now().toString(),
        isPaid: false,
        isRecurring: false,
        category: "utilities",
        createdAt: new Date().toISOString(),
        ...billData,
      };

      // Call Zustand mutation
      zustandAddBill(newBill);

      // Persist to Dexie
      try {
        await budgetDb.bills.add(newBill);
      } catch (error) {
        console.warn("Failed to persist bill to Dexie:", error);
      }

      return newBill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error, variables, context) => {
      console.error("Failed to add bill:", error);
      // TODO: Implement rollback logic
    },
  });

  // Update bill mutation
  const updateBillMutation = useMutation({
    mutationKey: ["bills", "update"],
    mutationFn: async ({ id, updates }) => {
      // Call Zustand mutation
      zustandUpdateBill(id, updates);

      // Update in Dexie
      try {
        await budgetDb.bills.update(id, {
          ...updates,
          lastModified: Date.now(),
        });
      } catch (error) {
        console.warn("Failed to update bill in Dexie:", error);
      }

      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error, variables, context) => {
      console.error("Failed to update bill:", error);
      // TODO: Implement rollback logic
    },
  });

  // Delete bill mutation
  const deleteBillMutation = useMutation({
    mutationKey: ["bills", "delete"],
    mutationFn: async (billId) => {
      // Call Zustand mutation
      zustandDeleteBill(billId);

      // Remove from Dexie
      try {
        await budgetDb.bills.delete(billId);
      } catch (error) {
        console.warn("Failed to delete bill from Dexie:", error);
      }

      return billId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error, variables, context) => {
      console.error("Failed to delete bill:", error);
      // TODO: Implement rollback logic
    },
  });

  // Mark bill paid mutation
  const markBillPaidMutation = useMutation({
    mutationKey: ["bills", "markPaid"],
    mutationFn: async ({ billId, paidAmount, paidDate, envelopeId }) => {
      const paidData = {
        isPaid: true,
        paidAmount: paidAmount,
        paidDate: paidDate || new Date().toISOString().split("T")[0],
        envelopeId: envelopeId,
        lastPaid: new Date().toISOString(),
      };

      // Call Zustand mutation
      zustandMarkBillPaid(billId, paidData);

      // Update in Dexie
      try {
        await budgetDb.bills.update(billId, {
          ...paidData,
          lastModified: Date.now(),
        });
      } catch (error) {
        console.warn("Failed to mark bill paid in Dexie:", error);
      }

      return { billId, paidData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (error, variables, context) => {
      console.error("Failed to mark bill paid:", error);
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
