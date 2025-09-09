import Tesseract from "tesseract.js";
import logger from "../common/logger";

/**
 * OCR Processing utility for receipt and document scanning
 * Uses Tesseract.js for client-side OCR processing
 */
export class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the OCR worker
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info("🔍 Initializing OCR worker...");
      this.worker = await Tesseract.createWorker();

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
   * @param {File|Blob|string} imageSource - Image file, blob, or data URL
   * @returns {Promise<Object>} OCR result with text and confidence
   */
  async processImage(imageSource) {
    if (!this.isInitialized) {
      await this.initialize();
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
   * @param {File|Blob|string} imageSource - Receipt image
   * @returns {Promise<Object>} Extracted receipt data
   */
  async processReceipt(imageSource) {
    const ocrResult = await this.processImage(imageSource);
    const extractedData = this.extractReceiptData(ocrResult.text);

    return {
      ...extractedData,
      rawText: ocrResult.text,
      confidence: ocrResult.confidence,
      processingTime: ocrResult.processingTime,
    };
  }

  /**
   * Extract structured data from receipt text using pattern matching
   * @param {string} text - Raw OCR text
   * @returns {Object} Structured receipt data
   */
  extractReceiptData(text) {
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
      subtotal: [
        /sub\s*total:?\s*\$?(\d+\.\d{2})/i,
        /subtotal:?\s*\$?(\d+\.\d{2})/i,
      ],
    };

    const extracted = {
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
          extracted[field] = match[1]?.trim();
          extracted.confidence[field] = "high";
          break; // Use first match
        }
      }

      if (!extracted[field]) {
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
   * @param {string} text - Raw OCR text
   * @returns {Array} Array of line items
   */
  extractLineItems(text) {
    const lines = text.split("\n");
    const items = [];

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
   * @param {Object} data - Extracted data to clean
   */
  cleanExtractedData(data) {
    // Clean total amount
    if (data.total) {
      data.total = parseFloat(data.total.replace(/[^0-9.]/g, ""));
      if (isNaN(data.total) || data.total <= 0) {
        data.total = null;
        data.confidence.total = "none";
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
    ["tax", "subtotal"].forEach((field) => {
      if (data[field]) {
        data[field] = parseFloat(data[field].replace(/[^0-9.]/g, ""));
        if (isNaN(data[field]) || data[field] < 0) {
          data[field] = null;
          data.confidence[field] = "none";
        }
      }
    });
  }

  /**
   * Get processing statistics and accuracy metrics
   * @returns {Object} OCR processor stats
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      workerStatus: this.worker ? "ready" : "not_initialized",
      // Could add more stats like total processed, avg confidence, etc.
    };
  }

  /**
   * Cleanup the OCR worker
   */
  async cleanup() {
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
export const processReceiptImage = async (imageSource) => {
  return await ocrProcessor.processReceipt(imageSource);
};

// Utility function to preload OCR worker (call on app init)
export const preloadOCR = async () => {
  try {
    await ocrProcessor.initialize();
    logger.info("🔍 OCR preloaded successfully");
  } catch (error) {
    logger.warn("Failed to preload OCR:", error);
  }
};
