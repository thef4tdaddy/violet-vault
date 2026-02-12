import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { ENVELOPE_TYPES, ENVELOPE_TYPE_CONFIG } from "../../../constants/categories";

interface EnvelopeTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  excludeTypes?: string[];
  disabled?: boolean;
}

/**
 * Shared component for envelope type selection
 * Used in both Create and Edit envelope modals
 */
const EnvelopeTypeSelector = ({
  selectedType,
  onTypeChange,
  excludeTypes = [],
  disabled = false,
}: EnvelopeTypeSelectorProps) => {
  const getIconName = (type: string): string => {
    switch (type) {
      case ENVELOPE_TYPES.BILL:
        return "FileText";
      case ENVELOPE_TYPES.VARIABLE:
        return "TrendingUp";
      case ENVELOPE_TYPES.SAVINGS:
        return "Target";
      default:
        return "Target";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center">
        {React.createElement(getIcon("Target"), {
          className: "h-4 w-4 mr-2 text-blue-600",
        })}
        Envelope Type
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(ENVELOPE_TYPE_CONFIG)
          .filter(([type]) => !excludeTypes.includes(type))
          .map(([type, config]) => {
            const iconName = getIconName(type);
            const isSelected = selectedType === type;

            return (
              <Button
                key={type}
                type="button"
                onClick={() => !disabled && onTypeChange(type)}
                disabled={disabled}
                className={`border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg ${
                  isSelected
                    ? `${config.borderColor} ${config.bgColor} shadow-lg ring-2 ring-blue-200`
                    : "border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? `${config.borderColor} ${config.bgColor}` : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div
                        className={`w-3 h-3 rounded-full ${config.bgColor.replace("-50", "-600")}`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {React.createElement(getIcon(iconName), {
                        className: `h-5 w-5 mr-3 ${isSelected ? config.textColor : "text-gray-500"}`,
                      })}
                      <span
                        className={`text-lg font-bold ${isSelected ? config.textColor : "text-gray-800"}`}
                      >
                        {config.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{config.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
      </div>
    </div>
  );
};

export default EnvelopeTypeSelector;
