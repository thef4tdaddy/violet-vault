import { Button } from "@/components/ui";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

/**
 * Password Rotation Modal Component
 * Extracted from MainLayout for better organization
 * Handles password expiration and rotation UI
 */
const PasswordRotationModal = ({
  isOpen,
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
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
          <ModalCloseButton onClick={onClose} />
        </div>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onSubmit}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
          >
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordRotationModal;
