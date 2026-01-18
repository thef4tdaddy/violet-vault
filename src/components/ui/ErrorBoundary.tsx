import React, { Component, type ReactNode } from "react";
import logger from "@/utils/core/common/logger";
import { getIcon } from "@/utils";
import { captureError } from "@/utils/core/common/sentry";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // Context name for better error reporting (e.g., "AnalyticsDashboard", "TransactionLedger")
  onReset?: () => void; // Callback to reset error state
  showReload?: boolean; // Whether to show reload button (default: true)
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Simple React ErrorBoundary that doesn't depend on external libraries
 * Used as a fallback when Sentry ErrorBoundary is not available
 */
class SimpleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const context = this.props.context || "Unknown";
    logger.error(`ErrorBoundary caught an error in ${context}`, error, {
      componentStack: errorInfo.componentStack,
      context,
    });

    // Report to Sentry
    captureError(error, {
      context,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const context = this.props.context || "this section";
      const AlertIcon = getIcon("AlertTriangle");

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              {AlertIcon && <AlertIcon className="h-12 w-12 text-red-600" aria-hidden="true" />}
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-1">An error occurred in {context}.</p>
            {this.state.error?.message && (
              <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              {this.props.showReload !== false && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lazy-loaded Sentry ErrorBoundary wrapper
 * Falls back to SimpleErrorBoundary if Sentry is not available
 */
const LazySentryErrorBoundary = React.lazy(async () => {
  try {
    const { ErrorBoundary } = await import("@sentry/react");
    return {
      default: ErrorBoundary as React.ComponentType<{
        children: ReactNode;
        fallback?: ReactNode;
        showDialog?: boolean;
      }>,
    };
  } catch {
    // Fallback to simple error boundary if Sentry fails to load
    return {
      default: SimpleErrorBoundary,
    };
  }
});

/**
 * Smart ErrorBoundary that uses Sentry when available, falls back to simple boundary
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  context,
  onReset,
  showReload,
}) => {
  // Check if Sentry is enabled via environment variable
  const isSentryEnabled = import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true";

  if (isSentryEnabled) {
    // Use lazy-loaded Sentry ErrorBoundary
    return (
      <React.Suspense
        fallback={
          <SimpleErrorBoundary
            fallback={fallback}
            context={context}
            onReset={onReset}
            showReload={showReload}
          >
            {children}
          </SimpleErrorBoundary>
        }
      >
        <LazySentryErrorBoundary
          fallback={
            fallback || (
              <SimpleErrorBoundary context={context} onReset={onReset} showReload={showReload}>
                {children}
              </SimpleErrorBoundary>
            )
          }
          showDialog={false}
        >
          {children}
        </LazySentryErrorBoundary>
      </React.Suspense>
    );
  }

  // Use simple error boundary if Sentry is disabled
  return (
    <SimpleErrorBoundary
      fallback={fallback}
      context={context}
      onReset={onReset}
      showReload={showReload}
    >
      {children}
    </SimpleErrorBoundary>
  );
};

export default ErrorBoundary;
