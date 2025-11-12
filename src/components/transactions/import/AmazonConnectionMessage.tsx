/**
 * Amazon Connection Message Component
 * Displays info about backend integration requirements
 */

import React from "react";
import { renderIcon } from "@/utils/icons";

export const AmazonConnectionMessage: React.FC = () => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start">
        {renderIcon("Info", {
          className: "h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0",
        })}
        <div>
          <h4 className="font-medium text-blue-900 mb-1">Backend Integration Required</h4>
          <p className="text-sm text-blue-700 mb-3">
            To enable Amazon receipt importing, you need to implement the backend OAuth flow. This
            includes:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside ml-2">
            <li>OAuth 2.0 authorization flow (Gmail/Outlook/iCloud)</li>
            <li>Secure token storage with encryption</li>
            <li>Email search API endpoint</li>
            <li>Receipt parsing service</li>
          </ul>
          <p className="text-xs text-blue-600 mt-3">
            See{" "}
            <code className="bg-blue-100 px-1 rounded">
              src/services/amazon/amazonReceiptParser.ts
            </code>{" "}
            for the parser implementation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazonConnectionMessage;
