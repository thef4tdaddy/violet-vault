import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useSecurityAcknowledgment } from "../../hooks/security/useSecurityAcknowledgment";

/**
 * Security warning component that informs users about local data storage
 * Addresses GitHub Issue #589 - Warning about unencrypted local data
 */
const LocalDataSecurityWarning = ({ onClose, onAcknowledge }) => {
  const { hasBeenAcknowledged, acknowledge } = useSecurityAcknowledgment();

  const handleAcknowledge = () => {
    acknowledge();
    if (onAcknowledge) onAcknowledge();
    if (onClose) onClose();
  };

  if (hasBeenAcknowledged) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-black shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh]">
        <WarningHeader />
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <SecurityStatusSection />
          <ImplicationsSection />
        </div>
        <WarningFooter onAcknowledge={handleAcknowledge} />
      </div>
    </div>
  );
};

const WarningHeader = () => (
  <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
        {React.createElement(getIcon("Shield"), {
          className: "h-6 w-6 text-yellow-600 dark:text-yellow-400",
        })}
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white">
          LOCAL DATA SECURITY NOTICE
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Please read and acknowledge this important information
        </p>
      </div>
    </div>
  </div>
);

const SecurityStatusSection = () => (
  <div className="space-y-4">
    <EncryptedDataCard />
    <UnencryptedDataCard />
  </div>
);

const EncryptedDataCard = () => (
  <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
    {React.createElement(getIcon("Lock"), {
      className: "w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0",
    })}
    <div>
      <h3 className="font-semibold text-green-800 dark:text-green-200 text-sm">✅ ENCRYPTED</h3>
      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
        Cloud data, authentication, and cross-device sync are fully encrypted
      </p>
    </div>
  </div>
);

const UnencryptedDataCard = () => (
  <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
    {React.createElement(getIcon("Unlock"), {
      className: "w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0",
    })}
    <div>
      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
        ⚠️ UNENCRYPTED (Local Only)
      </h3>
      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
        Local budget data (envelopes, bills, transactions) and profile info stored in browser
      </p>
    </div>
  </div>
);

const ImplicationsSection = () => (
  <div className="space-y-2">
    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
      {React.createElement(getIcon("AlertTriangle"), {
        className: "w-4 h-4 text-orange-500 mr-2",
      })}
      Key Points
    </h3>
    <div className="grid grid-cols-1 gap-3 text-xs">
      <div className="p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200">
        <p className="font-semibold text-green-800 dark:text-green-200 mb-1">✅ Protected From:</p>
        <p className="text-green-700 dark:text-green-300">
          Network attacks, unauthorized cloud access, server breaches
        </p>
      </div>
      <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200">
        <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
          ⚠️ NOT Protected From:
        </p>
        <p className="text-yellow-700 dark:text-yellow-300">
          Physical device access, malware, malicious browser extensions
        </p>
      </div>
      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
        <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🛡️ Best Practices:</p>
        <p className="text-blue-700 dark:text-blue-300">
          Lock your device, use strong passwords, keep software updated, log out on shared computers
        </p>
      </div>
    </div>
  </div>
);

const WarningFooter = ({ onAcknowledge }) => (
  <div className="flex flex-col items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
      This notice will not be shown again after you acknowledge it.
    </div>
    <Button
      onClick={onAcknowledge}
      className="w-full max-w-md px-8 py-3 text-base font-black text-white bg-purple-600 hover:bg-purple-700 rounded-lg border-2 border-black shadow-lg transition-all uppercase tracking-wider"
    >
      <span>
        <span className="text-lg">I</span> <span className="text-lg">U</span>NDERSTAND
      </span>
    </Button>
  </div>
);

export default LocalDataSecurityWarning;
