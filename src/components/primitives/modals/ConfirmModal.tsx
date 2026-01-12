import React from "react";
import BaseModal from "./BaseModal";
import { getIcon } from "@/utils/icons";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  loading?: boolean;
}

const VARIANT_STYLES = {
  danger: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    confirmBtnDisabled: "bg-red-300",
    iconName: "AlertTriangle",
  },
  warning: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    confirmBtnDisabled: "bg-amber-300",
    iconName: "AlertCircle",
  },
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    confirmBtnDisabled: "bg-blue-300",
    iconName: "Info",
  },
  success: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    confirmBtn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    confirmBtnDisabled: "bg-green-300",
    iconName: "CheckCircle",
  },
};

/**
 * ConfirmModal - Confirmation dialog component
 *
 * A specialized modal for confirmation actions with:
 * - Variant styling (danger, warning, info, success)
 * - Icon mapping based on variant
 * - Loading state with spinner
 * - Two-button layout (Cancel left, Confirm right)
 *
 * Composes BaseModal for consistent behavior.
 *
 * Part of Phase 1.1: Component Library Standardization
 * Issue #1526 - Modal Primitives
 *
 * @example
 * ```tsx
 * <ConfirmModal
 *   isOpen={showDelete}
 *   onClose={() => setShowDelete(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item?"
 *   message="This action cannot be undone. Are you sure?"
 *   variant="danger"
 *   confirmLabel="Delete"
 * />
 * ```
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  loading = false,
}) => {
  const variantStyle = VARIANT_STYLES[variant];

  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="md" closeOnEscape={!loading}>
      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-start mb-4">
          <div
            className={`w-12 h-12 ${variantStyle.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            {React.createElement(getIcon(variantStyle.iconName), {
              className: `h-6 w-6 ${variantStyle.iconColor}`,
            })}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border-2 border-black rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          {/* eslint-disable-next-line enforce-ui-library/enforce-ui-library */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
              loading ? variantStyle.confirmBtnDisabled : variantStyle.confirmBtn
            }`}
          >
            {loading ? (
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
    </BaseModal>
  );
};

export default ConfirmModal;
