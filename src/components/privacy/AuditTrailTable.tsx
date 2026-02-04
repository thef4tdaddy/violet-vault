import React from "react";
import { formatBytes } from "@/utils/data/settings/settingsHelpers";

interface AuditTrailTableProps {
  logs: Array<{
    id: string;
    timestamp: string | number;
    endpoint: string;
    encrypted: boolean;
    encryptedPayloadSize: number;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string;
  }>;
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({ logs }) => (
  <table className="w-full text-sm">
    <thead className="bg-gray-100 border-b">
      <tr>
        <th className="p-3 text-left font-semibold text-gray-700">Timestamp</th>
        <th className="p-3 text-left font-semibold text-gray-700">Endpoint</th>
        <th className="p-3 text-left font-semibold text-gray-700">Encrypted</th>
        <th className="p-3 text-left font-semibold text-gray-700">Payload Size</th>
        <th className="p-3 text-left font-semibold text-gray-700">Response Time</th>
        <th className="p-3 text-left font-semibold text-gray-700">Status</th>
      </tr>
    </thead>
    <tbody>
      {logs.slice(0, 50).map((log) => (
        <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
          <td className="p-3 text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
          <td className="p-3 text-gray-700 font-mono text-xs">{log.endpoint}</td>
          <td className="p-3">
            {log.encrypted ? (
              <span className="text-green-600 font-semibold flex items-center gap-1">
                ✓ Encrypted
              </span>
            ) : (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                ✗ Not Encrypted
              </span>
            )}
          </td>
          <td className="p-3 text-gray-700">{formatBytes(log.encryptedPayloadSize)}</td>
          <td className="p-3 text-gray-700">{log.responseTimeMs}ms</td>
          <td className="p-3">
            {log.success ? (
              <span className="text-green-600 font-semibold">Success</span>
            ) : (
              <span className="text-red-600 font-semibold" title={log.errorMessage}>
                Error
              </span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
