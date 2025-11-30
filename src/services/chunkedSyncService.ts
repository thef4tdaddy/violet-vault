// Chunked Sync Service - Handle large data synchronization
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
  query,
  where,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import type { IChunkedSyncService, ChunkedSyncStats, CloudSyncConfig } from "../types/firebase";
import { encryptionUtils } from "../utils/security/encryption";
import firebaseSyncService from "./firebaseSyncService";
import logger from "../utils/common/logger";
import { SyncMutex } from "../utils/sync/SyncMutex";
import {
  validateEncryptedData as _validateEncryptedData,
  validateManifest as _validateManifest,
  generateChecksum,
} from "../utils/sync/validation";
import { createSyncResilience } from "../utils/sync/resilience";

// Type for manifest metadata
interface ManifestMetadata {
  totalChunks: number;
  totalSize: number;
  [key: string]: unknown;
}

// Declare Window interface for corruptionModalShown
declare global {
  interface Window {
    corruptionModalShown?: boolean;
  }
}

/**
 * Binary <-> Base64 helpers to avoid massive Function.apply() (stack overflow)
 */
function base64FromBytes(bytes: Uint8Array | ArrayBuffer | number[]): string {
  let u8: Uint8Array;
  if (bytes instanceof Uint8Array) {
    u8 = bytes;
  } else if (bytes instanceof ArrayBuffer) {
    u8 = new Uint8Array(bytes);
  } else if (Array.isArray(bytes)) {
    u8 = new Uint8Array(bytes);
  } else {
    throw new Error(`Unexpected bytes type: ${typeof bytes}`);
  }
  const CHUNK_SIZE = 0x8000; // 32k chars per chunk keeps call stacks safe
  let binary = "";
  for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
    const chunk = u8.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function bytesFromBase64(str: string): Uint8Array {
  if (!str || typeof str !== "string") {
    throw new Error(`Invalid base64 string: ${typeof str}`);
  }

  try {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    logger.error("Failed to decode base64 string", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to decode base64 string (length: ${str.length}): ${errorMessage}`);
  }
}

/**
 * Chunked Firebase Sync Service
 * Handles synchronization of large datasets by breaking them into smaller chunks
 */
class ChunkedSyncService implements IChunkedSyncService {
  budgetId: string | null;
  encryptionKey: CryptoKey | string | null;
  maxChunkSize: number;
  maxArrayChunkSize: number;
  lastCorruptedDataClear: number | null;
  corruptedDataClearCooldown: number;
  syncMutex: SyncMutex;
  decryptionFailures: Map<string, { count: number; lastFailure: number }>;
  resilience: ReturnType<typeof createSyncResilience>;

  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    // Optimized for compression - much more aggressive chunk sizes
    this.maxChunkSize = 900 * 1024; // 900KB per chunk (compression should keep us under 1MB)
    this.maxArrayChunkSize = 5000; // 5x larger chunks since compression reduces size dramatically
    this.lastCorruptedDataClear = null; // Track when we last cleared corrupted data
    this.corruptedDataClearCooldown = 5 * 60 * 1000; // 5 minute cooldown between clears

    // GitHub Issue #576 - Phase 1: Prevent concurrent sync operations
    this.syncMutex = new SyncMutex(`ChunkedSync-${Date.now()}`);
    this.decryptionFailures = new Map(); // Track failed decryption attempts

    // GitHub Issue #576 - Phase 2: Resilience improvements
    this.resilience = createSyncResilience({
      retryManager: { name: "ChunkedSyncRetry" },
      circuitBreaker: { name: "ChunkedSyncCircuit", failureThreshold: 3 },
      syncQueue: { name: "ChunkedSyncQueue", debounceMs: 1500 },
    });
  }

  /**
   * Initialize chunked sync
   */
  async initialize(budgetId: string, encryptionKey: string): Promise<void> {
    // GitHub Issue #578: Add validation for initialization parameters
    if (!budgetId || !encryptionKey) {
      throw new Error(
        `Invalid initialization parameters - budgetId: ${!!budgetId}, encryptionKey: ${!!encryptionKey}`
      );
    }

    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;

    // Ensure Firebase service is initialized
    await firebaseSyncService.ensureAuthenticated();

    logger.info("Chunked sync service initialized", {
      budgetId: budgetId.substring(0, 8) + "...",
      maxChunkSize: this.maxChunkSize,
    });
  }

  /**
   * Get database reference
   */
  _getDb() {
    const app = firebaseSyncService.app;
    if (!app) {
      throw new Error("Firebase app not initialized");
    }
    return getFirestore(app);
  }

  /**
   * Safe JSON stringify with error handling
   */
  safeStringify(data: unknown) {
    try {
      return JSON.stringify(data, (_key, value) => {
        if (value === undefined) return null;
        if (typeof value === "function") return "[Function]";
        if (value instanceof Date) return value.toISOString();
        return value;
      });
    } catch (error) {
      logger.error("JSON stringify error", error);
      return JSON.stringify({ error: "Serialization failed" });
    }
  }

  /**
   * Calculate estimated compressed data size in bytes
   * Uses compression analysis to get realistic size estimates
   */
  async calculateSize(data: unknown) {
    try {
      // Dynamic import for optimization utilities
      const { optimizedSerialization } = await import(
        "../utils/security/optimizedSerialization.js"
      );

      // Get compression analysis for size estimation
      const analysis = optimizedSerialization.analyzeCompression(data);

      if (analysis) {
        // Return compressed size estimate (more realistic for chunking decisions)
        logger.debug("Using compressed size estimate", {
          originalSize: analysis.originalSize,
          compressedSize: analysis.finalSize,
          reduction: analysis.totalReduction.toFixed(2) + "x",
        });
        return analysis.finalSize;
      }
    } catch (error) {
      // Fallback to original method if compression analysis fails
      logger.debug(
        "Compression analysis failed, using JSON size",
        error as Record<string, unknown>
      );
    }

    // Fallback: original JSON size calculation
    const jsonString = this.safeStringify(data);
    return new Blob([jsonString]).size;
  }

  /**
   * Chunk large arrays into smaller pieces
   */
  async chunkArray(array: unknown, arrayName: string): Promise<Record<string, unknown>> {
    if (!Array.isArray(array)) {
      return { [arrayName]: array };
    }

    const chunks: Record<string, unknown> = {};
    const totalItems = array.length;

    if (totalItems === 0) {
      chunks[arrayName] = [];
      return chunks;
    }

    // Calculate chunk size based on data size and item count
    let chunkSize = this.maxArrayChunkSize;
    const sampleData = array.slice(0, Math.min(10, array.length));
    const sampleSize = await this.calculateSize(sampleData);
    const avgItemSize = sampleSize / Math.min(10, array.length);

    if (avgItemSize > 0) {
      const maxItemsForSize = Math.floor(this.maxChunkSize / avgItemSize);
      chunkSize = Math.min(chunkSize, Math.max(100, maxItemsForSize));
    }

    logger.debug(`Chunking ${arrayName}: ${totalItems} items, ${chunkSize} per chunk`);

    for (let i = 0; i < totalItems; i += chunkSize) {
      const chunkIndex = Math.floor(i / chunkSize);
      const chunkData = array.slice(i, i + chunkSize);
      const chunkKey = this.generateChunkId(arrayName, chunkIndex);
      chunks[chunkKey] = chunkData;
    }

    return chunks;
  }

  /**
   * Generate consistent chunk ID
   */
  generateChunkId(arrayName: string, chunkIndex: number): string {
    return `${arrayName}_chunk_${chunkIndex.toString().padStart(3, "0")}`;
  }

  /**
   * Create manifest with chunk information and validation checksums
   * GitHub Issue #576 Phase 1: Enhanced data validation
   */
  async createManifest(chunkMap: Record<string, unknown>, metadata: Record<string, unknown> = {}) {
    const manifest: {
      version: string;
      timestamp: number;
      chunks: Record<
        string,
        {
          size: number;
          itemCount: number;
          type: string;
          checksum: string;
        }
      >;
      metadata: ManifestMetadata;
      validation: {
        manifestChecksum: string;
        minChunkSize: number;
        minIVSize: number;
      };
    } = {
      version: "2.0",
      timestamp: Date.now(),
      chunks: {},
      metadata: {
        totalChunks: 0,
        totalSize: 0,
        ...metadata,
      } as ManifestMetadata,
      validation: {
        manifestChecksum: "", // Will be calculated after chunk processing
        minChunkSize: 16, // Minimum encrypted chunk size
        minIVSize: 12, // Minimum IV size
      },
    };

    for (const [chunkId, data] of Object.entries(chunkMap)) {
      const size = await this.calculateSize(data);
      const dataString = this.safeStringify(data);
      const checksum = await generateChecksum(dataString);

      manifest.chunks[chunkId] = {
        size,
        itemCount: Array.isArray(data) ? data.length : 1,
        type: Array.isArray(data) ? "array" : "object",
        checksum, // GitHub Issue #576: Add chunk checksum for validation
      };
      manifest.metadata.totalSize += size;
      manifest.metadata.totalChunks++;
    }

    // Generate manifest checksum for integrity validation
    const manifestString = JSON.stringify({
      version: manifest.version,
      timestamp: manifest.timestamp,
      chunks: manifest.chunks,
      metadata: manifest.metadata,
    });
    manifest.validation.manifestChecksum = await generateChecksum(manifestString);

    logger.debug("Created manifest", {
      totalChunks: manifest.metadata.totalChunks,
      totalSize: manifest.metadata.totalSize,
    });

    return manifest;
  }

  /**
   * Save large dataset to cloud using chunking
   */
  async saveToCloud(data: unknown, currentUser: CloudSyncConfig["currentUser"]): Promise<boolean> {
    return this.syncMutex.execute(async () => {
      if (!this.budgetId || !this.encryptionKey) {
        throw new Error("Chunked sync not initialized");
      }

      const db = this._getDb();
      const startTime = Date.now();

      // Warn if currentUser is undefined - check for budgetId (primary), uid (Firebase), or id (local user)
      const userObj = currentUser as {
        budgetId?: string;
        id?: string;
        uid?: string;
        userName?: string;
      };
      if (!userObj?.budgetId && !userObj?.uid && !userObj?.id) {
        logger.warn("saveToCloud called with undefined currentUser identifier, using 'anonymous'", {
          currentUser,
          hasCurrentUser: !!currentUser,
          currentUserKeys: currentUser ? Object.keys(currentUser) : [],
          currentUserValues: currentUser ? Object.values(currentUser).map((v) => typeof v) : [],
          // Show actual property names and values for debugging
          currentUserPropsDebug: currentUser
            ? Object.entries(currentUser).map(
                ([k, v]) => `${k}: ${typeof v === "string" ? v.substring(0, 20) : typeof v}`
              )
            : [],
          source: "chunkedSyncService",
        });
      }

      try {
        logger.info("🚀 [CHUNKED SYNC] Starting chunked save to cloud", {
          dataSize: this.calculateSize(data),
          userId: userObj?.budgetId || userObj?.uid || userObj?.id || "anonymous",
        });

        // Identify large arrays to chunk
        logger.debug("🚀 [CHUNKED SYNC] Processing data for chunking");
        const chunkedData: Record<string, unknown> = {};
        const chunkMap: Record<string, unknown> = {};

        // Ensure data is an object before using Object.entries
        if (data && typeof data === "object" && !Array.isArray(data)) {
          for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value) && value.length > 100) {
              logger.debug(
                `🚀 [CHUNKED SYNC] Chunking large array: ${key} (${value.length} items)`
              );
              // Chunk large arrays
              const arrayChunks = await this.chunkArray(value, key);
              Object.assign(chunkMap, arrayChunks);
              chunkedData[key] = { _chunked: true, _originalSize: value.length };
            } else {
              // Keep small data in main document
              chunkedData[key] = value;
            }
          }
        }
        logger.debug(
          `🚀 [CHUNKED SYNC] Data processing complete. Total chunks: ${Object.keys(chunkMap).length}`
        );

        // Create manifest
        const manifest = await this.createManifest(chunkMap, {
          userId: userObj?.budgetId || userObj?.uid || userObj?.id || "anonymous",
          userAgent: navigator.userAgent,
          originalKeys:
            data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data) : [],
        });

        // Encrypt and save manifest with optimization
        const encryptedManifest = await encryptionUtils.encryptOptimized(
          manifest,
          this.encryptionKey
        );

        // Fix: encryption utility returns 'data' property, not 'encryptedData'
        if (!encryptedManifest?.data || !encryptedManifest?.iv) {
          logger.error("❌ Encryption failed - missing properties", {
            encryptedManifest,
            hasData: !!encryptedManifest?.data,
            hasIv: !!encryptedManifest?.iv,
            manifestKeys: encryptedManifest ? Object.keys(encryptedManifest) : [],
          });
          throw new Error(
            `Encryption failed: missing properties - hasData: ${!!encryptedManifest?.data}, hasIv: ${!!encryptedManifest?.iv}`
          );
        }

        const mainDocumentRaw = {
          ...chunkedData,
          _manifest: {
            encryptedData: {
              data: base64FromBytes(encryptedManifest.data), // ✅ Fixed: use 'data' property
              iv: base64FromBytes(encryptedManifest.iv),
            },
            timestamp: Date.now(),
          },
          _metadata: {
            version: "2.0",
            lastSync: Date.now(),
            userId: userObj?.budgetId || userObj?.uid || userObj?.id || "anonymous",
            chunkedKeys:
              data && typeof data === "object" && !Array.isArray(data)
                ? Object.keys(data).filter(
                    (key) =>
                      Array.isArray((data as Record<string, unknown>)[key]) &&
                      Array.isArray((data as Record<string, unknown>)[key]) &&
                      ((data as Record<string, unknown>)[key] as unknown[]).length > 100
                  )
                : [],
          },
        };

        // Remove undefined values before sending to Firebase
        // Firebase doesn't allow undefined - must be omitted or null
        const { removeUndefinedValues } = await import("../utils/dataManagement/firebaseUtils");
        const mainDocument = removeUndefinedValues(mainDocumentRaw);

        // Store for use in chunk loop below
        const cleanUndefined = removeUndefinedValues;

        // Save main document with resilience and timeout
        logger.info("🚀 [CHUNKED SYNC] About to save main document to Firebase");
        await Promise.race([
          this.resilience.execute(
            () => {
              logger.debug("🚀 [CHUNKED SYNC] Calling setDoc for main document");
              return setDoc(doc(db, "budgets", this.budgetId as string), mainDocument);
            },
            "saveMainDocument",
            "saveMainDocument"
          ) as Promise<void>,
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Main document save timed out")), 30000)
          ),
        ]);
        logger.info("🚀 [CHUNKED SYNC] Main document saved successfully");

        // Save chunks in batches
        const chunkEntries = Object.entries(chunkMap);
        const batchSize = 500; // Firestore batch limit

        logger.info(
          `🚀 [CHUNKED SYNC] About to save ${chunkEntries.length} chunks in batches of ${batchSize}`
        );

        for (let i = 0; i < chunkEntries.length; i += batchSize) {
          const batchNumber = Math.floor(i / batchSize) + 1;
          const totalBatches = Math.ceil(chunkEntries.length / batchSize);
          logger.debug(`🚀 [CHUNKED SYNC] Processing batch ${batchNumber}/${totalBatches}`);

          const batch = writeBatch(db);
          const batchChunks = chunkEntries.slice(i, i + batchSize);

          for (const [chunkId, chunkData] of batchChunks) {
            const encryptedChunk = await encryptionUtils.encryptOptimized(
              chunkData,
              this.encryptionKey
            );

            // GitHub Issue #576 Phase 1: Enhanced validation before save
            const encryptedDataBytes = base64FromBytes(encryptedChunk.data);
            const ivBytes = base64FromBytes(encryptedChunk.iv);

            if (encryptedDataBytes.length < 16) {
              throw new Error(`Encrypted data too small: ${encryptedDataBytes.length} bytes`);
            }
            if (ivBytes.length < 12) {
              throw new Error(`IV too small: ${ivBytes.length} bytes`);
            }

            const chunkDocumentRaw = {
              encryptedData: {
                data: base64FromBytes(encryptedChunk.data),
                iv: base64FromBytes(encryptedChunk.iv),
              },
              budgetId: this.budgetId,
              chunkId,
              timestamp: Date.now(),
              validation: {
                originalSize:
                  encryptedChunk.metadata?.originalSize || JSON.stringify(chunkData).length,
                checksum: await generateChecksum(JSON.stringify(chunkData)),
              },
              // Add compression metadata
              metadata: encryptedChunk.metadata || {},
            };

            // Remove undefined values before sending to Firebase
            const chunkDocument = cleanUndefined(chunkDocumentRaw);
            batch.set(doc(db, "budgets", this.budgetId, "chunks", chunkId), chunkDocument);
          }

          // Commit batch with resilience and timeout
          logger.debug(`🚀 [CHUNKED SYNC] About to commit batch ${batchNumber}`);
          await Promise.race([
            this.resilience.execute(
              () => {
                logger.debug(`🚀 [CHUNKED SYNC] Calling batch.commit() for batch ${batchNumber}`);
                return batch.commit();
              },
              "saveChunkBatch",
              `saveChunkBatch-${batchNumber}`
            ) as Promise<void>,
            new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error(`Batch ${batchNumber} commit timed out`)), 45000)
            ),
          ]);
          logger.info(
            `🚀 [CHUNKED SYNC] Batch ${batchNumber}/${totalBatches} committed successfully`
          );
        }

        const duration = Date.now() - startTime;
        logger.info("✅ Chunked save completed successfully", {
          totalChunks: chunkEntries.length,
          duration: `${duration}ms`,
          mainDocSize: this.calculateSize(mainDocument),
        });

        return true;
      } catch (error) {
        logger.error("❌ Chunked save failed", error);
        // Explicitly capture to Sentry with sync context
        if (error instanceof Error) {
          import("../utils/common/sentry.js")
            .then(({ captureError }) => {
              captureError(error, {
                operation: "saveToCloud",
                budgetId: this.budgetId?.substring(0, 8),
                service: "ChunkedSyncService",
              });
            })
            .catch(() => {
              // Sentry not available, already logged via logger.error
            });
        }
        throw error;
      }
    }, "saveToCloud");
  }

  /**
   * Load large dataset from cloud with chunk reassembly
   */
  async loadFromCloud(): Promise<unknown> {
    return this.syncMutex.execute(async () => {
      if (!this.budgetId || !this.encryptionKey) {
        throw new Error("Chunked sync not initialized");
      }

      const db = this._getDb();
      const startTime = Date.now();

      try {
        logger.info("Starting chunked load from cloud");

        // Load main document with resilience
        const mainDoc = (await this.resilience.execute(
          () => getDoc(doc(db, "budgets", this.budgetId as string)),
          "loadMainDocument",
          "loadMainDocument"
        )) as DocumentSnapshot<Record<string, unknown>>;
        if (!mainDoc.exists()) {
          logger.info("No cloud data found");
          return null;
        }

        const mainData = mainDoc.data() as Record<string, unknown>;
        const reconstructedData = { ...mainData };

        // Remove internal metadata
        delete reconstructedData._manifest;
        delete reconstructedData._metadata;

        // Check if we have chunks to reassemble
        if (mainData._manifest) {
          type ManifestType = {
            version?: string;
            metadata?: { totalChunks?: number };
            chunks?: unknown[];
          };
          let manifest: ManifestType = {};
          try {
            // Validate manifest data before decryption
            const manifestData = mainData._manifest as Record<string, unknown>;
            const encryptedData = manifestData.encryptedData as Record<string, unknown> | undefined;
            if (!encryptedData?.data || !encryptedData?.iv) {
              throw new Error("Missing encrypted manifest data structure");
            }

            const encryptedDataBytes = bytesFromBase64(encryptedData.data as string);
            const ivBytes = bytesFromBase64(encryptedData.iv as string);

            // Check if data is too small (common corruption indicator)
            if (encryptedDataBytes.length < 16 || ivBytes.length < 12) {
              throw new Error(
                `Corrupted manifest data: encrypted=${encryptedDataBytes.length}bytes, iv=${ivBytes.length}bytes`
              );
            }

            // Decrypt manifest with optimization support
            manifest = (await encryptionUtils.decryptOptimized(
              encryptedDataBytes,
              this.encryptionKey,
              ivBytes
            )) as ManifestType;
          } catch (decryptError) {
            logger.error("❌ Failed to decrypt manifest - may be corrupted or key mismatch", {
              error: decryptError instanceof Error ? decryptError.message : String(decryptError),
              errorType:
                decryptError instanceof Error ? decryptError.name : String(typeof decryptError),
              budgetId: this.budgetId?.substring(0, 8) + "...",
            });

            // NEVER automatically clear data - this is too destructive and causes data loss
            // Smart detection: avoid repeatedly trying to decrypt the same bad data
            const errorSignature = `${this.budgetId}_${decryptError instanceof Error ? decryptError.message : String(decryptError)}`;
            const now = Date.now();

            // Track failed decryption attempts to avoid repeated attempts
            if (!this.decryptionFailures) {
              this.decryptionFailures = new Map();
            }

            const failureRecord = this.decryptionFailures.get(errorSignature);
            const backoffTime = 5 * 60 * 1000; // 5 minutes

            if (failureRecord && now - failureRecord.lastFailure < backoffTime) {
              logger.info("🔇 Skipping repeated decryption attempt (in backoff period)");
              return null; // Skip without logging noise
            }

            const newFailureRecord = {
              count: failureRecord ? failureRecord.count + 1 : 1,
              lastFailure: now,
            };
            this.decryptionFailures.set(errorSignature, newFailureRecord);

            // Check if we should trigger corruption recovery modal
            this.checkForCorruptionPattern();

            const isDemoMode =
              this.budgetId?.includes("demo") || process.env.NODE_ENV === "development";

            if (isDemoMode) {
              logger.warn(
                "⚠️ Decryption failed in dev mode - using demo Firebase config, NOT clearing cloud data"
              );
            } else {
              logger.warn(
                "⚠️ Decryption failed - possible key mismatch or corruption, NOT auto-clearing cloud data"
              );
              logger.warn(
                "💡 Use the admin console to manually clear cloud data if corruption is confirmed"
              );
            }

            return null; // Return null to trigger fresh upload from local data without clearing cloud
          }
          logger.debug("Loaded manifest", {
            version: manifest.version,
            totalChunks: manifest.metadata?.totalChunks,
          });

          // Load all chunks
          const chunksQuery = query(
            collection(db, "budgets", this.budgetId, "chunks"),
            where("budgetId", "==", this.budgetId)
          );

          const chunksSnapshot = (await this.resilience.execute(
            () => getDocs(chunksQuery),
            "loadChunks",
            "loadChunks"
          )) as QuerySnapshot;
          const chunks: Record<string, unknown> = {};

          // Decrypt all chunks with individual error handling
          for (const chunkDoc of chunksSnapshot.docs) {
            const chunkData = chunkDoc.data();
            try {
              // GitHub Issue #576 Phase 1: Pre-decryption validation
              const encryptedDataBytes = bytesFromBase64(chunkData.encryptedData.data);
              const ivBytes = bytesFromBase64(chunkData.encryptedData.iv);

              if (encryptedDataBytes.length < 16) {
                throw new Error(
                  `Corrupted chunk ${chunkData.chunkId}: encrypted data too small (${encryptedDataBytes.length} bytes)`
                );
              }
              if (ivBytes.length < 12) {
                throw new Error(
                  `Corrupted chunk ${chunkData.chunkId}: IV too small (${ivBytes.length} bytes)`
                );
              }

              // Decrypt chunk with optimization support
              const decryptedChunkData = await encryptionUtils.decryptOptimized(
                encryptedDataBytes,
                this.encryptionKey,
                ivBytes
              );

              // Post-decryption validation if checksum exists
              if (chunkData.validation?.checksum) {
                const actualChecksum = await generateChecksum(JSON.stringify(decryptedChunkData));
                if (actualChecksum !== chunkData.validation.checksum) {
                  logger.warn(`Checksum mismatch for chunk ${chunkData.chunkId}`, {
                    expected: chunkData.validation.checksum,
                    actual: actualChecksum,
                  });
                }
              }

              chunks[chunkData.chunkId] = decryptedChunkData;
            } catch (chunkDecryptError) {
              logger.error("❌ Failed to decrypt chunk - skipping corrupted chunk", {
                chunkId: chunkData.chunkId,
                error:
                  chunkDecryptError instanceof Error
                    ? chunkDecryptError.message
                    : String(chunkDecryptError),
                errorType:
                  chunkDecryptError instanceof Error
                    ? chunkDecryptError.name
                    : String(typeof chunkDecryptError),
              });
              // Skip this chunk but continue with others
              continue;
            }
          }

          // Reassemble chunked arrays
          for (const [key, value] of Object.entries(reconstructedData)) {
            if (value && typeof value === "object" && (value as Record<string, unknown>)._chunked) {
              // Find all chunks for this key
              const keyChunks = Object.entries(chunks)
                .filter(([chunkId]) => chunkId.startsWith(`${key}_chunk_`))
                .sort(([a], [b]) => a.localeCompare(b));

              // Reassemble array
              const reassembledArray = [];
              for (const [, chunkData] of keyChunks) {
                if (Array.isArray(chunkData)) {
                  reassembledArray.push(...chunkData);
                }
              }

              reconstructedData[key] = reassembledArray;
              logger.debug(`Reassembled ${key}: ${reassembledArray.length} items`);
            }
          }
        }

        const duration = Date.now() - startTime;
        logger.info("✅ Chunked load completed successfully", {
          duration: `${duration}ms`,
          keys: Object.keys(reconstructedData),
          dataStructure: Object.entries(reconstructedData).reduce(
            (acc, [key, value]) => {
              acc[key] = Array.isArray(value) ? `array[${value.length}]` : typeof value;
              return acc;
            },
            {} as Record<string, string>
          ),
        });

        return reconstructedData;
      } catch (error) {
        logger.error("❌ Chunked load failed", error);
        // Explicitly capture to Sentry with sync context
        if (error instanceof Error) {
          import("../utils/common/sentry.js")
            .then(({ captureError }) => {
              captureError(error, {
                operation: "loadFromCloud",
                budgetId: this.budgetId?.substring(0, 8),
                service: "ChunkedSyncService",
              });
            })
            .catch(() => {
              // Sentry not available, already logged via logger.error
            });
        }
        throw error;
      }
    }, "loadFromCloud");
  }

  /**
   * Reset cloud data (delete all chunks)
   */
  async resetCloudData() {
    if (!this.budgetId) {
      throw new Error("Budget ID not set");
    }

    const db = this._getDb();

    try {
      logger.info("Resetting cloud data and chunks");

      // Delete main document
      await setDoc(doc(db, "budgets", this.budgetId), {
        _deleted: true,
        _timestamp: Date.now(),
      });

      // Delete all chunks
      const chunksQuery = query(
        collection(db, "budgets", this.budgetId, "chunks"),
        where("budgetId", "==", this.budgetId)
      );

      const snapshot = await getDocs(chunksQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      logger.info("✅ Cloud data reset completed");
    } catch (error) {
      logger.error("❌ Failed to reset cloud data", error);
      // Explicitly capture to Sentry with sync context
      if (error instanceof Error) {
        import("../utils/common/sentry.js")
          .then(({ captureError }) => {
            captureError(error, {
              operation: "resetCloudData",
              budgetId: this.budgetId?.substring(0, 8),
              service: "ChunkedSyncService",
            });
          })
          .catch(() => {
            // Sentry not available, already logged via logger.error
          });
      }
      throw error;
    }
  }

  /**
   * Clear corrupted cloud data and reset to clean state
   */
  async clearCorruptedData(): Promise<void> {
    if (!this.budgetId) {
      throw new Error("Budget ID not set");
    }

    const db = this._getDb();

    try {
      logger.info("🧹 Clearing corrupted cloud data for fresh start");

      // Delete all chunks first
      const chunksQuery = query(
        collection(db, "budgets", this.budgetId, "chunks"),
        where("budgetId", "==", this.budgetId)
      );

      const snapshot = await getDocs(chunksQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((chunkDoc) => {
        batch.delete(chunkDoc.ref);
      });

      await batch.commit();
      logger.info(`🗑️ Deleted ${snapshot.docs.length} corrupted chunks`);

      // Clear main document
      await setDoc(doc(db, "budgets", this.budgetId), {
        _cleared: true,
        _timestamp: Date.now(),
        _reason: "Corrupted data cleared",
      });

      logger.info("✅ Corrupted cloud data cleared successfully");
    } catch (error) {
      logger.error("❌ Failed to clear corrupted cloud data", error);
      throw error;
    }
  }

  /**
   * Clear all data from cloud storage (alias for clearCorruptedData)
   * Used by cloudSyncService for complete data reset
   */
  async clearAllData() {
    logger.info("🧹 Clearing all cloud data (full reset)");

    // Handle case where budgetId is not set (e.g., during import before initialization)
    if (!this.budgetId) {
      logger.warn("Budget ID not set - skipping cloud data clear (likely during import)");
      return {
        success: true,
        message: "Skipped cloud clear - no budget ID set",
      };
    }

    return await this.clearCorruptedData();
  }

  /**
   * Get sync statistics including resilience metrics
   */
  getStats(): ChunkedSyncStats {
    return {
      maxChunkSize: this.maxChunkSize,
      maxArrayChunkSize: this.maxArrayChunkSize,
      isInitialized: !!(this.budgetId && this.encryptionKey),
    };
  }

  /**
   * Check for corruption patterns and trigger recovery modal if needed
   */
  checkForCorruptionPattern() {
    if (!this.decryptionFailures || this.decryptionFailures.size === 0) {
      return;
    }

    // Count recent failures (within last 10 minutes)
    const recentThreshold = Date.now() - 10 * 60 * 1000;
    let recentFailures = 0;
    let hasDataTooSmallError = false;

    for (const [errorSignature, failureRecord] of this.decryptionFailures) {
      if (failureRecord.lastFailure > recentThreshold) {
        recentFailures++;
        if (errorSignature.includes("The provided data is too small")) {
          hasDataTooSmallError = true;
        }
      }
    }

    // Trigger corruption recovery if we have multiple recent failures with "data too small" error
    if (recentFailures >= 2 && hasDataTooSmallError) {
      logger.warn("🚨 Corruption pattern detected - triggering recovery modal", {
        recentFailures,
        hasDataTooSmallError,
        totalFailures: this.decryptionFailures.size,
      });

      // Emit event for UI to show corruption recovery modal
      this.triggerCorruptionRecovery();
    }
  }

  /**
   * Trigger corruption recovery modal (to be connected to UI)
   */
  triggerCorruptionRecovery() {
    // Don't spam the user - only show once per session
    if (window.corruptionModalShown) {
      return;
    }

    window.corruptionModalShown = true;

    // Emit custom event for UI components to listen to
    const event = new CustomEvent("syncCorruptionDetected", {
      detail: {
        failureCount: this.decryptionFailures?.size || 0,
        budgetId: this.budgetId?.substring(0, 8) + "...",
        timestamp: Date.now(),
      },
    });

    window.dispatchEvent(event);
    logger.info("🚨 Corruption recovery event dispatched");
  }
}

// Export singleton instance
export default new ChunkedSyncService();
