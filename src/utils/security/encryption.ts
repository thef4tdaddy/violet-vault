/**
 * AES-256-GCM Encryption Utilities
 *
 * Provides client-side encryption/decryption using Web Crypto API.
 * Used for Tier 2 analytics to encrypt data before sending to backend.
 *
 * Security Features:
 * - AES-256-GCM (authenticated encryption)
 * - Random IV for each encryption
 * - Authentication tags verified on decryption
 * - Key derivation using PBKDF2 (100k iterations)
 *
 * @module encryption
 */

import logger from "@/utils/core/common/logger";

/**
 * Encryption result containing all necessary components
 */
export interface EncryptedData {
  /** Base64-encoded encrypted data */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Base64-encoded authentication tag */
  authTag: string;
  /** Algorithm used (always 'AES-256-GCM') */
  algorithm: string;
}

/**
 * Decryption input (mirrors EncryptedData)
 */
export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  algorithm: "AES-GCM" as const,
  keyLength: 256, // bits
  ivLength: 12, // bytes (96 bits recommended for GCM)
  tagLength: 128, // bits
} as const;

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random initialization vector (IV)
 *
 * @returns 96-bit random IV as Uint8Array
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
}

/**
 * Encrypt data using AES-256-GCM
 *
 * @param data - Data to encrypt (will be JSON stringified)
 * @param key - CryptoKey for encryption (256-bit AES-GCM key)
 * @returns Encrypted data with IV and auth tag
 *
 * @example
 * ```typescript
 * const key = await deriveKey(passphrase, salt);
 * const encrypted = await encryptData({ userId: 123, amount: 50.00 }, key);
 * // Send encrypted.ciphertext, encrypted.iv, encrypted.authTag to backend
 * ```
 */
export async function encryptData(data: unknown, key: CryptoKey): Promise<EncryptedData> {
  try {
    // Serialize data to JSON
    const plaintext = JSON.stringify(data);
    const encoder = new TextEncoder();
    const plaintextBytes = encoder.encode(plaintext);

    // Generate random IV
    const iv = generateIV();

    // Encrypt
    const ciphertextWithTag = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iv: iv as any,
        tagLength: ENCRYPTION_CONFIG.tagLength,
      },
      key,
      plaintextBytes
    );

    // GCM auth tag is appended to ciphertext
    const ciphertext = ciphertextWithTag.slice(0, -16); // Last 16 bytes are auth tag
    const authTag = ciphertextWithTag.slice(-16);

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iv: arrayBufferToBase64(iv as any),
      authTag: arrayBufferToBase64(authTag),
      algorithm: "AES-256-GCM",
    };
  } catch (error) {
    logger.error("Encryption failed", { error });
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt data using AES-256-GCM
 *
 * @param encrypted - Encrypted data with IV and auth tag
 * @param key - CryptoKey for decryption (same key used for encryption)
 * @returns Decrypted data (parsed from JSON)
 *
 * @throws Error if authentication tag verification fails
 *
 * @example
 * ```typescript
 * const key = await deriveKey(passphrase, salt);
 * const decrypted = await decryptData(encryptedPayload, key);
 * console.log(decrypted); // { userId: 123, amount: 50.00 }
 * ```
 */
export async function decryptData<T = unknown>(
  encrypted: EncryptedPayload,
  key: CryptoKey
): Promise<T> {
  try {
    // Verify algorithm
    if (encrypted.algorithm !== "AES-256-GCM") {
      throw new Error(`Unsupported algorithm: ${encrypted.algorithm}`);
    }

    // Convert from base64
    const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);
    const iv = base64ToArrayBuffer(encrypted.iv);
    const authTag = base64ToArrayBuffer(encrypted.authTag);

    // Combine ciphertext and auth tag (GCM expects them concatenated)
    const ciphertextWithTag = new Uint8Array(ciphertext.byteLength + authTag.byteLength);
    ciphertextWithTag.set(new Uint8Array(ciphertext), 0);
    ciphertextWithTag.set(new Uint8Array(authTag), ciphertext.byteLength);

    // Decrypt
    const plaintextBytes = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: new Uint8Array(iv),
        tagLength: ENCRYPTION_CONFIG.tagLength,
      },
      key,
      ciphertextWithTag
    );

    // Decode and parse
    const decoder = new TextDecoder();
    const plaintext = decoder.decode(plaintextBytes);
    return JSON.parse(plaintext) as T;
  } catch (error) {
    logger.error("Decryption failed", { error });
    throw new Error("Failed to decrypt data (authentication failed or corrupted data)");
  }
}

/**
 * Derive encryption key from passphrase using PBKDF2
 *
 * @param passphrase - User passphrase (never persisted)
 * @param salt - Salt for key derivation (base64 encoded)
 * @param iterations - PBKDF2 iterations (default: 100,000)
 * @returns CryptoKey for AES-GCM encryption
 *
 * @example
 * ```typescript
 * const salt = generateSalt();
 * const key = await deriveKey("my-secret-passphrase", salt);
 * ```
 */
export async function deriveKey(
  passphrase: string,
  salt: string,
  iterations: number = 100_000
): Promise<CryptoKey> {
  try {
    const encoder = new TextEncoder();
    const passphraseBytes = encoder.encode(passphrase);
    const saltBytes = base64ToArrayBuffer(salt);

    // Import passphrase as key material
    const keyMaterial = await crypto.subtle.importKey("raw", passphraseBytes, "PBKDF2", false, [
      "deriveKey",
    ]);

    // Derive AES-GCM key
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      false, // Not extractable (stays in memory)
      ["encrypt", "decrypt"]
    );

    return key;
  } catch (error) {
    logger.error("Key derivation failed", { error });
    throw new Error("Failed to derive encryption key");
  }
}

/**
 * Generate a random salt for PBKDF2
 *
 * @returns Base64-encoded salt (128 bits)
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16)); // 128 bits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arrayBufferToBase64(salt as any);
}

/**
 * Export key for storage (wrapped with another key)
 *
 * NOT RECOMMENDED: Keys should stay in memory only.
 * This is provided for advanced use cases only.
 *
 * @param key - CryptoKey to export
 * @param wrappingKey - CryptoKey to wrap with
 * @returns Base64-encoded wrapped key
 */
export async function exportKey(key: CryptoKey, wrappingKey: CryptoKey): Promise<string> {
  try {
    const wrapped = await crypto.subtle.wrapKey("raw", key, wrappingKey, {
      name: ENCRYPTION_CONFIG.algorithm,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iv: generateIV() as any,
    });
    return arrayBufferToBase64(wrapped);
  } catch (error) {
    logger.error("Key export failed", { error });
    throw new Error("Failed to export key");
  }
}

/**
 * Clear sensitive data from memory
 *
 * Note: JavaScript doesn't provide direct memory management,
 * but this helps signal to the GC that data can be collected.
 *
 * @param sensitiveData - Data to clear (object or string)
 */
export function clearSensitiveData(sensitiveData: Record<string, unknown> | string): void {
  if (typeof sensitiveData === "object") {
    // Overwrite all properties
    for (const key in sensitiveData) {
      if (Object.prototype.hasOwnProperty.call(sensitiveData, key)) {
        sensitiveData[key] = null;
      }
    }
  }

  // Force garbage collection hint (not guaranteed)
  if (typeof (globalThis as typeof globalThis & { gc?: () => void }).gc === "function") {
    (globalThis as typeof globalThis & { gc?: () => void }).gc?.();
  }
}

/**
 * Test encryption round-trip
 *
 * @param data - Test data to encrypt and decrypt
 * @param key - CryptoKey to use
 * @returns True if round-trip successful, false otherwise
 *
 * @example
 * ```typescript
 * const key = await deriveKey("test", generateSalt());
 * const success = await testEncryption({ test: "data" }, key);
 * console.log(success ? "Encryption working" : "Encryption failed");
 * ```
 */
export async function testEncryption(data: unknown, key: CryptoKey): Promise<boolean> {
  try {
    const encrypted = await encryptData(data, key);
    const decrypted = await decryptData(encrypted, key);

    // Deep equality check
    return JSON.stringify(data) === JSON.stringify(decrypted);
  } catch (error) {
    logger.error("Encryption test failed", { error });
    return false;
  }
}
