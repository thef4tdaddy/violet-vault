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
import { firebaseConfig } from "@/utils/common/firebaseConfig";
import { initializeApp, FirebaseApp } from "firebase/app";
import { encryptionManager } from "../../security/encryptionManager";
import logger from "@/utils/common/logger";
import { SyncProvider } from "../syncOrchestrator";
import { TypedResponse, SafeUnknown, categorizeFirebaseError } from "@/types/firebase";

interface SyncData extends Record<string, unknown> {
  lastModified?: number;
  unassignedCash?: number;
  actualBalance?: number;
  envelopes?: SafeUnknown[];
  transactions?: SafeUnknown[];
}

/**
 * FirebaseSyncProvider
 * Implements the SyncProvider interface using Firebase/Firestore.
 * Handles chunking, manifest management, and encryption.
 */
export class FirebaseSyncProvider implements SyncProvider {
  public name = "firebase";
  private app: FirebaseApp | null = null;
  private budgetId: string | null = null;
  private key: CryptoKey | null = null;

  public async initialize(budgetId: string, key: CryptoKey): Promise<void> {
    this.budgetId = budgetId;
    this.key = key;

    if (!this.app) {
      this.app = initializeApp(firebaseConfig);
    }

    await this.ensureAuthenticated();
  }

  public async ensureAuthenticated(): Promise<boolean> {
    const auth = getAuth(this.app!);
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          resolve(true);
        } else {
          try {
            await signInAnonymously(auth);
            resolve(true);
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  }

  public async save<T extends SafeUnknown>(data: T): Promise<TypedResponse<boolean>> {
    if (!this.budgetId || !this.key) throw new Error("FirebaseSyncProvider: Not initialized");

    try {
      const db = getFirestore(this.app!);
      const startTime = Date.now();

      // 1. Determine Sync Direction
      const cloudResult = await this.load();
      const cloudData = cloudResult.data;

      const direction = this.determineDirection(
        data as unknown as SyncData,
        cloudData as unknown as SyncData
      );

      if (direction === "download") {
        logger.info(
          "FirebaseSyncProvider: Cloud data is newer or local is empty, triggering download"
        );
        await this.syncToLocal(cloudData as Record<string, unknown>);
        return { success: true, timestamp: Date.now(), data: true };
      }

      // 2. Perform Upload
      logger.info("FirebaseSyncProvider: Starting upload to cloud");

      const chunkMap: Record<string, SafeUnknown[]> = {};
      const mainData: Record<string, SafeUnknown> = {
        ...(data as Record<string, unknown>),
      } as Record<string, SafeUnknown>;

      for (const [key, value] of Object.entries(mainData)) {
        if (Array.isArray(value) && value.length > 500) {
          for (let i = 0; i < value.length; i += 500) {
            const chunkId = `${key}_chunk_${Math.floor(i / 500)
              .toString()
              .padStart(3, "0")}`;
            chunkMap[chunkId] = value.slice(i, i + 500) as SafeUnknown[];
          }
          mainData[key] = { _chunked: true, count: value.length };
        }
      }

      // 3. Encrypt and Save Main Document
      const encryptedMain = await encryptionManager.encrypt(mainData);
      await setDoc(doc(db, "budgets", this.budgetId), {
        ...encryptedMain,
        _metadata: {
          version: "2.0",
          timestamp: Date.now(),
          type: "orchestrated",
        },
      });

      // 4. Save Chunks
      if (Object.keys(chunkMap).length > 0) {
        const batch = writeBatch(db);
        for (const [chunkId, chunkData] of Object.entries(chunkMap)) {
          const encryptedChunk = await encryptionManager.encrypt(chunkData);
          const chunkRef = doc(db, "budgets", this.budgetId, "chunks", chunkId);
          batch.set(chunkRef, {
            ...encryptedChunk,
            budgetId: this.budgetId,
            chunkId,
            timestamp: Date.now(),
          });
        }
        await batch.commit();
      }

      logger.info(`FirebaseSyncProvider: Upload complete (${Date.now() - startTime}ms)`);
      return { success: true, timestamp: Date.now(), data: true };
    } catch (error) {
      logger.error("FirebaseSyncProvider: Save failed", { error });
      return {
        success: false,
        timestamp: Date.now(),
        error: {
          code: "SAVE_FAILED",
          message: error instanceof Error ? error.message : String(error),
          category: categorizeFirebaseError(error),
          timestamp: Date.now(),
        },
      };
    }
  }

  public async load<T extends SafeUnknown>(): Promise<TypedResponse<T | null>> {
    if (!this.budgetId || !this.key) throw new Error("FirebaseSyncProvider: Not initialized");

    try {
      const db = getFirestore(this.app!);
      const docRef = doc(db, "budgets", this.budgetId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) return { success: true, timestamp: Date.now(), data: null };

      const mainDoc = snap.data();
      const decMainPayload = mainDoc as unknown as {
        data: number[];
        iv: number[];
        metadata?: Record<string, unknown>;
      };
      const decryptedMain = await encryptionManager.decrypt<SyncData>(decMainPayload);

      const reassembled = { ...decryptedMain };
      const chunksQuery = query(
        collection(db, "budgets", this.budgetId, "chunks"),
        where("budgetId", "==", this.budgetId)
      );
      const chunksSnap = await getDocs(chunksQuery);

      const chunkDataMap: Record<string, SafeUnknown[]> = {};
      for (const chunkDoc of chunksSnap.docs) {
        const c = chunkDoc.data();
        const decPayload = c as unknown as {
          data: number[];
          iv: number[];
          metadata?: Record<string, unknown>;
        };
        const decryptedChunk = await encryptionManager.decrypt<SafeUnknown[]>(decPayload);
        const [baseKey] = c.chunkId.split("_chunk_");
        if (!chunkDataMap[baseKey]) chunkDataMap[baseKey] = [];
        chunkDataMap[baseKey].push(...decryptedChunk);
      }

      for (const [key, value] of Object.entries(chunkDataMap)) {
        reassembled[key] = value;
      }

      return { success: true, timestamp: Date.now(), data: reassembled as T };
    } catch (error) {
      logger.error("FirebaseSyncProvider: Load failed", { error });
      return {
        success: false,
        timestamp: Date.now(),
        error: {
          code: "LOAD_FAILED",
          message: error instanceof Error ? error.message : String(error),
          category: categorizeFirebaseError(error),
          timestamp: Date.now(),
        },
      };
    }
  }

  private determineDirection(
    local: Record<string, unknown> | null,
    cloud: Record<string, unknown> | null
  ): "upload" | "download" | "none" {
    if (!cloud) return "upload";
    if (!local || (Array.isArray(local.envelopes) && local.envelopes.length === 0))
      return "download";

    const localTime = (local as SyncData).lastModified || 0;
    const cloudTime = (cloud as SyncData).lastModified || 0;

    if (cloudTime > localTime) return "download";
    if (localTime > cloudTime) return "upload";
    return "none";
  }

  private async syncToLocal(data: Record<string, unknown>): Promise<void> {
    const { budgetDb } = await import("@/db/budgetDb");
    await budgetDb.transaction(
      "rw",
      [budgetDb.envelopes, budgetDb.transactions, budgetDb.budget],
      async () => {
        await budgetDb.envelopes.clear();
        await budgetDb.transactions.clear();

        if (Array.isArray(data.envelopes)) await budgetDb.envelopes.bulkAdd(data.envelopes);
        if (Array.isArray(data.transactions))
          await budgetDb.transactions.bulkAdd(data.transactions);

        const syncData = data as SyncData;
        await budgetDb.budget.put({
          id: "metadata",
          unassignedCash: syncData.unassignedCash || 0,
          actualBalance: syncData.actualBalance || 0,
          lastModified: syncData.lastModified || Date.now(),
          syncVersion: "2.0",
        });
      }
    );
  }
}
