// Bill Analytics and Utility Functions
import { useMemo } from "react";
import type { Bill } from "@/types/bills";

/**
 * Calculate bill analytics from bill data
 */
export const useBillAnalytics = (bills: Bill[] = []) => {
  return useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalBills = bills.length;
    const paidBills = bills.filter((bill) => bill.isPaid).length;
    const unpaidBills = totalBills - paidBills;

    // Overdue bills
    const overdueBills = bills.filter((bill) => {
      if (bill.isPaid) return false;
      if (!bill.dueDate) return false;
      const dueDate = new Date(bill.dueDate);
      return dueDate < now;
    });

    // Upcoming bills (next 30 days)
    const upcomingBills = bills.filter((bill) => {
      if (bill.isPaid) return false;
      if (!bill.dueDate) return false;
      const dueDate = new Date(bill.dueDate);
      return dueDate >= now && dueDate <= thirtyDaysFromNow;
    });

    // Amount calculations
    const totalAmount = bills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
    const paidAmount = bills
      .filter((bill) => bill.isPaid)
      .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
    const unpaidAmount = bills
      .filter((bill) => !bill.isPaid)
      .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

    // Overdue amount
    const overdueAmount = overdueBills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

    // Upcoming amount (next 30 days)
    const upcomingAmount = upcomingBills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

    // Category breakdown
    interface CategoryStats {
      count: number;
      amount: number;
      paid: number;
      unpaid: number;
    }
    const categoryBreakdown = bills.reduce<Record<string, CategoryStats>>((acc, bill) => {
      const category = bill.category || "Other";
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0, paid: 0, unpaid: 0 };
      }
      acc[category].count++;
      acc[category].amount += Number(bill.amount) || 0;
      if (bill.isPaid) {
        acc[category].paid++;
      } else {
        acc[category].unpaid++;
      }
      return acc;
    }, {});

    return {
      totalBills,
      paidBills,
      unpaidBills,
      overdueBills: overdueBills.length,
      upcomingBills: upcomingBills.length,
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      upcomingAmount,
      categoryBreakdown,
      overdueBillsList: overdueBills,
      upcomingBillsList: upcomingBills,
    };
  }, [bills]);
};

/**
 * Get available categories from bills
 */
export const useAvailableCategories = (bills: Bill[] = []) => {
  return useMemo(() => {
    const categories = [...new Set(bills.map((bill) => bill.category).filter(Boolean))];
    return categories.sort();
  }, [bills]);
};

/**
 * Utility functions for bill operations
 */
export const useBillUtilities = (bills: Bill[] = []) => {
  return useMemo(() => {
    const getBillById = (billId: string) => {
      return bills.find((bill) => bill.id === billId);
    };

    const getBillsByCategory = (category: string) => {
      return bills.filter((bill) => bill.category === category);
    };

    const getBillsByStatus = (status: "paid" | "unpaid" | "overdue" | "upcoming" | "all") => {
      const now = new Date();
      switch (status) {
        case "paid":
          return bills.filter((bill) => bill.isPaid);
        case "unpaid":
          return bills.filter((bill) => !bill.isPaid);
        case "overdue":
          return bills.filter((bill) => {
            if (bill.isPaid) return false;
            if (!bill.dueDate) return false;
            const dueDate = new Date(bill.dueDate);
            return dueDate < now;
          });
        case "upcoming": {
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return bills.filter((bill) => {
            if (bill.isPaid) return false;
            if (!bill.dueDate) return false;
            const dueDate = new Date(bill.dueDate);
            return dueDate >= now && dueDate <= thirtyDaysFromNow;
          });
        }
        default:
          return bills;
      }
    };

    const getNextDueDate = (billId: string) => {
      const bill = getBillById(billId);
      if (!bill || !bill.dueDate) return null;

      const dueDate = new Date(bill.dueDate);
      const today = new Date();

      // If the due date is in the future, return it
      if (dueDate > today) return dueDate;

      // If the bill has frequency info, calculate next occurrence
      if (bill.frequency) {
        const nextDate = new Date(dueDate);
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        switch (bill.frequency) {
          case "weekly":
            while (nextDate <= today) {
              nextDate.setDate(nextDate.getDate() + 7);
            }
            break;
          case "biweekly":
            while (nextDate <= today) {
              nextDate.setDate(nextDate.getDate() + 14);
            }
            break;
          case "monthly":
            nextDate.setFullYear(currentYear);
            nextDate.setMonth(currentMonth);
            if (nextDate <= today) {
              nextDate.setMonth(nextDate.getMonth() + 1);
            }
            break;
          case "quarterly":
            while (nextDate <= today) {
              nextDate.setMonth(nextDate.getMonth() + 3);
            }
            break;
          case "yearly":
            nextDate.setFullYear(currentYear);
            if (nextDate <= today) {
              nextDate.setFullYear(nextDate.getFullYear() + 1);
            }
            break;
          default:
            return null;
        }

        return nextDate;
      }

      return null;
    };

    return {
      getBillById,
      getBillsByCategory,
      getBillsByStatus,
      getNextDueDate,
    };
  }, [bills]);
};
