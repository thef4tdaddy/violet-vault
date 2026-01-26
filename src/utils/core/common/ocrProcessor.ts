/**
 * OCR Processing utility for receipt and document scanning
 * Uses Python backend OCR service via service mesh
 */

import logger from "@/utils/core/common/logger";
import { ocrClient } from "@/utils/core/api/client";

interface OCRResult {
  text: string;
  confidence: number;
  words: unknown[];
  lines: unknown[];
  processingTime: number;
}

interface ReceiptData {
  total: string | null;
  merchant: string | null;
  date: string | null;
  time: string | null;
  tax: string | null;
  subtotal: string | null;
  items: Array<{ description: string; amount: number; rawLine: string }>;
  confidence: Record<string, string>;
}

interface ExtendedReceiptData extends ReceiptData {
  rawText: string;
  processingTime: number;
}

interface OCROptions {
  language?: string;
  preprocessing?: boolean;
  psm?: number;
  oem?: number;
}

interface OCRAPIResponse {
  success: boolean;
  data: {
    merchant: string | null;
    total: number | null;
    subtotal: number | null;
    tax: number | null;
    date: string | null;
    currency: string;
    line_items: Array<{
      description: string;
      quantity: number | null;
      unit_price: number | null;
      total_price: number | null;
      confidence: number;
    }>;
    raw_text: string;
    confidence_scores: {
      merchant: number;
      total: number;
      date: number;
      overall: number;
    };
  } | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

/**
 * OCR Processing utility for receipt and document scanning
 * Uses Python backend with Tesseract via service mesh
 */
export class OCRProcessor {
  isInitialized: boolean;

  constructor() {
    this.isInitialized = true; // Backend service is always available
  }

  /**
   * Initialize the OCR processor (no-op for backend service)
   */
  async initialize(): Promise<void> {
    // Backend service is always ready, but we can use this for health checks
    this.isInitialized = true;
    logger.info("✅ OCR processor ready (using backend service)");
  }

  /**
   * Convert image source to base64 string
   */
  private async convertToBase64(imageSource: File | Blob | string): Promise<string> {
    if (typeof imageSource === "string") {
      // Already a base64 string or data URL
      return imageSource;
    }

    // Convert File/Blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(imageSource);
    });
  }

  /**
   * Process an image and extract text using backend OCR service
   * @param imageSource - Image file, blob, or data URL
   * @param options - OCR processing options
   * @returns OCR result with text and confidence
   */
  async processImage(
    imageSource: File | Blob | string,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    try {
      logger.info("🔍 Processing image with backend OCR service...");
      const startTime = Date.now();

      // Convert image to base64
      const base64Image = await this.convertToBase64(imageSource);

      // Call backend OCR API
      const response = await ocrClient.post<OCRAPIResponse>(
        "/receipts/extract",
        {
          image_base64: base64Image,
          options: {
            language: options.language || "eng",
            preprocessing: options.preprocessing !== false, // Default true
            psm: options.psm || 6,
            oem: options.oem || 3,
          },
        },
        {
          maxAttempts: 2,
          retryOptions: {
            shouldRetry: (error) => {
              // Don't retry on 4xx client errors
              const errorStr = String(error);
              return !errorStr.includes("400") && !errorStr.includes("422");
            },
          },
        }
      );

      const processingTime = Date.now() - startTime;

      if (!response.success || !response.data) {
        throw new Error(response.error || "OCR extraction failed");
      }

      logger.info("✅ OCR processing completed", {
        confidence: response.data.confidence_scores.overall,
        processingTimeMs: processingTime,
        textLength: response.data.raw_text.length,
      });

      return {
        text: response.data.raw_text,
        confidence: response.data.confidence_scores.overall * 100, // Convert to percentage
        words: [], // Backend doesn't return word-level data
        lines: [], // Backend doesn't return line-level data
        processingTime,
      };
    } catch (error) {
      logger.error("❌ OCR processing failed:", error);
      throw new Error(
        `Failed to process image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Process a receipt image and extract structured data
   * @param imageSource - Receipt image
   * @param options - OCR processing options
   * @returns Extracted receipt data
   */
  async processReceipt(
    imageSource: File | Blob | string,
    options: OCROptions = {}
  ): Promise<ExtendedReceiptData> {
    try {
      logger.info("🔍 Processing receipt with backend OCR service...");
      const startTime = Date.now();

      // Convert image to base64
      const base64Image = await this.convertToBase64(imageSource);

      // Call backend OCR API
      const response = await ocrClient.post<OCRAPIResponse>(
        "/receipts/extract",
        {
          image_base64: base64Image,
          options: {
            language: options.language || "eng",
            preprocessing: options.preprocessing !== false,
            psm: options.psm || 6,
            oem: options.oem || 3,
          },
        },
        {
          maxAttempts: 2,
          retryOptions: {
            shouldRetry: (error) => {
              const errorStr = String(error);
              return !errorStr.includes("400") && !errorStr.includes("422");
            },
          },
        }
      );

      const processingTime = Date.now() - startTime;

      if (!response.success || !response.data) {
        throw new Error(response.error || "Receipt extraction failed");
      }

      const data = response.data;

      // Convert backend format to frontend format
      const extractedData: ExtendedReceiptData = {
        total: data.total !== null ? data.total.toString() : null,
        merchant: data.merchant,
        date: data.date,
        time: null, // Backend doesn't extract time separately
        tax: data.tax !== null ? data.tax.toString() : null,
        subtotal: data.subtotal !== null ? data.subtotal.toString() : null,
        items: data.line_items.map((item) => ({
          description: item.description,
          amount: item.total_price || 0,
          rawLine: item.description,
        })),
        confidence: {
          merchant: this.mapConfidence(data.confidence_scores.merchant),
          total: this.mapConfidence(data.confidence_scores.total),
          date: this.mapConfidence(data.confidence_scores.date),
        },
        rawText: data.raw_text,
        processingTime,
      };

      logger.info("✅ Receipt processing completed", {
        merchant: extractedData.merchant,
        total: extractedData.total,
        confidence: data.confidence_scores.overall,
      });

      return extractedData;
    } catch (error) {
      logger.error("❌ Receipt processing failed:", error);
      throw new Error(
        `Failed to process receipt: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Map confidence score (0-1) to confidence level string
   */
  private mapConfidence(score: number): string {
    if (score >= 0.8) return "high";
    if (score >= 0.5) return "medium";
    if (score > 0) return "low";
    return "none";
  }

  /**
   * Extract structured data from receipt text (kept for backwards compatibility)
   * Note: This is now handled by the backend, but kept for compatibility
   */
  extractReceiptData(_text: string): ReceiptData {
    logger.warn("extractReceiptData is deprecated. Use processReceipt instead.");
    return {
      total: null,
      merchant: null,
      date: null,
      time: null,
      tax: null,
      subtotal: null,
      items: [],
      confidence: {},
    };
  }

  /**
   * Extract line items (kept for backwards compatibility)
   */
  extractLineItems(_text: string): Array<{ description: string; amount: number; rawLine: string }> {
    logger.warn("extractLineItems is deprecated. Use processReceipt instead.");
    return [];
  }

  /**
   * Clean extracted data (kept for backwards compatibility)
   */
  cleanExtractedData(_data: ReceiptData): void {
    logger.warn("cleanExtractedData is deprecated. Backend handles data cleaning.");
  }

  /**
   * Get processing statistics
   */
  getStats(): { isInitialized: boolean; workerStatus: string } {
    return {
      isInitialized: this.isInitialized,
      workerStatus: "backend_service",
    };
  }

  /**
   * Cleanup (no-op for backend service)
   */
  async cleanup(): Promise<void> {
    logger.info("🔍 OCR processor cleanup (no-op for backend service)");
  }
}

// Create singleton instance
export const ocrProcessor = new OCRProcessor();

// Utility function for quick receipt processing
export const processReceiptImage = async (
  imageSource: File | Blob | string,
  options: OCROptions = {}
): Promise<ExtendedReceiptData> => {
  return await ocrProcessor.processReceipt(imageSource, options);
};

// Utility function to preload OCR (no-op for backend service)
export const preloadOCR = async (): Promise<void> => {
  try {
    await ocrProcessor.initialize();
    logger.info("🔍 OCR processor ready");
  } catch (error) {
    logger.warn("Failed to initialize OCR processor:", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
