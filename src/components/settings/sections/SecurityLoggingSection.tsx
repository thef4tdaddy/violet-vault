import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/icons";

interface SecuritySettings {
  securityLoggingEnabled: boolean;
}

interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string | number | Date;
}

interface SecurityLoggingSectionProps {
  securitySettings: SecuritySettings;
  securityEvents: SecurityEvent[];
  showEvents: boolean;
  handleSettingChange: (key: string, value: boolean) => void;
  toggleEventsDisplay: () => void;
  exportSecurityEvents: () => void;
  showClearConfirmDialog: () => void;
}

/**
 * Security logging section with events display and management
 * Extracted from SecuritySettings.jsx with UI standards compliance
 */
const SecurityLoggingSection: React.FC<SecurityLoggingSectionProps> = ({
  securitySettings,
  securityEvents,
  showEvents,
  handleSettingChange,
  toggleEventsDisplay,
  exportSecurityEvents,
  showClearConfirmDialog,
}) => {
  // Security event item component
  const SecurityEventItem: React.FC<{ event: SecurityEvent }> = ({ event }) => {
    const getEventTypeColor = (type: string) => {
      if (type.includes("FAILED") || type.includes("ERROR")) {
        return "text-red-600 bg-red-100 border-red-300";
      } else if (type.includes("LOCK")) {
        return "text-orange-600 bg-orange-100 border-orange-300";
      } else {
        return "text-green-600 bg-green-100 border-green-300";
      }
    };

    return (
      <div className="glassmorphism p-3 rounded-lg border border-gray-300 bg-white/60 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span
              className={`font-black text-xs uppercase tracking-wide px-2 py-1 rounded-full border ${getEventTypeColor(event.type)}`}
            >
              {event.type}
            </span>
            <p className="text-purple-800 mt-2 text-sm font-medium">{event.description}</p>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-300 ml-3">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="glassmorphism rounded-2xl p-6 shadow-xl border-2 border-black bg-green-50/60 backdrop-blur-3xl">
      <h4 className="font-black text-black mb-4 flex items-center gap-3 text-lg">
        <div className="glassmorphism rounded-full p-2 bg-green-500/20 border border-green-400">
          {React.createElement(getIcon("Eye"), {
            className: "h-5 w-5 text-green-600",
          })}
        </div>
        SECURITY LOGGING
      </h4>

      <div className="space-y-4">
        {/* Enable Security Logging Toggle */}
        <div className="flex items-center justify-between py-3">
          <div className="flex-1 mr-4">
            <label className="text-sm font-black text-purple-800 uppercase tracking-wide">
              Enable Security Logging
            </label>
            <p className="text-xs text-purple-700 mt-1 font-medium">
              🔍 Track security events and access attempts
            </p>
          </div>
          <Button
            onClick={() =>
              handleSettingChange(
                "securityLoggingEnabled",
                !securitySettings.securityLoggingEnabled
              )
            }
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-lg border-2 border-black ${
              securitySettings.securityLoggingEnabled
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 border border-gray-300 ${
                securitySettings.securityLoggingEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </Button>
        </div>

        {/* Security Events Management */}
        {securitySettings.securityLoggingEnabled && (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={toggleEventsDisplay}
                className="flex items-center gap-2 px-4 py-2 glassmorphism rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all bg-blue-500/20 hover:bg-blue-500/30 font-bold text-blue-700"
              >
                {showEvents
                  ? React.createElement(getIcon("EyeOff"), {
                      className: "h-4 w-4",
                    })
                  : React.createElement(getIcon("Eye"), {
                      className: "h-4 w-4",
                    })}
                {showEvents ? "HIDE" : "VIEW"} EVENTS ({securityEvents.length})
              </Button>

              <Button
                onClick={exportSecurityEvents}
                className="flex items-center gap-2 px-4 py-2 glassmorphism rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all bg-green-500/20 hover:bg-green-500/30 font-bold text-green-700"
              >
                {React.createElement(getIcon("Download"), {
                  className: "h-4 w-4",
                })}
                EXPORT
              </Button>

              <Button
                onClick={showClearConfirmDialog}
                className="flex items-center gap-2 px-4 py-2 glassmorphism rounded-lg border-2 border-black shadow-md hover:shadow-lg transition-all bg-red-500/20 hover:bg-red-500/30 font-bold text-red-700"
              >
                {React.createElement(getIcon("Trash2"), {
                  className: "h-4 w-4",
                })}
                CLEAR
              </Button>
            </div>

            {/* Security Events List */}
            {showEvents && (
              <div className="glassmorphism rounded-lg p-4 border border-green-300 bg-white/40 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {securityEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="glassmorphism rounded-full p-4 bg-gray-100/80 border border-gray-300 inline-block mb-3">
                        {React.createElement(getIcon("Eye"), {
                          className: "h-8 w-8 text-gray-400",
                        })}
                      </div>
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                        📊 No Security Events Recorded Yet
                      </p>
                    </div>
                  ) : (
                    securityEvents.map((event) => (
                      <SecurityEventItem key={event.id} event={event} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityLoggingSection;
