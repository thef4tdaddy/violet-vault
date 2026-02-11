/**
 * Version Control Domain Schemas
 * Runtime validation for commit, branch, tag, and change tracking
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Zod schema for BudgetCommit validation
 * Represents a commit in the budget history
 */
export const BudgetCommitSchema = z.object({
  hash: z.string().min(1, "Commit hash is required").max(200),
  timestamp: z.number().int().positive("Timestamp must be a positive number"),
  message: z.string().min(1, "Commit message is required").max(1000),
  author: z.string().min(1, "Author is required").max(200),
  parentHash: z.string().max(200).optional(),
  deviceFingerprint: z.string().max(200).optional(),
  changes: z.record(z.string(), z.unknown()).optional(),
});

export type BudgetCommit = z.infer<typeof BudgetCommitSchema>;

/**
 * Zod schema for BudgetChange validation
 * Represents a single change within a commit
 */
export const BudgetChangeSchema = z.object({
  id: z.number().int().positive().optional(),
  commitHash: z.string().min(1, "Commit hash is required"),
  entityType: z.string().min(1, "Entity type is required").max(100),
  entityId: z.string().min(1, "Entity ID is required"),
  changeType: z.enum(["create", "update", "delete"]),
  description: z.string().max(500).optional(),
  oldValue: z.unknown().optional(),
  newValue: z.unknown().optional(),
});

export type BudgetChange = z.infer<typeof BudgetChangeSchema>;

/**
 * Zod schema for BudgetBranch validation
 * Represents a branch in the budget history
 */
export const BudgetBranchSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Branch name is required").max(200),
  description: z.string().max(500).optional(),
  sourceCommitHash: z.string().min(1, "Source commit hash is required"),
  headCommitHash: z.string().min(1, "Head commit hash is required"),
  author: z.string().min(1, "Author is required").max(200),
  created: z.number().int().positive("Creation time must be a positive number"),
  isActive: z.boolean().default(true),
  isMerged: z.boolean().default(false),
  mergedAt: z.number().int().positive().optional(),
  mergedBy: z.string().max(200).optional(),
});

export type BudgetBranch = z.infer<typeof BudgetBranchSchema>;

/**
 * Zod schema for BudgetTag validation
 * Represents a tagged commit (release, milestone, backup)
 */
export const BudgetTagSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Tag name is required").max(200),
  description: z.string().max(500).optional(),
  commitHash: z.string().min(1, "Commit hash is required"),
  tagType: z.enum(["release", "milestone", "backup"]),
  author: z.string().min(1, "Author is required").max(200),
  created: z.number().int().positive("Creation time must be a positive number"),
  version: z.string().max(100).optional(),
});

export type BudgetTag = z.infer<typeof BudgetTagSchema>;

/**
 * Validation helpers for commits
 */
export const validateBudgetCommit = (data: unknown): BudgetCommit => {
  return BudgetCommitSchema.parse(data);
};

export const validateBudgetCommitSafe = (data: unknown) => {
  return BudgetCommitSchema.safeParse(data);
};

/**
 * Validation helpers for changes
 */
export const validateBudgetChange = (data: unknown): BudgetChange => {
  return BudgetChangeSchema.parse(data);
};

export const validateBudgetChangeSafe = (data: unknown) => {
  return BudgetChangeSchema.safeParse(data);
};

/**
 * Validation helpers for branches
 */
export const validateBudgetBranch = (data: unknown): BudgetBranch => {
  return BudgetBranchSchema.parse(data);
};

export const validateBudgetBranchSafe = (data: unknown) => {
  return BudgetBranchSchema.safeParse(data);
};

/**
 * Validation helpers for tags
 */
export const validateBudgetTag = (data: unknown): BudgetTag => {
  return BudgetTagSchema.parse(data);
};

export const validateBudgetTagSafe = (data: unknown) => {
  return BudgetTagSchema.safeParse(data);
};
