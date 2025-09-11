import { useMemo } from "react";
import { logger } from "../../utils/common/logger";

/**
 * Activity Snapshot Hook - Provides recent activity data for dashboard
 *
 * Aggregates recent transactions, upcoming bills, and recent paychecks
 * for display in the activity snapshot dashboard section.
 */
export const useActivitySnapshot = () => {
  // TODO: Replace with actual data from stores/APIs
  // This is mock data for initial implementation
  const mockData = {
    transactions: [
      {
        id: "txn-1",
        description: "Grocery Store",
        amount: -125.5,
        date: "Today",
      },
      {
        id: "txn-2",
        description: "Gas Station",
        amount: -45.0,
        date: "Yesterday",
      },
      {
        id: "txn-3",
        description: "Salary Deposit",
        amount: 2500.0,
        date: "2 days ago",
      },
      {
        id: "txn-4",
        description: "Coffee Shop",
        amount: -8.5,
        date: "3 days ago",
      },
      {
        id: "txn-5",
        description: "Online Purchase",
        amount: -75.25,
        date: "4 days ago",
      },
    ],
    bills: [
      {
        id: "bill-1",
        name: "Electric Bill",
        amount: 120.0,
        dueDate: "Sep 15",
      },
      {
        id: "bill-2",
        name: "Internet",
        amount: 79.99,
        dueDate: "Sep 18",
      },
      {
        id: "bill-3",
        name: "Phone Bill",
        amount: 65.0,
        dueDate: "Sep 20",
      },
    ],
    paychecks: [
      {
        id: "pay-1",
        employer: "Primary Job",
        netAmount: 2500.0,
        date: "Sep 6",
      },
      {
        id: "pay-2",
        employer: "Side Gig",
        netAmount: 350.0,
        date: "Sep 1",
      },
    ],
  };

  const activityData = useMemo(() => {
    logger.debug("Loading activity snapshot data", {
      component: "useActivitySnapshot",
      transactionCount: mockData.transactions.length,
      billCount: mockData.bills.length,
      paycheckCount: mockData.paychecks.length,
    });

    const result = {
      recentTransactions: mockData.transactions,
      upcomingBills: mockData.bills,
      recentPaychecks: mockData.paychecks,
    };

    logger.debug("Activity snapshot data loaded", {
      component: "useActivitySnapshot",
      recentTransactionsLoaded: result.recentTransactions.length,
      upcomingBillsLoaded: result.upcomingBills.length,
      recentPaychecksLoaded: result.recentPaychecks.length,
    });

    return result;
  }, [mockData]);

  return activityData;
};
