/**
 * Type definitions for UI Store
 */
import type { PaycheckHistory } from "@/db/types";

export type { PaycheckHistory };

/**
 * Patch notes data structure
 */
export interface PatchNotesData {
  version: string;
  summary: string;
  features: string[];
  fixes: string[];
  breaking: string[];
  other: string[];
  hasContent: boolean;
  date?: string;
  changes?: string[];
  fromVersion?: string;
  toVersion?: string;
  isUpdate?: boolean;
  [key: string]: unknown;
}

/**
 * BeforeInstallPromptEvent type for PWA installation
 */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * UI Store State
 */
export interface UIStoreState {
  // UI State and Settings
  biweeklyAllocation: number;
  isUnassignedCashModalOpen: boolean;
  paycheckHistory: PaycheckHistory[];
  isActualBalanceManual: boolean;
  isOnline: boolean;
  dataLoaded: boolean;
  cloudSyncEnabled: boolean;

  // PWA Update Management
  updateAvailable: boolean;
  isUpdating: boolean;
  showInstallPrompt: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;

  // Patch Notes Management
  showPatchNotes: boolean;
  patchNotesData: PatchNotesData | null;
  loadingPatchNotes: boolean;
}

/**
 * Auth data structure for background sync
 */
export interface AuthData {
  isUnlocked: boolean;
  budgetId: string;
  encryptionKey: CryptoKey | Uint8Array;
  currentUser?: string;
}

/**
 * UI Store Actions (static - defined in storeInitializer)
 */
export interface UIStoreStaticActions {
  // Basic state management actions
  setBiweeklyAllocation: (amount: number) => void;
  openUnassignedCashModal: () => void;
  closeUnassignedCashModal: () => void;
  setPaycheckHistory: (history: PaycheckHistory[]) => void;
  setDataLoaded: (loaded: boolean) => void;
  setOnlineStatus: (status: boolean) => void;
  setCloudSyncEnabled: (enabled: boolean) => void;

  // PWA Update Management actions
  setUpdateAvailable: (available: boolean) => void;
  setIsUpdating: (updating: boolean) => void;
  showInstallModal: () => void;
  hideInstallModal: () => void;
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void;

  // Patch Notes Management actions
  showPatchNotesModal: (patchNotesData: PatchNotesData) => void;
  hidePatchNotesModal: () => void;
  loadPatchNotesForUpdate: (
    fromVersion: string,
    toVersion: string
  ) => Promise<PatchNotesData | null>;

  // Migration and sync
  runMigrationIfNeeded: () => Promise<void>;
  startBackgroundSync: (authData?: AuthData) => Promise<void>;

  // Reset
  resetAllData: () => void;

  // Legacy compatibility
  setDebts: () => void;
}

/**
 * UI Store Actions (dynamic - added after store creation)
 */
export interface UIStoreDynamicActions {
  updateApp: () => Promise<void>;
  installApp: () => Promise<boolean>;
  manualInstall: () => Promise<{ success: boolean; reason: string }>;
  dismissInstallPrompt: () => void;
}

/**
 * All UI Store Actions
 */
export type UIStoreActions = UIStoreStaticActions & UIStoreDynamicActions;

/**
 * Full UI Store type (state + actions)
 */
export type UIStore = UIStoreState & UIStoreActions;

/**
 * Immer set function type for UI Store (using draft state)
 */
export type UIStoreSet = (fn: (state: UIStoreState & UIStoreStaticActions) => void) => void;

/**
 * Get function type for UI Store
 */
export type UIStoreGet = () => UIStore;
