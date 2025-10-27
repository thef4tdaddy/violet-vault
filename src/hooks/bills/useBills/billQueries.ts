// Bill Query Functions - Data fetching and filtering logic
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { queryKeys } from "../../../utils/common/queryClient.ts";
import { budgetDb } from "../../../db/budgetDb.ts";
import logger from "../../../utils/common/logger.ts";

/**
 * Bill query options interface
 */
interface BillQueryOptions {
  status?: string;
  daysAhead?: number;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Bill interface
 */
interface Bill {
  id: string;
  dueDate: string;
  isPaid: boolean;
  category?: string;
  lastPaid?: string;
  amount?: number;
  estimatedAmount?: number;
  [key: string]: unknown;
}

/**
 * Core bill data fetching query function
 */
export const useBillQueryFunction = (options: BillQueryOptions = {}) => {
  const {
    status = "all",
    daysAhead = 30,
    category,
    sortBy = "dueDate",
    sortOrder = "asc",
  } = options;

  return useCallback(async () => {
    // Fetch bills from Dexie (reduced logging)

    let bills: Bill[] = [];

    try {
      // Always fetch from Dexie (single source of truth for local data)
      bills = await budgetDb.bills.toArray();

      // Only log if there are bills or issues
      if (bills.length > 0) {
        logger.debug("TanStack Query: Bills loaded", { count: bills.length });
      }
    } catch (error) {
      logger.error("TanStack Query: Dexie fetch failed", error);
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
      filteredBills = filteredBills.filter((bill) => bill.category === category);
    }

    // Apply sorting
    filteredBills.sort((a, b) => {
      let aVal: string | number | Date = a[sortBy as keyof Bill] as string | number;
      let bVal: string | number | Date = b[sortBy as keyof Bill] as string | number;

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
      filterApplied: status !== "all" ? `Applied ${status} filter` : "No filter applied",
    });

    return filteredBills;
  }, [status, daysAhead, category, sortBy, sortOrder]);
};

/**
 * Main bills query hook
 */
export const useBillsQuery = (options: BillQueryOptions = {}) => {
  const {
    status = "all",
    daysAhead = 30,
    category,
    sortBy = "dueDate",
    sortOrder = "asc",
  } = options;

  const queryFunction = useBillQueryFunction(options);

  return useQuery({
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
};

/**
 * Upcoming bills query (separate for dashboard widgets)
 */
export const useUpcomingBillsQuery = (daysAhead = 30, billsData: Bill[] = []) => {
  return useQuery({
    queryKey: queryKeys.upcomingBills(daysAhead),
    queryFn: async () => {
      const bills = billsData || [];
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      return bills.filter((bill) => {
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= futureDate && !bill.isPaid;
      });
    },
    enabled: !!billsData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Query event listeners for invalidation
 */
export const useBillQueryEvents = () => {
  const queryClient = useQueryClient();

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
};
