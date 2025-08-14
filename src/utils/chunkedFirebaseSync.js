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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * ChunkedFirebaseSync - Handles large budget data by splitting into multiple documents
 * Prevents Firestore 1MB document limit issues
 */
class ChunkedFirebaseSync {
  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    this.maxChunkSize = 800 * 1024; // 800KB target size (Firestore limit is 1MB, leaving room for encryption overhead)
    this.chunkSizeThreshold = 0.8; // Trigger re-chunking at 80% of max size
    this.isAuthenticated = false;
    this.authPromise = null;
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
              console.log("🔥 Firebase user already authenticated:", user.uid);
              this.isAuthenticated = true;
              unsubscribe();
              resolve(true);
            } else {
              console.log("🔥 Signing in anonymously to Firebase...");
              const userCredential = await signInAnonymously(auth);
              console.log(
                "✅ Anonymous Firebase authentication successful:",
                userCredential.user.uid,
              );
              this.isAuthenticated = true;
              unsubscribe();
              resolve(true);
            }
          } catch (error) {
            console.error("❌ Firebase authentication failed:", error);

            // Handle specific auth configuration errors
            if (error.code === "auth/configuration-not-found") {
              console.warn("🔧 Firebase Auth configuration issue detected:", {
                message:
                  "Anonymous authentication may not be enabled in Firebase Console",
                solution:
                  "Enable Anonymous Authentication in Firebase Console > Authentication > Sign-in method",
                projectId: this.config?.projectId || "unknown",
              });

              // Don't fail completely - allow app to work in local-only mode
              console.log(
                "📱 Continuing in local-only mode without cloud sync",
              );
              this.isAuthenticated = false;
              unsubscribe();
              resolve(false); // Resolve with false instead of rejecting
              return;
            }

            unsubscribe();
            reject(error);
          }
        },
        reject,
      );
    });

    return this.authPromise;
  }

  initialize(budgetId, encryptionKey) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;

    console.log("🗂️ ChunkedFirebaseSync initialized", {
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

    // Reserve extra space for encryption overhead (empirically observed ~100% overhead)
    const encryptionOverheadMultiplier = 2.2; // Conservative estimate based on real data
    const effectiveMaxSize = Math.floor(
      this.maxChunkSize / encryptionOverheadMultiplier,
    );

    for (const item of array) {
      const itemSize = this.calculateSize(item);
      const projectedChunkSize = currentSize + itemSize + baseSize;

      // If adding this item would exceed the effective limit, start a new chunk
      if (projectedChunkSize > effectiveMaxSize && currentChunk.length > 0) {
        chunks.push([...currentChunk]);
        currentChunk = [item];
        currentSize = itemSize;
      } else {
        currentChunk.push(item);
        currentSize += itemSize;
      }
    }

    // Add the final chunk if it has data
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    console.log(`📦 Split ${arrayName}:`, {
      totalItems: array.length,
      chunks: chunks.length,
      averageItemsPerChunk: Math.round(array.length / chunks.length),
      effectiveMaxSizeKB: Math.round(effectiveMaxSize / 1024),
      encryptionOverhead: `${((encryptionOverheadMultiplier - 1) * 100).toFixed(0)}%`,
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
        totalDocuments: Object.values(chunkMap).reduce(
          (sum, chunks) => sum + chunks.length,
          0,
        ),
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

    // Ensure user is authenticated before any Firestore operations
    const isAuthenticated = await this.ensureAuthenticated();
    if (!isAuthenticated) {
      console.log("⚠️ Skipping cloud save - Firebase Auth not available");
      return {
        success: false,
        error: "Firebase authentication unavailable",
        localOnly: true,
      };
    }

    try {
      console.log("🌩️ Starting chunked save to cloud...");

      const startTime = Date.now();
      const batch = writeBatch(db);
      const chunkMap = {};

      // Arrays that need to be chunked
      const arrayFields = [
        "transactions",
        "envelopes",
        "bills",
        "savingsGoals",
        "paycheckHistory",
      ];

      // Process each array field
      for (const fieldName of arrayFields) {
        const array = data[fieldName] || [];

        if (array.length === 0) {
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
            this.encryptionKey,
          );

          const chunkDoc = {
            encryptedData: encryptedChunk,
            chunkType: fieldName,
            chunkIndex: i,
            totalChunks: chunks.length,
            budgetId: this.budgetId,
            lastModified: Date.now(),
          };

          // Verify chunk size is within limit
          const chunkSize = this.calculateSize(chunkDoc);
          if (chunkSize > this.maxChunkSize) {
            console.error(`❌ Chunk ${chunkId} exceeds size limit:`, {
              actualSizeKB: Math.round(chunkSize / 1024),
              maxSizeKB: Math.round(this.maxChunkSize / 1024),
              chunkType: fieldName,
              chunkIndex: i,
              itemsInChunk: chunks[i].length,
              encryptedDataSize: Math.round(encryptedChunk.length / 1024),
            });

            // Instead of throwing immediately, try to re-chunk with smaller size
            if (chunks[i].length > 1) {
              console.warn("🔄 Attempting to re-chunk with smaller size...");

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

              console.log(
                `📦 Re-chunked ${fieldName}[${i}]: split into ${firstHalf.length} + ${secondHalf.length} items`,
              );
              i--; // Retry this index with the new smaller chunk
              continue;
            } else {
              // Single item is too large - this is a critical error
              throw new Error(
                `Single item in ${fieldName} is too large to store (${Math.round(chunkSize / 1024)}KB). Consider reducing data size.`,
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
        this.encryptionKey,
      );

      const manifestDoc = doc(db, "budgets", this.budgetId);
      batch.set(manifestDoc, {
        type: "budget_manifest",
        encryptedData: encryptedManifest,
        lastModified: Date.now(),
        chunkCount: Object.values(chunkMap).reduce(
          (sum, chunks) => sum + chunks.length,
          0,
        ),
      });

      // Execute the batch write
      await batch.commit();

      const duration = Date.now() - startTime;
      const totalDocs =
        Object.values(chunkMap).reduce(
          (sum, chunks) => sum + chunks.length,
          0,
        ) + 1;

      console.log("✅ Chunked save completed", {
        duration: `${duration}ms`,
        totalDocuments: totalDocs,
        chunkMap,
      });

      H.track("chunked-save-completed", {
        budgetId: this.budgetId,
        duration,
        totalDocuments: totalDocs,
        chunkBreakdown: Object.fromEntries(
          Object.entries(chunkMap).map(([key, chunks]) => [key, chunks.length]),
        ),
      });
    } catch (error) {
      console.error("❌ Chunked save failed:", error);
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
      console.log("⚠️ Skipping cloud load - Firebase Auth not available");
      return { data: null, localOnly: true };
    }

    try {
      console.log("🌩️ Starting chunked load from cloud...");

      const startTime = Date.now();

      // Load the manifest first
      const manifestDoc = await getDoc(doc(db, "budgets", this.budgetId));

      if (!manifestDoc.exists()) {
        console.log("📭 No cloud data found");
        return { data: null };
      }

      // Decrypt manifest
      const manifestData = manifestDoc.data();
      const decryptedManifest = JSON.parse(
        await encryptionUtils.decrypt(
          manifestData.encryptedData,
          this.encryptionKey,
        ),
      );

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
          const chunkDoc = await getDoc(
            doc(db, "budgets", this.budgetId, "chunks", chunkId),
          );

          if (chunkDoc.exists()) {
            const encryptedChunk = chunkDoc.data();
            const decryptedChunk = JSON.parse(
              await encryptionUtils.decrypt(
                encryptedChunk.encryptedData,
                this.encryptionKey,
              ),
            );

            chunks.push({
              index: decryptedChunk.chunkIndex,
              data: decryptedChunk.data,
            });
          } else {
            console.warn(`⚠️ Missing chunk: ${chunkId}`);
          }
        }

        // Sort chunks by index and flatten data
        chunks.sort((a, b) => a.index - b.index);
        reconstructedData[fieldName] = chunks.flatMap((chunk) => chunk.data);
      }

      const duration = Date.now() - startTime;
      console.log("✅ Chunked load completed", {
        duration: `${duration}ms`,
        reconstructedFields: Object.keys(reconstructedData),
        totalItems: Object.entries(reconstructedData)
          .filter(([key]) => Array.isArray(reconstructedData[key]))
          .reduce((sum, [, arr]) => sum + arr.length, 0),
      });

      return { data: reconstructedData };
    } catch (error) {
      console.error("❌ Chunked load failed:", error);
      H.consumeError(error, {
        metadata: { budgetId: this.budgetId, operation: "chunked_load" },
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
      console.log("⚠️ Skipping cloud reset - Firebase Auth not available");
      return {
        success: false,
        error: "Firebase authentication unavailable",
        localOnly: true,
      };
    }

    try {
      console.log("🗑️ Cleaning up old cloud data...");

      // Delete the old single-document budget
      const oldDocRef = doc(db, "budgets", this.budgetId);
      await setDoc(oldDocRef, { deleted: true, deletedAt: Date.now() });

      // Delete all existing chunks
      const chunksQuery = query(
        collection(db, "budgets", this.budgetId, "chunks"),
        where("budgetId", "==", this.budgetId),
      );

      const chunksSnapshot = await getDocs(chunksQuery);
      const batch = writeBatch(db);

      chunksSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (chunksSnapshot.docs.length > 0) {
        await batch.commit();
        console.log(
          `🗑️ Deleted ${chunksSnapshot.docs.length} old chunk documents`,
        );
      }

      console.log("✅ Cloud data reset completed");
    } catch (error) {
      console.error("❌ Cloud data reset failed:", error);
      throw error;
    }
  }
}

export default new ChunkedFirebaseSync();
