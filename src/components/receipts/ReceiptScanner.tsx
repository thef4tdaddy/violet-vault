import { useReceiptScanner } from "../../hooks/receipts/useReceiptScanner";
import ReceiptScannerHeader from "./components/ReceiptScannerHeader";
import ReceiptUploadArea from "./components/ReceiptUploadArea";
import ReceiptProcessingState from "./components/ReceiptProcessingState";
import ReceiptErrorState from "./components/ReceiptErrorState";
import ReceiptImagePreview from "./components/ReceiptImagePreview";
import ReceiptExtractedData from "./components/ReceiptExtractedData";
import ReceiptActionButtons from "./components/ReceiptActionButtons";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

/**
 * Internal interface matching the hook's UploadedImage type
 */
interface UploadedImageData {
  file: File;
  url: string;
  name: string;
  size: number;
}

/**
 * Data returned from the receipt scanner hook
 */
interface HookReceiptData {
  merchant: string | null;
  total: string | null;
  date: string | null;
  time: string | null;
  tax: string | null;
  subtotal: string | null;
  items: Array<{ description: string; amount: number; rawLine: string }>;
  confidence: Record<string, string>;
  rawText: string;
  processingTime: number;
  imageData: UploadedImageData;
}

interface ReceiptProcessedData {
  merchant: string | null;
  total: string | null;
  date: string | null;
  time: string | null;
  tax: string | null;
  subtotal: string | null;
  items: Array<{ description: string; amount: number; rawLine: string }>;
  confidence: Record<string, string>;
  rawText: string;
  processingTime: number;
  imageData: { file: File; preview: string };
}

interface ReceiptScannerProps {
  onReceiptProcessed: (data: ReceiptProcessedData) => void;
  onClose: () => void;
}

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
const ReceiptScanner = ({ onReceiptProcessed, onClose }: ReceiptScannerProps) => {
  // Create a wrapper that transforms hook data to the expected format
  const handleReceiptProcessed = (data: HookReceiptData): void => {
    onReceiptProcessed({
      ...data,
      imageData: {
        file: data.imageData.file,
        preview: data.imageData.url, // Map url to preview
      },
    });
  };

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
  } = useReceiptScanner(handleReceiptProcessed);

  const modalRef = useModalAutoScroll(true);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-black shadow-2xl bg-purple-100/60 my-auto"
      >
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

              <ReceiptExtractedData
                extractedData={
                  extractedData
                    ? {
                        merchant: extractedData.merchant ?? undefined,
                        total: extractedData.total ? parseFloat(extractedData.total) : undefined,
                        date: extractedData.date ?? undefined,
                        tax: extractedData.tax ? parseFloat(extractedData.tax) : undefined,
                        subtotal: extractedData.subtotal
                          ? parseFloat(extractedData.subtotal)
                          : undefined,
                        processingTime: extractedData.processingTime,
                        items: extractedData.items,
                        confidence: {
                          merchant: extractedData.confidence.merchant
                            ? parseFloat(extractedData.confidence.merchant)
                            : undefined,
                          total: extractedData.confidence.total
                            ? parseFloat(extractedData.confidence.total)
                            : undefined,
                          date: extractedData.confidence.date
                            ? parseFloat(extractedData.confidence.date)
                            : undefined,
                          tax: extractedData.confidence.tax
                            ? parseFloat(extractedData.confidence.tax)
                            : undefined,
                          subtotal: extractedData.confidence.subtotal
                            ? parseFloat(extractedData.confidence.subtotal)
                            : undefined,
                        },
                      }
                    : null
                }
              />

              <ReceiptActionButtons
                extractedData={
                  extractedData as unknown as {
                    merchant?: string | null;
                    total?: string | null;
                    date?: string | null;
                    items?: Array<{ description: string; amount: number }>;
                    [key: string]: unknown;
                  }
                }
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
