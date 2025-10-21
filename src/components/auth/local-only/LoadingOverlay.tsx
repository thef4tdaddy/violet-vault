import React from "react";

interface LoadingOverlayProps {
  loading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full mx-auto mb-3" />
        <div className="text-sm text-gray-600">Processing...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
