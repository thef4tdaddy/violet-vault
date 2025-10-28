import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { formatPaydayPrediction, getDaysUntilPayday } from "../../utils/budgeting/paydayPredictor";

// Helper functions moved outside component
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return "emerald";
  if (confidence >= 60) return "amber";
  return "gray";
};

const getUrgencyStyle = (daysUntil: number): string => {
  if (daysUntil === 0) return "bg-purple-50 border-purple-200";
  if (daysUntil === 1) return "bg-emerald-50 border-emerald-200";
  if (daysUntil >= 2 && daysUntil <= 3) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-200";
};

const getPaydayIcon = (daysUntil: number) => {
  if (daysUntil === 0) {
    return React.createElement(getIcon("Calendar"), {
      className: "h-5 w-5 text-purple-600",
    });
  }
  if (daysUntil === 1) {
    return React.createElement(getIcon("TrendingUp"), {
      className: "h-5 w-5 text-emerald-600",
    });
  }
  if (daysUntil >= 2 && daysUntil <= 7) {
    return React.createElement(getIcon("Clock"), {
      className: "h-5 w-5 text-amber-600",
    });
  }
  return React.createElement(getIcon("Calendar"), {
    className: "h-5 w-5 text-gray-600",
  });
};

// Color mapping for consistency
const getColorClasses = (baseColor: string) => ({
  bar: `bg-${baseColor}-500`,
  text: `text-${baseColor}-600`,
});

// Sub-component: Confidence Bar
const ConfidenceBar = ({ confidence, confidenceColor }) => {
  const colors = getColorClasses(confidenceColor);
  return (
    <div className="flex items-center text-xs">
      <span className="font-medium text-gray-600">Confidence:</span>
      <div className="ml-2 flex items-center">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} transition-all duration-300`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className={`ml-1 ${colors.text} font-medium`}>{confidence}%</span>
      </div>
    </div>
  );
};

// Sub-component: Prediction Header
const PredictionHeader = ({ prediction, daysUntil, formattedPrediction, confidenceColor }) => (
  <div className="flex items-start justify-between">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">{getPaydayIcon(daysUntil)}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm">Next Payday Prediction</h4>
        <p className="text-sm text-gray-700 mt-1">{formattedPrediction.displayText}</p>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center text-xs text-gray-600">
            <span className="font-medium">Pattern:</span>
            <span className="ml-1">{prediction.pattern}</span>
          </div>
          <ConfidenceBar confidence={prediction.confidence} confidenceColor={confidenceColor} />
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
);

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
  const showProactiveSuggestions = daysUntil <= 3 && daysUntil >= 0;
  const confidenceColor = getConfidenceColor(prediction.confidence);

  return (
    <div
      className={`glassmorphism rounded-2xl p-4 border ${getUrgencyStyle(daysUntil)} ${className}`}
    >
      <PredictionHeader
        prediction={prediction}
        daysUntil={daysUntil}
        formattedPrediction={formattedPrediction}
        confidenceColor={confidenceColor}
      />

      {/* Proactive Funding Suggestions */}
      {showProactiveSuggestions && (
        <ProactiveSuggestions
          daysUntil={daysUntil}
          onProcessPaycheck={onProcessPaycheck}
          onPrepareEnvelopes={onPrepareEnvelopes}
        />
      )}
    </div>
  );
};

// Sub-component: Action Card
const ActionCard = ({ bgColor, borderColor, icon, iconColor, title, description, button }) => (
  <div className={`${bgColor} rounded-lg p-3 border ${borderColor}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {React.createElement(getIcon(icon), {
          className: `h-4 w-4 ${iconColor} mr-2`,
        })}
        <span
          className={`text-sm font-medium ${iconColor.replace("text-", "text-").replace("-600", "-800")}`}
        >
          {title}
        </span>
      </div>
      {button}
    </div>
    <p className={`text-xs ${iconColor} mt-1`}>{description}</p>
  </div>
);

// Sub-component: Proactive Suggestions
const ProactiveSuggestions = ({ daysUntil, onProcessPaycheck, onPrepareEnvelopes }) => (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        {React.createElement(getIcon("Zap"), {
          className: "h-4 w-4 text-purple-600 mr-2",
        })}
        <span className="text-sm font-semibold text-purple-700">
          {daysUntil === 0 ? "Payday Actions" : "Get Ready for Payday"}
        </span>
      </div>
    </div>

    <div className="space-y-2">
      {daysUntil === 0 && (
        <ActionCard
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          icon="DollarSign"
          iconColor="text-purple-600"
          title="Process Today's Paycheck"
          description="Add your paycheck and distribute to envelopes"
          button={
            onProcessPaycheck && (
              <Button
                onClick={onProcessPaycheck}
                className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
              >
                Process Now
              </Button>
            )
          }
        />
      )}

      {daysUntil === 1 && (
        <ActionCard
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
          icon="TrendingUp"
          iconColor="text-emerald-600"
          title="Payday Tomorrow!"
          description="Review your envelope allocation plan"
          button={
            onPrepareEnvelopes && (
              <Button
                onClick={onPrepareEnvelopes}
                className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Review Plan
              </Button>
            )
          }
        />
      )}

      {daysUntil >= 2 && daysUntil <= 3 && (
        <ActionCard
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          icon="Calendar"
          iconColor="text-amber-600"
          title={`Payday in ${daysUntil} days`}
          description="Plan your envelope funding strategy"
          button={
            onPrepareEnvelopes && (
              <Button
                onClick={onPrepareEnvelopes}
                className="text-xs bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 transition-colors"
              >
                Plan Ahead
              </Button>
            )
          }
        />
      )}
    </div>
  </div>
);

export default PaydayPrediction;
