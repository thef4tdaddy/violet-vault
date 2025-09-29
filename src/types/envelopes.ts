import { BaseEntity } from './common';

/**
 * Envelope types
 */

export interface Envelope extends BaseEntity {
  name: string;
  description?: string;
  balance: number;
  targetAmount?: number;
  color?: string;
  category?: string;
  priority?: number;
  isArchived?: boolean;
  autoFunding?: AutoFundingSettings;
}

export interface AutoFundingSettings {
  enabled: boolean;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'biweekly';
  nextDate?: string;
}

export interface EnvelopeBalance {
  envelopeId: string;
  previousBalance: number;
  newBalance: number;
  changeAmount: number;
  changeType: 'funding' | 'spending' | 'transfer';
}

export interface EnvelopeMutationData {
  name?: string;
  description?: string;
  balance?: number;
  targetAmount?: number;
  color?: string;
  category?: string;
  priority?: number;
  isArchived?: boolean;
  autoFunding?: AutoFundingSettings;
}