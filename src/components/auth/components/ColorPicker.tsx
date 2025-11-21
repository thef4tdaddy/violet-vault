import React from "react";
import { Button } from "@/components/ui";
import { USER_COLORS } from "../../../utils/auth/userSetupHelpers";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

/**
 * Color Picker Component
 * Grid of color options for user profile customization
 * Extracted from UserSetup with UI standards compliance
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-base font-black text-black mb-3 uppercase tracking-wider">
        <span className="text-lg">Y</span>OUR <span className="text-lg">C</span>
        OLOR
      </label>
      <div className="grid grid-cols-4 gap-3">
        {USER_COLORS.map((color) => (
          <Button
            key={color.value}
            type="button"
            onClick={() => onColorChange(color.value)}
            disabled={disabled}
            className={`w-12 h-12 rounded-lg border-2 transition-all ${
              selectedColor === color.value
                ? "border-gray-900 scale-110 shadow-lg"
                : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
