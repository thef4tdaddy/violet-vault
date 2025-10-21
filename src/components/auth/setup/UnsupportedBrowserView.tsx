import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface UnsupportedBrowserViewProps {
  onSwitchToAuth: () => void;
}

const UnsupportedBrowserView: React.FC<UnsupportedBrowserViewProps> = ({ onSwitchToAuth }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="glassmorphism rounded-2xl p-8 w-full max-w-md text-center border border-white/30 shadow-2xl">
      {React.createElement(getIcon("ShieldOff"), {
        className: "h-16 w-16 text-red-500 mx-auto mb-4",
      })}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Local-Only Mode Unavailable</h2>
      <p className="text-gray-600 mb-6">
        Your browser doesn't support the features required for local-only mode.
      </p>
      <Button
        onClick={onSwitchToAuth}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Use Standard Mode
      </Button>
    </div>
  </div>
);

export default UnsupportedBrowserView;
