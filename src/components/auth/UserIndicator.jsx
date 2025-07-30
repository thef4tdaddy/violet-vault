import React, { memo, useState } from "react";
import { User, ChevronDown, Settings } from "lucide-react";
import ProfileSettings from "./ProfileSettings";

const UserIndicator = memo(({ currentUser, onUserChange, onUpdateProfile }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center glassmorphism rounded-2xl px-5 py-3 shadow-xl border border-white/30 backdrop-blur-sm">
          <div
            className="w-3 h-3 rounded-full mr-3 shadow-sm ring-2 ring-white/50"
            style={{ backgroundColor: currentUser?.userColor || "#a855f7" }}
          />
          <User className="h-4 w-4 text-gray-700 mr-2" />
          <span className="font-semibold text-gray-900 text-sm">
            {currentUser?.userName || "Anonymous"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="btn btn-secondary flex items-center rounded-xl"
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </button>

        <button onClick={onUserChange} className="btn btn-secondary">
          Switch User
        </button>
      </div>

      <ProfileSettings
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onUpdateProfile={onUpdateProfile}
      />
    </>
  );
});

export default UserIndicator;
