import React from "react";
import { getIcon } from "../../../utils";

interface ArchivingProgressData {
  stage: string;
  progress: number;
}

interface ArchivingProgressProps {
  isArchiving: boolean;
  archivingProgress: ArchivingProgressData | null;
}

const ArchivingProgress: React.FC<ArchivingProgressProps> = ({
  isArchiving,
  archivingProgress,
}) => {
  if (!isArchiving || !archivingProgress) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Archiving in Progress</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Stage: {archivingProgress.stage}</span>
            <span>{archivingProgress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${archivingProgress.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {React.createElement(getIcon("RefreshCw"), {
            className: "h-4 w-4 animate-spin",
          })}
          <span>Please wait while we archive your transactions...</span>
        </div>
      </div>
    </div>
  );
};

export default ArchivingProgress;
