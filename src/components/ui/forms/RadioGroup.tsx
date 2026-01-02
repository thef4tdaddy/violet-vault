import React, { useId } from "react";

export interface RadioOption {
  /** The value of the radio button */
  value: string;
  /** Display label */
  label: string;
  /** Optional description text */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  /** Array of radio options */
  options: RadioOption[];
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Group label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below group */
  helperText?: string;
  /** Layout direction */
  direction?: "vertical" | "horizontal";
  /** Custom className for group container */
  className?: string;
  /** Custom className for individual radios */
  itemClassName?: string;
}

/**
 * RadioGroup Component
 * Standardized radio button group with consistent styling
 *
 * Features:
 * - Multiple radio options
 * - Vertical or horizontal layout
 * - Option descriptions (for grid-based layouts)
 * - Error states
 * - Helper text
 * - Disabled options
 *
 * Usage:
 * <RadioGroup
 *   name="allocation"
 *   options={[
 *     { value: "equal", label: "Equal Distribution" },
 *     { value: "custom", label: "Custom Distribution" }
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 *
 * With descriptions (grid layout):
 * <RadioGroup
 *   options={[
 *     {
 *       value: "option1",
 *       label: "Option 1",
 *       description: "Description for option 1"
 *     }
 *   ]}
 * />
 */
const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      error,
      helperText,
      direction = "vertical",
      className = "",
      itemClassName = "",
      name,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasDescriptions = options.some((opt) => opt.description);
    const generatedId = useId();
    const groupId = `radio-group-${generatedId}`;

    const handleChange = (optionValue: string) => {
      onChange?.(optionValue);
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-900 mb-3">{label}</label>}

        <div
          className={`space-y-3 ${
            hasDescriptions ? "space-y-4" : direction === "horizontal" ? "flex flex-wrap gap-6" : ""
          }`}
        >
          {options.map((option) => (
            <div key={option.value} className={itemClassName}>
              {hasDescriptions ? (
                // Grid layout for options with descriptions
                <div className="grid grid-cols-[auto_1fr] gap-3 items-start p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id={`${groupId}-${option.value}`}
                    name={name || groupId}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => handleChange(option.value)}
                    disabled={disabled || option.disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-0.5 justify-self-start"
                    {...props}
                  />
                  <div>
                    <label
                      htmlFor={`${groupId}-${option.value}`}
                      className="text-sm font-medium text-gray-900 cursor-pointer block"
                    >
                      {option.label}
                    </label>
                    {option.description && (
                      <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                // Standard inline layout
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`${groupId}-${option.value}`}
                    name={name || groupId}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => handleChange(option.value)}
                    disabled={disabled || option.disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    {...props}
                  />
                  <label
                    htmlFor={`${groupId}-${option.value}`}
                    className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500 mt-2">{helperText}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
