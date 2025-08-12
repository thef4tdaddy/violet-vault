/**
 * Local Error Viewer - Fallback when monitoring services are blocked
 * Access via browser console: window.VioletVaultErrors
 */

class ErrorViewer {
  constructor() {
    this.initializeConsoleAPI();
  }

  initializeConsoleAPI() {
    // Make error viewer available globally for development
    window.VioletVaultErrors = {
      view: () => this.viewErrors(),
      clear: () => this.clearErrors(),
      export: () => this.exportErrors(),
      count: () => this.getErrorCount(),
      latest: (n = 5) => this.getLatestErrors(n),
    };

    // Add friendly console message
    if (process.env.NODE_ENV === "development") {
      console.log(
        "%c🔍 VioletVault Error Viewer Available",
        "color: #8b5cf6; font-weight: bold; font-size: 14px",
      );
      console.log("Use window.VioletVaultErrors.view() to see stored errors");
      console.log("Other commands: .clear(), .export(), .count(), .latest(n)");
    }
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem("violet-vault-errors") || "[]");
    } catch (error) {
      console.error("Failed to parse stored errors:", error);
      return [];
    }
  }

  viewErrors() {
    const errors = this.getStoredErrors();

    if (errors.length === 0) {
      console.log("✅ No errors stored locally");
      return;
    }

    console.group(`🚨 VioletVault Stored Errors (${errors.length})`);

    errors.forEach((error, index) => {
      const timeAgo = this.getTimeAgo(error.timestamp);
      console.group(
        `${index + 1}. ${error.name}: ${error.message} (${timeAgo})`,
      );
      console.log("Component:", error.failingComponent);
      console.log("Timestamp:", error.timestamp);
      console.log("URL:", error.url);
      console.log("Stack:", error.stack);
      console.log("Component Stack:", error.componentStack);
      console.groupEnd();
    });

    console.groupEnd();

    return errors;
  }

  clearErrors() {
    localStorage.removeItem("violet-vault-errors");
    console.log("🧹 Cleared all stored errors");
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
    console.log("📥 Exported errors to JSON file");

    return errors;
  }

  getErrorCount() {
    const count = this.getStoredErrors().length;
    console.log(`📊 ${count} errors stored locally`);
    return count;
  }

  getLatestErrors(n = 5) {
    const errors = this.getStoredErrors().slice(0, n);
    console.log(`📋 Latest ${n} errors:`);
    errors.forEach((error, index) => {
      const timeAgo = this.getTimeAgo(error.timestamp);
      console.log(
        `${index + 1}. ${error.failingComponent}: ${error.message} (${timeAgo})`,
      );
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
      console.log("✅ No errors to retry");
      return;
    }

    console.log(`🔄 Attempting to send ${errors.length} stored errors...`);

    // This would integrate with whatever error service you want to use
    // For now, just log them with instructions for manual sending
    console.group("📤 Errors ready to send to external service:");
    errors.forEach((error, index) => {
      console.log(`${index + 1}.`, {
        timestamp: error.timestamp,
        error: error.name,
        message: error.message,
        component: error.failingComponent,
        signature: error.errorSignature,
      });
    });
    console.groupEnd();

    console.log("💡 You can copy these errors and manually report them");
    return errors;
  }
}

// Initialize the error viewer
new ErrorViewer();

export default ErrorViewer;
