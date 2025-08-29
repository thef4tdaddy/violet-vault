import React, { useState, useCallback, useRef } from "react";
import {
  Camera,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { processReceiptImage } from "../../utils/common/ocrProcessor";
import logger from "../../utils/common/logger";

/**
 * Receipt Scanner Component
 * Handles image upload, camera capture, and OCR processing
 */
const ReceiptScanner = ({ onReceiptProcessed, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Please use a file smaller than 10MB.");
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
      setError(
        "Failed to process receipt. Please try again with a clearer image.",
      );
      setExtractedData(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Confirm and create transaction
  const handleConfirmReceipt = () => {
    if (extractedData && onReceiptProcessed) {
      onReceiptProcessed({
        ...extractedData,
        imageData: uploadedImage,
      });
    }
  };

  // Reset state
  const resetScanner = () => {
    setUploadedImage(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
    setShowImagePreview(false);

    // Clean up object URLs
    if (uploadedImage?.url) {
      URL.revokeObjectURL(uploadedImage.url);
    }
  };

  // Render confidence indicator
  const renderConfidenceIndicator = (field, confidence) => {
    const confidenceMap = {
      high: { color: "text-green-600", icon: CheckCircle },
      medium: { color: "text-yellow-600", icon: CheckCircle },
      low: { color: "text-red-600", icon: XCircle },
      none: { color: "text-gray-400", icon: XCircle },
    };

    const conf = confidenceMap[confidence] || confidenceMap.none;
    const Icon = conf.icon;

    return <Icon className={`h-4 w-4 ${conf.color}`} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-xl">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Receipt Scanner
                </h2>
                <p className="text-sm text-gray-500">
                  Upload or capture a receipt to extract transaction details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              ×
            </button>
          </div>

          {/* Upload Area */}
          {!uploadedImage && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Upload className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload Receipt Image
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop an image here, or click to browse
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Browse Files
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Take Photo
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, and other image formats • Max 10MB
                </p>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="bg-purple-100 p-4 rounded-2xl inline-block mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                Processing Receipt...
              </p>
              <p className="text-sm text-gray-500">
                Using AI to extract transaction details
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">Processing Failed</p>
              </div>
              <p className="text-red-600 text-sm mt-2">{error}</p>
              <button
                onClick={resetScanner}
                className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {extractedData && !isProcessing && (
            <div className="space-y-6">
              {/* Image Preview */}
              {uploadedImage && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">
                      Scanned Receipt
                    </h3>
                    <button
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                    >
                      <Eye className="h-4 w-4" />
                      {showImagePreview ? "Hide" : "Show"} Image
                    </button>
                  </div>

                  {showImagePreview && (
                    <div className="mt-3">
                      <img
                        src={uploadedImage.url}
                        alt="Receipt"
                        className="max-w-full h-auto rounded-xl max-h-64 object-contain mx-auto"
                      />
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    {uploadedImage.name} •{" "}
                    {Math.round(uploadedImage.size / 1024)} KB
                  </div>
                </div>
              )}

              {/* Extracted Data */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <h3 className="font-medium text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Extracted Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Merchant:</span>
                      <div className="flex items-center gap-2">
                        {renderConfidenceIndicator(
                          "merchant",
                          extractedData.confidence.merchant,
                        )}
                        <span className="font-medium">
                          {extractedData.merchant || "Not detected"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Amount:
                      </span>
                      <div className="flex items-center gap-2">
                        {renderConfidenceIndicator(
                          "total",
                          extractedData.confidence.total,
                        )}
                        <span className="font-medium">
                          {extractedData.total
                            ? `$${extractedData.total.toFixed(2)}`
                            : "Not detected"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <div className="flex items-center gap-2">
                        {renderConfidenceIndicator(
                          "date",
                          extractedData.confidence.date,
                        )}
                        <span className="font-medium">
                          {extractedData.date || "Not detected"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {extractedData.tax && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tax:</span>
                        <div className="flex items-center gap-2">
                          {renderConfidenceIndicator(
                            "tax",
                            extractedData.confidence.tax,
                          )}
                          <span className="font-medium">
                            ${extractedData.tax.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {extractedData.subtotal && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <div className="flex items-center gap-2">
                          {renderConfidenceIndicator(
                            "subtotal",
                            extractedData.confidence.subtotal,
                          )}
                          <span className="font-medium">
                            ${extractedData.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Processing time: {extractedData.processingTime}ms
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                {extractedData.items && extractedData.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="font-medium text-green-900 mb-3">
                      Items Found ({extractedData.items.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {extractedData.items.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700 truncate flex-1">
                            {item.description}
                          </span>
                          <span className="font-medium ml-2">
                            ${item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {extractedData.items.length > 5 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{extractedData.items.length - 5} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetScanner}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleConfirmReceipt}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  disabled={!extractedData.total && !extractedData.merchant}
                >
                  Create Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;
