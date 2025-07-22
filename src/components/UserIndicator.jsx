import React, { memo } from "react";
import { User, ChevronDown } from "lucide-react";

const UserIndicator = memo(({ currentUser, onUserChange }) => {
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center glassmorphism rounded-2xl px-5 py-3 shadow-xl border border-white/30 backdrop-blur-sm">
        <div
          className="w-3 h-3 rounded-full mr-3 shadow-sm ring-2 ring-white/50"
          style={{ backgroundColor: currentUser?.userColor || '#a855f7' }}
        />
        <User className="h-4 w-4 text-gray-700 mr-2" />
        <span className="font-semibold text-gray-900 text-sm">
          {currentUser?.userName || 'Anonymous'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
      </div>

      <button
        onClick={onUserChange}
        className="glassmorphism px-6 py-3 text-purple-700 text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl border border-purple-200/50 hover:border-purple-300/70 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
      >
        Switch User
      </button>
    </div>
  );
});

export default UserIndicator;
