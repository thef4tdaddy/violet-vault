import logger from "../common/logger";
import { optimizedSerialization } from "./optimizedSerialization";
import { safeCryptoOperation, getRandomBytes } from "./cryptoCompat";

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
        encryptedDataType: typeof encryptedData,
        encryptedDataLength: (encryptedData as any[])?.length,
        hasKey: !!key,
        keyType: typeof key,
        hasIv: !!iv,
        ivType: typeof iv,
        ivLength: (iv as any[])?.length,
      });

      const decrypted = await safeCryptoOperation(
        "decrypt",
        { name: "AES-GCM", iv: new Uint8Array(iv as any[]) },
        key,
        new Uint8Array(encryptedData as any[])
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
    const decrypted = await safeCryptoOperation(
      "decrypt",
      { name: "AES-GCM", iv: new Uint8Array(iv as any[]) },
      key,
      new Uint8Array(encryptedData as any[])
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

      // Step 1: Analyze compression potential
      const analysis = optimizedSerialization.analyzeCompression(data);
      logger.debug("Compression analysis", {
        originalSize: analysis?.originalSize || 0,
        expectedReduction: analysis?.totalReduction?.toFixed(2) + "x" || "0x",
        spaceSaved: analysis?.spaceSavedPercent + "%" || "0%",
      });

      // Step 2: Serialize with compression and MessagePack
      const compressedData = optimizedSerialization.serialize(data);

      // Step 3: Encrypt the compressed binary data
      const iv = getRandomBytes(12);
      const encrypted = await safeCryptoOperation(
        "encrypt",
        { name: "AES-GCM", iv: iv },
        key,
        compressedData
      );

      const duration = performance.now() - startTime;

      logger.info("Optimized encryption complete", {
        originalSize: analysis?.originalSize || 0,
        compressedSize: compressedData.length,
        encryptedSize: encrypted.byteLength,
        compressionRatio: ((analysis?.originalSize || 0) / compressedData.length).toFixed(2) + "x",
        totalReduction: ((analysis?.originalSize || 0) / encrypted.byteLength).toFixed(2) + "x",
        duration: Math.round(duration) + "ms",
      });

      return {
        data: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
        metadata: {
          compressionRatio: analysis?.totalReduction || 0,
          originalSize: analysis?.originalSize || 0,
          compressedSize: compressedData.length,
          encryptedSize: encrypted.byteLength,
          optimized: true,
        },
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
  async decryptOptimized(encryptedData: unknown, key: unknown) {
    try {
      // Step 1: Decrypt data
      const iv = (encryptedData as any)?.iv || [];
      const data = (encryptedData as any)?.data || [];
      const encrypted = new Uint8Array(data);

      const decrypted = await safeCryptoOperation(
        "decrypt",
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        encrypted
      );

      // Step 2: Decompress using MessagePack
      const decompressedData = optimizedSerialization.deserialize(decrypted);

      // Check for compression metadata
      const metadata = (encryptedData as any)?.metadata || {};
      const wasOptimized = metadata?.optimized || false;

      logger.info("Optimized decryption complete", {
        wasOptimized,
        compressedSize: encrypted.length,
        decompressedSize: decompressedData?.length || 0,
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
