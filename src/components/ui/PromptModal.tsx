import React, { useEffect, useRef, useState, useCallback } from "react";
import { getIcon } from "@/utils";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface ValidationResult {
  valid: boolean;
  error: string;
}

interface PromptModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputType?: string;
  isRequired?: boolean;
  validation?: ((value: string) => ValidationResult) | null;
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }> | null;
  onConfirm?: (value: string) => void;
  onCancel?: (value: null) => void;
  children?: React.ReactNode;
}

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
  validation = null,
  isLoading = false,
  icon = null,
  onConfirm,
  onCancel,
  children,
}: PromptModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalAutoScroll(isOpen);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [validationError, setValidationError] = useState("");

  // Define handlers first to avoid temporal dead zone issues
  const handleConfirm = useCallback(() => {
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
  }, [inputValue, isRequired, validation, onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel?.(null);
  }, [onCancel]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  // Keyboard handling - now placed after handlers are defined
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleCancel();
      }
      if (e.key === "Enter" && !isLoading) {
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, handleConfirm, handleCancel]);

  if (!isOpen) return null;

  const Icon = icon || getIcon("Type");

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
      aria-describedby="prompt-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border-2 border-black my-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <ModalHeader icon={Icon} title={title} />
            </div>
            <ModalCloseButton onClick={handleCancel} />
          </div>
          <ModalContent
            message={message}
            children={children}
            inputRef={inputRef}
            inputType={inputType}
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            placeholder={placeholder}
            validationError={validationError}
            isLoading={isLoading}
          />
          <ModalActions
            handleCancel={handleCancel}
            handleConfirm={handleConfirm}
            isLoading={isLoading}
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
          />
        </div>
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const ModalHeader = ({ icon, title }: ModalHeaderProps) => (
  <div className="flex items-center mb-4">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
      {React.createElement(icon, {
        className: "h-6 w-6 text-blue-600",
      })}
    </div>
    <div className="flex-1">
      <h3 id="prompt-modal-title" className="text-lg font-semibold text-gray-900">
        {title}
      </h3>
    </div>
  </div>
);

interface ModalContentProps {
  message: string;
  children?: React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputType: string;
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  validationError: string;
  isLoading: boolean;
}

const ModalContent = ({
  message,
  children,
  inputRef,
  inputType,
  inputValue,
  handleInputChange,
  placeholder,
  validationError,
  isLoading,
}: ModalContentProps) => (
  <div className="mb-6">
    <p id="prompt-modal-description" className="text-gray-700 mb-4">
      {message}
    </p>
    {children}
    <InputField
      inputRef={inputRef}
      inputType={inputType}
      inputValue={inputValue}
      handleInputChange={handleInputChange}
      placeholder={placeholder}
      validationError={validationError}
      isLoading={isLoading}
    />
  </div>
);

interface InputFieldProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputType: string;
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  validationError: string;
  isLoading: boolean;
}

const InputField = ({
  inputRef,
  inputType,
  inputValue,
  handleInputChange,
  placeholder,
  validationError,
  isLoading,
}: InputFieldProps) => (
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
    {validationError && <ValidationError error={validationError} />}
  </div>
);

interface ValidationErrorProps {
  error: string;
}

const ValidationError = ({ error }: ValidationErrorProps) => (
  <div id="input-error" className="flex items-center text-red-600 text-sm">
    {React.createElement(getIcon("AlertCircle"), {
      className: "h-4 w-4 mr-1",
    })}
    {error}
  </div>
);

interface ModalActionsProps {
  handleCancel: () => void;
  handleConfirm: () => void;
  isLoading: boolean;
  cancelLabel: string;
  confirmLabel: string;
}

const ModalActions = ({
  handleCancel,
  handleConfirm,
  isLoading,
  cancelLabel,
  confirmLabel,
}: ModalActionsProps) => (
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
      {isLoading ? <LoadingSpinner /> : confirmLabel}
    </button>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center">
    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
    Processing...
  </div>
);

export default PromptModal;
