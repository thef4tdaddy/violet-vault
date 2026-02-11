import React from "react";

/**
 * Type definitions index for VioletVault
 * Export all type definitions from this file
 */

// Auth types
export * from "./auth";

// Sync types
export * from "./sync";

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Event handler types
export type EventHandler<T = React.SyntheticEvent> = (event: T) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// Component base props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
// Central types export
export * from "./debt";
