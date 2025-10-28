/**
 * Auth Domain Schema
 * Runtime validation for authentication entities
 * Part of Phase 1: Domain Types & Zod Schemas for Auth Models
 */

import { z } from "zod";

/**
 * Auth mode enum - standard (Firebase + encryption) or local-only
 */
export const AuthModeSchema = z.enum(["standard", "local-only"]).nullable();
export type AuthMode = z.infer<typeof AuthModeSchema>;

/**
 * Setup step enum for user onboarding flow
 */
export const SetupStepSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export type SetupStep = z.infer<typeof SetupStepSchema>;

/**
 * User data schema - base user information
 */
export const UserDataSchema = z.object({
  userName: z
    .string()
    .min(1, "User name is required")
    .max(100, "User name must be 100 characters or less"),
  userColor: z.string().min(1, "User color is required"),
  budgetId: z.string().optional(),
  shareCode: z.string().optional(),
  sharedBy: z.string().optional(),
  password: z.string().optional(),
});
export type UserData = z.infer<typeof UserDataSchema>;

/**
 * Partial user data schema for updates
 */
export const UserDataPartialSchema = UserDataSchema.partial();
export type UserDataPartial = z.infer<typeof UserDataPartialSchema>;

/**
 * Security context schema - encryption key and metadata
 */
export const SecurityContextSchema = z.object({
  encryptionKey: z.custom<CryptoKey | null>((val) => val === null || val instanceof CryptoKey, {
    message: "Encryption key must be a CryptoKey instance or null",
  }),
  budgetId: z.string().nullable(),
  salt: z.custom<Uint8Array | null>((val) => val === null || val instanceof Uint8Array, {
    message: "Salt must be a Uint8Array instance or null",
  }),
});
export type SecurityContext = z.infer<typeof SecurityContextSchema>;

/**
 * Auth state schema - complete authentication state
 */
export const AuthStateSchema = z.object({
  isUnlocked: z.boolean().default(false),
  encryptionKey: z.custom<CryptoKey | null>((val) => val === null || val instanceof CryptoKey, {
    message: "Encryption key must be a CryptoKey instance or null",
  }),
  salt: z.custom<Uint8Array | null>((val) => val === null || val instanceof Uint8Array, {
    message: "Salt must be a Uint8Array instance or null",
  }),
  currentUser: UserDataSchema.nullable(),
  lastActivity: z.number().nullable(),
  budgetId: z.string().nullable(),
});
export type AuthState = z.infer<typeof AuthStateSchema>;

/**
 * Auth result schema - operation outcome with error details
 */
export const AuthResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  code: z.string().optional(),
  canCreateNew: z.boolean().optional(),
  suggestion: z.string().optional(),
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

/**
 * Password validation result schema
 */
export const PasswordValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
});
export type PasswordValidationResult = z.infer<typeof PasswordValidationResultSchema>;

/**
 * Local-only mode user schema
 */
export const LocalOnlyUserSchema = z.object({
  userName: z
    .string()
    .min(1, "User name is required")
    .max(100, "User name must be 100 characters or less"),
  userColor: z.string().min(1, "User color is required"),
  budgetId: z.string().min(1, "Budget ID is required"),
});
export type LocalOnlyUser = z.infer<typeof LocalOnlyUserSchema>;

/**
 * Local-only mode result schema
 */
export const LocalOnlyModeResultSchema = z.object({
  success: z.boolean(),
  user: LocalOnlyUserSchema.optional(),
  error: z.string().optional(),
});
export type LocalOnlyModeResult = z.infer<typeof LocalOnlyModeResultSchema>;

/**
 * Join budget data schema - data required to join a shared budget
 */
export const JoinBudgetDataSchema = z.object({
  shareCode: z.string().min(1, "Share code is required"),
  password: z.string().min(1, "Password is required"),
  userName: z.string().optional(),
  userColor: z.string().optional(),
});
export type JoinBudgetData = z.infer<typeof JoinBudgetDataSchema>;

/**
 * Key derivation result schema - result of password-based key derivation
 */
export const KeyDerivationResultSchema = z.object({
  key: z.custom<CryptoKey>((val) => val instanceof CryptoKey, {
    message: "Key must be a CryptoKey instance",
  }),
  salt: z.custom<Uint8Array>((val) => val instanceof Uint8Array, {
    message: "Salt must be a Uint8Array instance",
  }),
});
export type KeyDerivationResult = z.infer<typeof KeyDerivationResultSchema>;

/**
 * Share code generation options schema
 */
export const ShareCodeOptionsSchema = z.object({
  length: z.number().int().positive().optional(),
  includeNumbers: z.boolean().optional(),
  includeSymbols: z.boolean().optional(),
});
export type ShareCodeOptions = z.infer<typeof ShareCodeOptionsSchema>;

// ===== Validation Helpers =====

/**
 * Validation helper - throws on invalid data
 */
export const validateUserData = (data: unknown): UserData => {
  return UserDataSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateUserDataSafe = (data: unknown) => {
  return UserDataSchema.safeParse(data);
};

/**
 * Validation helper for partial user data updates
 */
export const validateUserDataPartial = (data: unknown): UserDataPartial => {
  return UserDataPartialSchema.parse(data);
};

/**
 * Validation helper for auth state
 */
export const validateAuthState = (data: unknown): AuthState => {
  return AuthStateSchema.parse(data);
};

/**
 * Safe validation helper for auth state
 */
export const validateAuthStateSafe = (data: unknown) => {
  return AuthStateSchema.safeParse(data);
};

/**
 * Validation helper for auth result
 */
export const validateAuthResult = (data: unknown): AuthResult => {
  return AuthResultSchema.parse(data);
};

/**
 * Safe validation helper for auth result
 */
export const validateAuthResultSafe = (data: unknown) => {
  return AuthResultSchema.safeParse(data);
};

/**
 * Validation helper for security context
 */
export const validateSecurityContext = (data: unknown): SecurityContext => {
  return SecurityContextSchema.parse(data);
};

/**
 * Safe validation helper for security context
 */
export const validateSecurityContextSafe = (data: unknown) => {
  return SecurityContextSchema.safeParse(data);
};

/**
 * Validation helper for password validation result
 */
export const validatePasswordValidationResult = (data: unknown): PasswordValidationResult => {
  return PasswordValidationResultSchema.parse(data);
};

/**
 * Safe validation helper for password validation result
 */
export const validatePasswordValidationResultSafe = (data: unknown) => {
  return PasswordValidationResultSchema.safeParse(data);
};

/**
 * Validation helper for local-only user
 */
export const validateLocalOnlyUser = (data: unknown): LocalOnlyUser => {
  return LocalOnlyUserSchema.parse(data);
};

/**
 * Safe validation helper for local-only user
 */
export const validateLocalOnlyUserSafe = (data: unknown) => {
  return LocalOnlyUserSchema.safeParse(data);
};

/**
 * Validation helper for local-only mode result
 */
export const validateLocalOnlyModeResult = (data: unknown): LocalOnlyModeResult => {
  return LocalOnlyModeResultSchema.parse(data);
};

/**
 * Safe validation helper for local-only mode result
 */
export const validateLocalOnlyModeResultSafe = (data: unknown) => {
  return LocalOnlyModeResultSchema.safeParse(data);
};

/**
 * Validation helper for join budget data
 */
export const validateJoinBudgetData = (data: unknown): JoinBudgetData => {
  return JoinBudgetDataSchema.parse(data);
};

/**
 * Safe validation helper for join budget data
 */
export const validateJoinBudgetDataSafe = (data: unknown) => {
  return JoinBudgetDataSchema.safeParse(data);
};

/**
 * Validation helper for key derivation result
 */
export const validateKeyDerivationResult = (data: unknown): KeyDerivationResult => {
  return KeyDerivationResultSchema.parse(data);
};

/**
 * Safe validation helper for key derivation result
 */
export const validateKeyDerivationResultSafe = (data: unknown) => {
  return KeyDerivationResultSchema.safeParse(data);
};

/**
 * Validation helper for share code options
 */
export const validateShareCodeOptions = (data: unknown): ShareCodeOptions => {
  return ShareCodeOptionsSchema.parse(data);
};

/**
 * Safe validation helper for share code options
 */
export const validateShareCodeOptionsSafe = (data: unknown) => {
  return ShareCodeOptionsSchema.safeParse(data);
};
