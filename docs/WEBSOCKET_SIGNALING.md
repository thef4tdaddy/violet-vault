# WebSocket Real-Time Signaling

## Overview

VioletVault supports optional **privacy-preserving real-time sync notifications** via WebSocket. This feature enables instant synchronization across multiple devices while maintaining strict end-to-end encryption.

## Privacy-First Design

### Critical Privacy Rules

1. **SIGNALING ONLY** - WebSockets transmit only metadata signals (e.g., "data changed")
2. **NO DECRYPTED DATA** - Your financial data never travels through WebSocket unencrypted
3. **NO ENCRYPTED BLOBS** - Large encrypted payloads are not streamed via WebSocket
4. **E2E ENCRYPTION PRESERVED** - All sensitive data flows through Firebase with encryption

### How It Works

1. Client A makes a budget change
2. Data is encrypted locally and saved to Firebase via SyncOrchestrator
3. SyncOrchestrator emits a WebSocket signal: `{ type: "data_changed", timestamp: ... }`
4. Client B receives the signal
5. Client B triggers normal sync flow to fetch encrypted data from Firebase
6. Data is decrypted locally on Client B

**Result:** Clients stay synchronized in real-time without compromising privacy.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Enable WebSocket signaling
VITE_WEBSOCKET_ENABLED=true

# WebSocket server URL
VITE_WEBSOCKET_URL=ws://localhost:8080
# Or for production:
VITE_WEBSOCKET_URL=wss://your-websocket-server.com
```

### WebSocket Server Requirements

Your WebSocket server should:

1. Accept WebSocket connections
2. Authenticate clients (optional but recommended)
3. Route signals to connected clients for the same budget
4. Support signal types:
   - `connected` - Client connected
   - `disconnected` - Client disconnected
   - `data_changed` - Data has changed, sync required
   - `sync_required` - Explicit sync request
   - `ping` / `pong` - Heartbeat

### Example Server Implementation

```javascript
// Simple Node.js WebSocket server example
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const rooms = new Map(); // budgetId -> Set of clients

wss.on("connection", (ws) => {
  let budgetId = null;

  ws.on("message", (data) => {
    const signal = JSON.parse(data);

    // Handle connection signal
    if (signal.type === "connected") {
      budgetId = signal.budgetId;
      if (!rooms.has(budgetId)) {
        rooms.set(budgetId, new Set());
      }
      rooms.get(budgetId).add(ws);
    }

    // Handle heartbeat
    if (signal.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      return;
    }

    // Broadcast signal to all clients in the same room
    if (budgetId && rooms.has(budgetId)) {
      rooms.get(budgetId).forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(signal));
        }
      });
    }
  });

  ws.on("close", () => {
    if (budgetId && rooms.has(budgetId)) {
      rooms.get(budgetId).delete(ws);
    }
  });
});
```

## Usage

### React Hook

Use the `useWebSocketSignaling` hook in your components:

```typescript
import { useWebSocketSignaling } from '@/hooks/sync/useWebSocketSignaling';
import { useCallback } from 'react';

function MyComponent() {
  const budgetId = 'your-budget-id';

  // Handle incoming signals
  const handleSignal = useCallback((signal) => {
    console.log('Signal received:', signal.type);

    if (signal.type === 'data_changed') {
      // Optionally show a notification or UI indicator
      console.log('Remote data changed, sync will trigger automatically');
    }
  }, []);

  const {
    isConnected,
    connectionStatus,
    lastHeartbeat,
    error,
    sendSignal,
    reconnect,
    disconnect
  } = useWebSocketSignaling(budgetId, handleSignal);

  return (
    <div>
      <p>WebSocket Status: {connectionStatus}</p>
      {isConnected && <p>✓ Real-time sync active</p>}
      {error && <p>Error: {error}</p>}

      <button onClick={() => sendSignal('sync_required')}>
        Request Sync
      </button>
    </div>
  );
}
```

### Service Layer

Use the WebSocket service directly:

```typescript
import { websocketSignalingService } from "@/services/sync/websocketSignalingService";

// Connect
await websocketSignalingService.connect({
  url: "ws://localhost:8080",
  budgetId: "your-budget-id",
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
  maxReconnectAttempts: 10,
});

// Listen for signals
const unsubscribe = websocketSignalingService.onSignal((signal) => {
  console.log("Signal:", signal);
});

// Send a signal
websocketSignalingService.sendSignal("data_changed", {
  version: "2.0",
});

// Check status
const status = websocketSignalingService.getStatus();
console.log("Connected:", status.isConnected);

// Cleanup
unsubscribe();
websocketSignalingService.disconnect();
```

## Signal Types

### `connected`

Sent when a client connects to the WebSocket server.

```typescript
{
  type: 'connected',
  budgetId: 'abc123',
  timestamp: 1234567890,
  metadata: {
    version: '2.0'
  }
}
```

### `data_changed`

Sent when data has been modified and saved to cloud.

```typescript
{
  type: 'data_changed',
  budgetId: 'abc123',
  timestamp: 1234567890,
  metadata: {
    version: '2.0'
  }
}
```

### `sync_required`

Explicit request for clients to sync.

```typescript
{
  type: 'sync_required',
  budgetId: 'abc123',
  timestamp: 1234567890
}
```

### `ping` / `pong`

Heartbeat signals to maintain connection.

```typescript
{
  type: 'ping',
  timestamp: 1234567890
}
```

## Integration with SyncOrchestrator

WebSocket signaling is automatically integrated with the SyncOrchestrator:

1. When `syncOrchestrator.start()` is called, it automatically sets up WebSocket signaling
2. On successful sync, a `data_changed` signal is sent to notify other clients
3. When a `data_changed` or `sync_required` signal is received, sync is triggered automatically
4. When `syncOrchestrator.stop()` is called, WebSocket is disconnected

No additional configuration needed in your sync logic!

## Testing

The WebSocket service includes comprehensive tests:

- **Privacy compliance tests** - Verify no data transmission
- **Connection management tests** - Connect, disconnect, reconnect
- **Signal handling tests** - Send and receive signals
- **Heartbeat tests** - Verify periodic ping/pong
- **Multi-listener tests** - Multiple subscribers

Run tests:

```bash
npm run test -- src/services/__tests__/websocketSignalingService.test.ts
```

## Troubleshooting

### WebSocket not connecting

1. Check `VITE_WEBSOCKET_ENABLED` is set to `true`
2. Verify `VITE_WEBSOCKET_URL` is correct
3. Ensure WebSocket server is running
4. Check browser console for connection errors

### Signals not being received

1. Verify both clients are connected to the same WebSocket server
2. Check that both clients have the same `budgetId`
3. Look for WebSocket errors in browser console
4. Check WebSocket server logs

### Frequent disconnections

1. Check network stability
2. Adjust `heartbeatInterval` in config
3. Increase `maxReconnectAttempts` if needed
4. Review WebSocket server logs for errors

## Security Considerations

1. **Use WSS (Secure WebSocket)** in production: `wss://`
2. **Implement authentication** on your WebSocket server
3. **Validate all incoming signals** on the server
4. **Rate limit connections** to prevent abuse
5. **Monitor for suspicious activity** (unusual signal patterns)

## Performance

- **Lightweight signals** - Typically < 1KB per signal
- **Automatic reconnection** - Handles network interruptions
- **Debounced sync triggers** - Prevents excessive syncing
- **Heartbeat monitoring** - Detects stale connections

## Disabling WebSocket

To disable WebSocket signaling:

1. Set `VITE_WEBSOCKET_ENABLED=false` in `.env`
2. Or remove the environment variable entirely

The app will continue to work normally, falling back to periodic sync or manual sync triggers.

## Future Enhancements

- **WebSocket authentication** - JWT token-based auth
- **Presence indicators** - Show which users are online
- **Typing indicators** - Show who is editing
- **Conflict resolution signals** - Notify about merge conflicts
- **Broadcast system messages** - Server maintenance notifications

## Architecture Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│  Client A   │◄───────►│  WebSocket       │◄───────►│  Client B   │
│             │  Signal │  Server          │  Signal │             │
└─────┬───────┘         └──────────────────┘         └─────┬───────┘
      │                                                      │
      │ Encrypted                                  Encrypted │
      │ Data Flow                                  Data Flow │
      │                                                      │
      ▼                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Firebase                                 │
│                  (Encrypted Data Storage)                        │
└─────────────────────────────────────────────────────────────────┘
```

**Signal Flow:**

1. Client A → WebSocket Server (signal only)
2. WebSocket Server → Client B (signal only)
3. Client B → Firebase (fetch encrypted data)
4. Firebase → Client B (encrypted data)
5. Client B decrypts locally

**Data never flows through WebSocket - only signals!**
