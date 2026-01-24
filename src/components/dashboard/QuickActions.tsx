import React from "react";
import QuickActionButton from "./QuickActionButton";
import { useManualSync } from "@/hooks/platform/sync/useManualSync";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className = "" }) => {
  const { forceFullSync, isSyncInProgress } = useManualSync();
  const { showSuccessToast, showErrorToast } = useToastHelpers();

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
        onClick={() => {
          /* TODO: Open Add Transaction Modal */
        }}
      />
      <QuickActionButton
        icon="Receipt"
        label="Scan Receipt"
        variant="secondary"
        onClick={() => {
          /* TODO: Open Receipt Scanner */
        }}
      />
      <QuickActionButton
        icon="Calendar"
        label="Add Bill"
        variant="primary"
        color="orange"
        onClick={() => {
          /* TODO: Open Add Bill Modal */
        }}
      />
      <QuickActionButton
        icon="Wallet"
        label="Add Paycheck"
        variant="primary"
        color="success"
        onClick={() => {
          /* TODO: Open Add Paycheck Modal */
        }}
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
