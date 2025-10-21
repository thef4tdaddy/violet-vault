import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface WelcomeStepProps {
  loading: boolean;
  onStartFresh: () => void;
  onStartImport: () => void;
  onSwitchToAuth: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({
  loading,
  onStartFresh,
  onStartImport,
  onSwitchToAuth,
}) => (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        {React.createElement(getIcon("Shield"), {
          className: "h-5 w-5 text-blue-600 mr-3 mt-0.5",
        })}
        <div className="text-sm">
          <p className="text-blue-900 font-medium mb-2">Complete Privacy</p>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• No cloud sync or account required</li>
            <li>• All data stored locally on your device</li>
            <li>• Works completely offline</li>
            <li>• You control all data export and deletion</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start">
        {React.createElement(getIcon("AlertTriangle"), {
          className: "h-5 w-5 text-amber-600 mr-3 mt-0.5",
        })}
        <div className="text-sm">
          <p className="text-amber-900 font-medium mb-2">Important Limitations</p>
          <ul className="text-amber-800 space-y-1 text-sm">
            <li>• Data is not backed up automatically</li>
            <li>• Clearing browser data will delete your budget</li>
            <li>• Cannot sync between multiple devices</li>
            <li>• No password protection (device security only)</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        onClick={onStartFresh}
        disabled={loading}
        className="p-4 border border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 text-left"
      >
        {React.createElement(getIcon("User"), {
          className: "h-6 w-6 text-purple-600 mb-2",
        })}
        <div className="font-medium text-gray-900">Start Fresh</div>
        <div className="text-sm text-gray-600">Create a new local-only budget</div>
      </Button>

      <Button
        onClick={onStartImport}
        disabled={loading}
        className="p-4 border border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 text-left"
      >
        {React.createElement(getIcon("Upload"), {
          className: "h-6 w-6 text-green-600 mb-2",
        })}
        <div className="font-medium text-gray-900">Import Data</div>
        <div className="text-sm text-gray-600">Restore from previous export</div>
      </Button>
    </div>

    <div className="text-center">
      <Button
        onClick={onSwitchToAuth}
        className="text-sm text-gray-600 hover:text-gray-800 underline"
      >
        Use standard mode with cloud sync instead
      </Button>
    </div>
  </div>
);

export default WelcomeStep;
