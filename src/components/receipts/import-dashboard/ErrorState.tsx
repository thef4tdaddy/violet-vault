import React from "react";
import { getIcon } from "@/utils/ui/icons";
import { Button } from "@/components/ui/buttons";

const AlertTriangle = getIcon("AlertTriangle");
const RefreshCw = getIcon("RefreshCw");

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Error",
  message,
  onRetry,
  isRetrying = false,
  className = "",
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        p-6 bg-red-50 border-2 border-red-200 rounded-xl
        text-center
        ${className}
      `}
      role="alert"
      data-testid="error-state"
    >
      <div className="mb-3 p-3 bg-red-100 rounded-full">
        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>

      <h3 className="font-mono font-black uppercase tracking-tight text-red-900 text-lg mb-2">
        {title}
      </h3>

      <p className="font-mono text-sm text-red-700 max-w-sm mb-4">{message}</p>

      {onRetry && (
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          variant="outline"
          className="bg-white border-2 border-black text-red-800 hover:bg-red-50"
          data-testid="error-retry-button"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
