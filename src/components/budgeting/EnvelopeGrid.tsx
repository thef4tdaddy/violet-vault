// src/components/budgeting/EnvelopeGrid.tsx - Refactored with separated logic
import { useState, useMemo, lazy, Suspense, Dispatch, SetStateAction } from "react";
import useUiStoreRaw from "@/stores/ui/uiStore";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useTransactions } from "@/hooks/common/useTransactions";
import useBills from "../../hooks/budgeting/transactions/scheduled/expenses/useBills";
import {
  calculateEnvelopeData,
  sortEnvelopes,
  filterEnvelopes,
  calculateEnvelopeTotals,
} from "@/utils/budgeting";
import type {
  Envelope as BudgetEnvelope,
  EnvelopeData as BudgetEnvelopeData,
} from "@/utils/budgeting/envelopeCalculations";
import EnvelopeGridView from "./envelope/EnvelopeGridView";
import logger from "../../utils/common/logger";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { EnvelopeGridPropsSchema } from "@/domain/schemas/component-props";

type Envelope = BudgetEnvelope;
type EnvelopeData = BudgetEnvelopeData;

interface FilterOptions {
  timeRange: string;
  showEmpty: boolean;
  sortBy: string;
  envelopeType: string;
}

interface QuickFundModalState {
  isOpen: boolean;
  envelope: Envelope | null;
  suggestedAmount: number;
}

interface BudgetState {
  envelopes: Envelope[];
  transactions: unknown[];
  bills: unknown[];
  currentUser: unknown;
  updateBill: (bill: unknown) => void;
}

type UpdateEnvelopeFunction = (params: {
  id: string;
  updates: Partial<Envelope>;
}) => Promise<unknown>;
type AddEnvelopeFunction = (data: unknown) => Promise<void>;

// Lazy load modals for better performance
const EnvelopeCreateModal = lazy(() => import("./CreateEnvelopeModal"));
const EnvelopeEditModal = lazy(() => import("./EditEnvelopeModal"));
const EnvelopeHistoryModal = lazy(() => import("./envelope/EnvelopeHistoryModal"));
const QuickFundModal = lazy(() => import("../modals/QuickFundModal"));

// Modals container component
interface EnvelopeRef {
  id: string;
  name: string;
  [key: string]: unknown;
}

const EnvelopeModals = ({
  showCreateModal,
  setShowCreateModal,
  handleCreateEnvelope,
  envelopes,
  budget,
  unassignedCash,
  editingEnvelope,
  setEditingEnvelope,
  handleUpdateEnvelope,
  deleteEnvelope,
  updateBill: _updateBill,
  bills: _bills,
  historyEnvelope,
  setHistoryEnvelope,
  quickFundModal,
  closeQuickFundModal,
  handleQuickFundConfirm,
}: {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  handleCreateEnvelope: (data: unknown) => Promise<void>;
  envelopes: Envelope[];
  budget: { currentUser: unknown; updateBill: (bill: unknown) => void };
  unassignedCash: number;
  editingEnvelope: EnvelopeRef | null;
  setEditingEnvelope: (env: EnvelopeRef | null) => void;
  handleUpdateEnvelope: (data: unknown) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  updateBill: (data: { id: string; updates: unknown }) => Promise<void>;
  bills: unknown[];
  historyEnvelope: EnvelopeRef | null;
  setHistoryEnvelope: (env: EnvelopeRef | null) => void;
  quickFundModal: QuickFundModalState;
  closeQuickFundModal: () => void;
  handleQuickFundConfirm: (id: string, amount: number) => Promise<void>;
}) => (
  <Suspense fallback={<div>Loading...</div>}>
    {showCreateModal && (
      <EnvelopeCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEnvelope={handleCreateEnvelope}
        onCreateBill={() => {}}
        existingEnvelopes={envelopes}
        currentUser={
          (budget.currentUser as { userName: string; userColor: string } | undefined) || {
            userName: "User",
            userColor: "#000000",
          }
        }
      />
    )}

    {editingEnvelope && (
      <EnvelopeEditModal
        isOpen={!!editingEnvelope}
        onClose={() => setEditingEnvelope(null)}
        envelope={editingEnvelope as EnvelopeRef}
        onUpdateEnvelope={handleUpdateEnvelope}
        onDeleteEnvelope={deleteEnvelope}
        existingEnvelopes={envelopes}
        currentUser={
          (budget.currentUser as { userName: string; userColor: string } | undefined) || {
            userName: "User",
            userColor: "#000000",
          }
        }
      />
    )}

    {historyEnvelope && (
      <EnvelopeHistoryModal
        isOpen={!!historyEnvelope}
        onClose={() => setHistoryEnvelope(null)}
        envelope={historyEnvelope as EnvelopeRef}
      />
    )}

    {quickFundModal.isOpen && (
      <QuickFundModal
        isOpen={quickFundModal.isOpen}
        onClose={closeQuickFundModal}
        onConfirm={(amount: number) => {
          if (quickFundModal.envelope?.id) {
            handleQuickFundConfirm(quickFundModal.envelope.id, amount).catch((err) => {
              logger.error("Failed to quick fund envelope:", err);
            });
          }
        }}
        envelope={quickFundModal.envelope as { id: string; name: string; [key: string]: unknown }}
        suggestedAmount={quickFundModal.suggestedAmount}
        unassignedCash={unassignedCash}
      />
    )}
  </Suspense>
);

// Hook for envelope UI state and handlers
const useEnvelopeUIState = (
  envelopeData: EnvelopeData[],
  updateEnvelope: UpdateEnvelopeFunction,
  addEnvelope: AddEnvelopeFunction
) => {
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("overview");
  const [historyEnvelope, setHistoryEnvelope] = useState<EnvelopeRef | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<EnvelopeRef | null>(null);
  const [quickFundModal, setQuickFundModal] = useState<QuickFundModalState>({
    isOpen: false,
    envelope: null,
    suggestedAmount: 0,
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    timeRange: "current_month",
    showEmpty: true,
    sortBy: "usage_desc",
    envelopeType: "all",
  });

  const handleEnvelopeSelect = (envelopeId: string) => {
    setSelectedEnvelopeId(envelopeId === selectedEnvelopeId ? null : envelopeId);
  };

  const handleQuickFund = (envelopeId: string, suggestedAmount: number) => {
    const envelope = envelopeData.find((env: EnvelopeData) => env.id === envelopeId);
    if (envelope) {
      setQuickFundModal({ isOpen: true, envelope, suggestedAmount });
    }
  };

  const handleQuickFundConfirm = async (envelopeId: string, amount: number) => {
    try {
      const currentAllocated =
        envelopeData.find((env: EnvelopeData) => env.id === envelopeId)?.allocated || 0;
      await updateEnvelope({
        id: envelopeId,
        updates: { allocated: currentAllocated + amount },
      });
      logger.info(`Quick funded $${amount} to envelope ${envelopeId}`);
    } catch (error) {
      logger.error("Failed to quick fund envelope:", error);
    }
  };

  const closeQuickFundModal = () => {
    setQuickFundModal({ isOpen: false, envelope: null, suggestedAmount: 0 });
  };

  const handleEnvelopeEdit = (envelope: EnvelopeRef) => setEditingEnvelope(envelope);
  const handleViewHistory = (envelope: EnvelopeRef) => setHistoryEnvelope(envelope);

  const handleCreateEnvelope = async (envelopeData: unknown) => {
    try {
      await addEnvelope(envelopeData);
      setShowCreateModal(false);
    } catch (error) {
      logger.error("Failed to create envelope:", error);
    }
  };

  const handleUpdateEnvelope = async (envelopeData: { id: string; [key: string]: unknown }) => {
    try {
      await updateEnvelope({ id: envelopeData.id, updates: envelopeData });
      setEditingEnvelope(null);
    } catch (error) {
      logger.error("Failed to update envelope:", error);
    }
  };

  return {
    selectedEnvelopeId,
    viewMode,
    setViewMode,
    historyEnvelope,
    setHistoryEnvelope,
    showCreateModal,
    setShowCreateModal,
    editingEnvelope,
    setEditingEnvelope,
    quickFundModal,
    filterOptions,
    setFilterOptions,
    handleEnvelopeSelect,
    handleQuickFund,
    handleQuickFundConfirm,
    closeQuickFundModal,
    handleEnvelopeEdit,
    handleViewHistory,
    handleCreateEnvelope,
    handleUpdateEnvelope,
  };
};

// Hook to resolve data from multiple sources with priority
const useResolvedData = (
  propEnvelopes: Envelope[] = [],
  propTransactions: unknown[] = [],
  propUnassignedCash?: number
) => {
  const {
    envelopes: tanStackEnvelopes = [],
    addEnvelope,
    updateEnvelopeAsync,
    deleteEnvelope,
    isLoading: envelopesLoading,
  } = useEnvelopes();

  const { transactions: tanStackTransactions = [], isLoading: transactionsLoading } =
    useTransactions();
  const { bills: tanStackBills = [], updateBill, isLoading: billsLoading } = useBills();
  const { unassignedCash: tanStackUnassignedCash } = useUnassignedCash();
  // Selective subscriptions - only subscribe to specific properties needed
  // Type the selector functions explicitly to avoid implicit any errors
  const selectorEnvelopes = (state: Record<string, unknown>): Envelope[] => {
    const budgetState = state as unknown as BudgetState;
    return budgetState.envelopes;
  };
  const selectorTransactions = (state: Record<string, unknown>): unknown[] => {
    const budgetState = state as unknown as BudgetState;
    return budgetState.transactions;
  };
  const selectorBills = (state: Record<string, unknown>): unknown[] => {
    const budgetState = state as unknown as BudgetState;
    return budgetState.bills;
  };
  const selectorCurrentUser = (state: Record<string, unknown>): unknown => {
    const budgetState = state as unknown as BudgetState;
    return budgetState.currentUser;
  };
  const selectorUpdateBill = (state: Record<string, unknown>): ((bill: unknown) => void) => {
    const budgetState = state as unknown as BudgetState;
    return budgetState.updateBill;
  };
  // Use type assertions to work around store typing limitations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Store type is complex and not properly exported
  const useUiStore = useUiStoreRaw as any as <T>(
    selector: (state: Record<string, unknown>) => T
  ) => T;
  const budgetEnvelopes = useUiStore(selectorEnvelopes);
  const budgetTransactions = useUiStore(selectorTransactions);
  const budgetBills = useUiStore(selectorBills);
  const budgetCurrentUser = useUiStore(selectorCurrentUser);
  const budgetUpdateBill = useUiStore(selectorUpdateBill);

  const envelopes = useMemo(
    () =>
      propEnvelopes?.length
        ? propEnvelopes
        : tanStackEnvelopes.length
          ? tanStackEnvelopes
          : budgetEnvelopes || [],
    [propEnvelopes, tanStackEnvelopes, budgetEnvelopes]
  );

  const transactions = useMemo(
    () =>
      propTransactions?.length
        ? propTransactions
        : tanStackTransactions.length
          ? tanStackTransactions
          : budgetTransactions || [],
    [propTransactions, tanStackTransactions, budgetTransactions]
  );

  const unassignedCash =
    propUnassignedCash !== undefined ? propUnassignedCash : tanStackUnassignedCash || 0;

  const bills = useMemo(() => {
    const result = tanStackBills.length ? tanStackBills : budgetBills || [];
    logger.debug("🔍 EnvelopeGrid bills debug:", {
      tanStackBills,
      tanStackBillsLength: tanStackBills.length,
      budgetBills: budgetBills,
      budgetBillsLength: budgetBills?.length,
      finalResult: result,
      finalLength: result.length,
    });
    return result;
  }, [tanStackBills, budgetBills]);

  const isLoading = envelopesLoading || transactionsLoading || billsLoading;

  return {
    envelopes,
    transactions,
    bills,
    unassignedCash,
    budget: {
      currentUser: budgetCurrentUser,
      updateBill: budgetUpdateBill,
    },
    isLoading,
    addEnvelope,
    updateEnvelope: (params: { id: string; updates: Partial<Envelope> }) =>
      updateEnvelopeAsync(params.id, params.updates),
    deleteEnvelope: (id: string) => deleteEnvelope({ envelopeId: id }),
    updateBill,
  };
};

const UnifiedEnvelopeManager = ({
  envelopes: propEnvelopes = [],
  transactions: propTransactions = [],
  unassignedCash: propUnassignedCash,
  className = "",
}: {
  envelopes?: Envelope[];
  transactions?: unknown[];
  unassignedCash?: number;
  className?: string;
}) => {
  // Validate props in development
  validateComponentProps(
    "EnvelopeGrid",
    {
      envelopes: propEnvelopes,
      transactions: propTransactions,
      unassignedCash: propUnassignedCash,
      className,
    },
    EnvelopeGridPropsSchema
  );

  const {
    envelopes,
    transactions,
    bills,
    unassignedCash,
    budget,
    isLoading,
    addEnvelope,
    updateEnvelope,
    deleteEnvelope,
    updateBill,
  } = useResolvedData(propEnvelopes, propTransactions, propUnassignedCash);

  // Calculate envelope data
  const envelopeData = useMemo(
    () =>
      calculateEnvelopeData(
        envelopes,
        transactions as Parameters<typeof calculateEnvelopeData>[1],
        bills as Parameters<typeof calculateEnvelopeData>[2]
      ),
    [envelopes, transactions, bills]
  );

  // UI state and handlers
  const uiState = useEnvelopeUIState(
    envelopeData,
    updateEnvelope as unknown as UpdateEnvelopeFunction,
    addEnvelope as unknown as AddEnvelopeFunction
  );

  // Computed envelope data
  const sortedEnvelopes = useMemo(() => {
    const filtered = filterEnvelopes(envelopeData, uiState.filterOptions);
    return sortEnvelopes(filtered, uiState.filterOptions.sortBy);
  }, [envelopeData, uiState.filterOptions]);

  const totals = useMemo(() => calculateEnvelopeTotals(envelopeData), [envelopeData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <EnvelopeGridView
      className={className}
      totals={totals}
      unassignedCash={unassignedCash}
      filterOptions={uiState.filterOptions}
      setFilterOptions={(opts: unknown) => {
        uiState.setFilterOptions(opts as FilterOptions);
      }}
      setShowCreateModal={uiState.setShowCreateModal}
      viewMode={uiState.viewMode}
      setViewMode={uiState.setViewMode}
      handleViewHistory={(env: unknown) => {
        uiState.handleViewHistory(env as EnvelopeRef);
      }}
      sortedEnvelopes={sortedEnvelopes as unknown as Array<{ id: string; [key: string]: unknown }>}
      handleEnvelopeSelect={uiState.handleEnvelopeSelect}
      handleEnvelopeEdit={(env: unknown) => {
        uiState.handleEnvelopeEdit(env as EnvelopeRef);
      }}
      handleQuickFund={uiState.handleQuickFund}
      selectedEnvelopeId={uiState.selectedEnvelopeId}
      bills={bills}
    >
      <EnvelopeModals
        showCreateModal={uiState.showCreateModal}
        setShowCreateModal={uiState.setShowCreateModal}
        handleCreateEnvelope={uiState.handleCreateEnvelope}
        envelopes={envelopes}
        budget={budget}
        unassignedCash={unassignedCash}
        editingEnvelope={uiState.editingEnvelope}
        setEditingEnvelope={
          uiState.setEditingEnvelope as Dispatch<SetStateAction<EnvelopeRef | null>>
        }
        handleUpdateEnvelope={(data: unknown) => {
          const envelopeData = data as { id: string; [key: string]: unknown };
          return uiState.handleUpdateEnvelope(envelopeData);
        }}
        deleteEnvelope={(id: string) => Promise.resolve(deleteEnvelope(id))}
        updateBill={async (data: { id: string; updates: unknown }) => {
          updateBill(data.updates as never);
        }}
        bills={bills}
        historyEnvelope={uiState.historyEnvelope}
        setHistoryEnvelope={
          uiState.setHistoryEnvelope as Dispatch<SetStateAction<EnvelopeRef | null>>
        }
        quickFundModal={uiState.quickFundModal}
        closeQuickFundModal={uiState.closeQuickFundModal}
        handleQuickFundConfirm={uiState.handleQuickFundConfirm}
      />
    </EnvelopeGridView>
  );
};

export default UnifiedEnvelopeManager;
