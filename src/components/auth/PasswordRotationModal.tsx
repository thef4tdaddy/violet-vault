import React from "react";
import { Button } from "@/components/ui";

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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4">Password Expired</h3>
        <p className="text-gray-700 mb-4">For security, please set a new password.</p>
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
