/**
 * TypeScript Type Definitions for Backend API
 * Defines types for Go and Python backend API responses
 */

/**
 * Bug Report API Types
 */

export interface BugReportRequest {
  title: string;
  description?: string;
  steps?: string;
  expected?: string;
  actual?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  labels?: string[];
  systemInfo?: SystemInfo;
  screenshot?: string;
  sessionUrl?: string;
  contextInfo?: ContextInfo;
  logs?: string[];
}

export interface SystemInfo {
  appVersion?: string;
  browser?: BrowserInfo;
  viewport?: ViewportInfo;
  userAgent?: string;
  performance?: PerformanceInfo;
  timestamp?: string;
  errors?: ErrorInfo;
}

export interface BrowserInfo {
  name: string;
  version: string;
}

export interface ViewportInfo {
  width: number;
  height: number;
}

export interface PerformanceInfo {
  memory?: {
    usedJSHeapSize: number;
  };
}

export interface ErrorInfo {
  recentErrors?: Array<{
    type?: string;
    message?: string;
    stack?: string;
    timestamp?: string;
    filename?: string;
    lineno?: number;
  }>;
  consoleLogs?: Array<{
    level: string;
    message: string;
    timestamp: string;
  }>;
}

export interface ContextInfo {
  url?: string;
  userLocation?: string;
  page?: string;
  route?: string;
}

export interface BugReportResponse {
  success: boolean;
  issueNumber?: number;
  url?: string;
  error?: string;
  provider: string;
}

/**
 * Analytics API Types
 */

export interface Transaction {
  date: string;
  amount: number;
  description: string;
  category?: string;
  envelopeId?: string;
}

export interface Envelope {
  id: string;
  name: string;
  category?: string;
  monthlyAmount?: number;
  currentBalance?: number;
}

export interface PaydayPredictionRequest {
  type: 'payday_prediction';
  transactions: Transaction[];
}

export interface PaydayPredictionResponse {
  success: boolean;
  data?: PaydayPrediction;
  error?: string;
}

export interface PaydayPrediction {
  nextPayday: string | null;
  confidence: number;
  pattern: string | null;
  intervalDays?: number;
  message: string;
}

export interface MerchantPatternsRequest {
  type: 'merchant_patterns';
  transactions: Transaction[];
  envelopes?: Envelope[];
  monthsOfData?: number;
}

export interface MerchantPatternsResponse {
  success: boolean;
  data?: {
    suggestions: MerchantSuggestion[];
  };
  error?: string;
}

export interface MerchantSuggestion {
  id: string;
  type: 'merchant_pattern' | 'new_envelope' | 'increase_envelope' | 'decrease_envelope';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedAmount: number;
  reasoning: string;
  action: 'create_envelope' | 'increase_budget' | 'decrease_budget';
  impact: 'organization' | 'tracking' | 'accuracy' | 'efficiency';
  data: {
    name: string;
    monthlyAmount: number;
    category: string;
    color: string;
    envelopeId?: string;
    currentAmount?: number;
  };
}

export interface AnalyticsRequest {
  type: 'payday_prediction' | 'merchant_patterns';
  transactions: Transaction[];
  envelopes?: Envelope[];
  monthsOfData?: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: PaydayPrediction | { suggestions: MerchantSuggestion[] };
  error?: string;
}

export interface ComprehensiveAnalyticsResult {
  success: boolean;
  payday: PaydayPrediction & { success: boolean; error?: string };
  merchants: {
    success: boolean;
    suggestions: MerchantSuggestion[];
    error?: string;
  };
  error?: string;
}

/**
 * API Client Types
 */

export interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface APIError {
  message: string;
  statusCode?: number;
  response?: unknown;
}
