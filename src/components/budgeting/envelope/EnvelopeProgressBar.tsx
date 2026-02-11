import React from "react";

interface EnvelopeProgressBarProps {
  utilizationRate: number;
  progressBarColor: string;
}

export const EnvelopeProgressBar: React.FC<EnvelopeProgressBarProps> = React.memo(
  ({ utilizationRate, progressBarColor }) => {
    return (
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{
              width: `${Math.min(utilizationRate * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    );
  }
);

EnvelopeProgressBar.displayName = "EnvelopeProgressBar";
