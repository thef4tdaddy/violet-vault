import React, { useState } from "react";
import { X, User, Palette, Save } from "lucide-react";

const ProfileSettings = ({ isOpen, onClose, currentUser, onUpdateProfile }) => {
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [userColor, setUserColor] = useState(currentUser?.userColor || "#a855f7");
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    { name: "Purple", value: "#a855f7" },
    { name: "Emerald", value: "#10b981" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
  ];

  const handleSave = async () => {
    if (!userName.trim()) {
      alert("Please enter a name");
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
      console.error("Failed to update profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-600" />
            Profile Settings
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Display Name
            </label>
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
              <Palette className="h-4 w-4 inline mr-1" />
              Profile Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
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
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              PREVIEW
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                style={{ backgroundColor: userColor }}
              />
              <span className="font-semibold text-gray-900">
                {userName.trim() || "Your Name"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            disabled={isLoading || !userName.trim()}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;