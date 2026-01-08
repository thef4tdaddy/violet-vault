import { useMemo } from "react";
import { processRecurringBill } from "@/utils/bills/recurringBillUtils";
import {
  categorizeBills,
  calculateBillTotals,
  filterBills,
  processBillCalculations,
} from "@/utils/bills/billCalculations";
import type { Bill as DbBill, Transaction } from "@/db/types";
import type { Bill as UiBill } from "@/types/bills";

// Helper types matching the ones in useBillManagerHelpers
export interface BillRecord extends DbBill {
  [key: string]: unknown;
}

export interface TransactionRecord extends Transaction {
  [key: string]: unknown;
}

import type { Envelope as DbEnvelope } from "@/db/types";

export interface EnvelopeRecord extends DbEnvelope {
  [key: string]: unknown;
}

export interface FilterOptions {
  search?: string;
  urgency?: string;
  envelope?: string;
  amountMin?: string;
  amountMax?: string;
  [key: string]: unknown;
}

export const useBillCalculations = () => {
  // Helper to resolve data from multiple sources (Props > TanStack > Budget Store)
  const resolveData = useMemo(() => {
    return (propData: unknown[], tanStackData: unknown[], storeData: unknown[]) => {
      if (propData && propData.length) return propData;
      if (tanStackData && tanStackData.length) return tanStackData;
      return storeData || [];
    };
  }, []);

  const processAllBills = useMemo(() => {
    return (
      transactions: TransactionRecord[],
      allBills: BillRecord[],
      onUpdateBill?: (bill: UiBill) => void,
      updateBillMutation?: (updates: {
        billId: string;
        updates: Record<string, unknown>;
      }) => Promise<void>
    ) => {
      // 1. Extract bills from transactions
      const transactionBills = transactions.filter(
        (t) =>
          t.isBill ||
          (t as unknown as Record<string, unknown>).type === "bill" ||
          t.category === "bill"
      ) as unknown as BillRecord[];

      // 2. Combine and deduplicate
      const combinedBills: BillRecord[] = [];
      const seenIds = new Set<string>();

      [...allBills, ...transactionBills].forEach((bill) => {
        if (!seenIds.has(bill.id)) {
          seenIds.add(bill.id);
          combinedBills.push(bill);
        }
      });

      // 3. Process recurring logic and calculations
      return combinedBills.map((bill, index) => {
        // Handle recurring logic
        const processedBill = processRecurringBill(bill as unknown as UiBill, (updatedBill) => {
          if (onUpdateBill) {
            onUpdateBill(updatedBill as unknown as UiBill);
          } else if (updateBillMutation) {
            updateBillMutation({
              billId: updatedBill.id,
              updates: {
                isPaid: false,
                dueDate: updatedBill.dueDate,
                paidDate: null,
              },
            });
          }
        });

        // Apply calculations
        const calculated = processBillCalculations(processedBill as never) as unknown as BillRecord;

        // Normalize for UI
        return {
          ...calculated,
          // Ensure essential fields exist for UI
          name:
            calculated.name ||
            (calculated as Record<string, unknown>).provider ||
            `Bill ${index + 1}`,
          category: calculated.category || "Uncategorized",
          amount: Number(calculated.amount) || 0,
          color: (calculated as Record<string, unknown>).color || "blue",
        } as unknown as UiBill;
      });
    };
  }, []);

  const getCategorizedBills = useMemo(() => {
    return (bills: UiBill[]) => {
      const categorized = categorizeBills(bills as unknown as DbBill[]);
      const totals = calculateBillTotals(categorized);
      return { categorizedBills: categorized, totals };
    };
  }, []);

  const getFilteredBills = useMemo(() => {
    return (
      categorizedBills: Record<string, UiBill[]>,
      viewMode: string,
      filterOptions: FilterOptions
    ) => {
      const billsToFilter = categorizedBills[viewMode] || categorizedBills.all || [];
      return filterBills(
        billsToFilter as unknown as DbBill[],
        filterOptions
      ) as unknown as UiBill[];
    };
  }, []);

  return {
    resolveData,
    processAllBills,
    getCategorizedBills,
    getFilteredBills,
  };
};
