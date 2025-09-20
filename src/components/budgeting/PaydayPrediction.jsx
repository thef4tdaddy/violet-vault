import React from "react";
import { getIcon } from "../../utils";
import { formatPaydayPrediction, getDaysUntilPayday } from "../../utils/budgeting/paydayPredictor";

const PaydayPrediction = ({
  prediction,
  className = "",
  onProcessPaycheck,
  onPrepareEnvelopes,
}) => {
  if (!prediction || !prediction.nextPayday) {
    return null;
  }

  const formattedPrediction = formatPaydayPrediction(prediction);
  const daysUntil = getDaysUntilPayday(prediction);

  // Determine if we should show proactive suggestions
  const showProactiveSuggestions = daysUntil <= 3 && daysUntil >= 0;

  // Determine the style based on confidence and time until payday
  const getConfidenceColor = () => {
    if (prediction.confidence >= 80) return "emerald";
    if (prediction.confidence >= 60) return "amber";
    return "gray";
  };

  const getUrgencyStyle = () => {
    if (daysUntil === 0) return "bg-purple-50 border-purple-200";
    if (daysUntil === 1) return "bg-emerald-50 border-emerald-200";
    if (daysUntil >= 2 && daysUntil <= 3) return "bg-amber-50 border-amber-200";
    return "bg-gray-50 border-gray-200";
  };

  const getPaydayIcon = () => {
    if (daysUntil === 0)
      return React.createElement(getIcon("Calendar"), {
        className: "h-5 w-5 text-purple-600",
      });
    if (daysUntil === 1)
      return React.createElement(getIcon("TrendingUp"), {
        className: "h-5 w-5 text-emerald-600",
      });
    if (daysUntil >= 2 && daysUntil <= 7)
      return React.createElement(getIcon("Clock"), {
        className: "h-5 w-5 text-amber-600",
      });
    return React.createElement(getIcon("Calendar"), {
      className: "h-5 w-5 text-gray-600",
    });
  };

  const confidenceColor = getConfidenceColor();

  return (
    <div className={`glassmorphism rounded-2xl p-4 border ${getUrgencyStyle()} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getPaydayIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm">Next Payday Prediction</h4>
            <p className="text-sm text-gray-700 mt-1">{formattedPrediction.displayText}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-xs text-gray-600">
                <span className="font-medium">Pattern:</span>
                <span className="ml-1">{prediction.pattern}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="font-medium text-gray-600">Confidence:</span>
                <div className="ml-2 flex items-center">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${confidenceColor}-500 transition-all duration-300`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className={`ml-1 text-${confidenceColor}-600 font-medium`}>
                    {prediction.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {prediction.confidence < 60 && (
          <div className="flex-shrink-0 ml-2">
            {React.createElement(getIcon("AlertCircle"), {
              className: "h-4 w-4 text-amber-500",
              title: "Low confidence prediction",
            })}
          </div>
        )}
      </div>

      {/* Proactive Funding Suggestions */}
      {showProactiveSuggestions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {React.createElement(getIcon("Zap"), { className: "h-4 w-4 text-purple-600 mr-2" })}
              <span className="text-sm font-semibold text-purple-700">
                {daysUntil === 0 ? "Payday Actions" : "Get Ready for Payday"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {daysUntil === 0 && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {React.createElement(getIcon("DollarSign"), {
                      className: "h-4 w-4 text-purple-600 mr-2",
                    })}
                    <span className="text-sm font-medium text-purple-800">
                      Process Today's Paycheck
                    </span>
                  </div>
                  {onProcessPaycheck && (
                    <button
                      onClick={onProcessPaycheck}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Process Now
                    </button>
                  )}
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Add your paycheck and distribute to envelopes
                </p>
              </div>
            )}

            {daysUntil === 1 && (
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {React.createElement(getIcon("TrendingUp"), {
                      className: "h-4 w-4 text-emerald-600 mr-2",
                    })}
                    <span className="text-sm font-medium text-emerald-800">Payday Tomorrow!</span>
                  </div>
                  {onPrepareEnvelopes && (
                    <button
                      onClick={onPrepareEnvelopes}
                      className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Review Plan
                    </button>
                  )}
                </div>
                <p className="text-xs text-emerald-600 mt-1">
                  Review your envelope allocation plan
                </p>
              </div>
            )}

            {daysUntil >= 2 && daysUntil <= 3 && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {React.createElement(getIcon("Calendar"), {
                      className: "h-4 w-4 text-amber-600 mr-2",
                    })}
                    <span className="text-sm font-medium text-amber-800">
                      Payday in {daysUntil} days
                    </span>
                  </div>
                  {onPrepareEnvelopes && (
                    <button
                      onClick={onPrepareEnvelopes}
                      className="text-xs bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Plan Ahead
                    </button>
                  )}
                </div>
                <p className="text-xs text-amber-600 mt-1">Plan your envelope funding strategy</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaydayPrediction;
