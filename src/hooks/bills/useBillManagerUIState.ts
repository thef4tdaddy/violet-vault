/**
 * useBillManagerUIState Hook
 * Extracted UI state management from useBillManager to reduce function length
 */
import { useState } from "react";

interface FilterOptions {
  search: string;
  urgency: string;
  envelope: string;
  amountMin: string;
  amountMax: string;
}

/**
 * Custom hook for managing UI state in bill manager
 */
export const useBillManagerUIState = () => {
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [viewMode, setViewMode] = useState("upcoming");
  const [isSearching, setIsSearching] = useState(false);
  const [showBillDetail, setShowBillDetail] = useState(null);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discoveredBills, setDiscoveredBills] = useState([]);
  const [historyBill, setHistoryBill] = useState(null);
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
