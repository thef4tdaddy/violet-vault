import React, { useState } from "react";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils";

interface ShareCodeDisplayProps {
  shareCode: string;
  onCreateBudget: (e?: React.FormEvent) => void | Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

/**
 * Share Code Display Component
 * Shows the generated 4-word share code with copy/save options
 * Critical step - user MUST save this code to access budget on other devices
 */
const ShareCodeDisplay = ({
  shareCode,
  onCreateBudget,
  onBack,
  isLoading,
}: ShareCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Handle clipboard copy failure silently in UI
    }
  };

  const handleDownload = () => {
    const content = `Violet Vault Budget Share Code

⚠️  IMPORTANT: Save this code safely - you need it to access your budget on other devices!

Your Share Code:
${shareCode}

Instructions:
1. Keep this code private and secure
2. You need BOTH your password AND this share code to access your budget
3. If you lose this code, you cannot recover your budget
4. To use on another device: enter your password + this share code

Generated: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `violet-vault-share-code-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayCode = shareCode
    .split(" ")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          {renderIcon("AlertTriangle", { className: "w-5 h-5" })}
          <h3 className="font-bold">CRITICAL: Save Your Share Code</h3>
        </div>
        <p className="text-red-700 text-sm">
          You need this code to access your budget on other devices. If you lose it, you cannot
          recover your budget!
        </p>
      </div>

      {/* Share Code Display */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Budget Share Code</h2>
          <p className="text-sm text-gray-600">
            Write this down or save it safely - you'll need it to access your budget from other
            devices
          </p>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
          <div className="text-2xl font-mono font-bold text-purple-900 tracking-wider mb-4 select-all">
            🔑 {displayCode}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {renderIcon(copied ? "Check" : "Copy", { className: "w-4 h-4" })}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </Button>

            <Button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {renderIcon("Download", { className: "w-4 h-4" })}
              <span>Save to File</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to use your share code:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep this code private and secure (like a password)</li>
          <li>• To access your budget: enter your password + this share code</li>
          <li>• Same code works on all your devices</li>
          <li>• No more device-specific lockouts!</li>
        </ul>
      </div>

      {/* Final Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-200 text-black font-semibold rounded-lg border-2 border-black hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {renderIcon("ArrowLeft", { className: "w-4 h-4 mr-2" })}
          Back
        </Button>

        <Button
          type="button"
          onClick={onCreateBudget}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg border-2 border-black hover:bg-purple-700 transition-colors disabled:opacity-50 font-semibold"
        >
          {isLoading ? (
            <>
              {renderIcon("Loader2", { className: "w-4 h-4 mr-2 animate-spin" })}
              Creating...
            </>
          ) : (
            <>
              {renderIcon("Rocket", { className: "w-4 h-4 mr-2" })}
              Create My Budget
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ShareCodeDisplay;
