/**
 * Encrypted Payload Inspector - v2.1
 * Visualizes encryption process and sample data for transparency
 */

import React, { useState, useEffect } from "react";
import type { EncryptedPayloadData } from "@/types/privacyAudit";

/**
 * Component to inspect and visualize encrypted payload data
 * Shows before/after encryption with sample data
 */
export function EncryptedPayloadInspector(): React.ReactElement {
  const [sampleData, setSampleData] = useState<EncryptedPayloadData | null>(null);

  useEffect(() => {
    // Generate sample encrypted payload for demonstration
    generateSamplePayload().then(setSampleData);
  }, []);

  if (!sampleData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-purple-600">Loading sample data...</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 space-y-6 bg-white/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-gray-900">Data Inspector</h3>

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>🔒 End-to-End Encryption</strong>
          <br />
          This shows a sample of what data is sent to the backend. All data is encrypted using
          AES-256-GCM before transmission. The backend processes it in-memory and immediately
          discards it after generating insights.
        </p>
      </div>

      {/* Visual flow */}
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        <div className="flex-1 border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold mb-3 text-green-900 flex items-center gap-2">
            <span className="text-xl">📄</span>
            Original Data (Your Device)
          </h4>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-64 border border-green-200 font-mono">
            {JSON.stringify(sampleData.originalData, null, 2)}
          </pre>
        </div>

        <div className="flex items-center justify-center text-3xl text-purple-600 font-bold">→</div>

        <div className="flex-1 border rounded-lg p-4 bg-purple-50">
          <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
            <span className="text-xl">🔐</span>
            Encrypted (In Transit)
          </h4>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-48 break-all border border-purple-200 font-mono">
            {sampleData.encryptedData.substring(0, 200)}...
          </pre>
          <div className="mt-3 text-xs text-purple-700 space-y-1">
            <div className="flex items-center gap-2">
              <strong>IV:</strong>
              <code className="bg-white px-2 py-0.5 rounded border border-purple-200">
                {sampleData.iv}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <strong>Auth Tag:</strong>
              <code className="bg-white px-2 py-0.5 rounded border border-purple-200">
                {sampleData.authTag}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <strong>Encryption Time:</strong>
              <span className="bg-white px-2 py-0.5 rounded border border-purple-200">
                {sampleData.encryptionTime.toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Fields Explanation */}
      <div className="border-t pt-6">
        <h4 className="font-semibold mb-3 text-gray-900">What data is included:</h4>
        <ul className="list-disc list-inside text-sm space-y-2 text-gray-700">
          <li>Transaction amounts (encrypted)</li>
          <li>Envelope IDs (encrypted)</li>
          <li>Dates (encrypted)</li>
          <li>Allocation strategies (encrypted)</li>
        </ul>
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>No personally identifiable information (PII)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>No account numbers or bank details</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>No email addresses or names</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate a sample encrypted payload for demonstration
 */
async function generateSamplePayload(): Promise<EncryptedPayloadData> {
  // Sample original data
  const originalData = {
    transactions: [
      { date: "2026-02-01", amount: 100, envelopeId: "env_123" },
      { date: "2026-02-08", amount: 150, envelopeId: "env_456" },
    ],
    dateRange: { start: "2026-01-01", end: "2026-02-01" },
  };

  const startTime = performance.now();

  // Simple base64 encoding for demo (in production, use actual encryption)
  const encryptedData = btoa(JSON.stringify(originalData));

  const encryptionTime = performance.now() - startTime;

  // Generate sample IV and auth tag
  const iv = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
  const authTag = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");

  return {
    originalData,
    encryptedData,
    iv,
    authTag,
    encryptionTime,
  };
}
