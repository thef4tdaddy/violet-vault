/**
 * Hook for connection configuration and display settings
 * Extracted from useConnectionManager.js for better maintainability
 */
export const useConnectionConfig = () => {
  const getConnectionConfig = (entityType: string) => {
    switch (entityType) {
      case "bill":
        return {
          displayTitle: "Connected Envelopes",
          selectTitle: "Connect to Envelope",
          connectionType: "envelope",
          selectPrompt: "Choose an envelope to connect this bill to...",
          tip: "Connect to an envelope to automatically allocate bill payments.",
        };
      case "envelope":
        return {
          displayTitle: "Connected Bills",
          selectTitle: "Connect to Bill",
          connectionType: "bill",
          selectPrompt: "Choose a bill to auto-populate envelope settings...",
          tip: "Connect to a bill to automatically fill envelope details.",
        };
      case "debt":
        return {
          displayTitle: "Connected Envelopes",
          selectTitle: "Connect to Envelope",
          connectionType: "envelope",
          selectPrompt: "Choose an envelope to allocate debt payments to...",
          tip: "Connect to an envelope to track debt payment allocations.",
        };
      default:
        return {
          displayTitle: "Connected Items",
          selectTitle: "Connect Item",
          connectionType: "item",
          selectPrompt: "Choose an item to connect...",
          tip: "Connect related items for better organization.",
        };
    }
  };

  return {
    getConnectionConfig,
  };
};
