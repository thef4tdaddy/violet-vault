import { useState, useCallback } from "react";
import { generateBillSuggestions } from "@/utils/common/billDiscovery";
import logger from "@/utils/common/logger";
import type { Bill, Transaction, Envelope } from "@/db/types";

// Helper types until we fully migrate to shared types
interface BillRecord extends Bill {
  [key: string]: unknown;
}

interface TransactionRecord extends Transaction {
  [key: string]: unknown;
}

type EnvelopeRecord = Envelope & {
  [key: string]: unknown;
};

export const useBillDiscovery = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [discoveredBills, setDiscoveredBills] = useState<BillRecord[]>([]);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  const discoverBills = useCallback(
    async (
      transactions: TransactionRecord[],
      bills: BillRecord[],
      envelopes: EnvelopeRecord[],
      onSearchNewBills?: () => void | Promise<void>
    ) => {
      setIsSearching(true);
      try {
        // Normalize data for the utility
        const normalizedTransactions = transactions.map((txn) => ({
          id: String(txn.id),
          date: txn.date instanceof Date ? txn.date.toISOString().split("T")[0] : String(txn.date),
          amount: Number(txn.amount || 0),
          description: typeof txn.description === "string" ? txn.description : "",
          category: typeof txn.category === "string" ? txn.category : "uncategorized",
          envelopeId: typeof txn.envelopeId === "string" ? txn.envelopeId : "",
          type:
            txn.type === "income" || txn.type === "expense" || txn.type === "transfer"
              ? txn.type
              : txn.amount >= 0
                ? "income"
                : "expense",
        }));

        const normalizedBills = bills.map((bill) => ({
          id: String(bill.id),
          name: bill.name,
          dueDate:
            bill.dueDate instanceof Date
              ? bill.dueDate
              : bill.dueDate
                ? new Date(bill.dueDate)
                : new Date(),
          amount: Number(bill.amount || 0),
          category: bill.category || "other",
          isPaid: Boolean(bill.isPaid),
          isRecurring: Boolean(bill.isRecurring),
          envelopeId: bill.envelopeId ? String(bill.envelopeId) : undefined,
          lastModified: typeof bill.lastModified === "number" ? bill.lastModified : Date.now(),
          // Add missing properties required by Bill type
          archived: Boolean(bill.archived),
          currentBalance: Number(bill.currentBalance || 0),
          color: bill.color || "gray",
          autoAllocate: Boolean(bill.autoAllocate),
          type: "liability" as const,
          interestRate: Number(bill.interestRate || 0),
          minimumPayment: Number(bill.minimumPayment || 0),
          creditLimit: 0,
          status: "active" as const,
        }));

        const normalizedEnvelopes = envelopes.map((envelope) => ({
          id: String(envelope.id),
          name: String(envelope.name || "Envelope"),
          category: envelope.category || "uncategorized",
          archived: Boolean(envelope.archived),
          lastModified:
            typeof envelope.lastModified === "number" ? envelope.lastModified : Date.now(),
          currentBalance: Number(envelope.currentBalance || 0),
          color: (envelope as unknown as Record<string, string>).color || "blue",
          autoAllocate: Boolean((envelope as unknown as Record<string, boolean>).autoAllocate),
          type: ((envelope as unknown as Record<string, string>).type ||
            "goal") as Envelope["type"],
        })) as unknown as Envelope[];

        const suggestions = generateBillSuggestions(
          normalizedTransactions,
          normalizedBills,
          normalizedEnvelopes
        );

        if (onSearchNewBills) {
          await onSearchNewBills();
        }

        const formattedSuggestions = suggestions.map((suggestion) => ({
          ...suggestion,
          id: suggestion.id,
          name: suggestion.provider || suggestion.description || "Suggested Bill",
          amount: suggestion.amount,
          category: suggestion.category,
          dueDate: suggestion.dueDate,
          // Add required Bill fields with defaults
          isPaid: false,
          isRecurring: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
          metadata: {
            suggestion,
          },
        })) as unknown as BillRecord[];

        setDiscoveredBills(formattedSuggestions);
        setShowDiscoveryModal(true);

        return formattedSuggestions;
      } catch (error) {
        logger.error("Error discovering bills:", error);
        throw error;
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const addDiscoveredBills = useCallback(
    async (
      billsToAdd: BillRecord[],
      addBillFn: (bill: BillRecord) => Promise<void>,
      onCreateRecurringBill?: (bill: BillRecord) => void | Promise<void>
    ) => {
      try {
        for (const bill of billsToAdd) {
          if (onCreateRecurringBill) {
            await onCreateRecurringBill(bill);
          } else {
            await addBillFn(bill);
          }
        }
        setShowDiscoveryModal(false);
        setDiscoveredBills([]);
      } catch (error) {
        logger.error("Error adding discovered bills:", error);
        throw error;
      }
    },
    []
  );

  return {
    isSearching,
    discoveredBills,
    setDiscoveredBills,
    showDiscoveryModal,
    setShowDiscoveryModal,
    discoverBills,
    addDiscoveredBills,
  };
};
