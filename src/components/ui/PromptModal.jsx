import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Type, X, CheckCircle } from "lucide-react";

/**
 * Reusable PromptModal Component
 * Replaces window.prompt() with a custom modal for better UX and accessibility
 *
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #504 - Replace Prompts with PromptModal
 */
const PromptModal = ({
  isOpen = false,
  title = "Enter Value",
  message = "Please enter a value:",
  placeholder = "",
  defaultValue = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  inputType = "text",
  isRequired = true,
  validation = null, // Function to validate input: (value) => ({ valid: boolean, error: string })
  isLoading = false,
  icon = null,
  onConfirm,
  onCancel,
  children, // For custom content between message and input
}) => {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [validationError, setValidationError] = useState("");

  // Focus management - focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select existing text for easy replacement
    }
    // Reset input value when modal opens
    if (isOpen) {
      setInputValue(defaultValue);
      setValidationError("");
    }
  }, [isOpen, defaultValue]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel?.();
      }
      if (e.key === "Enter" && !isLoading) {
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleConfirm = () => {
    // Validate required field
    if (isRequired && !inputValue.trim()) {
      setValidationError("This field is required");
      return;
    }

    // Run custom validation if provided
    if (validation) {
      const result = validation(inputValue);
      if (!result.valid) {
        setValidationError(result.error);
        return;
      }
    }

    // Call onConfirm with the input value
    onConfirm?.(inputValue);
  };

  const handleCancel = () => {
    onCancel?.(null);
  };

  if (!isOpen) return null;

  // Icon selection
  const getIcon = () => {
    if (icon) return icon;
    return Type;
  };

  const Icon = getIcon();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
      aria-describedby="prompt-modal-description"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 id="prompt-modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p id="prompt-modal-description" className="text-gray-700 mb-4">
              {message}
            </p>
            {children}

            {/* Input Field */}
            <div className="space-y-2">
              <input
                ref={inputRef}
                type={inputType}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationError ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "input-error" : undefined}
              />

              {/* Validation Error */}
              {validationError && (
                <div id="input-error" className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationError}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
