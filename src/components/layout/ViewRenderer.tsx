import { Suspense, useCallback, lazy, createElement, ReactNode } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
// Lazy load large components for code-splitting
const Dashboard = lazy(() => import("../pages/MainDashboard"));
const SmartEnvelopeSuggestions = lazy(() => import("../budgeting/SmartEnvelopeSuggestions"));
const EnvelopeGrid = lazy(() => import("../budgeting/EnvelopeGrid"));
const SavingsGoals = lazy(() => import("../savings/SavingsGoals"));
const SupplementalAccounts = lazy(() => import("../accounts/SupplementalAccounts"));
const PaycheckProcessor = lazy(() => import("../budgeting/PaycheckProcessor"));
const BillManager = lazy(() => import("../bills/BillManager"));
const TransactionLedger = lazy(() => import("../transactions/TransactionLedger"));
const AnalyticsDashboard = lazy(() => import("../analytics/AnalyticsDashboard"));
const DebtDashboard = lazy(() => import("../debt/DebtDashboard"));
import { isDebtFeatureEnabled } from "@/utils/debts/debtDebugConfig";
const AutoFundingView = lazy(() => import("../automation/AutoFundingView"));
const ActivityFeed = lazy(() => import("../activity/ActivityFeed"));
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { useLayoutData } from "@/hooks/platform/ux/layout/useLayoutData";
import { usePaycheckOperations } from "@/hooks/budgeting/transactions/scheduled/income/usePaycheckOperations";
import useSavingsGoals from "@/hooks/budgeting/envelopes/goals/useSavingsGoals";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { ENVELOPE_TYPES } from "@/constants/categories";
import logger from "@/utils/common/logger";
import { globalToast } from "@/stores/ui/toastStore";
import type {
  Transaction as DbTransaction,
  Envelope as DbEnvelope,
  PaycheckHistory,
} from "@/db/types";

/**
 * ViewRenderer component for handling main content switching
 * Extracted from Layout.jsx for better organization
 */
interface ViewRendererProps {
  activeView: string;
  budget?: Record<string, unknown>;
  currentUser?: Record<string, unknown>;
  setActiveView: (view: string) => void;
}

// ============================================================================
// Helper Components
// ============================================================================

type SafeTransaction = DbTransaction;
type EnvelopeWithComputed = DbEnvelope & { [key: string]: unknown };

interface EnvelopeViewProps {
  envelopes: EnvelopeWithComputed[];
  safeTransactions: SafeTransaction[];
  unassignedCash: number;
  addEnvelope: () => void;
  updateEnvelope: () => void;
  setActiveView: (view: string) => void;
}

const EnvelopeView = ({
  envelopes,
  safeTransactions,
  unassignedCash,
  addEnvelope,
  updateEnvelope,
  setActiveView,
}: EnvelopeViewProps) => (
  <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-4">
    {/* Header Row: Title/Subheaders (left) + Action Buttons (right) */}
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      {/* Left: Header + Subheaders */}
      <div className="flex-1">
        <h2 className="font-black text-black text-2xl mb-1 flex items-center">
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-purple-500 p-2 rounded-2xl">
              {createElement(getIcon("Wallet"), {
                className: "h-5 w-5 text-white",
              })}
            </div>
          </div>
          <span className="text-3xl">E</span>NVELOPE <span className="text-3xl">M</span>ANAGEMENT
        </h2>
        <p className="text-purple-900 text-sm ml-12">Organize and track your budget allocations</p>
        <p className="text-purple-800 text-xs ml-12 font-medium">
          You currently have {envelopes?.length || 0}{" "}
          {envelopes?.length === 1 ? "envelope" : "envelopes"}
        </p>
      </div>

      {/* Right: Action Buttons - Stack vertically, full width on mobile */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <Button
          onClick={() => setActiveView("automation")}
          className="btn btn-secondary border-2 border-black flex items-center whitespace-nowrap"
          title="Manage automatic envelope funding rules"
        >
          {createElement(getIcon("Settings"), {
            className: "h-4 w-4 mr-2",
          })}
          Auto-Funding
        </Button>
        <SmartEnvelopeSuggestions
          transactions={safeTransactions}
          envelopes={envelopes}
          onCreateEnvelope={addEnvelope}
          onUpdateEnvelope={updateEnvelope}
          onDismissSuggestion={() => {}}
          dateRange="6months"
        />
      </div>
    </div>

    <EnvelopeGrid unassignedCash={unassignedCash} data-tour="envelope-grid" />
  </div>
);

const DebtDisabledView = () => (
  <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Debt Dashboard Temporarily Disabled
    </h2>
    <p className="text-gray-600 mb-4">
      The debt dashboard is currently disabled for debugging the temporal dead zone error.
    </p>
    <p className="text-sm text-gray-500">
      Debug configuration can be adjusted in src/utils/debtDebugConfig.js
    </p>
  </div>
);

// ============================================================================
// Helper Functions
// ============================================================================

// Extract budget operations to reduce complexity
function extractBudgetOperations(budget: Record<string, unknown> | undefined) {
  const {
    savingsGoals = [],
    supplementalAccounts = [],
    addSavingsGoal = () => {},
    updateSavingsGoal = () => {},
    deleteSavingsGoal = () => {},
    addSupplementalAccount = () => {},
    updateSupplementalAccount = () => {},
    deleteSupplementalAccount = () => {},
    transferFromSupplementalAccount = () => {},
    addEnvelope = () => {},
    updateEnvelope = () => {},
  } = budget || {};

  return {
    savingsGoals,
    supplementalAccounts,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSupplementalAccount,
    updateSupplementalAccount,
    deleteSupplementalAccount,
    transferFromSupplementalAccount,
    addEnvelope,
    updateEnvelope,
  };
}

// Provide default user if not supplied
function getDefaultUser(currentUser: Record<string, unknown> | undefined) {
  return (currentUser || { userName: "", userColor: "" }) as Record<string, unknown> & {
    userName: string;
    userColor: string;
  };
}

// eslint-disable-next-line max-lines-per-function -- Complex view renderer managing multiple routes and component rendering logic
const ViewRenderer = ({ activeView, budget, currentUser, setActiveView }: ViewRendererProps) => {
  // Use centralized layout data hook
  const layoutData = useLayoutData();
  const {
    unassignedCash,
    bills,
    envelopes,
    transactions: safeTransactions,
    processPaycheck: tanStackProcessPaycheck,
    paycheckHistory: tanStackPaycheckHistory,
  } = layoutData;

  // Get bill operations from the bills data
  const { addBill: _tanStackAddBill } = bills;

  // Get paycheck operations
  const { handleDeletePaycheck } = usePaycheckOperations();

  // Get savings goals operations (for mutations)
  const savingsGoalsHook = useSavingsGoals();

  // Get savings envelopes (v2.0: savings goals are now envelopes)
  const savingsEnvelopesQuery = useEnvelopes({
    envelopeTypes: [ENVELOPE_TYPES.SAVINGS],
    excludeEnvelopeTypes: [], // Don't exclude anything when explicitly filtering by type
  });

  // Get supplemental account envelopes (v2.0: supplemental accounts are now envelopes)
  const supplementalEnvelopesQuery = useEnvelopes({
    envelopeTypes: [ENVELOPE_TYPES.SUPPLEMENTAL],
    excludeEnvelopeTypes: [], // Don't exclude anything when explicitly filtering by type
  });

  // Extract budget operations
  const budgetOps = extractBudgetOperations(budget);

  // Provide default user if not supplied
  const user = getDefaultUser(currentUser);

  // Stable callback for bill updates
  const handleUpdateBill = useCallback((updatedBill: Record<string, unknown>) => {
    logger.debug("ViewRenderer handleUpdateBill called", {
      billId: updatedBill.id,
      envelopeId: updatedBill.envelopeId,
    });

    try {
      logger.debug("ViewRenderer TanStack updateBill completed successfully", {
        billId: updatedBill.id,
        envelopeId: updatedBill.envelopeId,
      });
    } catch (error) {
      logger.error("Error in ViewRenderer handleUpdateBill", error, {
        billId: updatedBill.id,
        envelopeId: updatedBill.envelopeId,
      });
    }
  }, []);

  // Debug log to verify function creation - only on dev sites
  if (activeView === "bills") {
    logger.debug("ViewRenderer handleUpdateBill created for bills view", {
      functionExists: !!handleUpdateBill,
      functionType: typeof handleUpdateBill,
      activeView,
    });
  }

  const handleBillManagerError = useCallback((message?: string) => {
    if (!message) {
      return;
    }
    globalToast.showError(message, "Bill Manager");
    logger.error("Bill manager error", { message });
  }, []);

  const views: Record<string, ReactNode> = {
    dashboard: (
      <ErrorBoundary context="MainDashboard">
        <Suspense fallback={<LoadingSpinner />}>
          <Dashboard setActiveView={setActiveView} />
        </Suspense>
      </ErrorBoundary>
    ),
    envelopes: (
      <EnvelopeView
        envelopes={envelopes as EnvelopeWithComputed[]}
        safeTransactions={safeTransactions as SafeTransaction[]}
        unassignedCash={unassignedCash}
        addEnvelope={budgetOps.addEnvelope as () => void}
        updateEnvelope={budgetOps.updateEnvelope as () => void}
        setActiveView={setActiveView}
      />
    ),
    savings: (
      <ErrorBoundary context="SavingsGoals">
        <Suspense fallback={<LoadingSpinner />}>
          <SavingsGoals
            savingsGoals={
              savingsEnvelopesQuery.envelopes as unknown as import("@/db/types").SavingsGoal[]
            }
            unassignedCash={unassignedCash}
            onAddGoal={savingsGoalsHook.helpers.addGoal}
            onUpdateGoal={savingsGoalsHook.helpers.updateGoal}
            onDeleteGoal={savingsGoalsHook.helpers.deleteGoal}
            onDistributeToGoals={(distribution: Record<string, number>) => {
              savingsGoalsHook.helpers.distributeFunds(distribution, "").catch((err) => {
                logger.error("Failed to distribute funds:", err);
              });
            }}
          />
        </Suspense>
      </ErrorBoundary>
    ),
    supplemental: (
      <ErrorBoundary context="SupplementalAccounts">
        <Suspense fallback={<LoadingSpinner />}>
          <SupplementalAccounts
            supplementalAccounts={
              supplementalEnvelopesQuery.envelopes as Array<Record<string, unknown>>
            }
            onAddAccount={
              budgetOps.addSupplementalAccount as unknown as (account: {
                id: string | number;
                name: string;
                type: string;
                currentBalance: number;
                annualContribution: number;
                expirationDate: string | null;
                description: string | null;
                color: string;
                isActive: boolean;
                createdBy: string;
                createdAt: string;
                lastUpdated: string;
                transactions: unknown[];
              }) => void
            }
            onUpdateAccount={
              budgetOps.updateSupplementalAccount as unknown as (account: {
                id: string | number;
                name: string;
                type: string;
                currentBalance: number;
                annualContribution: number;
                expirationDate: string | null;
                description: string | null;
                color: string;
                isActive: boolean;
                createdBy: string;
                createdAt: string;
                lastUpdated: string;
                transactions: unknown[];
              }) => void
            }
            onDeleteAccount={
              budgetOps.deleteSupplementalAccount as unknown as (accountId: string) => void
            }
            onTransferToEnvelope={
              budgetOps.transferFromSupplementalAccount as unknown as (transfer: {
                accountId: string;
                envelopeId: string;
                amount: number;
                description: string;
              }) => void
            }
            envelopes={envelopes}
            currentUser={user}
          />
        </Suspense>
      </ErrorBoundary>
    ),
    paycheck: (
      <ErrorBoundary context="PaycheckProcessor">
        <Suspense fallback={<LoadingSpinner />}>
          <PaycheckProcessor
            envelopes={envelopes}
            paycheckHistory={tanStackPaycheckHistory as unknown as PaycheckHistory[]}
            onProcessPaycheck={
              tanStackProcessPaycheck as unknown as (data: unknown) => Promise<void>
            }
            onDeletePaycheck={async (paycheck: PaycheckHistory) => {
              await handleDeletePaycheck(
                paycheck.id,
                tanStackPaycheckHistory as unknown as PaycheckHistory[]
              );
            }}
            currentUser={currentUser as unknown as { userName: string }}
          />
        </Suspense>
      </ErrorBoundary>
    ),
    bills: (
      <ErrorBoundary context="BillManager">
        <Suspense fallback={<LoadingSpinner />}>
          <BillManager
            transactions={
              safeTransactions as unknown as Array<{
                id: string;
                date: Date | string;
                amount: number;
                [key: string]: unknown;
              }>
            }
            envelopes={envelopes as unknown as import("@/types/finance").Envelope[]}
            onUpdateBill={
              handleUpdateBill as unknown as (
                bill: import("@/types/bills").Bill
              ) => void | Promise<void>
            }
            onCreateRecurringBill={() => {}}
            onSearchNewBills={async () => {}}
            onError={handleBillManagerError}
          />
        </Suspense>
      </ErrorBoundary>
    ),
    transactions: (
      <ErrorBoundary context="TransactionLedger">
        <Suspense fallback={<LoadingSpinner />}>
          <TransactionLedger currentUser={user} />
        </Suspense>
      </ErrorBoundary>
    ),
    analytics: (
      <ErrorBoundary context="AnalyticsDashboard">
        <Suspense fallback={<LoadingSpinner />}>
          <AnalyticsDashboard />
        </Suspense>
      </ErrorBoundary>
    ),
    debts: isDebtFeatureEnabled("ENABLE_DEBT_DASHBOARD") ? (
      <ErrorBoundary context="DebtDashboard">
        <Suspense fallback={<LoadingSpinner />}>
          <DebtDashboard />
        </Suspense>
      </ErrorBoundary>
    ) : (
      <DebtDisabledView />
    ),
    automation: (
      <ErrorBoundary context="AutoFundingView">
        <Suspense fallback={<LoadingSpinner />}>
          <AutoFundingView />
        </Suspense>
      </ErrorBoundary>
    ),
    activity: (
      <ErrorBoundary context="ActivityFeed">
        <Suspense fallback={<LoadingSpinner />}>
          <ActivityFeed />
        </Suspense>
      </ErrorBoundary>
    ),
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {views[activeView] || <div>View not found</div>}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ViewRenderer;
