import React from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password Input Component
 * Password field with show/hide toggle functionality
 * Extracted from UserSetup with UI standards compliance
 */
const PasswordInput = ({
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
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600"
        disabled={disabled}
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;
