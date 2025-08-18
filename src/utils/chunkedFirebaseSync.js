import { initializeApp } from "firebase/app";
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
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { encryptionUtils } from "./encryption";
import { H } from "./highlight.js";
import { firebaseConfig } from "./firebaseConfig";
import logger from "./logger.js";

logger.info("🔥 Firebase: Starting initialization...", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

logger.info("✅ Firebase: Initialization complete!", {
  projectId: firebaseConfig.projectId,
});

// Expose Firebase to window for debugging (development/staging only)
if (
  typeof window !== "undefined" &&
  (import.meta.env.MODE === "development" ||
    window.location.hostname.includes("f4tdaddy.com") ||
    window.location.hostname.includes("vercel.app"))
) {
  window.firebaseApp = app;
  window.firebaseDb = db;
  window.firebaseAuth = auth;
}

// ---- Binary <-> Base64 helpers to avoid massive Function.apply() (stack overflow) ----
function base64FromBytes(bytes) {
  // Accepts Array<number> | Uint8Array
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const CHUNK_SIZE = 0x8000; // 32k chars per chunk keeps call stacks safe
  let binary = "";
  for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
    const slice = u8.subarray(i, i + CHUNK_SIZE);
    // Using apply on small chunks is safe and fast
    binary += String.fromCharCode.apply(null, slice);
  }
  return btoa(binary);
}

function bytesFromBase64(str) {
  const binary = atob(str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
// -----------------------------------------------------------------------------

/**
 * ChunkedFirebaseSync - Handles large budget data by splitting into multiple documents
 * Prevents Firestore 1MB document limit issues
 */
class ChunkedFirebaseSync {
  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    this.maxChunkSize = 400 * 1024; // 400KB target size (Firestore limit is 1MB, need significant room for encryption overhead)
    this.chunkSizeThreshold = 0.8; // Trigger re-chunking at 80% of max size
    this.isAuthenticated = false;
    this.authPromise = null;
    this.activeSavePromise = null; // Prevent concurrent saves
  }

  /**
   * Ensure user is authenticated with Firebase Auth
   */
  async ensureAuthenticated() {
    if (this.isAuthenticated) {
      return true;
    }

    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          try {
            if (user) {
              logger.info("🔥 Firebase user already authenticated:", user.uid);
              this.isAuthenticated = true;
              unsubscribe();
              resolve(true);
            } else {
              logger.info("🔥 Signing in anonymously to Firebase...");
              const userCredential = await signInAnonymously(auth);
              logger.info(
                "✅ Anonymous Firebase authentication successful:",
                userCredential.user.uid
              );
              this.isAuthenticated = true;
              unsubscribe();
              resolve(true);
            }
          } catch (error) {
            logger.error("❌ Firebase authentication failed:", error);

            // Handle specific auth configuration errors
            if (error.code === "auth/configuration-not-found") {
              logger.warn("🔧 Firebase Auth configuration issue detected:", {
                message: "Anonymous authentication may not be enabled in Firebase Console",
                solution:
                  "Enable Anonymous Authentication in Firebase Console > Authentication > Sign-in method",
                projectId: this.config?.projectId || "unknown",
              });

              // Don't fail completely - allow app to work in local-only mode
              logger.info("📱 Continuing in local-only mode without cloud sync");
              this.isAuthenticated = false;
              unsubscribe();
              resolve(false); // Resolve with false instead of rejecting
              return;
            }

            unsubscribe();
            reject(error);
          }
        },
        reject
      );
    });

    return this.authPromise;
  }

  initialize(budgetId, encryptionKey) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;

    logger.info("🗂️ ChunkedFirebaseSync initialized", {
      budgetId: budgetId?.substring(0, 8) + "...",
      maxChunkSizeKB: Math.round(this.maxChunkSize / 1024),
    });
  }

  /**
   * Calculate the byte size of an object when JSON stringified
   */
  calculateSize(data) {
    return new TextEncoder().encode(JSON.stringify(data)).length;
  }

  /**
   * Split array into chunks that don't exceed size limit
   */
  chunkArray(array, arrayName) {
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    // Base chunk structure overhead with encryption padding
    const baseChunkStructure = {
      chunkType: arrayName,
      chunkIndex: 0,
      totalChunks: 0,
      encryptedData: "",
      budgetId: this.budgetId,
      lastModified: Date.now(),
    };
    const baseSize = this.calculateSize(baseChunkStructure);

    // Reserve extra space for encryption overhead AND final document metadata
    // We need to be extremely conservative: raw data -> JSON -> encryption -> final doc structure
    const FIREBASE_MAX_SIZE = 1048576; // Firebase's actual 1MB limit
    const encryptionOverheadMultiplier = 4.5; // Balanced - ~300% overhead for JSON + encryption + metadata + safety margin
    const effectiveMaxSize = Math.floor(FIREBASE_MAX_SIZE / encryptionOverheadMultiplier);

    logger.debug(
      `🔧 Chunking ${arrayName} with effectiveMaxSize: ${Math.round(effectiveMaxSize / 1024)}KB (${effectiveMaxSize} bytes)`
    );

    for (const item of array) {
      const itemSize = this.calculateSize(item);
      const projectedChunkSize = currentSize + itemSize + baseSize;

      // Check if a single item is too large
      if (itemSize > effectiveMaxSize * 0.8) {
        logger.warn(`⚠️ Large ${arrayName} item detected:`, {
          itemSizeKB: Math.round(itemSize / 1024),
          effectiveMaxKB: Math.round(effectiveMaxSize / 1024),
          itemId: item.id || "unknown",
        });
      }

      // If adding this item would exceed the effective limit, start a new chunk
      if (projectedChunkSize > effectiveMaxSize && currentChunk.length > 0) {
        chunks.push([...currentChunk]);
        currentChunk = [item];
        currentSize = itemSize;
      } else {
        currentChunk.push(item);
        currentSize += itemSize;
      }

      // Safety check: if current chunk is getting too big, force a split
      if (currentSize > effectiveMaxSize * 0.9 && currentChunk.length > 1) {
        logger.warn(
          `🚨 Force splitting ${arrayName} chunk with ${currentChunk.length} items (${Math.round(currentSize / 1024)}KB)`
        );
        // Remove the last item before pushing the chunk
        const lastItem = currentChunk.pop();
        const lastItemSize = this.calculateSize(lastItem);

        chunks.push([...currentChunk]);

        // Start new chunk with the item that caused the split
        currentChunk = [lastItem];
        currentSize = lastItemSize;
      }
    }

    // Add the final chunk if it has data
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    logger.info(`📦 Split ${arrayName}:`, {
      totalItems: array.length,
      chunks: chunks.length,
      averageItemsPerChunk: Math.round(array.length / chunks.length),
      effectiveMaxSizeKB: Math.round(effectiveMaxSize / 1024),
      encryptionOverhead: `${((encryptionOverheadMultiplier - 1) * 100).toFixed(0)}%`,
      chunkSizes: chunks.map((chunk, i) => ({
        index: i,
        items: chunk.length,
        estimatedSizeKB: Math.round(this.calculateSize(chunk) / 1024),
      })),
    });

    return chunks;
  }

  /**
   * Generate chunk ID for consistent naming
   */
  generateChunkId(arrayName, chunkIndex) {
    return `${arrayName}-${String(chunkIndex).padStart(5, "0")}`;
  }

  /**
   * Create document manifest with chunk references
   */
  createManifest(chunkMap, metadata = {}) {
    return {
      type: "budget_manifest",
      budgetId: this.budgetId,
      lastModified: Date.now(),
      chunkMap,
      metadata: {
        totalDocuments: Object.values(chunkMap).reduce((sum, chunks) => sum + chunks.length, 0),
        createdAt: metadata.createdAt || new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * Save data to cloud using chunked approach
   */
  async saveToCloud(data, currentUser) {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("ChunkedFirebaseSync not initialized");
    }

    // Prevent concurrent saves that can cause corruption
    if (this.activeSavePromise) {
      logger.info("🔄 Save already in progress, waiting for completion...");
      return await this.activeSavePromise;
    }

    this.activeSavePromise = this._saveToCloudInternal(data, currentUser);
    try {
      const result = await this.activeSavePromise;
      return result;
    } finally {
      this.activeSavePromise = null;
    }
  }

  async _saveToCloudInternal(data, currentUser) {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("ChunkedFirebaseSync not initialized");
    }

    // Ensure user is authenticated before any Firestore operations
    const isAuthenticated = await this.ensureAuthenticated();
    if (!isAuthenticated) {
      logger.warn("⚠️ Skipping cloud save - Firebase Auth not available");
      return {
        success: false,
        error: "Firebase authentication unavailable",
        localOnly: true,
      };
    }

    try {
      logger.info("🌩️ Starting chunked save to cloud...");

      const startTime = Date.now();
      const batch = writeBatch(db);
      const chunkMap = {};

      // Arrays that need to be chunked
      const arrayFields = [
        "transactions",
        "envelopes",
        "bills",
        "debts",
        "savingsGoals",
        "paycheckHistory",
      ];

      // Process each array field
      for (const fieldName of arrayFields) {
        const array = data[fieldName] || [];

        logger.debug(`🔍 Processing ${fieldName}: ${array.length} items`);

        if (array.length === 0) {
          logger.debug(`⚠️ Skipping empty ${fieldName} array`);
          chunkMap[fieldName] = [];
          continue;
        }

        const chunks = this.chunkArray(array, fieldName);
        chunkMap[fieldName] = [];

        // Save each chunk as a separate document
        for (let i = 0; i < chunks.length; i++) {
          const chunkId = this.generateChunkId(fieldName, i);
          const chunkData = {
            chunkType: fieldName,
            chunkIndex: i,
            totalChunks: chunks.length,
            data: chunks[i],
            budgetId: this.budgetId,
            lastModified: Date.now(),
          };

          // Encrypt the chunk data
          const encryptedChunk = await encryptionUtils.encrypt(
            JSON.stringify(chunkData),
            this.encryptionKey
          );

          // Convert arrays to base64 to reduce Firestore storage size
          const chunkDoc = {
            encryptedData: {
              data: base64FromBytes(encryptedChunk.data),
              iv: base64FromBytes(encryptedChunk.iv),
            },
            chunkType: fieldName,
            chunkIndex: i,
            totalChunks: chunks.length,
            budgetId: this.budgetId,
            lastModified: Date.now(),
          };

          // Verify chunk size is within Firebase's 1MB limit
          const chunkSize = this.calculateSize(chunkDoc);
          const FIREBASE_MAX_SIZE = 1000000; // 1MB with safety margin (1,048,576 - 48,576 bytes buffer)

          logger.debug(`📏 Chunk ${chunkId} size check:`, {
            actualSizeKB: Math.round(chunkSize / 1024),
            firebaseLimitKB: Math.round(FIREBASE_MAX_SIZE / 1024),
            withinLimit: chunkSize <= FIREBASE_MAX_SIZE,
            rawDataItems: chunks[i].length,
            originalArraySize: encryptedChunk?.data?.length || 0,
            base64DataSize: chunkDoc.encryptedData?.data?.length || 0,
            base64IvSize: chunkDoc.encryptedData?.iv?.length || 0,
            compressionRatio: encryptedChunk?.data
              ? Math.round(
                  (chunkDoc.encryptedData.data.length / encryptedChunk.data.length) * 100
                ) + "%"
              : "N/A",
          });

          if (chunkSize > FIREBASE_MAX_SIZE) {
            logger.error(`❌ Chunk ${chunkId} exceeds Firebase size limit:`, {
              actualSizeKB: Math.round(chunkSize / 1024),
              firebaseLimitKB: Math.round(FIREBASE_MAX_SIZE / 1024),
              targetMaxSizeKB: Math.round(this.maxChunkSize / 1024),
              chunkType: fieldName,
              chunkIndex: i,
              itemsInChunk: chunks[i].length,
              encryptedDataSize: Math.round((encryptedChunk.data?.length || 0) / 1024),
            });

            // Instead of throwing immediately, try to re-chunk with smaller size
            if (chunks[i].length > 1) {
              logger.warn("🔄 Attempting to re-chunk with smaller size...");

              // Split this chunk in half and retry
              const midpoint = Math.floor(chunks[i].length / 2);
              const firstHalf = chunks[i].slice(0, midpoint);
              const secondHalf = chunks[i].slice(midpoint);

              // Replace current chunk with two smaller chunks
              chunks.splice(i, 1, firstHalf, secondHalf);

              // Update total chunks count and restart from this chunk
              for (let j = i; j < chunks.length; j++) {
                chunks[j].totalChunks = chunks.length;
              }

              logger.info(
                `📦 Re-chunked ${fieldName}[${i}]: split into ${firstHalf.length} + ${secondHalf.length} items`
              );
              i--; // Retry this index with the new smaller chunk
              continue;
            } else {
              // Single item is too large - this is a critical error
              throw new Error(
                `Single item in ${fieldName} is too large to store (${Math.round(chunkSize / 1024)}KB). Consider reducing data size.`
              );
            }
          }

          const docRef = doc(db, "budgets", this.budgetId, "chunks", chunkId);
          batch.set(docRef, chunkDoc);

          chunkMap[fieldName].push(chunkId);
        }
      }

      // Create and save the manifest document
      const manifest = this.createManifest(chunkMap, {
        currentUser: {
          userName: currentUser?.userName || "Anonymous",
          userColor: currentUser?.userColor || "#a855f7",
          lastSeen: new Date().toISOString(),
        },
        stats: {
          totalTransactions: data.transactions?.length || 0,
          totalEnvelopes: data.envelopes?.length || 0,
          totalBills: data.bills?.length || 0,
        },
      });

      // Encrypt manifest
      const encryptedManifest = await encryptionUtils.encrypt(
        JSON.stringify(manifest),
        this.encryptionKey
      );

      const manifestDoc = doc(db, "budgets", this.budgetId);
      batch.set(manifestDoc, {
        type: "budget_manifest",
        encryptedData: {
          data: base64FromBytes(encryptedManifest.data),
          iv: base64FromBytes(encryptedManifest.iv),
        },
        lastModified: Date.now(),
        chunkCount: Object.values(chunkMap).reduce((sum, chunks) => sum + chunks.length, 0),
      });

      // Execute the batch write atomically
      logger.info(
        `🔄 Committing ${Object.values(chunkMap).reduce((sum, chunks) => sum + chunks.length, 0) + 1} documents atomically...`
      );
      await batch.commit();

      const duration = Date.now() - startTime;
      const totalDocs = Object.values(chunkMap).reduce((sum, chunks) => sum + chunks.length, 0) + 1;

      logger.info("✅ Chunked save completed", {
        duration: `${duration}ms`,
        totalDocuments: totalDocs,
        chunkMap,
      });

      H.track("chunked-save-completed", {
        budgetId: this.budgetId,
        duration,
        totalDocuments: totalDocs,
        chunkBreakdown: Object.fromEntries(
          Object.entries(chunkMap).map(([key, chunks]) => [key, chunks.length])
        ),
      });
    } catch (error) {
      logger.error("❌ Chunked save failed:", error);
      H.consumeError(error, {
        metadata: { budgetId: this.budgetId, operation: "chunked_save" },
      });
      throw error;
    }
  }

  /**
   * Load data from cloud using chunked approach
   */
  async loadFromCloud() {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("ChunkedFirebaseSync not initialized");
    }

    // Ensure user is authenticated before any Firestore operations
    const isAuthenticated = await this.ensureAuthenticated();
    if (!isAuthenticated) {
      logger.warn("⚠️ Skipping cloud load - Firebase Auth not available");
      return { data: null, localOnly: true };
    }

    try {
      logger.info("🌩️ Starting chunked load from cloud...");

      // Debug current auth state and encryption key for cross-browser sync troubleshooting
      const currentUser = auth.currentUser;
      let encryptionKeyDebug = "none";
      if (this.encryptionKey) {
        try {
          // Get first 16 bytes of encryption key as hex for debugging (safe to log)
          const keyView = new Uint8Array(this.encryptionKey);
          encryptionKeyDebug = Array.from(keyView.slice(0, 16))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } catch (error) {
          encryptionKeyDebug = "error";
        }
      }

      logger.debug("🔍 Current Firebase Auth state:", {
        isSignedIn: !!currentUser,
        uid: currentUser?.uid,
        isAnonymous: currentUser?.isAnonymous,
        providerId: currentUser?.providerId,
        budgetId: this.budgetId?.slice(0, 8) || "none",
        fullBudgetId: this.budgetId,
        encryptionKeyPreview: encryptionKeyDebug,
        encryptionKeyLength: this.encryptionKey ? new Uint8Array(this.encryptionKey).length : 0,
      });

      const startTime = Date.now();

      // Load the manifest first
      logger.debug("📄 Attempting to fetch manifest document...", {
        budgetId: this.budgetId,
        collection: "budgets",
        isAuthenticated: this.isAuthenticated,
      });

      let manifestDoc;
      try {
        manifestDoc = await getDoc(doc(db, "budgets", this.budgetId));
        logger.debug("📄 Firebase getDoc completed, exists:", manifestDoc.exists());
      } catch (firestoreError) {
        logger.error("Firestore getDoc failed", firestoreError, {
          budgetId: this.budgetId,
          code: firestoreError.code,
          message: firestoreError.message,
          name: firestoreError.name,
          source: "chunkedFirebaseSync.loadFromCloud",
        });
        throw new Error(
          `Firestore read failed: ${firestoreError.code} - ${firestoreError.message}`
        );
      }

      if (!manifestDoc.exists()) {
        logger.info("📭 No cloud data found");
        return { data: null };
      }

      // Decrypt manifest
      const manifestData = manifestDoc.data();

      // Validate manifest encrypted data exists and has sufficient length
      if (!manifestData.encryptedData || manifestData.encryptedData.length < 32) {
        logger.error(`🔍 Corrupted manifest detected - triggering automatic cleanup`, {
          hasEncryptedData: !!manifestData.encryptedData,
          encryptedDataSize: manifestData.encryptedData?.length || 0,
          manifestKeys: Object.keys(manifestData),
        });

        // Automatically clean up corrupted manifest
        logger.info("🔧 Attempting automatic cleanup of corrupted manifest...");
        try {
          await this.resetCloudData();
          logger.info("✅ Corrupted manifest cleaned up successfully");
          // Return null to indicate no data available (will trigger fresh upload if local data exists)
          return { data: null, recovered: true };
        } catch (cleanupError) {
          logger.error("❌ Failed to cleanup corrupted manifest:", cleanupError);
        }

        throw new Error(
          `Invalid or corrupted manifest data (size: ${manifestData.encryptedData?.length || 0})`
        );
      }

      logger.debug("🔓 Attempting to decrypt manifest", {
        encryptedDataSize: manifestData.encryptedData?.length || 0,
        encryptedDataType: typeof manifestData.encryptedData,
        hasEncryptionKey: !!this.encryptionKey,
        isBase64Format: typeof manifestData.encryptedData?.data === "string",
      });

      // Handle both old array format and new base64 format for manifest
      let decryptedManifest;
      if (typeof manifestData.encryptedData?.data === "string") {
        // New base64 format
        const manifestDecryptionData = {
          data: Array.from(bytesFromBase64(manifestData.encryptedData.data)),
          iv: Array.from(bytesFromBase64(manifestData.encryptedData.iv)),
        };
        decryptedManifest = JSON.parse(
          await encryptionUtils.decrypt(
            manifestDecryptionData.data,
            this.encryptionKey,
            manifestDecryptionData.iv
          )
        );
      } else {
        // Old array format (backward compatibility)
        decryptedManifest = JSON.parse(
          await encryptionUtils.decrypt(manifestData.encryptedData, this.encryptionKey)
        );
      }

      if (decryptedManifest.type !== "budget_manifest") {
        throw new Error("Invalid manifest document");
      }

      const chunkMap = decryptedManifest.chunkMap;
      const reconstructedData = {
        lastModified: decryptedManifest.lastModified,
      };

      // Load all chunks for each array field
      for (const [fieldName, chunkIds] of Object.entries(chunkMap)) {
        if (chunkIds.length === 0) {
          reconstructedData[fieldName] = [];
          continue;
        }

        const chunks = [];

        // Load all chunks for this field
        for (const chunkId of chunkIds) {
          const chunkDoc = await getDoc(doc(db, "budgets", this.budgetId, "chunks", chunkId));

          if (chunkDoc.exists()) {
            const encryptedChunk = chunkDoc.data();

            // Validate encrypted data exists and has sufficient length
            if (!encryptedChunk.encryptedData || encryptedChunk.encryptedData.length < 32) {
              logger.warn(
                `⚠️ Invalid or corrupted chunk data: ${chunkId} (size: ${encryptedChunk.encryptedData?.length || 0})`
              );
              continue;
            }

            try {
              logger.debug(`🔓 Attempting to decrypt chunk ${chunkId}`, {
                hasEncryptedData: !!encryptedChunk.encryptedData,
                encryptedDataType: typeof encryptedChunk.encryptedData,
                chunkType: encryptedChunk.chunkType,
                chunkIndex: encryptedChunk.chunkIndex,
                isBase64Format: typeof encryptedChunk.encryptedData?.data === "string",
              });

              // Handle both old array format and new base64 format
              let decryptionData;
              if (typeof encryptedChunk.encryptedData?.data === "string") {
                // New base64 format
                decryptionData = {
                  data: Array.from(bytesFromBase64(encryptedChunk.encryptedData.data)),
                  iv: Array.from(bytesFromBase64(encryptedChunk.encryptedData.iv)),
                };
              } else {
                // Old array format (backward compatibility)
                decryptionData = encryptedChunk.encryptedData;
              }

              const decryptedChunk = JSON.parse(
                await encryptionUtils.decrypt(
                  decryptionData.data,
                  this.encryptionKey,
                  decryptionData.iv
                )
              );

              chunks.push({
                index: decryptedChunk.chunkIndex,
                data: decryptedChunk.data,
              });
            } catch (decryptError) {
              logger.warn(`⚠️ Failed to decrypt chunk: ${chunkId}`, decryptError.message);
              // Skip corrupted chunks rather than failing the entire operation
              continue;
            }
          } else {
            logger.warn(`⚠️ Missing chunk: ${chunkId}`);
          }
        }

        // Sort chunks by index and flatten data
        chunks.sort((a, b) => a.index - b.index);
        reconstructedData[fieldName] = chunks.flatMap((chunk) => chunk.data);
      }

      const duration = Date.now() - startTime;
      logger.info("✅ Chunked load completed", {
        duration: `${duration}ms`,
        reconstructedFields: Object.keys(reconstructedData),
        totalItems: Object.entries(reconstructedData)
          .filter(([key]) => Array.isArray(reconstructedData[key]))
          .reduce((sum, [, arr]) => sum + arr.length, 0),
      });

      return { data: reconstructedData };
    } catch (error) {
      logger.error("❌ Chunked load failed:", error);
      logger.error("⚠️ ⚠️ Failed to fetch chunked Firestore data", error.message);

      // Provide more specific error context and auto-recovery
      if (
        error.message.includes("provided data is too small") ||
        error.message.includes("too small") ||
        error.message.includes("operation failed for an operation-specific reason")
      ) {
        logger.error(
          "🔍 This error typically occurs when trying to decrypt corrupted or incomplete data chunks."
        );
        logger.error("💡 The chunks may have been partially written or corrupted during upload.");

        // Automatically clean up corrupted data to allow fresh sync
        logger.info("🔧 Attempting automatic cleanup of corrupted cloud data...");
        try {
          await this.resetCloudData();
          logger.info("✅ Corrupted cloud data cleaned up successfully");
          // Return null to indicate no data available (will trigger fresh upload if local data exists)
          return { data: null, recovered: true };
        } catch (cleanupError) {
          logger.error("❌ Failed to cleanup corrupted data:", cleanupError);
        }
      }

      H.consumeError(error, {
        metadata: {
          budgetId: this.budgetId,
          operation: "chunked_load",
          errorType: error.message.includes("too small") ? "data_too_small" : "unknown",
        },
      });
      throw error;
    }
  }

  /**
   * Clean up old cloud data (for migration)
   */
  async resetCloudData() {
    if (!this.budgetId) {
      throw new Error("ChunkedFirebaseSync not initialized");
    }

    // Ensure user is authenticated before any Firestore operations
    const isAuthenticated = await this.ensureAuthenticated();
    if (!isAuthenticated) {
      logger.warn("⚠️ Skipping cloud reset - Firebase Auth not available");
      return {
        success: false,
        error: "Firebase authentication unavailable",
        localOnly: true,
      };
    }

    try {
      logger.info("🗑️ Cleaning up old cloud data...");

      // Delete the old single-document budget
      const oldDocRef = doc(db, "budgets", this.budgetId);
      await setDoc(oldDocRef, { deleted: true, deletedAt: Date.now() });

      // Delete all existing chunks
      const chunksQuery = query(
        collection(db, "budgets", this.budgetId, "chunks"),
        where("budgetId", "==", this.budgetId)
      );

      const chunksSnapshot = await getDocs(chunksQuery);
      const batch = writeBatch(db);

      chunksSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (chunksSnapshot.docs.length > 0) {
        await batch.commit();
        logger.info(`🗑️ Deleted ${chunksSnapshot.docs.length} old chunk documents`);
      }

      logger.info("✅ Cloud data reset completed");
    } catch (error) {
      logger.error("❌ Cloud data reset failed:", error);
      throw error;
    }
  }
}

export default new ChunkedFirebaseSync();
