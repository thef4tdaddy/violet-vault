/**
 * API Client - V2 Polyglot Backend Integration
 * Typed fetch wrapper for communicating with Go and Python serverless functions
 *
 * @module services/api/client
 */

import logger from "@/utils/core/common/logger";
import { auditTrailService } from "@/services/privacy/auditTrailService";

// --- Types ---

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// --- Constants ---

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// --- Implementation ---

export class ApiClient {
  /**
   * Make a typed API request
   */
  static async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, timeout = DEFAULT_TIMEOUT, signal } = options;

    // Start timing for audit log
    const startTime = performance.now();
    let success = false;
    let errorMessage: string | undefined;
    let payloadSize = 0;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Use combined signal only if custom signal provided
    const combinedSignal = signal
      ? this.combineAbortSignals([signal, controller.signal])
      : controller.signal;

    try {
      const url = `${API_BASE_URL}${endpoint}`;
      logger.info(`API Request: ${method} ${url}`);

      // Prepare request options
      const requestOptions = this.prepareRequestOptions(method, body, headers, combinedSignal);

      // Calculate payload size for audit log
      if (requestOptions.body) {
        if (typeof requestOptions.body === "string") {
          payloadSize = new Blob([requestOptions.body]).size;
        } else if (requestOptions.body instanceof FormData) {
          // Approximate size for FormData. Computing the exact size of a multipart/form-data
          // payload is non-trivial (depends on generated boundaries, part headers, encoding, etc.).
          // For audit logging purposes a fixed rough estimate is sufficient here, but if higher
          // precision is ever required this should be replaced with logic that iterates over
          // FormData entries and estimates their serialized size.
          payloadSize = 1024;
        }
      }

      // Make the request
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Parse and return response
      const result = await this.parseResponse<T>(response, method, url);
      success = result.success;
      errorMessage = result.error;

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      const result = this.handleRequestError(error, endpoint, timeout);
      success = result.success;
      errorMessage = result.error;
      return result;
    } finally {
      // Log to audit trail (async, don't wait)
      const responseTimeMs = Math.round(performance.now() - startTime);

      // Only log analytics API calls, not health checks
      const analyticsEndpoints = ["/api/prediction", "/api/categorization"];
      const isAnalyticsEndpoint =
        endpoint.startsWith("/api/analytics") || analyticsEndpoints.includes(endpoint);

      if (isAnalyticsEndpoint) {
        auditTrailService
          .logApiCall({
            timestamp: Date.now(),
            endpoint,
            method: method as "GET" | "POST" | "PUT" | "DELETE",
            encryptedPayloadSize: payloadSize,
            responseTimeMs,
            success,
            encrypted: true, // All backend calls use encryption
            errorMessage,
          })
          .catch((err) => {
            logger.error("Failed to log API call to audit trail", err);
          });
      }
    }
  }

  /**
   * Prepare fetch request options
   */
  private static prepareRequestOptions(
    method: string,
    body: Record<string, unknown> | FormData | undefined,
    headers: Record<string, string>,
    signal: AbortSignal
  ): globalThis.RequestInit {
    const requestOptions: globalThis.RequestInit = {
      method,
      signal,
      headers: { ...headers },
    };

    // Add body for POST/PUT requests
    if (body && (method === "POST" || method === "PUT")) {
      if (body instanceof FormData) {
        requestOptions.body = body;
        // Let browser set Content-Type for FormData
      } else {
        requestOptions.headers = {
          ...requestOptions.headers,
          "Content-Type": "application/json",
        };
        requestOptions.body = JSON.stringify(body);
      }
    }

    return requestOptions;
  }

  /**
   * Parse fetch response
   */
  private static async parseResponse<T>(
    response: Response,
    method: string,
    url: string
  ): Promise<ApiResponse<T>> {
    // Parse response
    const contentType = response.headers.get("content-type");
    let responseData: ApiResponse<T>;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = {
        success: response.ok,
        error: response.ok ? undefined : text || "Unknown error",
      } as ApiResponse<T>;
    }

    // Check for HTTP errors
    if (!response.ok) {
      logger.error(`API Error: ${method} ${url}`, {
        status: response.status,
        statusText: response.statusText,
        error: responseData.error,
      });

      return {
        success: false,
        error: responseData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    logger.info(`API Success: ${method} ${url}`);
    return responseData;
  }

  /**
   * Handle request errors
   */
  private static handleRequestError(
    error: unknown,
    endpoint: string,
    timeout: number
  ): ApiResponse<never> {
    // Handle abort/timeout errors
    if (error instanceof Error && error.name === "AbortError") {
      logger.error("API request timeout", { endpoint, timeout });
      return {
        success: false,
        error: "Request timeout - please try again",
      };
    }

    // Handle network errors
    logger.error("API request failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }

  /**
   * Make a GET request
   */
  static async get<T>(
    endpoint: string,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * Make a POST request
   */
  static async post<T>(
    endpoint: string,
    body: Record<string, unknown> | FormData,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  /**
   * Make a PUT request
   */
  static async put<T>(
    endpoint: string,
    body: Record<string, unknown>,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  /**
   * Make a DELETE request
   */
  static async delete<T>(
    endpoint: string,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * Check if the client is online
   */
  static isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  /**
   * Health check for the API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get<{ success: boolean }>("/api/health", {
        timeout: 5000,
      });
      return response.success === true;
    } catch (error) {
      logger.error("API health check failed", error);
      return false;
    }
  }

  /**
   * Combine multiple abort signals into one
   * Needed for handling both timeout and manual cancellation
   *
   * Note: Event listeners are set with { once: true } to prevent memory leaks.
   * They are automatically removed after firing once.
   */
  private static combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }

      signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    return controller.signal;
  }
}

export default ApiClient;
