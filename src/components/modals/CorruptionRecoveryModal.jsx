import React, { useState } from "react";
import { ConfirmModal } from "../shared/ConfirmModal";
import { useToastHelpers } from "../../hooks/ui/useToastHelpers";
import { useDataManagement } from "../../hooks/common/useDataManagement";
import logger from "../../utils/common/logger";

/**
 * Modal that guides users through encryption corruption recovery
 * Shows when repeated decryption failures indicate corrupted sync data
 */
export const CorruptionRecoveryModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const { exportData } = useDataManagement();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportData();
      setStep(2);
      showSuccessToast(
        "Data exported successfully! Now create a new profile.",
        "Backup Complete",
      );
    } catch (error) {
      logger.error("Failed to export data during corruption recovery", error);
      showErrorToast(`Export failed: ${error.message}`, "Export Error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateNewProfile = () => {
    // Clear the current user profile to trigger fresh setup
    const keysToRemove = [
      "violet_vault_user_profile",
      "violet-vault-user-data",
      "violet-vault-auth-salt",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    showSuccessToast(
      "Profile cleared. The page will reload to start fresh setup.",
      "Profile Reset",
    );

    // Reload to trigger fresh user setup
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-black text-black mb-2">
          SYNC CORRUPTION DETECTED
        </h3>
        <p className="text-purple-900">
          Your sync data has encryption corruption that prevents normal
          recovery. Don't worry - we can fix this safely!
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
          You <strong>must export your data first</strong>. Creating a new
          profile will clear your current session.
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black rounded-lg font-bold disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "📤 Export Data First"}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-black text-black mb-2">
          DATA EXPORTED SUCCESSFULLY
        </h3>
        <p className="text-purple-900">
          Your backup is saved. Now let's create a fresh profile to eliminate
          the corruption.
        </p>
      </div>

      <div className="bg-green-50 border-2 border-black rounded-lg p-4 ring-1 ring-gray-800/10">
        <h4 className="font-bold text-green-800 mb-2">✅ Backup Complete</h4>
        <p className="text-green-700">
          Your data is safely exported. Now we'll clear your current profile and
          start fresh with clean encryption.
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
        <button
          onClick={onClose}
          className="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateNewProfile}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white border-2 border-black rounded-lg font-bold"
        >
          🆕 Create New Profile
        </button>
      </div>
    </div>
  );

  return (
    <ConfirmModal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      {step === 1 ? renderStep1() : renderStep2()}
    </ConfirmModal>
  );
};
