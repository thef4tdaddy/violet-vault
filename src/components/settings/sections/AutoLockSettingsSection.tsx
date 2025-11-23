import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils/icons";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
  description: string;
}

/**
 * Toggle switch component for consistency
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 mr-4">
      <label className="text-sm font-black text-purple-800 uppercase tracking-wide">{label}</label>
      <p className="text-xs text-purple-700 mt-1 font-medium">{description}</p>
    </div>
    <Button
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-lg border-2 border-black ${
        enabled ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 border border-gray-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </Button>
  </div>
);

interface SecuritySettings {
  autoLockEnabled: boolean;
  autoLockTimeout: number;
  lockOnPageHide: boolean;
}

interface AutoLockSettingsSectionProps {
  securitySettings: SecuritySettings;
  handleSettingChange: (setting: string, value: boolean | number) => void;
}

/**
 * Auto-lock settings section with toggle switches and timeout slider
 * Extracted from SecuritySettings.jsx with UI standards compliance
 */
const AutoLockSettingsSection: React.FC<AutoLockSettingsSectionProps> = ({
  securitySettings,
  handleSettingChange,
}) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 shadow-xl border-2 border-black bg-orange-50/60 backdrop-blur-3xl">
      <h4 className="font-black text-black mb-4 flex items-center gap-3 text-lg">
        <div className="glassmorphism rounded-full p-2 bg-orange-500/20 border border-orange-400">
          {React.createElement(getIcon("Lock"), {
            className: "h-5 w-5 text-orange-600",
          })}
        </div>
        AUTO-LOCK SETTINGS
      </h4>

      <div className="space-y-1">
        {/* Enable Auto-Lock Toggle */}
        <ToggleSwitch
          enabled={securitySettings.autoLockEnabled}
          onChange={() => handleSettingChange("autoLockEnabled", !securitySettings.autoLockEnabled)}
          label="Enable Auto-Lock"
          description="Automatically lock the app after period of inactivity"
        />

        {/* Auto-Lock Timeout Slider */}
        {securitySettings.autoLockEnabled && (
          <div className="pt-4 pb-2">
            <div className="glassmorphism rounded-lg p-4 border border-orange-300 bg-white/50">
              <label className="text-sm font-black text-purple-800 flex items-center gap-2 uppercase tracking-wide mb-3">
                {React.createElement(getIcon("Clock"), {
                  className: "h-4 w-4 text-orange-500",
                })}
                Auto-Lock Timeout: {securitySettings.autoLockTimeout} Minutes
              </label>

              <input
                type="range"
                min="1"
                max="120"
                value={securitySettings.autoLockTimeout}
                onChange={(e) => handleSettingChange("autoLockTimeout", parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-orange-200 to-orange-400 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #fb923c 0%, #fb923c ${(securitySettings.autoLockTimeout / 120) * 100}%, #fed7aa ${(securitySettings.autoLockTimeout / 120) * 100}%, #fed7aa 100%)`,
                }}
              />

              <div className="flex justify-between text-xs font-bold text-orange-700 mt-2">
                <span>⚡ 1 MIN</span>
                <span>🕐 2 HOURS</span>
              </div>
            </div>
          </div>
        )}

        {/* Lock on Page Hide Toggle */}
        <ToggleSwitch
          enabled={securitySettings.lockOnPageHide}
          onChange={() => handleSettingChange("lockOnPageHide", !securitySettings.lockOnPageHide)}
          label="Lock on Page Hide"
          description="Lock when switching tabs or minimizing window"
        />
      </div>
    </div>
  );
};

export default AutoLockSettingsSection;
