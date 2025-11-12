import React from "react";

/**
 * Authentication type definitions for VioletVault
 * Core types for auth flows and UI boundary components
 */

// Base user data structure
export interface UserData {
  userName: string;
  userColor: string;
  budgetId?: string;
  shareCode?: string;
  sharedBy?: string;
  password?: string;
}

// Authentication state interface
export interface AuthState {
  isUnlocked: boolean;
  encryptionKey: CryptoKey | null;
  salt: Uint8Array | null;
  currentUser: UserData | null;
  lastActivity: number | null;
  budgetId: string | null;
}

// Security context for auth hooks
export interface SecurityContext {
  encryptionKey: CryptoKey | null;
  budgetId: string | null;
  salt: Uint8Array | null;
}

// Auth operation result
export interface AuthResult {
  success: boolean;
  error?: string;
  code?: string;
  canCreateNew?: boolean;
  suggestion?: string;
}

export type SetupPayload = string | (UserData & { password: string; shareCode?: string });

// Auth flow types
export type AuthMode = "standard" | "local-only" | null;

// User setup step types
export type SetupStep = 1 | 2 | 3 | 4;

// Password validation result
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

// Local-only mode user structure
export interface LocalOnlyUser {
  userName: string;
  userColor: string;
  budgetId: string;
}

// Local-only mode result
export interface LocalOnlyModeResult {
  success: boolean;
  user?: LocalOnlyUser;
  error?: string;
}

// Auth flow hook return type
export interface AuthFlowHook {
  // State
  isUnlocked: boolean;
  encryptionKey: CryptoKey | null;
  currentUser: UserData | null;
  budgetId: string | null;
  salt: Uint8Array | null;

  // Actions
  handleSetup: (userDataOrPassword: string | UserData) => Promise<AuthResult>;
  handleLogout: () => void;
  handleChangePassword: (oldPassword: string, newPassword: string) => Promise<AuthResult>;
  handleUpdateProfile: (updatedProfile: Partial<UserData>) => Promise<AuthResult>;
}

// User setup hook return type
export interface UserSetupHook {
  // State
  step: SetupStep;
  masterPassword: string;
  userName: string;
  userColor: string;
  showPassword: boolean;
  isLoading: boolean;
  isReturningUser: boolean;
  shareCode: string;

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleStep1Continue: () => void;
  handleStartTrackingClick: () => void;
  handleCreateBudget: () => Promise<void>;
  clearSavedProfile: () => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePasswordVisibility: () => void;
  switchToChangeProfile: () => void;
  goBackToStep1: () => void;
  goBackToStep2: () => void;
  setUserColor: (color: string) => void;
}

// Auth Gateway component props
export interface AuthGatewayProps {
  onSetupComplete: (payload: SetupPayload) => Promise<void> | void;
  onLocalOnlyReady: (user: LocalOnlyUser | null) => void;
}

// User Setup component props
export interface UserSetupProps {
  onSetupComplete: (payload: SetupPayload) => Promise<void> | void;
}

// Join budget modal data
export interface JoinBudgetData {
  shareCode: string;
  password: string;
  userName?: string;
  userColor?: string;
}

// Change password modal props
export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Profile settings props
export interface ProfileSettingsProps {
  user: UserData;
  onUpdate: (updatedProfile: Partial<UserData>) => Promise<void>;
}

// User indicator props
export interface UserIndicatorProps {
  user: UserData;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

// Auth manager hook interface
export interface AuthManagerHook {
  isUnlocked: boolean;
  user: UserData | null;
  login: (password: string, userData?: UserData | null) => Promise<AuthResult>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (updatedProfile: Partial<UserData>) => Promise<AuthResult>;
  joinBudget: (joinData: JoinBudgetData) => Promise<AuthResult>;
  securityContext: SecurityContext;
}

// Encryption key derivation result
export interface KeyDerivationResult {
  key: CryptoKey;
  salt: Uint8Array;
}

// Share code generation options
export interface ShareCodeOptions {
  length?: number;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}
