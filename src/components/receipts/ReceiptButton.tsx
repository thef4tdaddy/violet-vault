import React, { useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import ReceiptScanner from "./ReceiptScanner";
import ReceiptToTransactionModal from "./ReceiptToTransactionModal";
import { preloadOCR } from "@/utils/common/ocrProcessor";
import logger from "@/utils/common/logger";

interface ProcessedReceipt {
  id?: string;
  total: string | null;
  merchant: string | null;
  date: string | null;
  time: string | null;
  tax: string | null;
  subtotal: string | null;
  items: Array<{ description: string; amount: number; rawLine: string }>;
  confidence: Record<string, string>;
  rawText?: string;
  processingTime?: number;
}

interface Transaction {
  id: string;
  [key: string]: unknown;
}

interface Receipt {
  id: string;
  [key: string]: unknown;
}

interface ReceiptButtonProps {
  onTransactionCreated?: (transaction: Transaction, receipt: Receipt) => void;
  variant?: "primary" | "secondary" | "icon" | "fab";
}

/**
 * Button to trigger receipt scanning
 * Can be integrated into transaction forms or used as standalone
 */
const ReceiptButton = ({ onTransactionCreated, variant = "primary" }: ReceiptButtonProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ProcessedReceipt | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  const handleScanReceipt = async () => {
    // Preload OCR if not already done
    if (!isPreloading) {
      setIsPreloading(true);
      try {
        await preloadOCR();
      } catch (error) {
        logger.warn("Failed to preload OCR:", error as Record<string, unknown>);
      } finally {
        setIsPreloading(false);
      }
    }

    setShowScanner(true);
  };

  const handleReceiptProcessed = (processedReceipt: ProcessedReceipt) => {
    setReceiptData(processedReceipt);
    setShowScanner(false);
    setShowTransactionModal(true);
  };

  const handleTransactionComplete = (transaction: Transaction, receipt: Receipt) => {
    setShowTransactionModal(false);
    setReceiptData(null);

    // Notify parent component
    onTransactionCreated?.(transaction, receipt);

    logger.info("✅ Transaction created from receipt", {
      transactionId: transaction.id,
      receiptId: receipt.id,
    });
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setReceiptData(null);
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    setReceiptData(null);
  };

  // Render different button styles based on variant
  const renderButton = () => {
    const baseClasses = "flex items-center gap-2 transition-colors disabled:opacity-50";

    switch (variant) {
      case "secondary":
        return (
          <Button
            onClick={handleScanReceipt}
            disabled={isPreloading}
            className={`${baseClasses} px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50`}
          >
            {React.createElement(getIcon("Camera"), { className: "h-4 w-4" })}
            {isPreloading ? "Loading..." : "Scan Receipt"}
          </Button>
        );

      case "icon":
        return (
          <Button
            onClick={handleScanReceipt}
            disabled={isPreloading}
            className={`${baseClasses} p-2 text-purple-600 hover:bg-purple-50 rounded-xl`}
            title="Scan Receipt"
          >
            {React.createElement(getIcon("Camera"), { className: "h-5 w-5" })}
          </Button>
        );

      case "fab":
        return (
          <Button
            onClick={handleScanReceipt}
            disabled={isPreloading}
            className={`${baseClasses} fixed bottom-20 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl z-40`}
            title="Scan Receipt"
          >
            {React.createElement(getIcon("Receipt"), { className: "h-6 w-6" })}
          </Button>
        );

      default: // primary
        return (
          <Button
            onClick={handleScanReceipt}
            disabled={isPreloading}
            className={`${baseClasses} px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700`}
          >
            {React.createElement(getIcon("Camera"), { className: "h-5 w-5" })}
            {isPreloading ? "Loading OCR..." : "Scan Receipt"}
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* Receipt Scanner Modal */}
      {showScanner && (
        <ReceiptScanner onReceiptProcessed={handleReceiptProcessed} onClose={handleCloseScanner} />
      )}

      {/* Receipt to Transaction Modal */}
      {showTransactionModal && receiptData && (
        <ReceiptToTransactionModal
          receiptData={{
            merchant: receiptData.merchant ?? undefined,
            total: receiptData.total
              ? Number.isFinite(parseFloat(receiptData.total))
                ? parseFloat(receiptData.total)
                : undefined
              : undefined,
            date: receiptData.date ?? undefined,
            rawText: receiptData.rawText,
            processingTime: receiptData.processingTime,
            items: receiptData.items,
            tax: receiptData.tax
              ? Number.isFinite(parseFloat(receiptData.tax))
                ? parseFloat(receiptData.tax)
                : undefined
              : undefined,
            subtotal: receiptData.subtotal
              ? Number.isFinite(parseFloat(receiptData.subtotal))
                ? parseFloat(receiptData.subtotal)
                : undefined
              : undefined,
          }}
          onComplete={handleTransactionComplete as unknown as () => void}
          onClose={handleCloseTransactionModal}
        />
      )}
    </>
  );
};

export default ReceiptButton;
