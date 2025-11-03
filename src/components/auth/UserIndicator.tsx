import React, { memo, useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import ProfileSettings from "./ProfileSettings";
import KeyManagementSettings from "./KeyManagementSettings";

interface UserIndicatorProps {
  currentUser: {
    userName: string;
    userColor: string;
    budgetId?: string;
    [key: string]: unknown;
  } | null;
  onUserChange?: () => void;
  onUpdateProfile?: (updates: {
    userName: string;
    userColor: string;
    budgetId?: string;
    [key: string]: unknown;
  }) => Promise<void>;
}

const UserIndicator = memo(({ currentUser, onUserChange, onUpdateProfile }: UserIndicatorProps) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center glassmorphism rounded-2xl px-5 py-3 shadow-xl border border-white/30 ring-1 ring-gray-800/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <div
              className="w-3 h-3 rounded-full mr-3 shadow-sm ring-2 ring-white/50"
              style={{ backgroundColor: currentUser?.userColor || "#a855f7" }}
            />
            {React.createElement(getIcon("User"), {
              className: "h-4 w-4 text-gray-700 mr-2",
            })}
            <span className="font-semibold text-gray-900 text-sm">
              {currentUser?.userName || "Anonymous"}
            </span>
            {React.createElement(getIcon("ChevronDown"), {
              className: `h-4 w-4 text-gray-500 ml-2 transition-transform ${showDropdown ? "rotate-180" : ""}`,
            })}
          </Button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-[100]" onClick={() => setShowDropdown(false)} />
              {/* Dropdown Menu */}
              <div className="absolute top-full mt-2 right-0 z-[110] bg-white rounded-xl shadow-xl border-2 border-black ring-1 ring-gray-800/10 py-2 min-w-[180px]">
                <Button
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {React.createElement(getIcon("Settings"), {
                    className: "h-4 w-4 mr-3",
                  })}
                  Profile Settings
                </Button>
                <Button
                  onClick={() => {
                    setShowKeyManagement(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {React.createElement(getIcon("Key"), {
                    className: "h-4 w-4 mr-3",
                  })}
                  Backup Key
                </Button>
                <div className="border-t border-gray-100 my-1"></div>
                <Button
                  onClick={() => {
                    onUserChange?.();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {React.createElement(getIcon("User"), {
                    className: "h-4 w-4 mr-3",
                  })}
                  Switch User
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <ProfileSettings
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onUpdateProfile={onUpdateProfile}
      />

      <KeyManagementSettings
        isOpen={showKeyManagement}
        onClose={() => setShowKeyManagement(false)}
      />
    </>
  );
});

export default UserIndicator;
