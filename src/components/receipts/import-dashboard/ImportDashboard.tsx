import React, { useState, useCallback, useEffect, useMemo } from "react";
import ImportSidebar from "./ImportSidebar";
import ImportDashboardHeader from "./ImportDashboardHeader";
import ReceiptInbox from "./ReceiptInbox";
import ScanUploadZone from "./ScanUploadZone";
import OCRScanner from "@/components/sentinel/OCRScanner";
import MatchConfirmationModal from "@/components/receipts/MatchConfirmationModal";
import { useUnifiedReceipts } from "@/hooks/platform/receipts/useUnifiedReceipts";
import { useReceiptMatching } from "@/hooks/platform/receipts/useReceiptMatching";
import { useReceiptMutations } from "@/hooks/platform/data/useReceiptMutations";
import { useReceiptScanner } from "@/hooks/platform/receipts/useReceiptScanner";
import { useOfflineReceiptQueue } from "@/hooks/platform/receipts/useOfflineReceiptQueue";
import { useImportDashboardKeyboard } from "@/hooks/platform/receipts/useImportDashboardKeyboard";
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
 * Custom hook for ImportDashboard logic to keep component clean
 */
function useImportDashboard(initialMode: ImportMode, preloadedFile: File | null) {
  const [selectedMode, setSelectedMode] = useState<ImportMode>(
    preloadedFile ? "scan" : initialMode
  );
  const [showOCRScanner, setShowOCRScanner] = useState(false);

  const { addReceipt } = useReceiptMutations();
  const { showSuccess } = useToast();
  const closeDashboard = useImportDashboardStore((state) => state.close);

  const handleMatchSuccess = useCallback(() => {
    hapticFeedback(20, "success");
    showSuccess("Receipt Linked", "The receipt has been successfully linked.");
    closeDashboard();
  }, [showSuccess, closeDashboard]);

  const { isProcessing, handleFileUpload } = useReceiptScanner((data) => {
    addReceipt(convertOCRDataToReceipt(data) as Receipt);
  });

  const {
    addToQueue,
    retryQueue,
    pendingCount: offlineCount,
    isOnline,
    isSyncing,
  } = useOfflineReceiptQueue(handleFileUpload);

  const handleFileSelected = useCallback(
    (file: File) => {
      if (isOnline) {
        handleFileUpload(file);
      } else {
        addToQueue(file);
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

  const { sentinelReceipts, ocrReceipts, isLoading, error } = useUnifiedReceipts();

  const filteredReceipts = useMemo(
    () =>
      (selectedMode === "digital" ? sentinelReceipts : ocrReceipts).filter(
        (r) => r.status === "pending"
      ),
    [selectedMode, sentinelReceipts, ocrReceipts]
  );

  const pendingCounts = useMemo(
    () => ({
      digital: sentinelReceipts.filter((r) => r.status === "pending").length,
      scan: ocrReceipts.filter((r) => r.status === "pending").length + offlineCount,
    }),
    [sentinelReceipts, ocrReceipts, offlineCount]
  );

  useEffect(() => {
    if (preloadedFile) handleFileUpload(preloadedFile);
  }, [preloadedFile, handleFileUpload]);

  useImportDashboardKeyboard(setSelectedMode);

  return {
    selectedMode,
    setSelectedMode,
    showOCRScanner,
    setShowOCRScanner,
    isProcessing,
    isSyncing,
    offlineCount,
    isOnline,
    retryQueue,
    error,
    filteredReceipts,
    pendingCounts,
    isLoading,
    handleFileSelected,
    handleReceiptProcessed,
    showConfirmModal,
    selectedMatch,
    confirmLinkOnly,
    confirmLinkAndUpdate,
    closeMatchConfirmation,
    isLinking,
    isLinkingAndUpdating,
    handleReceiptClick: useCallback(
      (dashboardReceipt: DashboardReceiptItem) => {
        const receipt = dashboardReceipt.rawData as Receipt;
        const suggestions = getMatchSuggestionsForReceipt(receipt);
        if (suggestions.length > 0) openMatchConfirmation(receipt, suggestions[0]);
      },
      [openMatchConfirmation, getMatchSuggestionsForReceipt]
    ),
    handleEmptyAction: useCallback(() => {
      if (selectedMode === "scan") {
        setShowOCRScanner(true);
      }
    }, [selectedMode]),
  };
}

/**
 * ImportDashboard - Main unified receipt import interface
 */
const ImportDashboard: React.FC<ImportDashboardProps> = ({
  initialMode = "digital",
  className = "",
  preloadedFile = null,
  onClose,
}) => {
  const logic = useImportDashboard(initialMode, preloadedFile);

  return (
    <>
      <div
        className={`flex flex-col lg:flex-row gap-6 min-h-screen p-6 bg-linear-to-br from-purple-50 to-cyan-50 ${className}`}
        data-testid="import-dashboard"
      >
        <aside className="lg:w-64 shrink-0">
          <ImportSidebar
            selectedMode={logic.selectedMode}
            onModeChange={logic.setSelectedMode}
            pendingCounts={logic.pendingCounts}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <ImportDashboardHeader
            selectedMode={logic.selectedMode}
            onClose={onClose}
            offlineCount={logic.offlineCount}
            isOnline={logic.isOnline}
            isSyncing={logic.isSyncing}
            retryQueue={logic.retryQueue}
            error={logic.error}
          />
          <ReceiptInbox
            receipts={logic.filteredReceipts}
            mode={logic.selectedMode}
            isLoading={logic.isLoading}
            onReceiptClick={logic.handleReceiptClick}
            onEmptyAction={logic.handleEmptyAction}
          />
          {logic.selectedMode === "scan" && (
            <div className="mt-8 border-t-2 border-black/5 pt-8">
              <h2 className="font-mono font-black uppercase tracking-tight text-black text-xl mb-4">
                Add New Scan
              </h2>
              <ScanUploadZone
                onFileSelected={logic.handleFileSelected}
                isProcessing={logic.isProcessing || logic.isSyncing}
              />
            </div>
          )}
        </main>
      </div>

      {logic.showOCRScanner && (
        <OCRScanner
          preloadedFile={preloadedFile}
          onReceiptProcessed={logic.handleReceiptProcessed}
          onClose={() => logic.setShowOCRScanner(false)}
        />
      )}

      {logic.showConfirmModal && logic.selectedMatch && (
        <MatchConfirmationModal
          selectedMatch={logic.selectedMatch}
          onLinkOnly={logic.confirmLinkOnly}
          onLinkAndUpdate={logic.confirmLinkAndUpdate}
          onClose={logic.closeMatchConfirmation}
          isLinking={logic.isLinking}
          isLinkingAndUpdating={logic.isLinkingAndUpdating}
        />
      )}
    </>
  );
};

export default ImportDashboard;
