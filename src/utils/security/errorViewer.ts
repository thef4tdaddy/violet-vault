/**
 * Local Error Viewer - Fallback when monitoring services are blocked
 * Access via browser console: window.VioletVaultErrors
 */

import logger from "../common/logger";

class ErrorViewer {
  constructor() {
    this.initializeConsoleAPI();
  }

  initializeConsoleAPI() {
    // Make error viewer available globally for development
    (window as Window & { VioletVaultErrors?: unknown }).VioletVaultErrors = {
      view: () => this.viewErrors(),
      clear: () => this.clearErrors(),
      export: () => this.exportErrors(),
      count: () => this.getErrorCount(),
      latest: (n = 5) => this.getLatestErrors(n),
    };

    // Add friendly console message
    if (process.env.NODE_ENV === "development") {
      logger.info(
        "🔍 VioletVault Error Viewer Available",
        "color: #8b5cf6; font-weight: bold; font-size: 14px"
      );
      logger.info("Use window.VioletVaultErrors.view() to see stored errors");
      logger.info("Other commands: .clear(), .export(), .count(), .latest(n)");
    }
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem("violet-vault-errors") || "[]");
    } catch (error) {
      logger.error("Failed to parse stored errors:", error);
      return [];
    }
  }

  viewErrors() {
    const errors = this.getStoredErrors();

    if (errors.length === 0) {
      logger.info("✅ No errors stored locally");
      return;
    }

    logger.info(`🚨 VioletVault Stored Errors (${errors.length})`);

    errors.forEach((error, index) => {
      const timeAgo = this.getTimeAgo(error.timestamp);
      logger.info(`${index + 1}. ${error.name}: ${error.message} (${timeAgo})`);
      logger.debug("Component:", error.failingComponent);
      logger.debug("Timestamp:", error.timestamp);
      logger.debug("URL:", error.url);
      logger.debug("Stack:", error.stack);
      logger.debug("Component Stack:", error.componentStack);
    });

    return errors;
  }

  clearErrors() {
    localStorage.removeItem("violet-vault-errors");
    logger.info("🧹 Cleared all stored errors");
  }

  exportErrors() {
    const errors = this.getStoredErrors();
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `violet-vault-errors-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    logger.info("📥 Exported errors to JSON file");

    return errors;
  }

  getErrorCount() {
    const count = this.getStoredErrors().length;
    logger.info(`📊 ${count} errors stored locally`);
    return count;
  }

  getLatestErrors(n = 5) {
    const errors = this.getStoredErrors().slice(0, n);
    logger.info(`📋 Latest ${n} errors:`);
    errors.forEach((error, index) => {
      const timeAgo = this.getTimeAgo(error.timestamp);
      logger.info(`${index + 1}. ${error.failingComponent}: ${error.message} (${timeAgo})`);
    });
    return errors;
  }

  getTimeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  }

  // Method to simulate sending errors to external service when connection is restored
  async retrySendErrors() {
    const errors = this.getStoredErrors();

    if (errors.length === 0) {
      logger.info("✅ No errors to retry");
      return;
    }

    logger.info(`🔄 Attempting to send ${errors.length} stored errors...`);

    // This would integrate with whatever error service you want to use
    // For now, just log them with instructions for manual sending
    logger.info("📤 Errors ready to send to external service:");
    errors.forEach((error, index) => {
      logger.debug(`${index + 1}.`, {
        timestamp: error.timestamp,
        error: error.name,
        message: error.message,
        component: error.failingComponent,
        signature: error.errorSignature,
      });
    });

    logger.info("💡 You can copy these errors and manually report them");
    return errors;
  }
}

// Initialize the error viewer
new ErrorViewer();

export default ErrorViewer;
