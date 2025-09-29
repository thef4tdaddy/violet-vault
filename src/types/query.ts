import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

/**
 * TanStack Query types with proper generics
 */

export type QueryResult<TData, TError = Error> = UseQueryResult<TData, TError> & {
  refetch: () => Promise<UseQueryResult<TData, TError>>;
};

export type MutationResult<TData, TError = Error, TVariables = unknown, TContext = unknown> = 
  UseMutationResult<TData, TError, TVariables, TContext>;

export interface QueryKey extends Array<string | number | object | undefined> {}

export interface QueryKeyFactory {
  all: () => QueryKey;
  lists: () => QueryKey;
  list: (filters?: object) => QueryKey;
  details: () => QueryKey;
  detail: (id: string) => QueryKey;
}

export interface OptimisticUpdate<TData> {
  type: 'add' | 'update' | 'delete';
  data: TData;
  previousData?: TData;
}

export interface MutationOptions<TData, TError = Error, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}