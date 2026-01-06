import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebSocketSignalingService } from "../sync/websocketSignalingService";
import type { WebSocketSignalMessage } from "@/types/sync";

// Mock WebSocket
class MockWebSocket {
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public readyState: number = WebSocket.CONNECTING;

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string): void {
    // Mock send - no-op in tests
    console.log("Mock WebSocket send:", data);
  }

  close(): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { wasClean: true }));
    }
  }
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

describe("WebSocketSignalingService", () => {
  let service: WebSocketSignalingService;

  beforeEach(() => {
    // Reset environment variables
    vi.stubEnv("VITE_WEBSOCKET_ENABLED", "true");
    vi.stubEnv("VITE_WEBSOCKET_URL", "ws://localhost:8080");

    // Get fresh instance for each test
    service = WebSocketSignalingService.getInstance();
  });

  afterEach(() => {
    service.disconnect();
    vi.unstubAllEnvs();
  });

  describe("Privacy Compliance", () => {
    it("should only send signal metadata, never decrypted data", async () => {
      const sendSpy = vi.spyOn(MockWebSocket.prototype, "send");

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 50));

      service.sendSignal("data_changed", { version: "2.0" });

      // Check that sent data contains only metadata
      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]) as WebSocketSignalMessage;

      // Verify structure contains no sensitive data
      expect(sentData).toHaveProperty("type");
      expect(sentData).toHaveProperty("budgetId");
      expect(sentData).toHaveProperty("timestamp");
      expect(sentData).toHaveProperty("metadata");

      // Ensure no encrypted or decrypted data fields
      expect(sentData).not.toHaveProperty("encryptedData");
      expect(sentData).not.toHaveProperty("decryptedData");
      expect(sentData).not.toHaveProperty("data");
      expect(sentData).not.toHaveProperty("payload");
    });

    it("should never accept data payloads in signals", async () => {
      let receivedSignal: WebSocketSignalMessage | null = null;

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      service.onSignal((signal) => {
        receivedSignal = signal;
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate receiving a malicious message with data payload
      const ws = (service as unknown as { ws: MockWebSocket }).ws;
      if (ws && ws.onmessage) {
        const maliciousMessage = {
          type: "data_changed",
          budgetId: "test-budget-123",
          timestamp: Date.now(),
          // Attempt to inject data payload
          data: { secret: "should not be here" },
          encryptedData: "encrypted payload",
        };

        ws.onmessage(
          new MessageEvent("message", {
            data: JSON.stringify(maliciousMessage),
          })
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify that the signal was received but data fields are ignored
      expect(receivedSignal).toBeTruthy();
      if (receivedSignal) {
        expect(receivedSignal.type).toBe("data_changed");
        // The service should not expose data fields even if they're in the message
        expect(receivedSignal).not.toHaveProperty("data");
        expect(receivedSignal).not.toHaveProperty("encryptedData");
      }
    });
  });

  describe("Connection Management", () => {
    it("should connect successfully", async () => {
      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = service.getStatus();
      expect(status.status).toBe("connected");
      expect(status.isConnected).toBe(true);
    });

    it("should disconnect cleanly", async () => {
      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      service.disconnect();

      const status = service.getStatus();
      expect(status.status).toBe("disconnected");
      expect(status.isConnected).toBe(false);
    });

    it("should not connect when disabled", async () => {
      vi.stubEnv("VITE_WEBSOCKET_ENABLED", "false");

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = service.getStatus();
      expect(status.status).toBe("disconnected");
    });
  });

  describe("Signal Handling", () => {
    it("should receive and handle signals", async () => {
      const signals: WebSocketSignalMessage[] = [];

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      service.onSignal((signal) => {
        signals.push(signal);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate receiving a signal
      const ws = (service as unknown as { ws: MockWebSocket }).ws;
      if (ws && ws.onmessage) {
        const testSignal: WebSocketSignalMessage = {
          type: "data_changed",
          budgetId: "test-budget-123",
          timestamp: Date.now(),
        };

        ws.onmessage(
          new MessageEvent("message", {
            data: JSON.stringify(testSignal),
          })
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(signals.length).toBeGreaterThan(0);
      const dataChangedSignal = signals.find((s) => s.type === "data_changed");
      expect(dataChangedSignal).toBeTruthy();
    });

    it("should handle multiple signal listeners", async () => {
      const signals1: WebSocketSignalMessage[] = [];
      const signals2: WebSocketSignalMessage[] = [];

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      service.onSignal((signal) => signals1.push(signal));
      service.onSignal((signal) => signals2.push(signal));

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Simulate receiving a signal
      const ws = (service as unknown as { ws: MockWebSocket }).ws;
      if (ws && ws.onmessage) {
        const testSignal: WebSocketSignalMessage = {
          type: "sync_required",
          budgetId: "test-budget-123",
          timestamp: Date.now(),
        };

        ws.onmessage(
          new MessageEvent("message", {
            data: JSON.stringify(testSignal),
          })
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Both listeners should receive the signal
      expect(signals1.length).toBeGreaterThan(0);
      expect(signals2.length).toBeGreaterThan(0);
      expect(signals1.length).toBe(signals2.length);
    });

    it("should unsubscribe signal listeners", async () => {
      const signals: WebSocketSignalMessage[] = [];

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      const unsubscribe = service.onSignal((signal) => {
        signals.push(signal);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Unsubscribe before sending signal
      unsubscribe();

      // Simulate receiving a signal
      const ws = (service as unknown as { ws: MockWebSocket }).ws;
      if (ws && ws.onmessage) {
        const testSignal: WebSocketSignalMessage = {
          type: "data_changed",
          budgetId: "test-budget-123",
          timestamp: Date.now(),
        };

        ws.onmessage(
          new MessageEvent("message", {
            data: JSON.stringify(testSignal),
          })
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Listener should not receive signals after unsubscribe
      // Only the "connected" signal should be present
      const dataChangedSignals = signals.filter((s) => s.type === "data_changed");
      expect(dataChangedSignals.length).toBe(0);
    });
  });

  describe("Status Updates", () => {
    it("should notify status listeners on connection", async () => {
      const statuses: string[] = [];

      service.onStatusChange((status) => {
        statuses.push(status.status);
      });

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(statuses).toContain("connecting");
      expect(statuses).toContain("connected");
    });

    it("should update status on disconnect", async () => {
      const statuses: string[] = [];

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
      });

      service.onStatusChange((status) => {
        statuses.push(status.status);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      service.disconnect();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(statuses).toContain("disconnected");
    });
  });

  describe("Heartbeat", () => {
    it("should send ping signals periodically", async () => {
      const sendSpy = vi.spyOn(MockWebSocket.prototype, "send");

      await service.connect({
        url: "ws://localhost:8080",
        budgetId: "test-budget-123",
        heartbeatInterval: 100, // Fast heartbeat for testing
      });

      await new Promise((resolve) => setTimeout(resolve, 250));

      // Check for ping messages
      const pingSent = sendSpy.mock.calls.some((call) => {
        const data = JSON.parse(call[0]) as WebSocketSignalMessage;
        return data.type === "ping";
      });

      expect(pingSent).toBe(true);
    });
  });
});
