import logger from "../../utils/common/logger";
import { optimizedSerialization } from "../../utils/security/optimizedSerialization";
import { safeCryptoOperation, getRandomBytes } from "../../utils/security/cryptoCompat";

/**
 * EncryptionManager Service
 * Centralizes all encryption, decryption, and key derivation logic.
 * Supports optimized (compressed) and standard encryption paths.
 */
export class EncryptionManager {
  private static instance: EncryptionManager;
  private currentKey: CryptoKey | null = null;

  private constructor() {}

  public static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * Initialize the manager with a key and salt
   */
  public setKey(key: CryptoKey): void {
    this.currentKey = key;
    logger.debug("EncryptionManager: Key initialized");
  }

  /**
   * Derive a deterministic key and salt from a password
   */
  public async deriveKey(password: string): Promise<{ key: CryptoKey; salt: Uint8Array }> {
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
  }

  /**
   * Encrypt data with compression and metadata (Optimized path)
   * Object -> Compress -> Encrypt -> Payload { data, iv, metadata }
   */
  public async encrypt(
    data: unknown,
    overrideKey?: CryptoKey
  ): Promise<{
    data: number[];
    iv: number[];
    metadata: {
      optimized: boolean;
      originalSize: number;
      compressedSize: number;
      encryptedSize: number;
      compressionRatio: number;
    };
  }> {
    const key = overrideKey || this.currentKey;
    if (!key) throw new Error("EncryptionManager: No key set or provided");

    try {
      const startTime = performance.now();

      // Step 1: Serialize and Compress
      const analysis = optimizedSerialization.analyzeCompression(data);
      const serializedData = optimizedSerialization.serialize(data);

      if (analysis) {
        logger.debug("EncryptionManager: Compression analysis", {
          originalSize: analysis.originalSize,
          reduction: `${analysis.totalReduction.toFixed(2)}x`,
        });
      }

      // Step 2: Encrypt
      const iv = getRandomBytes(12);
      const encrypted = await safeCryptoOperation(
        "encrypt",
        { name: "AES-GCM", iv: iv },
        key,
        serializedData
      );

      const duration = performance.now() - startTime;
      const encryptedArray = new Uint8Array(encrypted);

      const metadata = {
        optimized: true,
        originalSize: analysis?.originalSize || 0,
        compressedSize: serializedData.length,
        encryptedSize: encryptedArray.length,
        compressionRatio: analysis?.totalReduction || 1,
      };

      logger.info("EncryptionManager: Optimized encryption complete", {
        ...metadata,
        duration: `${Math.round(duration)}ms`,
      });

      return {
        data: Array.from(encryptedArray),
        iv: Array.from(iv),
        metadata,
      };
    } catch (error) {
      logger.error("EncryptionManager: Encryption failed", { error });
      throw error;
    }
  }

  /**
   * Decrypt data (handles optimized payloads)
   */
  public async decrypt<T>(
    payload: {
      data: number[] | Uint8Array;
      iv: number[] | Uint8Array;
      metadata?: Record<string, unknown>;
    },
    overrideKey?: CryptoKey
  ): Promise<T> {
    const key = overrideKey || this.currentKey;
    if (!key) throw new Error("EncryptionManager: No key set or provided");

    try {
      const ivBytes = payload.iv instanceof Uint8Array ? payload.iv : new Uint8Array(payload.iv);
      const encryptedBytes =
        payload.data instanceof Uint8Array ? payload.data : new Uint8Array(payload.data);

      const decrypted = await safeCryptoOperation(
        "decrypt",
        { name: "AES-GCM", iv: ivBytes },
        key,
        encryptedBytes
      );

      // DecryptOptimized used deserializer which handles decompression
      const result = optimizedSerialization.deserialize(new Uint8Array(decrypted)) as T;

      return result;
    } catch (error) {
      logger.error("EncryptionManager: Decryption failed", { error });
      throw error;
    }
  }

  /**
   * Generate a deterministic budget ID
   */
  public async generateBudgetId(password: string, shareCode: string): Promise<string> {
    const { shareCodeUtils } = await import("../../utils/security/shareCodeUtils");
    const normalized = shareCodeUtils.normalizeShareCode(shareCode);

    if (!shareCodeUtils.validateShareCode(normalized)) {
      throw new Error("Invalid share code format");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`budget_seed_${password}_${normalized}_violet_vault`);
    const hashBuffer = await safeCryptoOperation("digest", "SHA-256", data);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `budget_${hashHex.substring(0, 16)}`;
  }

  /**
   * Helper to convert various byte sources to Uint8Array
   * @private (keeping for future use internally)
   */
  // @ts-expect-error - Keeping for internal utility use cases
  private toUint8Array(value: unknown): Uint8Array {
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value))
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (Array.isArray(value)) return new Uint8Array(value);
    throw new TypeError("Unsupported byte source");
  }
}

export const encryptionManager = EncryptionManager.getInstance();
