import React from "react";
import { getIcon } from "../../../utils/icons";

interface SecuritySettings {
  clipboardClearTimeout: number;
}

interface ClipboardSecuritySectionProps {
  securitySettings: SecuritySettings;
  handleSettingChange: (setting: string, value: number) => void;
}

/**
 * Clipboard security settings section
 * Extracted from SecuritySettings.jsx with enhanced UI standards
 */
const ClipboardSecuritySection: React.FC<ClipboardSecuritySectionProps> = ({
  securitySettings,
  handleSettingChange,
}) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 shadow-xl border-2 border-black bg-purple-50/60 backdrop-blur-3xl">
      <h4 className="font-black text-black mb-4 flex items-center gap-3 text-lg">
        <div className="glassmorphism rounded-full p-2 bg-purple-500/20 border border-purple-400">
          {React.createElement(getIcon("RotateCcw"), {
            className: "h-5 w-5 text-purple-600",
          })}
        </div>
        CLIPBOARD SECURITY
      </h4>

      <div className="glassmorphism rounded-lg p-4 border border-purple-300 bg-white/50">
        <label className="text-sm font-black text-purple-800 flex items-center gap-2 uppercase tracking-wide mb-3">
          {React.createElement(getIcon("Clock"), {
            className: "h-4 w-4 text-purple-500",
          })}
          Auto-Clear Timeout: {securitySettings.clipboardClearTimeout} Seconds
        </label>

        <p className="text-xs font-medium text-purple-700 mb-4">
          🔐 Automatically clear clipboard after copying sensitive data
        </p>

        <input
          type="range"
          min="5"
          max="300"
          value={securitySettings.clipboardClearTimeout}
          onChange={(e) => handleSettingChange("clipboardClearTimeout", parseInt(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-purple-200 to-purple-400 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((securitySettings.clipboardClearTimeout - 5) / 295) * 100}%, #e9d5ff ${((securitySettings.clipboardClearTimeout - 5) / 295) * 100}%, #e9d5ff 100%)`,
          }}
        />

        <div className="flex justify-between text-xs font-bold text-purple-700 mt-2">
          <span>⚡ 5 SEC</span>
          <span>⏰ 5 MIN</span>
        </div>
      </div>
    </div>
  );
};

export default ClipboardSecuritySection;
