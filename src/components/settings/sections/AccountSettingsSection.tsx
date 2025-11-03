import { useState } from "react";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils";
import ShareCodeModal from "../../sharing/ShareCodeModal";
import JoinBudgetModal from "../../sharing/JoinBudgetModal";
import ProfileSettings from "../../auth/ProfileSettings";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import logger from "@/utils/common/logger";

const AccountSettingsSection = ({
  currentUser,
  onOpenPasswordModal,
  onLogout,
  onOpenResetConfirm,
  onUpdateProfile,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { joinBudget } = useAuthManager();

  const handleJoinSuccess = async (joinData: unknown) => {
    if (!joinData || typeof joinData !== "object") return;
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
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-black shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
          <p className="text-sm text-gray-600 mb-3">
            {currentUser?.userName || currentUser?.name || "User"}
          </p>
          <Button
            onClick={() => setShowProfileSettings(true)}
            className="w-full flex items-center p-3 border-2 border-black bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
          >
            {renderIcon("Settings", "h-5 w-5 text-purple-600 mr-3")}
            <div className="text-left">
              <p className="font-medium text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-700">Update name and color</p>
            </div>
          </Button>
        </div>

        {/* Budget Sharing Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Budget Sharing</h4>
          <p className="text-sm text-gray-600 mb-4">
            Share your budget with family members or join someone else's budget
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center p-3 border-2 border-black bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
            >
              {renderIcon("Share", "h-5 w-5 text-blue-600 mr-3")}
              <div className="text-left">
                <p className="font-medium text-gray-900">Share Your Budget</p>
                <p className="text-sm text-gray-700">Generate a share code for others to join</p>
              </div>
            </Button>

            <Button
              onClick={() => setShowJoinModal(true)}
              className="w-full flex items-center p-3 border-2 border-black bg-green-50 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
            >
              {renderIcon("UserPlus", "h-5 w-5 text-green-600 mr-3")}
              <div className="text-left">
                <p className="font-medium text-gray-900">Join Shared Budget</p>
                <p className="text-sm text-gray-700">Enter a share code to join someone's budget</p>
              </div>
            </Button>
          </div>
        </div>

        <Button
          onClick={onOpenPasswordModal}
          className="w-full flex items-center p-3 border-2 border-black bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
        >
          {renderIcon("Key", "h-5 w-5 text-purple-600 mr-3")}
          <div className="text-left">
            <p className="font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-700">Update your encryption password</p>
          </div>
        </Button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            {renderIcon("AlertTriangle", "h-5 w-5 text-red-600 mt-0.5 mr-3")}
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Danger Zone</h4>
              <p className="text-sm text-red-700 mt-1">These actions cannot be undone.</p>
              <div className="mt-3 space-y-2">
                <Button
                  onClick={onLogout}
                  className="block w-full text-left px-3 py-2 text-sm border-2 border-black bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-900 font-medium shadow-sm"
                >
                  Logout Only (Keep Data)
                </Button>
                <Button
                  onClick={onOpenResetConfirm}
                  className="block w-full text-left px-3 py-2 text-sm bg-red-100 border-2 border-black rounded-lg hover:bg-red-200 transition-colors text-red-900 font-medium shadow-sm"
                >
                  Clear All Data
                </Button>
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

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        currentUser={currentUser}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
};

export default AccountSettingsSection;
