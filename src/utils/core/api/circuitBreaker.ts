/**
 * Circuit Breaker Pattern
 * Protects the frontend from cascading failures by "tripping" when a service is failing.
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitOptions {
  failureThreshold: number; // Number of failures before opening
  resetTimeout: number; // Home many ms to stay open before trying again
  onStateChange?: (state: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private nextAttemptTime: number = 0;

  constructor(
    private name: string,
    private options: CircuitOptions
  ) {}

  /**
   * Proxies a function call through the circuit breaker.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.checkState();

    if (this.state === "OPEN") {
      throw new Error(`Circuit breaker for "${this.name}" is OPEN. Requests blocked.`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private checkState() {
    if (this.state === "OPEN" && Date.now() >= this.nextAttemptTime) {
      this.setState("HALF_OPEN");
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF_OPEN") {
      this.setState("CLOSED");
    }
  }

  private onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.options.failureThreshold) {
      this.setState("OPEN");
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
    }
  }

  private setState(state: CircuitState) {
    if (this.state !== state) {
      this.state = state;
      this.options.onStateChange?.(state);
    }
  }

  getState(): CircuitState {
    this.checkState();
    return this.state;
  }
}

/**
 * Registry for managed circuit breakers
 */
const registry = new Map<string, CircuitBreaker>();

export const getCircuitBreaker = (
  name: string,
  options: CircuitOptions = { failureThreshold: 5, resetTimeout: 30000 }
): CircuitBreaker => {
  if (!registry.has(name)) {
    registry.set(name, new CircuitBreaker(name, options));
  }
  return registry.get(name)!;
};

/**
 * Clears the registry (useful for unit tests)
 */
export const clearCircuitBreakers = () => {
  registry.clear();
};
