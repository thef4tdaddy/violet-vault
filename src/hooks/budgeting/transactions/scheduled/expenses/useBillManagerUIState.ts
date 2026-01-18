/**
 * useBillManagerUIState Hook
 * Extracted UI state management from useBillManager to reduce function length
 */
import { useState } from "react";

import type { FilterOptions } from "./useBillCalculations";
import type { Bill } from "@/types/bills";

/**
 * Bill record type for UI state
 */
interface BillRecord {
  id: string;
  name: string;
  amount: number;
  category?: string;
  dueDate: Date | string | null;
  metadata?: Record<string, unknown>;
  isPaid?: boolean;
  isRecurring?: boolean;
  lastModified?: number;
  envelopeId?: string;
  [key: string]: unknown;
}

/**
 * Custom hook for managing UI state in bill manager
 */
export const useBillManagerUIState = () => {
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<string>("upcoming");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showBillDetail, setShowBillDetail] = useState<Bill | BillRecord | null>(null);
  const [showAddBillModal, setShowAddBillModal] = useState<boolean>(false);
  const [editingBill, setEditingBill] = useState<Bill | BillRecord | null>(null);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState<boolean>(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState<boolean>(false);
  const [discoveredBills, setDiscoveredBills] = useState<BillRecord[]>([]);
  const [historyBill, setHistoryBill] = useState<Bill | BillRecord | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    urgency: "all",
    envelope: "",
    amountMin: "",
    amountMax: "",
  });

  return {
    selectedBills,
    setSelectedBills,
    viewMode,
    setViewMode,
    isSearching,
    setIsSearching,
    showBillDetail,
    setShowBillDetail,
    showAddBillModal,
    setShowAddBillModal,
    editingBill,
    setEditingBill,
    showBulkUpdateModal,
    setShowBulkUpdateModal,
    showDiscoveryModal,
    setShowDiscoveryModal,
    discoveredBills,
    setDiscoveredBills,
    historyBill,
    setHistoryBill,
    filterOptions,
    setFilterOptions,
  };
};
