import { Suspense, useCallback, lazy, createElement, ReactNode } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import Dashboard from "../pages/MainDashboard";
import SmartEnvelopeSuggestions from "../budgeting/SmartEnvelopeSuggestions";
import EnvelopeGrid from "../budgeting/EnvelopeGrid";
import SavingsGoals from "../savings/SavingsGoals";
import SupplementalAccounts from "../accounts/SupplementalAccounts";
import PaycheckProcessor from "../budgeting/PaycheckProcessor";
import BillManager from "../bills/BillManager";
import TransactionLedger from "../transactions/TransactionLedger";
const ChartsAndAnalytics = lazy(() => import("../analytics/ChartsAndAnalytics"));
// Temporarily disable lazy loading due to chunk loading error
// const DebtDashboard = lazy(() => import("../debt/DebtDashboard"));
import DebtDashboard from "../debt/DebtDashboard";
import { isDebtFeatureEnabled } from "@/utils/debts/debtDebugConfig";
const AutoFundingView = lazy(() => import("../automation/AutoFundingView"));
const ActivityFeed = lazy(() => import("../activity/ActivityFeed"));
import LoadingSpinner from "../ui/LoadingSpinner";
import { ErrorBoundary } from "@highlight-run/react";
import { useLayoutData } from "@/hooks/layout";
import { usePaycheckOperations } from "@/hooks/layout/usePaycheckOperations";
import useSavingsGoals from "@/hooks/savings/useSavingsGoals";
import logger from "@/utils/common/logger";

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

interface EnvelopeViewProps {
  envelopes: Array<Record<string, unknown>>;
  safeTransactions: Array<Record<string, unknown>>;
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
    <div className="flex justify-between items-start gap-4">
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
        <p className="text-purple-900 text-sm ml-12">
          Organize and track your budget allocations
        </p>
        <p className="text-purple-800 text-xs ml-12 font-medium">
          You currently have {envelopes?.length || 0} {envelopes?.length === 1 ? 'envelope' : 'envelopes'}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
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

  // Get savings goals operations
  const savingsGoalsHook = useSavingsGoals();

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

  const views: Record<string, ReactNode> = {
    dashboard: <Dashboard setActiveView={setActiveView} />,
    envelopes: (
      <EnvelopeView
        envelopes={envelopes as unknown as Array<Record<string, unknown>>}
        safeTransactions={safeTransactions}
        unassignedCash={unassignedCash}
        addEnvelope={budgetOps.addEnvelope as () => void}
        updateEnvelope={budgetOps.updateEnvelope as () => void}
        setActiveView={setActiveView}
      />
    ),
    savings: (
      <SavingsGoals
        savingsGoals={savingsGoalsHook.savingsGoals as Array<Record<string, unknown>>}
        unassignedCash={unassignedCash}
        onAddGoal={savingsGoalsHook.helpers.addGoal}
        onUpdateGoal={savingsGoalsHook.helpers.updateGoal}
        onDeleteGoal={savingsGoalsHook.helpers.deleteGoal}
        onDistributeToGoals={savingsGoalsHook.helpers.distributeUnassignedCash}
      />
    ),
    supplemental: (
      <SupplementalAccounts
        supplementalAccounts={budgetOps.supplementalAccounts as Array<Record<string, unknown>>}
        onAddAccount={budgetOps.addSupplementalAccount}
        onUpdateAccount={budgetOps.updateSupplementalAccount}
        onDeleteAccount={budgetOps.deleteSupplementalAccount}
        onTransferToEnvelope={budgetOps.transferFromSupplementalAccount}
        envelopes={envelopes}
        currentUser={user}
      />
    ),
    paycheck: (
      <PaycheckProcessor
        envelopes={envelopes}
        paycheckHistory={tanStackPaycheckHistory}
        onProcessPaycheck={tanStackProcessPaycheck}
        onDeletePaycheck={(paycheckId: string) =>
          handleDeletePaycheck(paycheckId, tanStackPaycheckHistory)
        }
        currentUser={currentUser}
      />
    ),
    bills: (
      <BillManager
        transactions={safeTransactions}
        envelopes={envelopes}
        onUpdateBill={handleUpdateBill}
        onCreateRecurringBill={() => {}}
        onSearchNewBills={async () => {}}
        onError={() => {}}
      />
    ),
    transactions: <TransactionLedger currentUser={user} />,
    analytics: (
      <Suspense fallback={<LoadingSpinner />}>
        <ChartsAndAnalytics
          transactions={(safeTransactions as Array<Record<string, unknown>>) || []}
          envelopes={envelopes || []}
          currentUser={user}
        />
      </Suspense>
    ),
    debts: isDebtFeatureEnabled("ENABLE_DEBT_DASHBOARD") ? (
      <Suspense fallback={<LoadingSpinner />}>
        <DebtDashboard />
      </Suspense>
    ) : (
      <DebtDisabledView />
    ),
    automation: (
      <Suspense fallback={<LoadingSpinner />}>
        <AutoFundingView />
      </Suspense>
    ),
    activity: (
      <Suspense fallback={<LoadingSpinner />}>
        <ActivityFeed />
      </Suspense>
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
