import React, { memo } from "react";
import { RefreshCw } from "lucide-react";

const LoadingSpinner = memo(({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="glassmorphism rounded-2xl p-8 text-center">
        <div className="relative mx-auto mb-4 w-16 h-16">
          <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-lg opacity-30"></div>
          <div className="relative bg-purple-500 p-4 rounded-2xl">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <p className="text-lg font-semibold text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
});

export default LoadingSpinner;
