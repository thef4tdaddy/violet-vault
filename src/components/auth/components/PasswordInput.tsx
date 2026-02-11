import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

/**
 * Password Input Component
 * Password field with show/hide toggle functionality
 * Extracted from UserSetup with UI standards compliance
 */
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  disabled = false,
  placeholder = "MASTER PASSWORD",
}) => {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-4 text-lg border-2 border-black rounded-lg focus:ring-2 focus:ring-purple-500 bg-white/90 placeholder-gray-500 uppercase tracking-wider font-medium"
        disabled={disabled}
        required
      />
      <Button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600"
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword
          ? React.createElement(getIcon("EyeOff"), {
              className: "h-5 w-5",
            })
          : React.createElement(getIcon("Eye"), {
              className: "h-5 w-5",
            })}
      </Button>
    </div>
  );
};

export default PasswordInput;
