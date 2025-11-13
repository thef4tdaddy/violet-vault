/**
 * Screenshot Capture Service
 * Handles multiple screenshot capture methods and fallbacks
 * Extracted from useBugReport.js for Issue #513
 */
import logger from "../../utils/common/logger";

/**
 * Screenshot capture options
 */
export interface ScreenshotOptions {
  compress?: boolean;
}

/**
 * Screenshot information
 */
export interface ScreenshotInfo {
  size: number;
  sizeKB: number;
  format: string;
  timestamp: string;
}

export class ScreenshotService {
  /**
   * Capture screenshot with multiple fallback methods and auto-compression
   * @param {Object} options - Capture options
   * @param {boolean} options.compress - Whether to auto-compress (default: true)
   * @returns {Promise<string>} Base64 encoded screenshot data URL
   */
  static async captureScreenshot(options: ScreenshotOptions = {}): Promise<string | null> {
    const { compress = true } = options;

    try {
      let screenshot: string | null = null;

      // Try modern native screenshot API first (requires user interaction)
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === "function") {
        try {
          screenshot = await this.captureWithDisplayMedia();
        } catch (error) {
          logger.warn(
            "Native screen capture failed, falling back",
            error as Record<string, unknown>
          );
        }
      }

      // Fallback to html2canvas with timeout
      if (!screenshot) {
        try {
          screenshot = await this.captureWithHtml2Canvas();
        } catch (error) {
          logger.warn(
            "html2canvas capture failed, using final fallback",
            error as Record<string, unknown>
          );
          screenshot = await this.captureFallbackMethod();
        }
      }

      // Auto-compress screenshot if enabled and captured
      if (screenshot && compress) {
        screenshot = await this.autoCompressScreenshot(screenshot);
      }

      return screenshot;
    } catch (error) {
      logger.error("Screenshot capture failed completely", error);
      return null;
    }
  }

  /**
   * Detect if device is mobile
   * @returns {boolean}
   */
  static detectMobileDevice() {
    return (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
  }

  /**
   * Capture using native getDisplayMedia API
   * @returns {Promise<string>}
   */
  static async captureWithDisplayMedia() {
    logger.debug("Attempting native screen capture API (user interaction required)");

    // This requires user permission and interaction
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 1, max: 5 },
      },
      audio: false,
    });

    // Create video element to capture frame
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    // Create canvas and capture frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    ctx.drawImage(video, 0, 0);
    const screenshotDataUrl = canvas.toDataURL("image/png", 0.8);

    // Clean up
    stream.getTracks().forEach((track) => track.stop());
    video.remove();

    logger.info("Native screenshot captured successfully");
    return screenshotDataUrl;
  }

  /**
   * Capture using html2canvas library with timeout
   * @returns {Promise<string>}
   */
  static async captureWithHtml2Canvas() {
    logger.debug("Attempting html2canvas screen capture");

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Screenshot timeout after 10 seconds")), 10000)
    );

    // Dynamically import html2canvas
    const html2canvas = (await import("html2canvas")).default;

    const screenshotPromise = html2canvas(document.body, {
      height: window.innerHeight,
      width: window.innerWidth,
      useCORS: true,
      allowTaint: false,
      scale: 0.8,
    });

    const canvas = (await Promise.race([screenshotPromise, timeoutPromise])) as HTMLCanvasElement;
    const screenshotDataUrl = canvas.toDataURL("image/png", 0.8);

    logger.info("html2canvas screenshot captured successfully");
    return screenshotDataUrl;
  }

  /**
   * Final fallback method using reduced quality settings
   * @returns {Promise<string>}
   */
  static async captureFallbackMethod() {
    logger.debug("Using fallback screenshot method");

    try {
      // Try html2canvas with very lenient settings
      const html2canvas = (await import("html2canvas")).default;
      const fallbackCanvas = await html2canvas(document.body, {
        height: Math.min(window.innerHeight, 800),
        width: Math.min(window.innerWidth, 1200),
        useCORS: true,
        allowTaint: true,
        scale: 0.5,
        logging: false,
        onclone: (clonedDoc) => {
          // Remove potentially problematic elements
          const problematicElements = clonedDoc.querySelectorAll(
            "iframe, embed, object, canvas[data-html2canvas-ignore]"
          );
          problematicElements.forEach((el) => el.remove());
        },
      });

      const fallbackDataUrl = fallbackCanvas.toDataURL("image/png", 0.3);
      logger.info("Fallback screenshot captured successfully");
      return fallbackDataUrl;
    } catch {
      logger.warn("Fallback html2canvas failed, using manual canvas method");
      return await this.captureManualCanvas();
    }
  }

  /**
   * Manual canvas method as last resort
   * @returns {Promise<string>}
   */
  static async captureManualCanvas(): Promise<string | null> {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      canvas.width = Math.min(window.innerWidth, 1200);
      canvas.height = Math.min(window.innerHeight, 800);

      // Create a simple visual representation
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add app title and basic info
      ctx.fillStyle = "#333";
      ctx.font = "24px Arial, sans-serif";
      ctx.textAlign = "center";

      const pageTitle = document.title || "Unknown Page";
      ctx.fillText(pageTitle, canvas.width / 2, 50);

      // Add current URL
      ctx.font = "14px Arial, sans-serif";
      ctx.fillText(window.location.href, canvas.width / 2, 80);

      // Try to capture some visual elements
      const activeTab = document.querySelector("[aria-selected='true'], .active, .selected");
      if (activeTab) {
        ctx.fillText(`Active Tab: ${activeTab.textContent?.trim() ?? ""}`, canvas.width / 2, 110);
      }

      const fallbackDataUrl = canvas.toDataURL("image/png", 0.8);
      logger.info("Manual canvas screenshot created");
      return fallbackDataUrl;
    } catch (error) {
      logger.error("All screenshot methods failed", error);
      return null;
    }
  }

  /**
   * Compress screenshot to reduce file size
   * @param {string} dataUrl - Original screenshot data URL
   * @param {Object} options - Compression options
   * @param {number} options.quality - JPEG quality (0.1 - 1.0, default: 0.7)
   * @param {number} options.maxWidth - Maximum width (default: 1920)
   * @param {number} options.maxHeight - Maximum height (default: 1080)
   * @param {string} options.format - Output format ('jpeg' or 'webp', default: 'jpeg')
   * @returns {Promise<string>} Compressed screenshot data URL
   */
  static async compressScreenshot(
    dataUrl: string,
    options: {
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
      format?: string;
    } = {}
  ): Promise<string> {
    try {
      const { quality = 0.7, maxWidth = 1920, maxHeight = 1080, format = "jpeg" } = options;

      logger.debug("Compressing screenshot", {
        quality,
        maxWidth,
        maxHeight,
        format,
      });

      // Create image from data URL
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw compressed image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Improve compression quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image at new size
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed format
      const mimeType = format === "webp" ? "image/webp" : "image/jpeg";
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);

      const originalSize = this.getScreenshotInfo(dataUrl);
      const compressedSize = this.getScreenshotInfo(compressedDataUrl);

      logger.info("Screenshot compressed", {
        originalSizeKB: originalSize?.sizeKB ?? 0,
        compressedSizeKB: compressedSize?.sizeKB ?? 0,
        compressionRatio:
          originalSize && compressedSize
            ? Math.round((1 - compressedSize.sizeKB / originalSize.sizeKB) * 100)
            : 0,
        newDimensions: `${width}x${height}`,
      });

      return compressedDataUrl;
    } catch (error) {
      logger.error("Screenshot compression failed", error);
      // Return original if compression fails
      return dataUrl;
    }
  }

  /**
   * Auto-compress screenshot based on size
   * @param {string} dataUrl - Screenshot data URL
   * @returns {Promise<string>} Potentially compressed screenshot
   */
  static async autoCompressScreenshot(dataUrl: string | null): Promise<string | null> {
    if (!dataUrl) return dataUrl;

    const info = this.getScreenshotInfo(dataUrl);
    if (!info) return dataUrl;

    // Compress if over 200KB
    if (info.sizeKB > 200) {
      logger.debug(`Screenshot is ${info.sizeKB}KB, applying compression`);

      // Aggressive compression for very large screenshots
      if (info.sizeKB > 1000) {
        return this.compressScreenshot(dataUrl, {
          quality: 0.5,
          maxWidth: 1280,
          maxHeight: 720,
          format: "jpeg",
        });
      }

      // Moderate compression for medium-large screenshots
      if (info.sizeKB > 500) {
        return this.compressScreenshot(dataUrl, {
          quality: 0.6,
          maxWidth: 1600,
          maxHeight: 900,
          format: "jpeg",
        });
      }

      // Light compression for slightly large screenshots
      return this.compressScreenshot(dataUrl, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });
    }

    return dataUrl;
  }

  /**
   * Get screenshot file info
   * @param {string} dataUrl - Base64 data URL
   * @returns {Object}
   */
  static getScreenshotInfo(dataUrl: string): ScreenshotInfo {
    if (!dataUrl) return { size: 0, sizeKB: 0, format: "", timestamp: new Date().toISOString() };

    const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const format = dataUrl.includes("data:image/jpeg")
      ? "jpeg"
      : dataUrl.includes("data:image/webp")
        ? "webp"
        : "png";

    return {
      size: sizeInBytes,
      sizeKB: sizeInKB,
      format,
      timestamp: new Date().toISOString(),
    };
  }
}
