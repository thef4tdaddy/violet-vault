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
} from "firebase/firestore";
import { encryptionUtils } from "../utils/security/encryption";
import firebaseSyncService from "./firebaseSyncService";
import logger from "../utils/common/logger";
import { SyncMutex } from "../utils/sync/SyncMutex";
import {
  validateEncryptedData,
  validateManifest,
  generateChecksum,
} from "../utils/sync/validation";
import { createSyncResilience } from "../utils/sync/resilience";

/**
 * Binary <-> Base64 helpers to avoid massive Function.apply() (stack overflow)
 */
function base64FromBytes(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const CHUNK_SIZE = 0x8000; // 32k chars per chunk keeps call stacks safe
  let binary = "";
  for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
    const chunk = u8.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function bytesFromBase64(str) {
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
    throw new Error(`Failed to decode base64 string (length: ${str.length}): ${error.message}`);
  }
}

/**
 * Chunked Firebase Sync Service
 * Handles synchronization of large datasets by breaking them into smaller chunks
 */
class ChunkedSyncService {
  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    this.maxChunkSize = 800 * 1024; // 800KB per chunk (under Firestore 1MB limit)
    this.maxArrayChunkSize = 1000; // Max items per array chunk
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
  async initialize(budgetId, encryptionKey) {
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
    return getFirestore(firebaseSyncService.app);
  }

  /**
   * Safe JSON stringify with error handling
   */
  safeStringify(data) {
    try {
      return JSON.stringify(data, (key, value) => {
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
   * Calculate data size in bytes
   */
  calculateSize(data) {
    const jsonString = this.safeStringify(data);
    return new Blob([jsonString]).size;
  }

  /**
   * Chunk large arrays into smaller pieces
   */
  chunkArray(array, arrayName) {
    if (!Array.isArray(array)) {
      return { [arrayName]: array };
    }

    const chunks = {};
    const totalItems = array.length;

    if (totalItems === 0) {
      chunks[arrayName] = [];
      return chunks;
    }

    // Calculate chunk size based on data size and item count
    let chunkSize = this.maxArrayChunkSize;
    const sampleSize = this.calculateSize(array.slice(0, Math.min(10, array.length)));
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
  generateChunkId(arrayName, chunkIndex) {
    return `${arrayName}_chunk_${chunkIndex.toString().padStart(3, "0")}`;
  }

  /**
   * Create manifest with chunk information
   */
  createManifest(chunkMap, metadata = {}) {
    const manifest = {
      version: "2.0",
      timestamp: Date.now(),
      chunks: {},
      metadata: {
        totalChunks: 0,
        totalSize: 0,
        ...metadata,
      },
    };

    for (const [chunkId, data] of Object.entries(chunkMap)) {
      const size = this.calculateSize(data);
      manifest.chunks[chunkId] = {
        size,
        itemCount: Array.isArray(data) ? data.length : 1,
        type: Array.isArray(data) ? "array" : "object",
      };
      manifest.metadata.totalSize += size;
      manifest.metadata.totalChunks++;
    }

    logger.debug("Created manifest", {
      totalChunks: manifest.metadata.totalChunks,
      totalSize: manifest.metadata.totalSize,
    });

    return manifest;
  }

  /**
   * Save large dataset to cloud using chunking
   */
  async saveToCloud(data, currentUser) {
    return this.syncMutex.execute(async () => {
      if (!this.budgetId || !this.encryptionKey) {
        throw new Error("Chunked sync not initialized");
      }

      const db = this._getDb();
      const startTime = Date.now();

      // Warn if currentUser is undefined - check for budgetId (primary), uid (Firebase), or id (local user)
      if (!currentUser?.budgetId && !currentUser?.uid && !currentUser?.id) {
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
        logger.info("Starting chunked save to cloud", {
          dataSize: this.calculateSize(data),
          userId: currentUser?.budgetId || currentUser?.uid || currentUser?.id || "anonymous",
        });

        // Identify large arrays to chunk
        const chunkedData = {};
        const chunkMap = {};

        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.length > 100) {
            // Chunk large arrays
            const arrayChunks = this.chunkArray(value, key);
            Object.assign(chunkMap, arrayChunks);
            chunkedData[key] = { _chunked: true, _originalSize: value.length };
          } else {
            // Keep small data in main document
            chunkedData[key] = value;
          }
        }

        // Create manifest
        const manifest = this.createManifest(chunkMap, {
          userId: currentUser?.budgetId || currentUser?.uid || currentUser?.id || "anonymous",
          userAgent: navigator.userAgent,
          originalKeys: Object.keys(data),
        });

        // Encrypt and save manifest
        const encryptedManifest = await encryptionUtils.encrypt(
          this.safeStringify(manifest),
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

        const mainDocument = {
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
            userId: currentUser?.budgetId || currentUser?.uid || currentUser?.id || "anonymous",
            chunkedKeys: Object.keys(data).filter(
              (key) => Array.isArray(data[key]) && data[key].length > 100
            ),
          },
        };

        // Save main document with resilience
        await this.resilience.execute(
          () => setDoc(doc(db, "budgets", this.budgetId), mainDocument),
          "saveMainDocument",
          "saveMainDocument"
        );

        // Save chunks in batches
        const chunkEntries = Object.entries(chunkMap);
        const batchSize = 500; // Firestore batch limit

        for (let i = 0; i < chunkEntries.length; i += batchSize) {
          const batch = writeBatch(db);
          const batchChunks = chunkEntries.slice(i, i + batchSize);

          for (const [chunkId, chunkData] of batchChunks) {
            const encryptedChunk = await encryptionUtils.encrypt(
              this.safeStringify(chunkData),
              this.encryptionKey
            );

            const chunkDocument = {
              encryptedData: {
                data: base64FromBytes(encryptedChunk.encryptedData),
                iv: base64FromBytes(encryptedChunk.iv),
              },
              budgetId: this.budgetId,
              chunkId,
              timestamp: Date.now(),
            };

            batch.set(doc(db, "budgets", this.budgetId, "chunks", chunkId), chunkDocument);
          }

          // Commit batch with resilience
          await this.resilience.execute(
            () => batch.commit(),
            "saveChunkBatch",
            `saveChunkBatch-${Math.floor(i / batchSize) + 1}`
          );
          logger.debug(
            `Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunkEntries.length / batchSize)}`
          );
        }

        const duration = Date.now() - startTime;
        logger.info("✅ Chunked save completed successfully", {
          totalChunks: chunkEntries.length,
          duration: `${duration}ms`,
          mainDocSize: this.calculateSize(mainDocument),
        });

        return { success: true };
      } catch (error) {
        logger.error("❌ Chunked save failed", error);
        throw error;
      }
    }, "saveToCloud");
  }

  /**
   * Load large dataset from cloud with chunk reassembly
   */
  async loadFromCloud() {
    return this.syncMutex.execute(async () => {
      if (!this.budgetId || !this.encryptionKey) {
        throw new Error("Chunked sync not initialized");
      }

      const db = this._getDb();
      const startTime = Date.now();

      try {
        logger.info("Starting chunked load from cloud");

        // Load main document with resilience
        const mainDoc = await this.resilience.execute(
          () => getDoc(doc(db, "budgets", this.budgetId)),
          "loadMainDocument",
          "loadMainDocument"
        );
        if (!mainDoc.exists()) {
          logger.info("No cloud data found");
          return null;
        }

        const mainData = mainDoc.data();
        const reconstructedData = { ...mainData };

        // Remove internal metadata
        delete reconstructedData._manifest;
        delete reconstructedData._metadata;

        // Check if we have chunks to reassemble
        if (mainData._manifest) {
          let manifest;
          try {
            // Validate manifest data before decryption
            if (
              !mainData._manifest?.encryptedData?.data ||
              !mainData._manifest?.encryptedData?.iv
            ) {
              throw new Error("Missing encrypted manifest data structure");
            }

            const encryptedDataBytes = bytesFromBase64(mainData._manifest.encryptedData.data);
            const ivBytes = bytesFromBase64(mainData._manifest.encryptedData.iv);

            // Check if data is too small (common corruption indicator)
            if (encryptedDataBytes.length < 16 || ivBytes.length < 12) {
              throw new Error(
                `Corrupted manifest data: encrypted=${encryptedDataBytes.length}bytes, iv=${ivBytes.length}bytes`
              );
            }

            // Decrypt manifest
            const manifestData = await encryptionUtils.decrypt(
              {
                data: encryptedDataBytes,
                iv: ivBytes,
              },
              this.encryptionKey
            );

            manifest = JSON.parse(manifestData);
          } catch (decryptError) {
            logger.error("❌ Failed to decrypt manifest - may be corrupted or key mismatch", {
              error: decryptError.message,
              errorType: decryptError.name,
              budgetId: this.budgetId.substring(0, 8) + "...",
            });

            // NEVER automatically clear data - this is too destructive and causes data loss
            // Smart detection: avoid repeatedly trying to decrypt the same bad data
            const errorSignature = `${this.budgetId}_${decryptError.message}`;
            const now = Date.now();

            // Track failed decryption attempts to avoid repeated attempts
            if (!this.decryptionFailures) {
              this.decryptionFailures = new Map();
            }

            const lastFailure = this.decryptionFailures.get(errorSignature);
            const backoffTime = 5 * 60 * 1000; // 5 minutes

            if (lastFailure && now - lastFailure < backoffTime) {
              logger.info("🔇 Skipping repeated decryption attempt (in backoff period)");
              return null; // Skip without logging noise
            }

            this.decryptionFailures.set(errorSignature, now);

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
            totalChunks: manifest.metadata.totalChunks,
          });

          // Load all chunks
          const chunksQuery = query(
            collection(db, "budgets", this.budgetId, "chunks"),
            where("budgetId", "==", this.budgetId)
          );

          const chunksSnapshot = await this.resilience.execute(
            () => getDocs(chunksQuery),
            "loadChunks", 
            "loadChunks"
          );
          const chunks = {};

          // Decrypt all chunks with individual error handling
          for (const chunkDoc of chunksSnapshot.docs) {
            const chunkData = chunkDoc.data();
            try {
              const decryptedChunk = await encryptionUtils.decrypt(
                {
                  data: bytesFromBase64(chunkData.encryptedData.data),
                  iv: bytesFromBase64(chunkData.encryptedData.iv),
                },
                this.encryptionKey
              );

              chunks[chunkData.chunkId] = JSON.parse(decryptedChunk);
            } catch (chunkDecryptError) {
              logger.error("❌ Failed to decrypt chunk - skipping corrupted chunk", {
                chunkId: chunkData.chunkId,
                error: chunkDecryptError.message,
                errorType: chunkDecryptError.name,
              });
              // Skip this chunk but continue with others
              continue;
            }
          }

          // Reassemble chunked arrays
          for (const [key, value] of Object.entries(reconstructedData)) {
            if (value && typeof value === "object" && value._chunked) {
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
        });

        return reconstructedData;
      } catch (error) {
        logger.error("❌ Chunked load failed", error);
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
      throw error;
    }
  }

  /**
   * Clear corrupted cloud data and reset to clean state
   */
  async clearCorruptedData() {
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
      return true;
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
    return await this.clearCorruptedData();
  }

  /**
   * Get sync statistics including resilience metrics
   */
  getStats() {
    const baseStats = {
      maxChunkSize: this.maxChunkSize,
      maxArrayChunkSize: this.maxArrayChunkSize,
      isInitialized: !!(this.budgetId && this.encryptionKey),
    };

    // Add Phase 2 resilience metrics
    const resilienceStatus = this.resilience?.getStatus();
    
    return {
      ...baseStats,
      resilience: resilienceStatus,
      phase1: {
        mutexEnabled: !!this.syncMutex,
        validationEnabled: true,
      },
      phase2: {
        retryEnabled: !!resilienceStatus?.retry,
        circuitBreakerEnabled: !!resilienceStatus?.circuit,
        queueEnabled: !!resilienceStatus?.queue,
      },
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

    for (const [errorSignature, timestamp] of this.decryptionFailures) {
      if (timestamp > recentThreshold) {
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
