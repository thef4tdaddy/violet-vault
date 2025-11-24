import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";
import type { PaydayPrediction } from "@/utils/budgeting/paydayPredictor";

interface NextPaydayBannerProps {
  prediction: PaydayPrediction | null;
  onProcessPaycheck?: () => void;
  onPrepareEnvelopes?: () => void;
}

/**
 * Full-width Next Payday Banner
 * Shows next payday date, estimated deposit, and action buttons
 */
const NextPaydayBanner = ({
  prediction,
  onProcessPaycheck,
  onPrepareEnvelopes,
}: NextPaydayBannerProps) => {
  if (!prediction || !prediction.nextPayday) {
    return null;
  }

  const nextPaydayDate = new Date(prediction.nextPayday);
  const today = new Date();
  const daysUntil = Math.ceil(
    (nextPaydayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatPaydayDate = () => {
    return nextPaydayDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getBannerColor = () => {
    if (daysUntil === 0) return "bg-gradient-to-r from-purple-500 to-purple-600";
    if (daysUntil === 1) return "bg-gradient-to-r from-emerald-500 to-emerald-600";
    if (daysUntil <= 3) return "bg-gradient-to-r from-amber-500 to-amber-600";
    return "bg-gradient-to-r from-blue-500 to-blue-600";
  };

  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${getBannerColor()}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {React.createElement(getIcon("Calendar"), {
            className: "h-8 w-8 flex-shrink-0",
          })}
          <div>
            <h2 className="text-2xl font-bold">
              {daysUntil === 0
                ? "Payday Today!"
                : `Next Estimated Payday — ${formatPaydayDate()}`}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
              {daysUntil > 0 && (
                <span className="font-medium">
                  {daysUntil} day{daysUntil !== 1 ? "s" : ""}
                </span>
              )}
              {prediction.estimatedAmount && (
                <span className="font-medium">
                  Est. deposit: ${prediction.estimatedAmount.toFixed(2)}
                </span>
              )}
              <span className="opacity-90">Confidence: {prediction.confidence}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {daysUntil === 0 && onProcessPaycheck && (
            <Button
              onClick={onProcessPaycheck}
              className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              {React.createElement(getIcon("DollarSign"), {
                className: "h-4 w-4",
              })}
              Process Paycheck
            </Button>
          )}
          {daysUntil > 0 && daysUntil <= 3 && onPrepareEnvelopes && (
            <Button
              onClick={onPrepareEnvelopes}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              {React.createElement(getIcon("TrendingUp"), {
                className: "h-4 w-4",
              })}
              Prepare Envelopes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NextPaydayBanner);
