import logger from "@/utils/core/common/logger";
import type {
  WebSocketSignalMessage,
  WebSocketSignalingConfig,
  WebSocketServiceStatus,
  WebSocketConnectionStatus,
  WebSocketSignalType,
} from "@/types/sync";

/**
 * WebSocket protocol version
 */
const WEBSOCKET_PROTOCOL_VERSION = "2.0";

/**
 * WebSocket Signaling Service
 *
 * PRIVACY-PRESERVING REAL-TIME SYNC NOTIFICATIONS
 *
 * CRITICAL PRIVACY RULES:
 * 1. WebSockets are used for SIGNALING ONLY (e.g., 'Data Changed')
 * 2. Do NOT stream decrypted data through WebSocket
 * 3. Do NOT stream encrypted blobs through WebSocket
 * 4. Maintain End-to-End Encryption boundary
 * 5. Only send metadata and signal types
 *
 * When a signal is received:
 * - Client triggers normal sync flow via SyncOrchestrator
 * - SyncOrchestrator fetches encrypted data via Firebase
 * - Data is decrypted locally using EncryptionManager
 *
 * This ensures that sensitive data never travels through WebSocket.
 */
export class WebSocketSignalingService {
  private static instance: WebSocketSignalingService;
  private ws: WebSocket | null = null;
  private config: WebSocketSignalingConfig | null = null;
  private status: WebSocketConnectionStatus = "disconnected";
  private lastHeartbeat: number | null = null;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private errorMessage: string | null = null;

  // Event listeners
  private signalListeners: Set<(signal: WebSocketSignalMessage) => void> = new Set();
  private statusListeners: Set<(status: WebSocketServiceStatus) => void> = new Set();

  private constructor() {}

  public static getInstance(): WebSocketSignalingService {
    if (!WebSocketSignalingService.instance) {
      WebSocketSignalingService.instance = new WebSocketSignalingService();
    }
    return WebSocketSignalingService.instance;
  }

  /**
   * Initialize and connect to WebSocket server
   */
  public async connect(config: WebSocketSignalingConfig): Promise<void> {
    // Check if WebSocket is enabled via environment variable
    const wsEnabled = import.meta.env.VITE_WEBSOCKET_ENABLED === "true";
    if (!wsEnabled) {
      logger.info("WebSocket signaling is disabled (VITE_WEBSOCKET_ENABLED not true)");
      return;
    }

    // If already connected or connecting, disconnect first to avoid connection leaks
    if (this.ws && (this.status === "connected" || this.status === "connecting")) {
      logger.warn("WebSocket already active, disconnecting before new connection");
      this.disconnect();
    }

    this.config = {
      reconnectInterval: 5000,
      heartbeatInterval: 30000,
      maxReconnectAttempts: 10,
      ...config,
    };

    this.connectWebSocket();
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      const wsToClose = this.ws;
      this.ws = null;
      wsToClose.close();
    }

    this.updateStatus("disconnected");
    logger.info("WebSocket signaling disconnected");
  }

  /**
   * Send a signal message (METADATA ONLY - NO DATA)
   */
  public sendSignal(type: WebSocketSignalType, metadata?: Record<string, unknown>): void {
    if (!this.ws || this.status !== "connected") {
      logger.warn("Cannot send signal - WebSocket not connected", { type });
      return;
    }

    // Validate and sanitize metadata
    const safeMetadata: WebSocketSignalMessage["metadata"] = metadata
      ? {
          deviceId: typeof metadata.deviceId === "string" ? metadata.deviceId : undefined,
          userId: typeof metadata.userId === "string" ? metadata.userId : undefined,
          version: typeof metadata.version === "string" ? metadata.version : undefined,
          budgetId: typeof metadata.budgetId === "string" ? metadata.budgetId : undefined,
        }
      : undefined;

    const signal: WebSocketSignalMessage = {
      type,
      budgetId: this.config?.budgetId,
      timestamp: Date.now(),
      metadata: safeMetadata,
    };

    try {
      this.ws.send(JSON.stringify(signal));
      logger.debug("WebSocket signal sent", { type });
    } catch (error) {
      logger.error("Failed to send WebSocket signal", { error, type });
    }
  }

  /**
   * Add signal listener
   */
  public onSignal(listener: (signal: WebSocketSignalMessage) => void): () => void {
    this.signalListeners.add(listener);
    return () => this.signalListeners.delete(listener);
  }

  /**
   * Add status change listener
   */
  public onStatusChange(listener: (status: WebSocketServiceStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Immediately call with current status
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  /**
   * Get current service status
   */
  public getStatus(): WebSocketServiceStatus {
    return {
      status: this.status,
      isConnected: this.status === "connected",
      lastHeartbeat: this.lastHeartbeat,
      reconnectAttempts: this.reconnectAttempts,
      error: this.errorMessage,
    };
  }

  /**
   * Internal: Connect WebSocket
   */
  private connectWebSocket(): void {
    if (!this.config) {
      logger.error("Cannot connect - WebSocket config not initialized");
      return;
    }

    // Prevent multiple concurrent connection attempts
    if (this.status === "connecting") {
      logger.debug("Connection already in progress");
      return;
    }

    this.updateStatus("connecting");
    logger.info("Connecting to WebSocket signaling server", { url: this.config.url });

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = (event) => this.handleClose(event);
    } catch (error) {
      logger.error("Failed to create WebSocket connection", { error });
      this.handleConnectionFailure();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    logger.info("WebSocket signaling connected");
    this.updateStatus("connected");
    this.reconnectAttempts = 0;
    this.errorMessage = null;

    // Start heartbeat
    this.startHeartbeat();

    // Send initial connection signal
    this.sendSignal("connected", {
      budgetId: this.config?.budgetId,
      version: WEBSOCKET_PROTOCOL_VERSION,
    });

    // Notify listeners
    this.notifySignalListeners({
      type: "connected",
      budgetId: this.config?.budgetId,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const rawSignal = JSON.parse(event.data);
      // Explicitly construct signal with ONLY the properties we want to expose
      // This protects against data leakage from malicious payloads
      const signal: WebSocketSignalMessage = {
        type: rawSignal.type as WebSocketSignalType,
        budgetId: typeof rawSignal.budgetId === "string" ? rawSignal.budgetId : undefined,
        timestamp: typeof rawSignal.timestamp === "number" ? rawSignal.timestamp : Date.now(),
      };

      if (rawSignal.metadata && typeof rawSignal.metadata === "object") {
        signal.metadata = {
          deviceId:
            typeof rawSignal.metadata.deviceId === "string"
              ? rawSignal.metadata.deviceId
              : undefined,
          userId:
            typeof rawSignal.metadata.userId === "string" ? rawSignal.metadata.userId : undefined,
          version:
            typeof rawSignal.metadata.version === "string" ? rawSignal.metadata.version : undefined,
          budgetId:
            typeof rawSignal.metadata.budgetId === "string"
              ? rawSignal.metadata.budgetId
              : undefined,
        };
      }

      logger.debug("WebSocket signal received", { type: signal.type });

      // Update heartbeat on pong
      if (signal.type === "pong") {
        this.lastHeartbeat = Date.now();
        return;
      }

      // Notify all signal listeners
      this.notifySignalListeners(signal);
    } catch (error) {
      logger.error("Failed to parse WebSocket message", { error, data: event.data });
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    logger.error("WebSocket error occurred", { error });
    this.errorMessage = "WebSocket connection error";
    this.updateStatus("error");
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    logger.info("WebSocket connection closed", {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    });

    this.stopHeartbeat();

    // Don't reconnect if it was a clean close
    if (event.wasClean) {
      this.updateStatus("disconnected");
      return;
    }

    // Attempt reconnection
    this.handleConnectionFailure();
  }

  /**
   * Handle connection failure and attempt reconnection
   */
  private handleConnectionFailure(): void {
    if (!this.config) return;

    const maxAttempts = this.config.maxReconnectAttempts || 10;

    if (this.reconnectAttempts >= maxAttempts) {
      logger.error("Max reconnection attempts reached", { attempts: this.reconnectAttempts });
      this.errorMessage = `Failed to reconnect after ${maxAttempts} attempts`;
      this.updateStatus("error");
      return;
    }

    this.reconnectAttempts++;
    this.updateStatus("reconnecting");

    const delay = this.config.reconnectInterval || 5000;
    logger.info("Attempting to reconnect WebSocket", {
      attempt: this.reconnectAttempts,
      maxAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    const interval = this.config?.heartbeatInterval || 30000;
    this.heartbeatTimer = setInterval(() => {
      this.sendSignal("ping");
    }, interval);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(status: WebSocketConnectionStatus): void {
    this.status = status;
    const statusInfo = this.getStatus();

    // Notify all status listeners
    this.statusListeners.forEach((listener) => {
      try {
        listener(statusInfo);
      } catch (error) {
        logger.error("Error in status listener", { error });
      }
    });
  }

  /**
   * Notify all signal listeners
   */
  private notifySignalListeners(signal: WebSocketSignalMessage): void {
    this.signalListeners.forEach((listener) => {
      try {
        listener(signal);
      } catch (error) {
        logger.error("Error in signal listener", { error });
      }
    });
  }

  /**
   * Reset service state for testing
   * This method is primarily for test isolation
   */
  public reset(): void {
    this.disconnect();
    this.signalListeners.clear();
    this.statusListeners.clear();
    this.reconnectAttempts = 0;
    this.lastHeartbeat = null;
    this.errorMessage = null;
    this.config = null;
  }
}

export const websocketSignalingService = WebSocketSignalingService.getInstance();
