import React from "react";
import { Button } from "@/components/ui";
import { useReceiptScanner } from "../../hooks/receipts/useReceiptScanner";
import ReceiptScannerHeader from "./components/ReceiptScannerHeader";
import ReceiptUploadArea from "./components/ReceiptUploadArea";
import ReceiptProcessingState from "./components/ReceiptProcessingState";
import ReceiptErrorState from "./components/ReceiptErrorState";
import ReceiptImagePreview from "./components/ReceiptImagePreview";
import ReceiptExtractedData from "./components/ReceiptExtractedData";
import ReceiptActionButtons from "./components/ReceiptActionButtons";

/**
 * Receipt Scanner Component (Refactored)
 * Handles image upload, camera capture, and OCR processing
 *
 * REFACTORING RESULTS:
 * - Before: 449 lines, 381-line function, complexity 18
 * - After: ~55 lines main component + 6 focused components + 1 custom hook
 * - UI Standards: Applied glassmorphism, hard borders, ALL CAPS typography
 * - Maintainability: Single-responsibility components with clear interfaces
 */
const ReceiptScanner = ({ onReceiptProcessed, onClose }) => {
  const {
    // State
    isProcessing,
    uploadedImage,
    extractedData,
    error,
    showImagePreview,

    // Refs
    fileInputRef,
    cameraInputRef,

    // Actions
    handleDrop,
    handleDragOver,
    handleFileInputChange,
    handleConfirmReceipt,
    resetScanner,
    toggleImagePreview,
  } = useReceiptScanner(onReceiptProcessed);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black bg-purple-100/40 backdrop-blur-3xl">
        <div className="p-6">
          <ReceiptScannerHeader onClose={onClose} />

          {!uploadedImage && (
            <ReceiptUploadArea
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              fileInputRef={fileInputRef}
              cameraInputRef={cameraInputRef}
              onFileInputChange={handleFileInputChange}
            />
          )}

          {isProcessing && <ReceiptProcessingState />}

          {error && <ReceiptErrorState error={error} onRetry={resetScanner} />}

          {extractedData && !isProcessing && (
            <div className="space-y-6">
              <ReceiptImagePreview
                uploadedImage={uploadedImage}
                showImagePreview={showImagePreview}
                onTogglePreview={toggleImagePreview}
              />

              <ReceiptExtractedData extractedData={extractedData} />

              <ReceiptActionButtons
                extractedData={extractedData}
                onReset={resetScanner}
                onConfirm={handleConfirmReceipt}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;
