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
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-black shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <WarningHeader />
        <div className="p-6 space-y-6">
          <SecurityStatusSection />
          <ImplicationsSection />
          <RecommendationsSection />
          <TechnicalDetailsSection />
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
  <div className="flex items-start space-x-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
    {React.createElement(getIcon("Lock"), {
      className: "w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0",
    })}
    <div>
      <h3 className="font-semibold text-green-800 dark:text-green-200">✅ ENCRYPTED & SECURE</h3>
      <ul className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
        <li>
          • <strong>Cloud Data:</strong> All data sent to Firebase is fully encrypted
        </li>
        <li>
          • <strong>Authentication:</strong> Login credentials are encrypted in browser storage
        </li>
        <li>
          • <strong>Cross-Device Sync:</strong> Shared budgets use strong encryption
        </li>
      </ul>
    </div>
  </div>
);

const UnencryptedDataCard = () => (
  <div className="flex items-start space-x-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
    {React.createElement(getIcon("Unlock"), {
      className: "w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0",
    })}
    <div>
      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
        ⚠️ UNENCRYPTED (LOCAL DEVICE ONLY)
      </h3>
      <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
        <li>
          • <strong>Local Budget Data:</strong> Envelopes, bills, and transactions in browser
          storage
        </li>
        <li>
          • <strong>Basic Profile:</strong> Username and color preferences
        </li>
      </ul>
    </div>
  </div>
);

const ImplicationsSection = () => (
  <div className="space-y-3">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
      {React.createElement(getIcon("AlertTriangle"), {
        className: "w-5 h-5 text-orange-500 mr-2",
      })}
      What This Means for You
    </h3>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
      <p>
        <strong>✅ Your data IS protected from:</strong>
      </p>
      <ul className="ml-4 space-y-1 text-green-700 dark:text-green-300">
        <li>• Network interception (all cloud sync is encrypted)</li>
        <li>• Unauthorized cloud access (requires your password)</li>
        <li>• Data breaches of our servers (we can't decrypt your data)</li>
      </ul>
      <p className="mt-3">
        <strong>⚠️ Your data is NOT protected from:</strong>
      </p>
      <ul className="ml-4 space-y-1 text-yellow-700 dark:text-yellow-300">
        <li>• Someone with physical access to your unlocked device</li>
        <li>• Malware running on your computer with browser access</li>
        <li>• Browser extensions with broad permissions</li>
      </ul>
    </div>
  </div>
);

const RecommendationsSection = () => (
  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
      🛡️ Recommended Security Practices
    </h3>
    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
      <li>• Always lock your device when not in use</li>
      <li>• Use strong device passwords/biometric locks</li>
      <li>• Regularly review browser extensions and their permissions</li>
      <li>• Keep your browser and operating system updated</li>
      <li>• Log out of VioletVault when using shared computers</li>
    </ul>
  </div>
);

const TechnicalDetailsSection = () => (
  <details className="text-sm text-gray-600 dark:text-gray-400">
    <summary className="cursor-pointer font-medium hover:text-gray-800 dark:hover:text-gray-200">
      Technical Details (Click to expand)
    </summary>
    <div className="mt-2 space-y-2 text-xs pl-4">
      <p>
        <strong>Local Storage:</strong> Unencrypted data is stored in your browser's IndexedDB for
        performance. This allows fast access to your budget without requiring decryption for every
        operation.
      </p>
      <p>
        <strong>Cloud Storage:</strong> All data sent to Firebase is encrypted with AES-256-GCM
        using your password-derived key. We cannot decrypt your cloud data without your password.
      </p>
      <p>
        <strong>Why not encrypt everything locally?</strong> Local encryption would significantly
        slow down the app since every operation would require encryption/decryption. The current
        design balances security with performance.
      </p>
    </div>
  </details>
);

const WarningFooter = ({ onAcknowledge }) => (
  <div className="flex flex-col items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
      Please scroll through and read the entire notice above, then click "I Understand" to continue.
      <br />
      <span className="text-xs text-gray-500 mt-1 block">
        This notice will not be shown again after you acknowledge it.
      </span>
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
