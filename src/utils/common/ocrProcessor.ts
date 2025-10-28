// Tesseract.js loaded dynamically to reduce main bundle size
import logger from "@/utils/common/logger";

interface TesseractWorker {
  loadLanguage(lang: string): Promise<void>;
  initialize(lang: string): Promise<void>;
  setParameters(params: Record<string, unknown>): Promise<void>;
  recognize(image: File | Blob | string): Promise<{
    data: {
      text: string;
      confidence: number;
      words: unknown[];
      lines: unknown[];
    };
  }>;
  terminate(): Promise<void>;
}

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

/**
 * OCR Processing utility for receipt and document scanning
 * Uses Tesseract.js for client-side OCR processing
 */
export class OCRProcessor {
  worker: TesseractWorker | null;
  isInitialized: boolean;

  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the OCR worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info("🔍 Initializing OCR worker...");
      // Dynamic import to avoid adding tesseract.js to main bundle
      const Tesseract = (await import("tesseract.js")).default;
      this.worker = (await Tesseract.createWorker()) as unknown as TesseractWorker;

      await this.worker.loadLanguage("eng");
      await this.worker.initialize("eng");

      // Configure for better accuracy with receipts
      await this.worker.setParameters({
        tessedit_char_whitelist:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/$()- ",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      });

      this.isInitialized = true;
      logger.info("✅ OCR worker initialized successfully");
    } catch (error) {
      logger.error("❌ Failed to initialize OCR worker:", error);
      throw new Error("OCR initialization failed");
    }
  }

  /**
   * Process an image and extract text
   * @param imageSource - Image file, blob, or data URL
   * @returns OCR result with text and confidence
   */
  async processImage(imageSource: File | Blob | string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error("OCR worker not initialized");
    }

    try {
      logger.info("🔍 Processing image with OCR...");
      const startTime = Date.now();

      const result = await this.worker.recognize(imageSource);

      const processingTime = Date.now() - startTime;
      logger.info("✅ OCR processing completed", {
        confidence: result.data.confidence,
        processingTimeMs: processingTime,
        textLength: result.data.text.length,
      });

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        processingTime: processingTime,
      };
    } catch (error) {
      logger.error("❌ OCR processing failed:", error);
      throw new Error("Failed to process image");
    }
  }

  /**
   * Process a receipt image and extract structured data
   * @param imageSource - Receipt image
   * @returns Extracted receipt data
   */
  async processReceipt(imageSource: File | Blob | string): Promise<ExtendedReceiptData> {
    const ocrResult = await this.processImage(imageSource);
    const extractedData = this.extractReceiptData(ocrResult.text);

    return {
      ...extractedData,
      rawText: ocrResult.text,
      processingTime: ocrResult.processingTime,
    };
  }

  /**
   * Extract structured data from receipt text using pattern matching
   * @param text - Raw OCR text
   * @returns Structured receipt data
   */
  extractReceiptData(text: string): ReceiptData {
    const patterns = {
      // Total amount patterns
      total: [
        /total:?\s*\$?(\d+\.\d{2})/i,
        /amount:?\s*\$?(\d+\.\d{2})/i,
        /\$(\d+\.\d{2})\s*total/i,
        /(\d+\.\d{2})\s*$(?!.*\d+\.\d{2})/m, // Last amount on a line
      ],

      // Date patterns
      date: [
        /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
        /(\d{1,2}-\d{1,2}-\d{2,4})/,
        /(\d{4}-\d{1,2}-\d{1,2})/,
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{1,2},?\s*\d{2,4}/i,
      ],

      // Merchant patterns (usually first few lines, all caps)
      merchant: [/^([A-Z\s&'.-]{3,30})$/m, /^([A-Z][A-Za-z\s&'.-]{2,29})$/m],

      // Time patterns
      time: [/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i],

      // Tax patterns
      tax: [/tax:?\s*\$?(\d+\.\d{2})/i, /sales\s*tax:?\s*\$?(\d+\.\d{2})/i],

      // Subtotal patterns
      subtotal: [/sub\s*total:?\s*\$?(\d+\.\d{2})/i, /subtotal:?\s*\$?(\d+\.\d{2})/i],
    };

    const extracted: ReceiptData = {
      total: null,
      merchant: null,
      date: null,
      time: null,
      tax: null,
      subtotal: null,
      items: [],
      confidence: {},
    };

    // Extract each field using patterns
    for (const [field, fieldPatterns] of Object.entries(patterns)) {
      for (const pattern of fieldPatterns) {
        const match = text.match(pattern);
        if (match) {
          (extracted as unknown as Record<string, string | null>)[field] = match[1]?.trim() ?? null;
          extracted.confidence[field] = "high";
          break; // Use first match
        }
      }

      if (!(extracted as unknown as Record<string, string | null>)[field]) {
        extracted.confidence[field] = "none";
      }
    }

    // Extract line items (simplified)
    extracted.items = this.extractLineItems(text);

    // Clean up and validate extracted data
    this.cleanExtractedData(extracted);

    return extracted;
  }

  /**
   * Extract line items from receipt text
   * @param text - Raw OCR text
   * @returns Array of line items
   */
  extractLineItems(text: string): Array<{ description: string; amount: number; rawLine: string }> {
    const lines = text.split("\n");
    const items: Array<{ description: string; amount: number; rawLine: string }> = [];

    const itemPattern = /(.+?)\s+\$?(\d+\.\d{2})$/;

    for (const line of lines) {
      const match = line.trim().match(itemPattern);
      if (match && match[1].length > 2) {
        const description = match[1].trim();
        const amount = parseFloat(match[2]);

        // Filter out likely non-items (totals, taxes, etc.)
        if (!/(total|tax|subtotal|amount|balance)/i.test(description)) {
          items.push({
            description,
            amount,
            rawLine: line.trim(),
          });
        }
      }
    }

    return items.slice(0, 20); // Limit to 20 items to avoid noise
  }

  /**
   * Clean and validate extracted data
   * @param data - Extracted data to clean
   */
  cleanExtractedData(data: ReceiptData): void {
    // Clean total amount
    if (data.total) {
      const cleanedTotal = parseFloat(data.total.replace(/[^0-9.]/g, ""));
      if (isNaN(cleanedTotal) || cleanedTotal <= 0) {
        data.total = null;
        data.confidence.total = "none";
      } else {
        data.total = cleanedTotal.toString();
      }
    }

    // Clean merchant name
    if (data.merchant) {
      data.merchant = data.merchant
        .replace(/[^A-Za-z0-9\s&'.-]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (data.merchant.length < 2) {
        data.merchant = null;
        data.confidence.merchant = "none";
      }
    }

    // Validate and standardize date
    if (data.date) {
      try {
        const parsedDate = new Date(data.date);
        if (isNaN(parsedDate.getTime())) {
          data.date = null;
          data.confidence.date = "none";
        } else {
          data.date = parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
        }
      } catch {
        data.date = null;
        data.confidence.date = "none";
      }
    }

    // Clean tax and subtotal
    (["tax", "subtotal"] as const).forEach((field) => {
      if (data[field]) {
        const cleanedValue = parseFloat((data[field] as string).replace(/[^0-9.]/g, ""));
        if (isNaN(cleanedValue) || cleanedValue < 0) {
          data[field] = null;
          data.confidence[field] = "none";
        } else {
          data[field] = cleanedValue.toString();
        }
      }
    });
  }

  /**
   * Get processing statistics and accuracy metrics
   * @returns OCR processor stats
   */
  getStats(): { isInitialized: boolean; workerStatus: string } {
    return {
      isInitialized: this.isInitialized,
      workerStatus: this.worker ? "ready" : "not_initialized",
      // Could add more stats like total processed, avg confidence, etc.
    };
  }

  /**
   * Cleanup the OCR worker
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
        logger.info("🔍 OCR worker terminated");
      } catch (error) {
        logger.error("Failed to terminate OCR worker:", error);
      }
    }
  }
}

// Create singleton instance
export const ocrProcessor = new OCRProcessor();

// Utility function for quick receipt processing
export const processReceiptImage = async (imageSource: File | Blob | string): Promise<ExtendedReceiptData> => {
  return await ocrProcessor.processReceipt(imageSource);
};

// Utility function to preload OCR worker (call on app init)
export const preloadOCR = async (): Promise<void> => {
  try {
    await ocrProcessor.initialize();
    logger.info("🔍 OCR preloaded successfully");
  } catch (error) {
    logger.warn("Failed to preload OCR:", error);
  }
};
