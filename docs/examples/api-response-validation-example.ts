/**
 * Example: Firebase Sync Service with API Response Validation
 * This demonstrates how to integrate Phase 2 API response schemas
 * into the existing firebaseSyncService
 */

import { getDoc, doc } from "firebase/firestore";
import {
  validateFirebaseDocumentSafe,
  validateEncryptedDataSafe,
  validateSyncOperationResultSafe,
  type FirebaseDocument,
  type SyncOperationResult,
} from "@/domain/schemas";
import { encryptionUtils } from "@/utils/security/encryption";
import logger from "@/utils/common/logger";

/**
 * Example: Enhanced loadFromCloud with validation
 *
 * Before: No validation, potential runtime errors
 * After: Full validation with type safety and error handling
 */
export async function loadFromCloudWithValidation(
  db: unknown,
  budgetId: string,
  encryptionKey: CryptoKey
): Promise<SyncOperationResult> {
  const startTime = Date.now();

  try {
    // Load from Firebase
    const docRef = doc(db as never, "budgets", budgetId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      logger.info("No cloud data found");
      return {
        success: true,
        operation: "load",
        bytesTransferred: 0,
        timestamp: Date.now(),
      };
    }

    const cloudData = docSnap.data();

    // ✅ PHASE 2: Validate Firebase document structure
    const documentValidation = validateFirebaseDocumentSafe(cloudData);

    if (!documentValidation.success) {
      logger.error("Invalid Firebase document structure", {
        errors: documentValidation.error,
        budgetId: budgetId.substring(0, 8) + "...",
      });

      return {
        success: false,
        operation: "load",
        error: "Invalid cloud data structure",
        timestamp: Date.now(),
      };
    }

    const document: FirebaseDocument = documentValidation.data;

    // ✅ PHASE 2: Validate encrypted data structure
    const encryptedDataValidation = validateEncryptedDataSafe(document.encryptedData);

    if (!encryptedDataValidation.success) {
      logger.error("Invalid encrypted data structure", {
        errors: encryptedDataValidation.error,
      });

      return {
        success: false,
        operation: "load",
        error: "Invalid encrypted data format",
        timestamp: Date.now(),
      };
    }

    // Decrypt with validated structure
    const decryptedData = await encryptionUtils.decrypt(
      encryptedDataValidation.data.data,
      encryptionKey,
      encryptedDataValidation.data.iv
    );

    const parsedData = JSON.parse(decryptedData);
    const bytesTransferred = decryptedData.length;

    logger.info("✅ Data loaded from cloud successfully", {
      bytesTransferred,
      duration: Date.now() - startTime,
    });

    const result: SyncOperationResult = {
      success: true,
      operation: "load",
      bytesTransferred,
      timestamp: Date.now(),
    };

    // ✅ PHASE 2: Validate result structure before returning
    const resultValidation = validateSyncOperationResultSafe(result);

    if (!resultValidation.success) {
      logger.warn("Invalid result structure (should not happen)", resultValidation.error);
      // Still return the result, but log the validation issue
    }

    return result;
  } catch (error) {
    logger.error("❌ Failed to load data from cloud", error);

    return {
      success: false,
      operation: "load",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: Date.now(),
    };
  }
}

/**
 * Example: Compare old vs new approach
 */

// ❌ OLD APPROACH (No validation)
async function oldLoadFromCloud(db: unknown, budgetId: string, key: CryptoKey): Promise<unknown> {
  const docRef = doc(db as never, "budgets", budgetId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const cloudData = docSnap.data();

  // No validation - assumes structure is correct
  // Can crash if encryptedData is missing or malformed
  const decryptedData = await encryptionUtils.decrypt(
    cloudData.encryptedData.data,
    key,
    cloudData.encryptedData.iv
  );

  return JSON.parse(decryptedData);
}

// ✅ NEW APPROACH (With validation)
async function newLoadFromCloud(db: unknown, budgetId: string, key: CryptoKey): Promise<unknown> {
  const docRef = doc(db as never, "budgets", budgetId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const cloudData = docSnap.data();

  // Validate document structure
  const validation = validateFirebaseDocumentSafe(cloudData);

  if (!validation.success) {
    logger.error("Invalid Firebase document", validation.error);
    return null;
  }

  // Validate encrypted data
  const encryptedValidation = validateEncryptedDataSafe(validation.data.encryptedData);

  if (!encryptedValidation.success) {
    logger.error("Invalid encrypted data", encryptedValidation.error);
    return null;
  }

  // Safe to decrypt with validated structure
  const decryptedData = await encryptionUtils.decrypt(
    encryptedValidation.data.data,
    key,
    encryptedValidation.data.iv
  );

  return JSON.parse(decryptedData);
}

/**
 * Benefits of Phase 2 Schemas:
 *
 * 1. ✅ Type Safety: Full TypeScript type inference
 * 2. ✅ Runtime Validation: Catch malformed data before processing
 * 3. ✅ Better Error Messages: Know exactly what's wrong
 * 4. ✅ Graceful Degradation: Handle errors without crashing
 * 5. ✅ Logging: Track validation failures for debugging
 * 6. ✅ Documentation: Self-documenting expected structures
 */
