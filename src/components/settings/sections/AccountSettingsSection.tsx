import React, { useState } from "react";
import { renderIcon } from "../../../utils";
import ShareCodeModal from "../../sharing/ShareCodeModal";
import JoinBudgetModal from "../../sharing/JoinBudgetModal";
import { useAuthManager } from "../../../hooks/auth/useAuthManager";
import logger from "../../../utils/common/logger";

const AccountSettingsSection = ({
  currentUser,
  onOpenPasswordModal,
  onLogout,
  onOpenResetConfirm,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { joinBudget } = useAuthManager();

  const handleJoinSuccess = async (joinData) => {
    try {
      const result = await joinBudget(joinData);
      if (result.success) {
        // Refresh the page or trigger a re-render to show the shared budget
        window.location.reload();
      }
    } catch (error) {
      logger.error("Failed to complete join budget setup", error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
          <p className="text-sm text-gray-600">
            {currentUser?.userName || currentUser?.name || "User"}
          </p>
        </div>

        {/* Budget Sharing Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Budget Sharing</h4>
          <p className="text-sm text-gray-600 mb-4">
            Share your budget with family members or join someone else's budget
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center p-3 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {renderIcon("Share", "h-5 w-5 text-blue-600 mr-3")}
              <div className="text-left">
                <p className="font-medium text-gray-900">Share Your Budget</p>
                <p className="text-sm text-gray-500">Generate a share code for others to join</p>
              </div>
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full flex items-center p-3 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              {renderIcon("UserPlus", "h-5 w-5 text-green-600 mr-3")}
              <div className="text-left">
                <p className="font-medium text-gray-900">Join Shared Budget</p>
                <p className="text-sm text-gray-500">Enter a share code to join someone's budget</p>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={onOpenPasswordModal}
          className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {renderIcon("Key", "h-5 w-5 text-gray-600 mr-3")}
          <div className="text-left">
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-500">Update your encryption password</p>
          </div>
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            {renderIcon("AlertTriangle", "h-5 w-5 text-red-600 mt-0.5 mr-3")}
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Danger Zone</h4>
              <p className="text-sm text-red-700 mt-1">These actions cannot be undone.</p>
              <div className="mt-3 space-y-2">
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-3 py-2 text-sm border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Logout Only (Keep Data)
                </button>
                <button
                  onClick={onOpenResetConfirm}
                  className="block w-full text-left px-3 py-2 text-sm bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors text-red-800"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Code Modal */}
      <ShareCodeModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />

      {/* Join Budget Modal */}
      <JoinBudgetModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={handleJoinSuccess}
      />
    </div>
  );
};

export default AccountSettingsSection;
