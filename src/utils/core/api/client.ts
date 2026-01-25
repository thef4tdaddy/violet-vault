import { resolveServiceUrl, type ServiceName } from "./discovery";
import { getCircuitBreaker } from "./circuitBreaker";
import { withRetry, type RetryOptions } from "./retry";
import { deserialize } from "./messagePack";

let globalRetryOptions: Partial<RetryOptions> = {};

/**
 * Sets global retry options for all APIClient instances.
 * Primary use case is to reduce delays in unit tests.
 */
export const setTestRetryOptions = (options: Partial<RetryOptions>) => {
  globalRetryOptions = options;
};

/**
 * APIClient
 * Unified client for making requests to polyglot services with built-in
 * discovery, circuit breaking, retry, and MessagePack support.
 */

type RequestOptions = NonNullable<Parameters<typeof fetch>[1]> & {
  useMsgPack?: boolean;
  maxAttempts?: number;
  retryOptions?: Partial<RetryOptions>;
};

export class APIClient {
  constructor(private service: ServiceName) {}

  /**
   * Performs a fetch request with full service mesh features.
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { useMsgPack, maxAttempts, ...fetchOptions } = options;
    const url = `${resolveServiceUrl(this.service)}${path.startsWith("/") ? "" : "/"}${path}`;

    // Set headers for MessagePack if requested
    if (useMsgPack) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Accept: "application/x-msgpack",
      };
    }

    const breaker = getCircuitBreaker(this.service);

    return withRetry(
      () =>
        breaker.execute(async () => {
          const response = await fetch(url, fetchOptions);

          if (!response.ok) {
            throw new Error(`API Request to ${this.service}${path} failed: ${response.statusText}`);
          }

          if (useMsgPack) {
            const buffer = await response.arrayBuffer();
            return deserialize<T>(buffer);
          }

          return response.json() as Promise<T>;
        }),
      { maxAttempts, ...globalRetryOptions, ...options.retryOptions }
    );
  }

  // Helper methods for common HTTP verbs
  async get<T>(path: string, options: RequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, body: unknown, options: RequestOptions = {}) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }
}

// Pre-configured clients for easier use
export const goClient = new APIClient("go-backend");
export const pyClient = new APIClient("py-analytics");
