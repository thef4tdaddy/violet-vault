/**
 * Allocation Types
 * Shared types for allocation analytics and processing
 */

export interface AllocationTransaction {
  id: string;
  date: string;
  amount: number;
  category?: string;
  envelopeId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
