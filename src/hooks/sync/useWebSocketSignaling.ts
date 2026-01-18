import { useState, useEffect, useCallback, useRef } from "react";
import { websocketSignalingService } from "@/services/sync/websocketSignalingService";
import type {
  WebSocketSignalMessage,
  WebSocketServiceStatus,
  WebSocketSignalType,
} from "@/types/sync";
import logger from "@/utils/core/common/logger";

/**
 * React hook for WebSocket signaling service
 *
 * Provides connection status and signal handling for real-time sync notifications.
 * Follows the privacy-preserving pattern: signals only, no data transmission.
 *
 * Note: This hook manages a singleton service. Multiple instances will share the same
 * WebSocket connection, and the connection will only be closed when all components
 * using this hook have unmounted.
 *
 * @param budgetId - The budget ID to connect to
 * @param onSignal - Callback for handling incoming signals
 * @returns WebSocket service status and control methods
 */
export const useWebSocketSignaling = (
  budgetId: string | null,
  onSignal?: (signal: WebSocketSignalMessage) => void
) => {
  const [status, setStatus] = useState<WebSocketServiceStatus>({
    status: "disconnected",
    isConnected: false,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    error: null,
  });

  // Use ref to store the latest callback to avoid re-subscribing
  const onSignalRef = useRef(onSignal);

  // Update ref when callback changes
  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  // Connect to WebSocket when budgetId is available
  useEffect(() => {
    if (!budgetId) {
      return;
    }

    // Check if WebSocket is enabled
    const wsEnabled = import.meta.env.VITE_WEBSOCKET_ENABLED === "true";
    if (!wsEnabled) {
      logger.debug("WebSocket signaling is disabled");
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      logger.warn("VITE_WEBSOCKET_URL not configured");
      return;
    }

    logger.info("Connecting to WebSocket signaling service", { budgetId });

    // Connect to WebSocket
    websocketSignalingService.connect({
      url: wsUrl,
      budgetId,
    });

    // Subscribe to status changes
    const unsubscribeStatus = websocketSignalingService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Note: We don't disconnect on unmount to allow multiple components to share
    // the same connection. The service manages its own lifecycle.
    // If you need to explicitly disconnect, use the disconnect method.
    return () => {
      unsubscribeStatus();
    };
  }, [budgetId]);

  // Subscribe to signals using the ref pattern to avoid re-subscribing
  // We track whether a callback exists (not the callback itself) to handle:
  // 1. Component mounts without callback → no subscription
  // 2. Callback becomes defined later → create subscription
  // 3. Callback reference changes → keep subscription, ref keeps it updated
  const hasCallback = !!onSignal;
  useEffect(() => {
    // Only subscribe if a callback was provided
    if (!hasCallback) {
      return;
    }

    const unsubscribeSignal = websocketSignalingService.onSignal((signal) => {
      // Call the latest callback from ref
      if (onSignalRef.current) {
        onSignalRef.current(signal);
      }
    });

    return () => {
      unsubscribeSignal();
    };
  }, [hasCallback]); // Re-run only when callback existence changes (not reference)

  // Send signal method
  const sendSignal = useCallback(
    (type: WebSocketSignalType, metadata?: Record<string, unknown>) => {
      websocketSignalingService.sendSignal(type, metadata);
    },
    []
  );

  // Reconnect method
  const reconnect = useCallback(() => {
    if (!budgetId) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      logger.warn("VITE_WEBSOCKET_URL not configured");
      return;
    }

    websocketSignalingService.disconnect();
    websocketSignalingService.connect({
      url: wsUrl,
      budgetId,
    });
  }, [budgetId]);

  // Disconnect method - disconnects the shared WebSocket for ALL components using this hook
  // Use only when intentionally shutting down all WebSocket connections
  const disconnect = useCallback(() => {
    websocketSignalingService.disconnect();
  }, []);

  return {
    status,
    isConnected: status.isConnected,
    connectionStatus: status.status,
    lastHeartbeat: status.lastHeartbeat,
    reconnectAttempts: status.reconnectAttempts,
    error: status.error,
    sendSignal,
    reconnect,
    disconnect,
  };
};
