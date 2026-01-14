import React, { useState } from "react";
import { Button } from "@/components/ui";
import ConfirmModal from "../ui/ConfirmModal";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import useDataManagement from "../../hooks/platform/data/useDataManagement";
import logger from "@/utils/common/logger";

// Type definitions for props
interface CorruptionRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Type definitions for hooks (temporary until hooks are typed)
interface ToastHelpers {
  showSuccessToast: (message: string, title: string) => void;
  showErrorToast: (message: string, title: string) => void;
}

interface DataManagement {
  exportData: () => Promise<void>;
}

/**
 * Modal that guides users through encryption corruption recovery
 * Shows when repeated decryption failures indicate corrupted sync data
 */
export const CorruptionRecoveryModal: React.FC<CorruptionRecoveryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { showSuccessToast, showErrorToast } = useToastHelpers() as ToastHelpers;
  const { exportData } = useDataManagement() as DataManagement;

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      await exportData();
      setStep(2);
      showSuccessToast("Data exported successfully! Now create a new profile.", "Backup Complete");
    } catch (error) {
      logger.error("Failed to export data during corruption recovery", { error });
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showErrorToast(`Export failed: ${errorMessage}`, "Export Error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateNewProfile = (): void => {
    // Clear the current user profile to trigger fresh setup
    const keysToRemove = [
      "violet_vault_user_profile",
      "violet-vault-user-data",
      "violet-vault-auth-salt",
    ];

    keysToRemove.forEach((key) => {
      // eslint-disable-next-line no-restricted-syntax -- Direct localStorage clear needed for recovery during sync corruption
      localStorage.removeItem(key);
    });

    showSuccessToast(
      "Profile cleared. The page will reload to start fresh setup.",
      "Profile Reset"
    );

    // Reload to trigger fresh user setup
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const renderStep1 = (): React.ReactElement => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-black text-black mb-2">SYNC CORRUPTION DETECTED</h3>
        <p className="text-purple-900">
          Your sync data has encryption corruption that prevents normal recovery. Don't worry - we
          can fix this safely!
        </p>
      </div>

      <div className="bg-yellow-50 border-2 border-black rounded-lg p-4 ring-1 ring-gray-800/10">
        <h4 className="font-bold text-yellow-800 mb-2">📋 Recovery Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>
            <strong>Export your data</strong> (backup before any changes)
          </li>
          <li>
            <strong>Create new profile</strong> with different password
          </li>
          <li>
            <strong>Re-import your data</strong> into the clean environment
          </li>
        </ol>
      </div>

      <div className="bg-red-50 border-2 border-black rounded-lg p-4 ring-1 ring-gray-800/10">
        <h4 className="font-bold text-red-800 mb-2">⚠️ Important:</h4>
        <p className="text-red-700">
          You <strong>must export your data first</strong>. Creating a new profile will clear your
          current session.
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          onClick={onClose}
          className="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black rounded-lg font-bold disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "📤 Export Data First"}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = (): React.ReactElement => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-black text-black mb-2">DATA EXPORTED SUCCESSFULLY</h3>
        <p className="text-purple-900">
          Your backup is saved. Now let's create a fresh profile to eliminate the corruption.
        </p>
      </div>

      <div className="bg-green-50 border-2 border-black rounded-lg p-4 ring-1 ring-gray-800/10">
        <h4 className="font-bold text-green-800 mb-2">✅ Backup Complete</h4>
        <p className="text-green-700">
          Your data is safely exported. Now we'll clear your current profile and start fresh with
          clean encryption.
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-black rounded-lg p-4 ring-1 ring-gray-800/10">
        <h4 className="font-bold text-blue-800 mb-2">📝 Next Steps:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>Click "Create New Profile" below</li>
          <li>Page will reload to user setup</li>
          <li>
            Enter a <strong>different password</strong> than before
          </li>
          <li>Import your exported data file</li>
        </ol>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          onClick={onClose}
          className="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateNewProfile}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white border-2 border-black rounded-lg font-bold"
        >
          🆕 Create New Profile
        </Button>
      </div>
    </div>
  );

  return (
    <ConfirmModal isOpen={isOpen} onCancel={onClose} onConfirm={() => {}}>
      {step === 1 ? renderStep1() : renderStep2()}
    </ConfirmModal>
  );
};
