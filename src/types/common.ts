/**
 * Common types used across the application
 */

export interface BaseEntity {
  id: string;
  createdAt: string;
  lastModified: number;
}

export interface QueryOptions {
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type EntityType = 'envelope' | 'transaction' | 'bill' | 'savingsGoal' | 'debt';

export interface LoadingState {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}