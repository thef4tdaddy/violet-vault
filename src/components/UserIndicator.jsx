import React from "react";
import { User, ChevronDown } from "lucide-react";

const UserIndicator = ({ currentUser, onUserChange }) => {
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center bg-white/80 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-lg border border-white/20">
        <div
          className="w-4 h-4 rounded-full mr-3 shadow-sm"
          style={{ backgroundColor: currentUser?.userColor || '#a855f7' }}
        />
        <User className="h-4 w-4 text-gray-600 mr-2" />
        <span className="font-semibold text-gray-900">
          {currentUser?.userName || 'Anonymous'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
      </div>

      <button
        onClick={onUserChange}
        className="text-sm text-purple-600 hover:text-purple-700 font-medium underline decoration-purple-300 underline-offset-4"
      >
        Switch User
      </button>
    </div>
  );
};

export default UserIndicator;
