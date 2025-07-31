import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Sentry } from "../../utils/sentry.js";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.lastErrorMessage = null;
    this.lastErrorTime = null;
    this.lastComponentStack = null;
    this.errorBurstStartTime = null;
    this.errorCount = 0;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    const currentTime = Date.now();
    const componentStack = errorInfo.componentStack;

    // Extract the top-level failing component from the stack
    const failingComponent = this.extractFailingComponent(componentStack);

    // Create a more comprehensive error signature that includes:
    // 1. Error type and message
    // 2. Failing component name
    // 3. Top few lines of component stack for context
    const stackContext = componentStack.split("\n").slice(0, 3).join("\n").trim();

    const errorSignature = `${error.name}:${error.message}:${failingComponent}:${stackContext}`;

    // Enhanced deduplication logic
    const isSameErrorBurst = this.isSameErrorBurst(errorSignature, currentTime);
    const shouldSendToSentry = !isSameErrorBurst;

    if (shouldSendToSentry) {
      // Reset or initialize error burst tracking
      this.lastErrorMessage = errorSignature;
      this.lastErrorTime = currentTime;
      this.lastComponentStack = componentStack;
      this.errorBurstStartTime = currentTime;
      this.errorCount = 1;

      // Send error to Sentry with enhanced context
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
            failingComponent,
          },
          errorBoundary: {
            errorCount: this.errorCount,
            burstDuration: 0,
          },
        },
        tags: {
          errorBoundary: true,
          failingComponent,
        },
        fingerprint: [errorSignature],
      });

      console.log("📤 Sent error to Sentry:", errorSignature);
    } else {
      this.errorCount++;
      console.log(`🔄 Skipping duplicate error #${this.errorCount} in burst:`, errorSignature);

      // If we're in a long error burst, send a summary after 10 seconds
      if (currentTime - this.errorBurstStartTime > 10000 && this.errorCount > 1) {
        Sentry.captureMessage(`Error burst detected: ${this.errorCount} similar errors`, {
          level: "warning",
          contexts: {
            errorBurst: {
              originalError: this.lastErrorMessage,
              errorCount: this.errorCount,
              burstDuration: currentTime - this.errorBurstStartTime,
              componentStack: this.lastComponentStack,
            },
          },
          tags: {
            errorBoundary: true,
            errorBurst: true,
            failingComponent,
          },
        });

        // Reset burst tracking after sending summary
        this.errorCount = 0;
        this.errorBurstStartTime = currentTime;
      }
    }

    // Additional debugging info
    if (process.env.NODE_ENV === "development") {
      console.group("🔍 Error Boundary Debug Info");
      console.log("Error:", error);
      console.log("Error Info:", errorInfo);
      console.log("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  }

  extractFailingComponent = (componentStack) => {
    if (!componentStack) return "Unknown";

    // Extract the first meaningful component from the stack
    const lines = componentStack.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      const match = line.match(/at (\w+)/);
      if (match && match[1] !== "div" && match[1] !== "ErrorBoundary") {
        return match[1];
      }
    }
    return "Unknown";
  };

  isSameErrorBurst = (errorSignature, currentTime) => {
    // Consider it the same error burst if:
    // 1. Same error signature AND
    // 2. Within 30 seconds of the last error
    return (
      this.lastErrorMessage === errorSignature &&
      this.lastErrorTime &&
      currentTime - this.lastErrorTime < 30000
    );
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glassmorphism rounded-3xl p-8 w-full max-w-md text-center">
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-red-500 p-4 rounded-2xl">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>

            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Your data is safe and automatically saved.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full btn btn-primary py-3 rounded-2xl flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full btn btn-secondary py-3 rounded-2xl"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded-lg overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
