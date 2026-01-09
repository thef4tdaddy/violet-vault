import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import logger from "@/utils/common/logger";
import { globalToast } from "@/stores/ui/toastStore";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Record<string, unknown> & {
    userName?: string;
    userColor?: string;
  };
  onUpdateProfile: (updates: Record<string, unknown>) => Promise<void> | void;
}

const PROFILE_COLORS = [
  { value: "#EF4444", name: "Crimson" },
  { value: "#F97316", name: "Orange" },
  { value: "#F59E0B", name: "Amber" },
  { value: "#10B981", name: "Emerald" },
  { value: "#14B8A6", name: "Teal" },
  { value: "#0EA5E9", name: "Sky" },
  { value: "#6366F1", name: "Indigo" },
  { value: "#8B5CF6", name: "Purple" },
  { value: "#EC4899", name: "Pink" },
  { value: "#F43F5E", name: "Rose" },
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}) => {
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [userColor, setUserColor] = useState(currentUser?.userColor || "#8b5cf6");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useModalAutoScroll(isOpen);

  useEffect(() => {
    if (isOpen) {
      setUserName(currentUser?.userName || "");
      setUserColor(currentUser?.userColor || "#8b5cf6");
    }
  }, [isOpen, currentUser?.userName, currentUser?.userColor]);

  const handleSave = async () => {
    if (!userName.trim()) {
      globalToast.showError("Please enter a name", "Missing Name");
      return;
    }

    setIsLoading(true);

    try {
      const updatedProfile = {
        ...currentUser,
        userName: userName.trim(),
        userColor,
      };

      await onUpdateProfile(updatedProfile);
      onClose();
    } catch (error) {
      logger.error("Failed to update profile:", error);
      globalToast.showError(
        `Failed to update profile: ${(error as Error).message}`,
        "Update Failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[200] overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-2xl my-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            {React.createElement(getIcon("User"), {
              className: "h-5 w-5 mr-2 text-purple-600",
            })}
            Profile Settings
          </h3>
          <ModalCloseButton
            onClick={() => {
              if (!isLoading) {
                onClose();
              }
            }}
            className={isLoading ? "opacity-50 pointer-events-none" : ""}
          />
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {React.createElement(getIcon("Palette"), {
                className: "h-4 w-4 inline mr-1",
              })}
              Profile Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PROFILE_COLORS.map((color) => (
                <Button
                  key={color.value}
                  type="button"
                  onClick={() => setUserColor(color.value)}
                  className={`w-12 h-12 rounded-xl border-2 transition-all ${
                    userColor === color.value
                      ? "border-gray-900 scale-110 shadow-lg ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-400 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-xs font-semibold text-gray-500 mb-2">PREVIEW</label>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                style={{ backgroundColor: userColor }}
              />
              <span className="font-semibold text-gray-900">{userName.trim() || "Your Name"}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            disabled={isLoading || !userName.trim()}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                {React.createElement(getIcon("Save"), {
                  className: "h-4 w-4 mr-2",
                })}
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
