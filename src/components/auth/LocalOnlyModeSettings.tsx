import React, { useState, useRef, useEffect } from "react";
import { globalToast } from "@/stores/ui/toastStore";
import { useLocalOnlyMode } from "@/hooks/platform/data/useLocalOnlyMode";
import LocalOnlyHeader from "./local-only/LocalOnlyHeader";
import PrivacyStatusBanner from "./local-only/PrivacyStatusBanner";
import ErrorDisplay from "./local-only/ErrorDisplay";
import StatisticsGrid from "./local-only/StatisticsGrid";
import DataManagementSection from "./local-only/DataManagementSection";
import ModeManagementSection from "./local-only/ModeManagementSection";
import LocalOnlyFooter from "./local-only/LocalOnlyFooter";
import LoadingOverlay from "./local-only/LoadingOverlay";
import ExitConfirmationModal from "./local-only/ExitConfirmationModal";
import ClearDataConfirmationModal from "./local-only/ClearDataConfirmationModal";
import logger from "@/utils/core/common/logger";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface LocalOnlyModeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSwitch: (mode: string) => void;
}

interface Stats {
  totalEnvelopes: number;
  totalTransactions: number;
  storageSizeFormatted: string;
  totalBills: number;
}

const LocalOnlyModeSettings: React.FC<LocalOnlyModeSettingsProps> = ({
  isOpen,
  onClose,
  onModeSwitch,
}) => {
  const {
    loading,
    error,
    clearError,
    exitLocalOnlyModeAndClear,
    exportData,
    importData,
    getStats,
    clearAllData,
    validateImportFile,
  } = useLocalOnlyMode();

  const [stats, setStats] = useState<Stats | null>(null);
  const [_importFile, _setImportFile] = useState<File | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalAutoScroll(isOpen);

  // Load statistics when modal opens
  useEffect(() => {
    if (isOpen) {
      getStats()
        .then((result: { success: boolean; error?: string } | Stats) => {
          if (result && typeof result === "object" && !("success" in result)) {
            setStats(result as Stats);
          }
        })
        .catch(logger.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getStats is stable Zustand action
  }, [isOpen]);

  // Clear states when closing
  useEffect(() => {
    if (!isOpen) {
      clearError();
      _setImportFile(null);
      setShowConfirmExit(false);
      setShowConfirmClear(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clearError is stable Zustand action
  }, [isOpen]);

  const handleExportData = async () => {
    try {
      await exportData();
    } catch (err) {
      logger.error("Export failed:", err);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      JSON.parse(fileText); // Validate JSON format

      const validation = validateImportFile();
      if (!validation.valid) {
        globalToast.showError(`Invalid import file: ${validation.error}`, "Invalid File", 8000);
        return;
      }

      await importData();

      // Refresh stats
      const newStats = await getStats();
      if (newStats && typeof newStats === "object" && !("success" in newStats)) {
        setStats(newStats as Stats);
      }

      globalToast.showSuccess("Data imported successfully!", "Import Complete", 5000);
    } catch (err) {
      logger.error("Import failed:", err);
      globalToast.showError(`Import failed: ${(err as Error).message}`, "Import Failed", 8000);
    }
  };

  const handleExitLocalMode = async (_clearData = false) => {
    try {
      await exitLocalOnlyModeAndClear();
      onModeSwitch("standard");
      onClose();
    } catch (err) {
      logger.error("Failed to exit local-only mode:", err);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();

      // Refresh stats
      const newStats = await getStats();
      if (newStats && typeof newStats === "object" && !("success" in newStats)) {
        setStats(newStats as Stats);
      }

      setShowConfirmClear(false);
      globalToast.showSuccess("All data cleared successfully!", "Data Cleared", 5000);
    } catch (err) {
      logger.error("Failed to clear data:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-2xl my-auto"
      >
        <div className="p-6">
          <LocalOnlyHeader onClose={onClose} loading={loading} />

          <PrivacyStatusBanner />

          <ErrorDisplay error={error} />

          <StatisticsGrid stats={stats} />

          <div className="space-y-6">
            <DataManagementSection
              loading={loading}
              onExportData={handleExportData}
              onImportClick={() => fileInputRef.current?.click()}
            />

            <ModeManagementSection
              loading={loading}
              onSwitchMode={() => setShowConfirmExit(true)}
              onClearData={() => setShowConfirmClear(true)}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              disabled={loading}
            />
          </div>

          <LoadingOverlay loading={loading} />

          <LocalOnlyFooter />
        </div>

        <ExitConfirmationModal
          showConfirmExit={showConfirmExit}
          loading={loading}
          onCancel={() => setShowConfirmExit(false)}
          onConfirm={() => handleExitLocalMode(false)}
        />

        <ClearDataConfirmationModal
          showConfirmClear={showConfirmClear}
          loading={loading}
          onCancel={() => setShowConfirmClear(false)}
          onConfirm={handleClearAllData}
        />
      </div>
    </div>
  );
};

export default LocalOnlyModeSettings;
