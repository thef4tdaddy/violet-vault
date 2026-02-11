import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleVisibility: () => void;
  showPassword: boolean;
  placeholder: string;
  disabled?: boolean;
  minLength?: number;
  required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  onToggleVisibility,
  showPassword,
  placeholder,
  disabled = false,
  minLength,
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
          disabled={disabled}
          minLength={minLength}
          required={required}
        />
        <Button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword
            ? React.createElement(getIcon("EyeOff"), {
                className: "h-4 w-4",
              })
            : React.createElement(getIcon("Eye"), {
                className: "h-4 w-4",
              })}
        </Button>
      </div>
    </div>
  );
};

export default PasswordField;
