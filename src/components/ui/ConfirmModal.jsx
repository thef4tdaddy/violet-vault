import React, { useEffect, useRef } from "react";
import { getIcon } from "../../utils/icons";
import { Trash2, AlertTriangle } from "lucide-react";

/**
 * Reusable ConfirmModal Component
 * Replaces window.confirm() with a custom modal for better UX and accessibility
 *
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #502 - Replace Confirms with ConfirmModal
 */
const ConfirmModal = ({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isLoading = false,
  icon = null,
  onConfirm,
  onCancel,
  children, // For custom content between message and buttons
}) => {
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Focus management - focus cancel button by default for safety
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel?.();
      }
      if (e.key === "Enter" && e.target === cancelButtonRef.current) {
        onCancel?.();
      }
      if (e.key === "Enter" && e.target === confirmButtonRef.current) {
        onConfirm?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel, onConfirm]);

  if (!isOpen) return null;

  // Icon selection based on type and destructive state
  const getModalIcon = () => {
    if (icon) return icon;
    if (destructive) return Trash2;
    return AlertTriangle;
  };

  const Icon = getModalIcon();

  // Color schemes based on destructive state
  const colorScheme = destructive
    ? {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        confirmBtnDisabled: "bg-red-300",
      }
    : {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        confirmBtnDisabled: "bg-blue-300",
      };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[10000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div
              className={`w-12 h-12 ${colorScheme.iconBg} rounded-full flex items-center justify-center mr-4`}
            >
              <Icon className={`h-6 w-6 ${colorScheme.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3
                id="confirm-modal-title"
                className="font-black text-black text-base"
              >
                {title}
              </h3>
              {destructive && (
                <p className="text-sm text-red-600">
                  This action cannot be undone
                </p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p id="confirm-modal-description" className="text-gray-700 mb-4">
              {message}
            </p>
            {children}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border-2 border-black rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors ${
                isLoading
                  ? colorScheme.confirmBtnDisabled
                  : `${colorScheme.confirmBtn}`
              }`}
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

export default ConfirmModal;
