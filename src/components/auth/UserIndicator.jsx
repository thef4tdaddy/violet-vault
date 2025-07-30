import React, { memo } from "react";
import { User, ChevronDown, Pencil } from "lucide-react";

const UserIndicator = memo(({ currentUser, onUserChange, onEditProfile }) => {
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center glassmorphism rounded-2xl px-5 py-3 shadow-xl border border-white/30 backdrop-blur-sm">
        <div
          className="w-3 h-3 rounded-full mr-3 shadow-sm ring-2 ring-white/50"
          style={{ backgroundColor: currentUser?.userColor || "#a855f7" }}
        />
        {currentUser?.userAvatar ? (
          <img
            src={currentUser.userAvatar}
            alt="Avatar"
            className="h-4 w-4 rounded-full mr-2 object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-gray-700 mr-2" />
        )}
        <span className="font-semibold text-gray-900 text-sm">
          {currentUser?.userName || "Anonymous"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
      </div>

      {onEditProfile && (
        <button onClick={onEditProfile} className="btn btn-secondary">
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </button>
      )}
      <button onClick={onUserChange} className="btn btn-secondary">
        Switch User
      </button>
    </div>
  );
});

export default UserIndicator;
