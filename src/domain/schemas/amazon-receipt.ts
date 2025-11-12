import { z } from "zod";

/**
 * Schema for Amazon receipt item
 */
export const AmazonReceiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  totalPrice: z.number().positive(),
  category: z.object({
    name: z.string(),
    icon: z.string(),
    color: z.string(),
  }),
});

export type AmazonReceiptItem = z.infer<typeof AmazonReceiptItemSchema>;

/**
 * Schema for parsed Amazon receipt
 */
export const AmazonReceiptSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  subject: z.string(),
  date: z.string(), // ISO date string
  total: z.number().positive(),
  shipping: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  subtotal: z.number().positive(),
  items: z.array(AmazonReceiptItemSchema),
  primaryCategory: z.string(),
  categoryIcon: z.string(),
  categoryColor: z.string(),
  deliveryDate: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  source: z.literal("amazon_email"),
  rawEmail: z.object({
    content: z.string(),
    subject: z.string(),
    date: z.string(),
    messageId: z.string().optional(),
  }),
});

export type AmazonReceipt = z.infer<typeof AmazonReceiptSchema>;

/**
 * Schema for Amazon receipt search request
 */
export const AmazonReceiptSearchRequestSchema = z.object({
  dateRange: z.enum(["7days", "30days", "90days", "6months", "1year"]),
  minAmount: z.number().nonnegative(),
  includeReturns: z.boolean(),
  folders: z.array(z.string()).min(1),
});

export type AmazonReceiptSearchRequest = z.infer<typeof AmazonReceiptSearchRequestSchema>;

/**
 * Schema for Amazon receipt search response
 */
export const AmazonReceiptSearchResponseSchema = z.object({
  receipts: z.array(AmazonReceiptSchema),
  totalFound: z.number().int().nonnegative(),
  searchedFolders: z.array(z.string()),
  searchDate: z.string(), // ISO date string
});

export type AmazonReceiptSearchResponse = z.infer<typeof AmazonReceiptSearchResponseSchema>;

/**
 * Schema for OAuth token data
 */
export const OAuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number(), // Unix timestamp
  scope: z.array(z.string()),
  provider: z.enum(["gmail", "outlook", "icloud"]),
});

export type OAuthToken = z.infer<typeof OAuthTokenSchema>;

/**
 * Schema for encrypted OAuth token storage
 */
export const EncryptedOAuthTokenSchema = z.object({
  userId: z.string(),
  encryptedToken: z.string(),
  provider: z.enum(["gmail", "outlook", "icloud"]),
  createdAt: z.string(), // ISO date string
  lastUsedAt: z.string().nullable(), // ISO date string
  isRevoked: z.boolean(),
});

export type EncryptedOAuthToken = z.infer<typeof EncryptedOAuthTokenSchema>;

/**
 * Schema for Amazon connection status
 */
export const AmazonConnectionStatusSchema = z.object({
  isConnected: z.boolean(),
  provider: z.enum(["gmail", "outlook", "icloud"]).nullable(),
  lastSync: z.string().nullable(), // ISO date string
  email: z.string().email().nullable(),
  totalReceipts: z.number().int().nonnegative(),
  error: z.string().nullable(),
});

export type AmazonConnectionStatus = z.infer<typeof AmazonConnectionStatusSchema>;

/**
 * Schema for OAuth authorization URL request
 */
export const OAuthAuthorizationRequestSchema = z.object({
  provider: z.enum(["gmail", "outlook", "icloud"]),
  redirectUri: z.string().url(),
  state: z.string(),
});

export type OAuthAuthorizationRequest = z.infer<typeof OAuthAuthorizationRequestSchema>;

/**
 * Schema for OAuth authorization URL response
 */
export const OAuthAuthorizationResponseSchema = z.object({
  authorizationUrl: z.string().url(),
  state: z.string(),
});

export type OAuthAuthorizationResponse = z.infer<typeof OAuthAuthorizationResponseSchema>;

/**
 * Schema for OAuth callback data
 */
export const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  provider: z.enum(["gmail", "outlook", "icloud"]),
});

export type OAuthCallback = z.infer<typeof OAuthCallbackSchema>;

/**
 * Schema for OAuth token revocation request
 */
export const OAuthRevocationRequestSchema = z.object({
  provider: z.enum(["gmail", "outlook", "icloud"]),
});

export type OAuthRevocationRequest = z.infer<typeof OAuthRevocationRequestSchema>;
