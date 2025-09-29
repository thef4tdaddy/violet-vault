import { BaseEntity } from './common';

/**
 * Bill types
 */

export interface Bill extends BaseEntity {
  name: string;
  amount: number;
  dueDate: string;
  frequency: BillFrequency;
  category?: string;
  envelopeId?: string;
  isPaid?: boolean;
  isAutoPay?: boolean;
  notes?: string;
  reminder?: BillReminder;
}

export type BillFrequency = 'monthly' | 'weekly' | 'biweekly' | 'quarterly' | 'annually' | 'custom';

export interface BillReminder {
  enabled: boolean;
  daysBefore: number;
}

export interface BillMutationData {
  name?: string;
  amount?: number;
  dueDate?: string;
  frequency?: BillFrequency;
  category?: string;
  envelopeId?: string;
  isPaid?: boolean;
  isAutoPay?: boolean;
  notes?: string;
  reminder?: BillReminder;
}