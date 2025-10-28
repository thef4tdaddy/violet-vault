/**
 * Audit Log Domain Schema
 * Runtime validation for audit log entries tracking changes
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from 'zod';

/**
 * Zod schema for AuditLogEntry validation
 * Tracks changes made to entities for audit trail and debugging
 */
export const AuditLogEntrySchema = z.object({
  id: z.number().int().positive().optional(),
  timestamp: z.number().int().positive('Timestamp must be a positive number'),
  action: z.string().min(1, 'Action is required').max(100),
  entityType: z.string().min(1, 'Entity type is required').max(100),
  entityId: z.string().min(1, 'Entity ID is required'),
  userId: z.string().max(200).optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Type inference from schema
 */
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

/**
 * Partial audit log entry schema for updates
 */
export const AuditLogEntryPartialSchema = AuditLogEntrySchema.partial();
export type AuditLogEntryPartial = z.infer<typeof AuditLogEntryPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateAuditLogEntry = (data: unknown): AuditLogEntry => {
  return AuditLogEntrySchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateAuditLogEntrySafe = (data: unknown) => {
  return AuditLogEntrySchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateAuditLogEntryPartial = (data: unknown): AuditLogEntryPartial => {
  return AuditLogEntryPartialSchema.parse(data);
};
