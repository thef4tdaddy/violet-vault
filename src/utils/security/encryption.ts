import logger from "../common/logger";
import { optimizedSerialization } from "./optimizedSerialization";
import { safeCryptoOperation, getRandomBytes } from "./cryptoCompat";
type CompressionAnalysis = ReturnType<typeof optimizedSerialization.analyzeCompression>;

const toUint8Array = (value: unknown, debugLabel?: string): Uint8Array => {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(
      value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)
    );
  }

  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }

  if (typeof value === "object" && value !== null && "length" in (value as ArrayLike<number>)) {
    return new Uint8Array(Array.from(value as ArrayLike<number>));
  }

  logger.warn("Received unsupported byte structure for Uint8Array conversion", {
    label: debugLabel,
    valueType: typeof value,
  });
  throw new TypeError("Unsupported byte structure");
};

const describeByteSource = (value: unknown) => {
  if (value instanceof Uint8Array) {
    return { length: value.length, type: "Uint8Array" };
  }
  if (ArrayBuffer.isView(value)) {
    return { length: value.byteLength, type: value.constructor.name };
  }
  if (value instanceof ArrayBuffer) {
    return { length: value.byteLength, type: "ArrayBuffer" };
  }
  if (Array.isArray(value)) {
    return { length: value.length, type: "Array<number>" };
  }
  return { length: undefined, type: typeof value };
};

const runCompressionPipeline = (data: unknown) => {
  const analysis = optimizedSerialization.analyzeCompression(data);
  const serializedData = optimizedSerialization.serialize(data);
  return { analysis, serializedData };
};

const logCompressionAnalysis = (analysis: CompressionAnalysis) => {
  if (!analysis) {
    return;
  }
  logger.debug("Compression analysis", {
    originalSize: analysis.originalSize || 0,
    expectedReduction: `${analysis.totalReduction?.toFixed(2) ?? "0"}x`,
    spaceSaved: `${analysis.spaceSavedPercent ?? 0}%`,
  });
};

const buildOptimizedEncryptionMetadata = (
  analysis: CompressionAnalysis,
  compressedLength: number,
  encryptedLength: number
) => ({
  compressionRatio: analysis?.totalReduction || 0,
  originalSize: analysis?.originalSize || 0,
  compressedSize: compressedLength,
  encryptedSize: encryptedLength,
  optimized: true,
});

const logOptimizedEncryptionSummary = (
  analysis: CompressionAnalysis,
  compressedLength: number,
  encryptedLength: number,
  durationMs: number
) => {
  const originalSize = analysis?.originalSize || 0;
  const compressionRatio =
    compressedLength > 0 ? (originalSize / compressedLength).toFixed(2) : "0.00";
  const totalReduction = encryptedLength > 0 ? (originalSize / encryptedLength).toFixed(2) : "0.00";

  logger.info("Optimized encryption complete", {
    originalSize,
    compressedSize: compressedLength,
    encryptedSize: encryptedLength,
    compressionRatio: `${compressionRatio}x`,
    totalReduction: `${totalReduction}x`,
    duration: `${Math.round(durationMs)}ms`,
  });
};

export const encryptionUtils = {
  async deriveKey(password: string) {
    return this.generateKey(password);
  },

  async deriveKeyFromSalt(password: string, salt: Uint8Array) {
    const encoder = new TextEncoder();
    const keyMaterial = await safeCryptoOperation(
      "importKey",
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await safeCryptoOperation(
      "deriveKey",
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    return key;
  },

  async generateKey(password: string) {
    const encoder = new TextEncoder();
    const keyMaterial = await safeCryptoOperation(
      "importKey",
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Generate deterministic salt from password to ensure same password = same key
    const passwordBytes = encoder.encode(password + "VioletVault_Salt");
    const saltHash = await safeCryptoOperation("digest", "SHA-256", passwordBytes);
    const salt = new Uint8Array(saltHash.slice(0, 16));

    const key = await safeCryptoOperation(
      "deriveKey",
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    return { key, salt };
  },

  async encrypt(data: unknown, key: unknown) {
    const encoder = new TextEncoder();
    const iv = getRandomBytes(12);

    // Handle both string data (already JSON stringified) and object data
    const stringData = typeof data === "string" ? data : JSON.stringify(data);

    const encrypted = await safeCryptoOperation(
      "encrypt",
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(stringData)
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  },

  async decrypt(encryptedData: unknown, key: unknown, iv: unknown) {
    try {
      // Add validation logging for debug
      // Debug logging for decrypt attempts
      logger.debug("🔓 Decrypt attempt:", {
        hasEncryptedData: !!encryptedData,
        encryptedDataType: describeByteSource(encryptedData).type,
        encryptedDataLength: describeByteSource(encryptedData).length,
        hasKey: !!key,
        keyType: typeof key,
        hasIv: !!iv,
        ivType: describeByteSource(iv).type,
        ivLength: describeByteSource(iv).length,
      });

      const ivBytes = toUint8Array(iv, "decrypt-iv");
      const encryptedBytes = toUint8Array(encryptedData, "decrypt-payload");

      const decrypted = await safeCryptoOperation(
        "decrypt",
        { name: "AES-GCM", iv: ivBytes },
        key,
        encryptedBytes
      );

      const decoder = new TextDecoder();
      const result = JSON.parse(decoder.decode(decrypted));
      logger.debug("🔓 Decrypt successful");
      return result;
    } catch (error) {
      logger.error("🔓 Decrypt failed:", {
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : String(error),
        errorType: typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },

  async decryptRaw(encryptedData: unknown, key: unknown, iv: unknown) {
    const ivBytes = toUint8Array(iv, "decrypt-raw-iv");
    const encryptedBytes = toUint8Array(encryptedData, "decrypt-raw-payload");

    const decrypted = await safeCryptoOperation(
      "decrypt",
      { name: "AES-GCM", iv: ivBytes },
      key,
      encryptedBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  },

  generateDeviceFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || "unknown",
      (navigator as { deviceMemory?: number }).deviceMemory || "unknown",
    ].join("|");

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  },

  async generateBudgetId(masterPassword: string, shareCode: string) {
    // NEW: Deterministic budget ID using password + share code
    // Replaces device-specific system with user-controlled share codes
    if (!shareCode) {
      throw new Error("Share code is required for deterministic budget ID generation");
    }

    // Import and validate share code
    const { shareCodeUtils } = await import("./shareCodeUtils");
    const normalizedShareCode = shareCodeUtils.normalizeShareCode(shareCode);

    if (!shareCodeUtils.validateShareCode(normalizedShareCode)) {
      throw new Error("Invalid share code format - must be exactly 4 valid words");
    }

    // Use SHA-256 with password + share code for deterministic cross-device budget ID
    const encoder = new TextEncoder();
    const data = encoder.encode(
      `budget_seed_${masterPassword}_${normalizedShareCode}_violet_vault`
    );
    const hashBuffer = await safeCryptoOperation("digest", "SHA-256", data);
    const hashArray = new Uint8Array(hashBuffer);

    // Convert to hex string and take first 16 characters for reasonable length
    const hashHex = Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const budgetId = `budget_${hashHex.substring(0, 16)}`;

    logger.info("Generated deterministic budget ID", {
      budgetIdPreview: budgetId.substring(0, 10) + "...",
      shareCodePreview: normalizedShareCode.split(" ").slice(0, 2).join(" ") + " ...",
    });

    return budgetId;
  },

  // Legacy budget ID generation removed - all budgets now require share codes

  /**
   * Optimized encryption with compression for Firebase storage
   * Pipeline: Object → Compress → Encrypt → Base64
   * Reduces storage overhead from 12x to 4-6x
   */
  async encryptOptimized(data: unknown, key: unknown) {
    try {
      const startTime = performance.now();

      const { analysis, serializedData } = runCompressionPipeline(data);
      logCompressionAnalysis(analysis);

      const iv = getRandomBytes(12);
      const encrypted = await safeCryptoOperation(
        "encrypt",
        { name: "AES-GCM", iv: iv },
        key,
        serializedData
      );

      const duration = performance.now() - startTime;
      logOptimizedEncryptionSummary(
        analysis,
        serializedData.length,
        encrypted.byteLength,
        duration
      );

      return {
        data: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        metadata: buildOptimizedEncryptionMetadata(
          analysis,
          serializedData.length,
          encrypted.byteLength
        ),
      };
    } catch (error) {
      logger.error("Optimized encryption failed", error as Record<string, unknown>);
      throw error;
    }
  },

  /**
   * Optimized decryption for compressed data
   * Pipeline: Base64 → Decrypt → Decompress → Object
   */
  async decryptOptimized(
    encryptedData: unknown,
    key: unknown,
    legacyIv?: Uint8Array | ArrayBuffer | number[]
  ) {
    try {
      const payload =
        legacyIv !== undefined
          ? {
              iv: toUint8Array(legacyIv, "decrypt-optimized-legacy-iv"),
              data: toUint8Array(encryptedData, "decrypt-optimized-legacy-data"),
              metadata: {},
            }
          : (encryptedData as {
              iv?: Uint8Array | number[] | ArrayBuffer;
              data?: Uint8Array | number[] | ArrayBuffer;
              metadata?: unknown;
            });

      if (!payload.iv || !payload.data) {
        throw new Error("Invalid encrypted payload structure");
      }

      // Step 1: Decrypt data
      const iv = toUint8Array(payload.iv, "decrypt-optimized-iv");
      const encrypted = toUint8Array(payload.data, "decrypt-optimized-data");

      const decrypted = await safeCryptoOperation(
        "decrypt",
        { name: "AES-GCM", iv },
        key,
        encrypted
      );

      // Step 2: Decompress using MessagePack
      const decompressedData = optimizedSerialization.deserialize(decrypted);

      // Check for compression metadata
      const metadata = (payload.metadata as Record<string, unknown>) || {};
      const wasOptimized = metadata?.optimized || false;

      logger.info("Optimized decryption complete", {
        wasOptimized,
        compressedSize: encrypted.length,
        decompressedSize:
          Array.isArray(decompressedData) || typeof decompressedData === "string"
            ? (decompressedData as string | unknown[]).length
            : 0,
        compressionRatio: metadata?.compressionRatio || 1,
      });

      return decompressedData;
    } catch (error) {
      logger.error("Optimized decryption failed", error as Record<string, unknown>);
      throw error;
    }
  },

  generateHash(data: unknown) {
    let hash = 0;
    const str = typeof data === "string" ? data : JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  },
};
