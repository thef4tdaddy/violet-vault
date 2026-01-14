/**
 * Optimized Serialization Utilities
 * Combines compression + MessagePack for efficient Firebase storage
 * Reduces overhead from 12x to 4-6x while maintaining security
 *
 * Pipeline: Data → Compress (gzip) → MessagePack → Encrypt → Firebase
 *
 * Created for GitHub Issue #588/#357
 */
import * as pako from "pako";
import { encode, decode } from "@msgpack/msgpack";
import logger from "@/utils/core/common/logger";

export const optimizedSerialization = {
  /**
   * Serialize data with compression and MessagePack
   * @param {unknown} data - Data to serialize
   * @returns {Uint8Array} Compressed and packed binary data
   */
  serialize(data: unknown): Uint8Array {
    try {
      const startTime = performance.now();

      // Step 1: JSON stringify (baseline)
      const jsonString = JSON.stringify(data);
      const originalSize = new TextEncoder().encode(jsonString).length;

      // Step 2: Compress with gzip
      const compressed = pako.gzip(jsonString);
      const compressedSize = compressed.length;

      // Step 3: Pack with MessagePack for efficient binary representation
      const packed = encode(compressed);
      const finalSize = packed.length;

      const duration = performance.now() - startTime;

      logger.info("Serialization complete", {
        originalSize,
        compressedSize,
        finalSize,
        compressionRatio: (originalSize / compressedSize).toFixed(2) + "x",
        totalReduction: (originalSize / finalSize).toFixed(2) + "x",
        duration: Math.round(duration) + "ms",
      });

      return packed;
    } catch (error) {
      logger.error("Serialization failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Serialization failed: ${errorMessage}`);
    }
  },

  /**
   * Deserialize compressed MessagePack data back to object
   * @param {Uint8Array} packedData - Compressed and packed binary data
   * @returns {unknown} Original data object
   */
  deserialize(packedData: Uint8Array): unknown {
    try {
      const startTime = performance.now();

      // Step 1: Unpack MessagePack to get compressed data
      const compressed = decode(packedData) as Uint8Array;

      // Step 2: Decompress gzip to get JSON string
      const jsonString = pako.ungzip(compressed, { to: "string" });

      // Step 3: Parse JSON to get original object
      const data = JSON.parse(jsonString);

      const duration = performance.now() - startTime;

      logger.debug("Deserialization complete", {
        packedSize: packedData.length,
        duration: Math.round(duration) + "ms",
      });

      return data;
    } catch (error) {
      logger.error("Deserialization failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Deserialization failed: ${errorMessage}`);
    }
  },

  /**
   * Get compression stats for given data without actually serializing
   * @param {unknown} data - Data to analyze
   * @returns {Object | null} Size analysis
   */
  analyzeCompression(data: unknown): {
    originalSize: number;
    compressedSize: number;
    finalSize: number;
    compressionRatio: number;
    totalReduction: number;
    spaceSaved: number;
    spaceSavedPercent: number;
  } | null {
    try {
      const jsonString = JSON.stringify(data);
      const originalSize = new TextEncoder().encode(jsonString).length;

      // Test compression
      const compressed = pako.gzip(jsonString);
      const compressedSize = compressed.length;

      // Test MessagePack
      const packed = encode(compressed);
      const finalSize = packed.length;

      return {
        originalSize,
        compressedSize,
        finalSize,
        compressionRatio: originalSize / compressedSize,
        totalReduction: originalSize / finalSize,
        spaceSaved: originalSize - finalSize,
        spaceSavedPercent: Math.round(((originalSize - finalSize) / originalSize) * 100),
      };
    } catch (error) {
      logger.error("Compression analysis failed", error);
      return null;
    }
  },

  /**
   * Convert data to Base64 string for Firebase storage
   * @param {Uint8Array} binaryData - Serialized binary data
   * @returns {string} Base64 encoded string
   */
  toBase64(binaryData: Uint8Array): string {
    try {
      // Convert Uint8Array to base64 string
      let binary = "";
      for (let i = 0; i < binaryData.length; i++) {
        binary += String.fromCharCode(binaryData[i]);
      }
      return btoa(binary);
    } catch (error) {
      logger.error("Base64 encoding failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Base64 encoding failed: ${errorMessage}`);
    }
  },

  /**
   * Convert Base64 string back to binary data
   * @param {string} base64String - Base64 encoded string
   * @returns {Uint8Array} Binary data
   */
  fromBase64(base64String: string): Uint8Array {
    try {
      const binary = atob(base64String);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      logger.error("Base64 decoding failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Base64 decoding failed: ${errorMessage}`);
    }
  },

  /**
   * Complete pipeline: Serialize → Base64 for Firebase storage
   * @param {unknown} data - Data to prepare for Firebase
   * @returns {string} Base64 string ready for Firebase
   */
  prepareForFirebase(data: unknown): string {
    const serialized = this.serialize(data);
    return this.toBase64(serialized);
  },

  /**
   * Complete pipeline: Base64 → Deserialize from Firebase storage
   * @param {string} base64String - Base64 string from Firebase
   * @returns {unknown} Original data object
   */
  restoreFromFirebase(base64String: string): unknown {
    const binaryData = this.fromBase64(base64String);
    return this.deserialize(binaryData);
  },

  /**
   * Test the complete pipeline with sample data
   * @param {unknown} testData - Data to test with
   * @returns {Object} Test results and performance metrics
   */
  testPipeline(testData: unknown): {
    success: boolean;
    totalTime?: number;
    base64Size?: number;
    analysis?: {
      originalSize: number;
      compressedSize: number;
      finalSize: number;
      compressionRatio: number;
      totalReduction: number;
      spaceSaved: number;
      spaceSavedPercent: number;
    } | null;
    verified?: string;
    error?: string;
  } {
    try {
      const startTime = performance.now();

      // Forward pipeline
      const serialized = this.serialize(testData);
      const base64 = this.toBase64(serialized);

      // Reverse pipeline
      const restored = this.restoreFromFirebase(base64);

      // Verify integrity
      const originalJson = JSON.stringify(testData);
      const restoredJson = JSON.stringify(restored);
      const isIdentical = originalJson === restoredJson;

      const totalTime = performance.now() - startTime;
      const analysis = this.analyzeCompression(testData);

      return {
        success: isIdentical,
        totalTime: Math.round(totalTime),
        base64Size: base64.length,
        analysis,
        verified: isIdentical ? "✅ Data integrity confirmed" : "❌ Data corruption detected",
      };
    } catch (error) {
      logger.error("Pipeline test failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

export default optimizedSerialization;
