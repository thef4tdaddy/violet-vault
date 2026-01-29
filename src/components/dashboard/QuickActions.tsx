import React from "react";
import QuickActionButton from "./QuickActionButton";
import { useManualSync } from "@/hooks/platform/sync/useManualSync";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import { useImportDashboardStore } from "@/stores/ui/importDashboardStore";
import { useSentinelReceipts } from "@/hooks/api/useSentinelReceipts";

interface QuickActionsProps {
  setActiveView?: (view: string) => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setActiveView, className = "" }) => {
  const { forceFullSync, isSyncInProgress } = useManualSync();
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const openImportDashboard = useImportDashboardStore((state) => state.open);
  const { pendingReceipts } = useSentinelReceipts();
  const pendingCount = pendingReceipts?.length || 0;

  const handleSync = async () => {
    try {
      const result = await forceFullSync();
      if (result.success) {
        showSuccessToast("Synchronization complete");
      } else {
        showErrorToast(result.error || "Synchronization failed");
      }
    } catch {
      showErrorToast("Synchronization failed");
    }
  };

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}
      data-testid="quick-actions-toolbar"
    >
      <QuickActionButton
        icon="Plus"
        label="Add Transaction"
        variant="primary"
        color="purple"
        onClick={() => setActiveView?.("transactions")}
      />
      <QuickActionButton
        icon="Receipt"
        label="Import Receipts"
        variant="secondary"
        onClick={() => openImportDashboard()}
        badgeCount={pendingCount}
      />
      <QuickActionButton
        icon="Calendar"
        label="Add Bill"
        variant="primary"
        color="orange"
        onClick={() => setActiveView?.("bills")}
      />
      <QuickActionButton
        icon="Wallet"
        label="Add Paycheck"
        variant="primary"
        color="success"
        onClick={() => setActiveView?.("paycheck")}
      />
      <QuickActionButton
        icon="RefreshCw"
        label={isSyncInProgress ? "Syncing..." : "Sync Now"}
        variant="primary"
        color="blue"
        disabled={isSyncInProgress}
        onClick={handleSync}
      />
    </div>
  );
};

export default QuickActions;
