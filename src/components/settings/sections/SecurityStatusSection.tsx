import React from "react";
import { getIcon } from "@/utils/icons";
import type { SecuritySettings, SecurityEvent } from "@/services/security/securityService";

interface SecurityStatusSectionProps {
  isLocked: boolean;
  securitySettings: SecuritySettings;
  securityEvents: SecurityEvent[];
  timeUntilAutoLock: () => string | null;
}

/**
 * Security status display section
 * Extracted from SecuritySettings.jsx for better organization
 */
const SecurityStatusSection = ({
  isLocked,
  securitySettings,
  securityEvents,
  timeUntilAutoLock,
}: SecurityStatusSectionProps) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 shadow-xl border-2 border-black bg-purple-50/60 backdrop-blur-3xl">
      <h4 className="font-black text-black mb-4 flex items-center gap-3 text-lg">
        <div className="glassmorphism rounded-full p-2 bg-blue-500/20 border border-blue-400">
          {React.createElement(getIcon("Info"), {
            className: "h-5 w-5 text-blue-600",
          })}
        </div>
        CURRENT SECURITY STATUS
      </h4>

      <div className="space-y-3 text-sm">
        {/* Session Status */}
        <div className="flex justify-between items-center py-2 px-3 glassmorphism rounded-lg border border-gray-300 bg-white/40">
          <span className="font-bold text-purple-800">Session Status:</span>
          <span
            className={`font-black px-3 py-1 rounded-full text-xs uppercase tracking-wide ${
              isLocked
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {isLocked ? "🔒 LOCKED" : "✅ ACTIVE"}
          </span>
        </div>

        {/* Auto-lock Timer */}
        {securitySettings.autoLockEnabled && !isLocked && (
          <div className="flex justify-between items-center py-2 px-3 glassmorphism rounded-lg border border-gray-300 bg-white/40">
            <span className="font-bold text-purple-800">Auto-lock in:</span>
            <span className="font-black text-orange-600 px-3 py-1 rounded-full text-xs uppercase bg-orange-100 border border-orange-300">
              {timeUntilAutoLock() || "⏱️ CALCULATING..."}
            </span>
          </div>
        )}

        {/* Security Events Count */}
        <div className="flex justify-between items-center py-2 px-3 glassmorphism rounded-lg border border-gray-300 bg-white/40">
          <span className="font-bold text-purple-800">Security Events:</span>
          <span className="font-black text-gray-700 px-3 py-1 rounded-full text-xs uppercase bg-gray-100 border border-gray-300">
            📊 {securityEvents.length} RECORDED
          </span>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatusSection;
