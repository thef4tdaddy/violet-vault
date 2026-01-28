import React, { useState, useCallback, useEffect } from "react";
import ImportSidebar from "./ImportSidebar";
import ReceiptInbox from "./ReceiptInbox";
import ScanUploadZone from "./ScanUploadZone";
import OCRScanner from "@/components/sentinel/OCRScanner";
import MatchConfirmationModal from "@/components/receipts/MatchConfirmationModal";
import { useUnifiedReceipts } from "@/hooks/platform/receipts/useUnifiedReceipts";
import { useReceiptMatching } from "@/hooks/platform/receipts/useReceiptMatching";
import { useReceiptMutations } from "@/hooks/platform/data/useReceiptMutations";
import { useReceiptScanner } from "@/hooks/platform/receipts/useReceiptScanner";
import { useOfflineReceiptQueue } from "@/hooks/platform/receipts/useOfflineReceiptQueue";
import type { ImportMode, DashboardReceiptItem } from "@/types/import-dashboard.types";
import type { ReceiptProcessedData } from "@/hooks/platform/receipts/useReceiptScanner";
import type { Receipt } from "@/db/types";
import { useImportDashboardStore } from "@/stores/ui/importDashboardStore";
import { hapticFeedback } from "@/utils/ui/feedback/touchFeedback";
import useToast from "@/hooks/platform/ux/useToast";

interface ImportDashboardProps {
  initialMode?: ImportMode;
  className?: string;
  preloadedFile?: File | null;
  onClose?: () => void;
}

/**
 * Convert OCR data to Receipt format
 */
function convertOCRDataToReceipt(data: ReceiptProcessedData): Partial<Receipt> {
  return {
    merchant: data.merchant || "Unknown Merchant",
    amount: parseFloat(data.total || "0"),
    total: parseFloat(data.total || "0"),
    date: data.date || new Date().toISOString(),
    time: data.time || null,
    tax: data.tax ? parseFloat(data.tax) : null,
    subtotal: data.subtotal ? parseFloat(data.subtotal) : null,
    items: data.items || [],
    rawText: data.rawText || "",
    ocrConfidence: data.confidence || {},
    processingStatus: "completed",
  };
}

/**
 * ImportDashboard - Main unified receipt import interface
 * Phase 3: Integrated with OCRScanner and MatchConfirmationModal
 */
const ImportDashboard: React.FC<ImportDashboardProps> = ({
  initialMode = "digital",
  className = "",
  preloadedFile = null,
  // onClose is used for the modal container, but if we need a close button here
  // we can add one in the header. For now, acknowledging it to suppress warning.
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<ImportMode>(initialMode);
  const [showOCRScanner, setShowOCRScanner] = useState(false);

  const { addReceipt } = useReceiptMutations();
  const { showSuccess } = useToast();
  const closeDashboard = useImportDashboardStore((state) => state.close);

  const handleMatchSuccess = useCallback(() => {
    hapticFeedback(20, "success");
    showSuccess("Receipt Linked", "The receipt has been successfully linked to the transaction.");
    closeDashboard();
  }, [showSuccess, closeDashboard]);

  // Integrated scanner for in-page zone
  const { isProcessing, handleFileUpload } = useReceiptScanner((data) => {
    addReceipt(convertOCRDataToReceipt(data) as Receipt);
  });

  // Offline Queue Hook
  const {
    addToQueue,
    retryQueue,
    pendingCount: offlineCount,
    isOnline,
    isSyncing,
  } = useOfflineReceiptQueue(handleFileUpload);

  // Wrapped upload handler that checks connectivity
  const handleFileSelected = useCallback(
    (file: File) => {
      if (!isOnline) {
        addToQueue(file);
      } else {
        handleFileUpload(file);
      }
    },
    [isOnline, addToQueue, handleFileUpload]
  );

  const handleReceiptProcessed = useCallback(
    (data: ReceiptProcessedData) => {
      addReceipt(convertOCRDataToReceipt(data) as Receipt);
      setShowOCRScanner(false);
    },
    [addReceipt]
  );

  // Auto-trigger OCR scanner if a file is preloaded (e.g. from PWA share)
  useEffect(() => {
    if (preloadedFile) {
      setSelectedMode("scan");
      handleFileUpload(preloadedFile);
    }
  }, [preloadedFile, handleFileUpload]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "d":
          setSelectedMode("digital");
          break;
        case "s":
          setSelectedMode("scan");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { sentinelReceipts, ocrReceipts, isLoading, error } = useUnifiedReceipts();
  const {
    showConfirmModal,
    selectedMatch,
    openMatchConfirmation,
    closeMatchConfirmation,
    confirmLinkOnly,
    confirmLinkAndUpdate,
    isLinking,
    isLinkingAndUpdating,
    getMatchSuggestionsForReceipt,
  } = useReceiptMatching({ onMatchSuccess: handleMatchSuccess });

  const filteredReceipts =
    selectedMode === "digital"
      ? sentinelReceipts.filter((r) => r.status === "pending")
      : ocrReceipts.filter((r) => r.status === "pending");

  const pendingCounts = {
    digital: sentinelReceipts.filter((r) => r.status === "pending").length,
    scan: ocrReceipts.filter((r) => r.status === "pending").length + offlineCount,
  };

  const handleReceiptClick = useCallback(
    (dashboardReceipt: DashboardReceiptItem) => {
      const receipt = dashboardReceipt.rawData as Receipt;
      const suggestions = getMatchSuggestionsForReceipt(receipt);
      if (suggestions.length > 0) {
        openMatchConfirmation(receipt, suggestions[0]);
      }
    },
    [openMatchConfirmation, getMatchSuggestionsForReceipt]
  );

  const handleEmptyAction = useCallback(() => {
    if (selectedMode === "scan") setShowOCRScanner(true);
  }, [selectedMode]);

  return (
    <>
      <div
        className={`flex flex-col lg:flex-row gap-6 min-h-screen p-6 bg-linear-to-br from-purple-50 to-cyan-50 ${className}`}
        data-testid="import-dashboard"
      >
        <aside className="lg:w-64 shrink-0">
          <ImportSidebar
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            pendingCounts={pendingCounts}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <header className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="font-mono font-black uppercase tracking-tight text-black text-3xl mb-2">
                Import Receipts
              </h1>
              <p className="font-mono text-sm text-purple-900">
                {selectedMode === "digital"
                  ? "Digital receipts from connected apps"
                  : "Scanned receipts from uploaded images"}
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                aria-label="Close dashboard"
                data-testid="close-dashboard-button"
              >
                <div className="w-6 h-6 flex items-center justify-center font-black">✕</div>
              </button>
            )}
          </header>

          {error && (
            <div
              className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
              role="alert"
              data-testid="error-banner"
            >
              <h2 className="font-mono font-black uppercase text-red-900 text-sm mb-1">
                Error Loading Receipts
              </h2>
              <p className="font-mono text-xs text-red-700">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
          )}

          {offlineCount > 0 && (
            <div
              className="mb-6 p-4 bg-amber-100 border-2 border-amber-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] flex items-center justify-between"
              data-testid="offline-banner"
            >
              <div>
                <h2 className="font-mono font-black uppercase text-amber-900 text-sm mb-1">
                  {isOnline ? "Syncing Offline Receipts" : "Offline Mode Active"}
                </h2>
                <p className="font-mono text-xs text-amber-800">
                  {isOnline
                    ? `Uploading ${offlineCount} pending receipts...`
                    : `${offlineCount} receipts queued. Connect to internet to sync.`}
                </p>
              </div>
              {isOnline && !isSyncing && (
                <button
                  type="button"
                  onClick={() => retryQueue()}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 border-2 border-black rounded text-xs font-bold text-amber-900 transition-colors"
                >
                  Sync Now
                </button>
              )}
            </div>
          )}

          <ReceiptInbox
            receipts={filteredReceipts}
            mode={selectedMode}
            isLoading={isLoading}
            onReceiptClick={handleReceiptClick}
            onEmptyAction={handleEmptyAction}
          />

          {selectedMode === "scan" && (
            <div className="mt-8 border-t-2 border-black/5 pt-8">
              <h2 className="font-mono font-black uppercase tracking-tight text-black text-xl mb-4">
                Add New Scan
              </h2>
              <ScanUploadZone
                onFileSelected={handleFileSelected}
                isProcessing={isProcessing || isSyncing}
              />
            </div>
          )}
        </main>
      </div>

      {showOCRScanner && (
        <OCRScanner
          preloadedFile={preloadedFile}
          onReceiptProcessed={handleReceiptProcessed}
          onClose={() => setShowOCRScanner(false)}
        />
      )}

      {showConfirmModal && selectedMatch && (
        <MatchConfirmationModal
          selectedMatch={selectedMatch}
          onLinkOnly={confirmLinkOnly}
          onLinkAndUpdate={confirmLinkAndUpdate}
          onClose={closeMatchConfirmation}
          isLinking={isLinking}
          isLinkingAndUpdating={isLinkingAndUpdating}
        />
      )}
    </>
  );
};

export default ImportDashboard;
