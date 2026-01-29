import React from "react";
import {
  useReceiptScanner,
  ReceiptProcessedData,
} from "@/hooks/platform/receipts/useReceiptScanner";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

import ScannerHeader from "./components/ScannerHeader";
import ScannerUploadArea from "./components/ScannerUploadArea";
import ScannerProcessingState from "./components/ScannerProcessingState";
import ScannerErrorState from "./components/ScannerErrorState";
import ScannerResults from "./components/ScannerResults";
import ScannerActionButtons from "./components/ScannerActionButtons";

interface OCRScannerProps {
  onReceiptProcessed: (data: ReceiptProcessedData) => void;
  onClose: () => void;
  preloadedFile?: File | null;
}

/**
 * OCRScanner - Sentinel-Enhanced Receipt Scanning UI
 * Implements "Hard Lines" high-contrast aesthetic with 2.1 architecture
 */
const OCRScanner = ({ onReceiptProcessed, onClose, preloadedFile = null }: OCRScannerProps) => {
  const {
    isProcessing,
    uploadedImage,
    extractedData,
    error,
    fileInputRef,
    cameraInputRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleFileInputChange,
    handleConfirmReceipt,
    resetScanner,
  } = useReceiptScanner((data) => {
    onReceiptProcessed(data);
  });

  // Handle preloaded file if provided (e.g. from PWA Share Target)
  React.useEffect(() => {
    if (preloadedFile && !uploadedImage && !isProcessing) {
      handleFileUpload(preloadedFile);
    }
  }, [preloadedFile, handleFileUpload, uploadedImage, isProcessing]);

  const modalRef = useModalAutoScroll(true);

  return (
    <div
      className="fixed inset-0 bg-[#4c1d95]/90 flex items-center justify-center p-4 z-9999 overflow-y-auto"
      data-testid=" sentinel-scanner-overlay"
    >
      <div
        ref={modalRef as React.RefObject<HTMLDivElement | null>}
        className="bg-[#f3e8ff] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full my-auto"
        data-testid="sentinel-scanner-container"
      >
        <div className="p-8">
          <ScannerHeader onClose={onClose} />

          {/* Initial State: Upload / Capture */}
          {!uploadedImage && !isProcessing && (
            <ScannerUploadArea
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              fileInputRef={fileInputRef}
              cameraInputRef={cameraInputRef}
              onFileInputChange={handleFileInputChange}
            />
          )}

          {/* Processing State: Laser Scan Animation */}
          {isProcessing && <ScannerProcessingState previewUrl={uploadedImage?.url} />}

          {/* Error State */}
          {error && <ScannerErrorState error={error} onRetry={resetScanner} />}

          {/* Success State: Show Results */}
          {extractedData && !isProcessing && (
            <>
              <ScannerResults data={extractedData} />

              <ScannerActionButtons
                onReset={resetScanner}
                onConfirm={handleConfirmReceipt}
                isValid={!!extractedData.merchant && !!extractedData.total}
              />
            </>
          )}
        </div>

        {/* Decorative footer elements */}
        <div className="bg-black text-[#f3e8ff] px-8 py-2 flex justify-between items-center text-[10px] font-black uppercase font-mono tracking-[0.3em]">
          <span>SYST_LOG: READY</span>
          <span>LATENCY: {extractedData?.processingTime || 0}MS</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            V2.1_SENTINEL
          </span>
        </div>
      </div>
    </div>
  );
};

export default OCRScanner;
