import React from "react";
import { Button } from "@/components/ui";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface PasswordRotationModalProps {
  isOpen: boolean;
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onClose?: () => void;
}

/**
 * Password rotation modal component
 * Extracted from Layout.jsx for better organization
 */
const PasswordRotationModal: React.FC<PasswordRotationModalProps> = ({
  isOpen,
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onClose,
}) => {
  const modalRef = useModalAutoScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Password Expired</h3>
            <p className="text-gray-700">For security, please set a new password.</p>
          </div>
          {onClose && <ModalCloseButton onClick={onClose} />}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
            required
            autoFocus
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6"
            required
          />

          <div className="flex gap-3">
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordRotationModal;
