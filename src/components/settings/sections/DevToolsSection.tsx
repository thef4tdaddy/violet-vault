import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import SyncDebugToolsSection from "./SyncDebugToolsSection";
// Development mode detection utility
const isDevelopmentMode = () => {
  return (
    typeof window !== "undefined" &&
    (import.meta.env.MODE === "development" ||
      window.location.hostname.includes("dev.") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname === "127.0.0.1")
  );
};

const DevToolsSection = ({ onOpenEnvelopeChecker, onCreateTestHistory }) => {
  const currentMode = import.meta.env.MODE || "production";
  const isDebugMode = isDevelopmentMode();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Development Tools</h3>
        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {currentMode} Mode
        </div>
      </div>

      {/* Development Tools */}
      <div className="space-y-4">
        {/* Envelope Integrity Checker */}
        <Button
          onClick={onOpenEnvelopeChecker}
          className="w-full flex items-center p-3 border-2 border-black bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
        >
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-5 w-5 text-purple-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-gray-900">🔍 Envelope Integrity Checker</p>
            <p className="text-sm text-gray-700">Detect and fix empty/corrupted envelopes</p>
          </div>
        </Button>

        {/* Test Budget History */}
        <Button
          onClick={onCreateTestHistory}
          className="w-full flex items-center p-3 border-2 border-black bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm"
        >
          {React.createElement(getIcon("History"), {
            className: "h-5 w-5 text-yellow-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-gray-900">🧪 Test Budget History</p>
            <p className="text-sm text-gray-700">Create test commits for family collaboration</p>
          </div>
        </Button>

        {/* Sync Debug Tools */}
        <SyncDebugToolsSection isDebugMode={isDebugMode} />
      </div>
    </div>
  );
};

export default DevToolsSection;
