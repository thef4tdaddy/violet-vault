import { useState, useCallback, useRef } from "react";
import { processReceiptImage } from "@/utils/common/ocrProcessor";
import logger from "@/utils/common/logger";

// Local type definition for receipt data with image
interface ExtendedReceiptData {
  merchant?: string;
  total?: string | number;
  date?: string;
  items?: Array<{ name: string; price?: number; quantity?: number }>;
  confidence?: string;
  rawText?: string;
  processingTime?: number;
  imageData?: {
    file: File;
    url: string;
    name: string;
    size: number;
  };
}

/**
 * Receipt Scanner Hook
 * Manages all receipt scanning state and business logic
 * Extracted from ReceiptScanner component for better organization
 */
export const useReceiptScanner = (
  onReceiptProcessed: (data: ExtendedReceiptData) => void
) => {
  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    file: File;
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [extractedData, setExtractedData] = useState<ExtendedReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // File validation utility
  const validateFile = useCallback((file: File) => {
    if (!file) return { valid: false, error: null };

    if (!file.type.startsWith("image/")) {
      return {
        valid: false,
        error: "Please upload an image file (JPG, PNG, etc.)",
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: "Image file is too large. Please use a file smaller than 10MB.",
      };
    }

    return { valid: true, error: null };
  }, []);

  // Handle file upload with OCR processing
  const handleFileUpload = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      setError(null);
      setIsProcessing(true);

      try {
        // Create preview URL
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage({
          file,
          url: imageUrl,
          name: file.name,
          size: file.size,
        });

        logger.info("🧾 Processing receipt image...", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        // Process with OCR
        const result = await processReceiptImage(file);

        setExtractedData(result);
        logger.info("✅ Receipt processing completed", {
          merchant: result.merchant,
          total: result.total,
          confidence: result.confidence,
        });
      } catch (error) {
        logger.error("❌ Receipt processing failed:", error);
        setError("Failed to process receipt. Please try again with a clearer image.");
        setExtractedData(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [validateFile]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files || []) as File[];
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragOver = useCallback((e: any) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    },
    [handleFileUpload]
  );

  // Confirm and create transaction
  const handleConfirmReceipt = useCallback(() => {
    if (extractedData && onReceiptProcessed) {
      onReceiptProcessed({
        ...extractedData,
        imageData: uploadedImage,
      });
    }
  }, [extractedData, uploadedImage, onReceiptProcessed]);

  // Reset scanner state
  const resetScanner = useCallback(() => {
    setUploadedImage(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
    setShowImagePreview(false);

    // Clean up object URLs
    if (uploadedImage?.url) {
      URL.revokeObjectURL(uploadedImage.url);
    }
  }, [uploadedImage?.url]);

  // Toggle image preview
  const toggleImagePreview = useCallback(() => {
    setShowImagePreview((prev: boolean) => !prev);
  }, []);

  return {
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
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleFileInputChange,
    handleConfirmReceipt,
    resetScanner,
    toggleImagePreview,
  };
};
