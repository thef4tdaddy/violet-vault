import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({
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
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
