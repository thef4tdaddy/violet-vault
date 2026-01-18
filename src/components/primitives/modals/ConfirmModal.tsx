import React from "react";
import BaseModal from "./BaseModal";
import { getIcon, logger } from "@/utils";
import { Button } from "../buttons/Button";

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
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
  const titleId = React.useId();

  const handleConfirm = async () => {
    if (loading) return;
    try {
      await onConfirm?.();
    } catch (err) {
      logger.error("ConfirmModal onConfirm error:", err);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      size="md"
      closeOnEscape={!loading}
      ariaLabelledBy={titleId}
    >
      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-start mb-4">
          <div
            className={`w-12 h-12 ${variantStyle.iconBg} rounded-full flex items-center justify-center shrink-0`}
          >
            {React.createElement(
              getIcon(variantStyle.iconName) as React.ComponentType<{ className?: string }>,
              {
                className: `h-6 w-6 ${variantStyle.iconColor}`,
              }
            )}
          </div>
          <div className="ml-4">
            <h3 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors ${
              loading ? variantStyle.confirmBtnDisabled : variantStyle.confirmBtn
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
