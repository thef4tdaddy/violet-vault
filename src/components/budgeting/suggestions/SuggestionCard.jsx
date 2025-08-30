import React from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  X,
} from "lucide-react";

const PRIORITY_ICONS = {
  high: AlertTriangle,
  medium: Lightbulb,
  low: Target,
};

const PRIORITY_COLORS = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-blue-500",
};

const TYPE_ICONS = {
  new_envelope: Plus,
  merchant_pattern: Plus,
  increase_envelope: TrendingUp,
  decrease_envelope: TrendingDown,
};

const SuggestionCard = ({ suggestion, onApply, onDismiss, isCompact = false }) => {
  const PriorityIcon = PRIORITY_ICONS[suggestion.priority] || Zap;
  const TypeIcon = TYPE_ICONS[suggestion.type] || Eye;
  const priorityColor = PRIORITY_COLORS[suggestion.priority] || "text-gray-500";

  const getActionButtonText = (action) => {
    switch (action) {
      case "create_envelope":
        return "Create Envelope";
      case "increase_budget":
        return "Increase Budget";
      case "decrease_budget":
        return "Reduce Budget";
      default:
        return "Apply";
    }
  };

  const getActionButtonColor = (action) => {
    switch (action) {
      case "create_envelope":
        return "bg-green-500 hover:bg-green-600";
      case "increase_budget":
        return "bg-blue-500 hover:bg-blue-600";
      case "decrease_budget":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-purple-500 hover:bg-purple-600";
    }
  };

  if (isCompact) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className={`flex items-center mr-2 ${priorityColor}`}>
              <PriorityIcon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{suggestion.title}</p>
              <p className="text-xs text-gray-600">
                ${suggestion.suggestedAmount.toFixed(0)}/month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => onApply(suggestion)}
              className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title={getActionButtonText(suggestion.action)}
            >
              <CheckCircle className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDismiss(suggestion.id)}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-gray-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`mr-3 ${priorityColor}`}>
            <PriorityIcon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{suggestion.title}</h4>
            <div className="flex items-center mt-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  suggestion.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : suggestion.priority === "medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                <TypeIcon className="h-3 w-3 mr-1" />
                {suggestion.priority} priority
              </span>
              <span className="ml-2 text-xs text-gray-500">{suggestion.impact}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Dismiss suggestion"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>

      <p className="text-xs text-gray-600 mb-3 italic">{suggestion.reasoning}</p>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-600">Suggested: </span>
          <span className="font-bold text-green-600">
            ${suggestion.suggestedAmount.toFixed(0)}/month
          </span>
        </div>
        <button
          onClick={() => onApply(suggestion)}
          className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-colors ${getActionButtonColor(suggestion.action)}`}
        >
          <CheckCircle className="h-3 w-3 mr-1 inline" />
          {getActionButtonText(suggestion.action)}
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;
