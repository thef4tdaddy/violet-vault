import React from "react";
import { renderIcon } from "@/utils/icons";

interface User {
  id: string;
  userName: string;
  color?: string;
}

interface ActiveUsersProps {
  otherActiveUsers: User[];
}

export const ActiveUsers: React.FC<ActiveUsersProps> = ({ otherActiveUsers }) => {
  if (otherActiveUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center text-sm text-gray-600">
        {renderIcon("Users", { className: "h-4 w-4 mr-1" })}
        <span>
          {otherActiveUsers.length} other
          {otherActiveUsers.length === 1 ? "" : "s"} online
        </span>
      </div>

      {/* User Avatars */}
      <div className="flex -space-x-2">
        {otherActiveUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="relative h-8 w-8 rounded-full border-2 border-white"
            style={{ backgroundColor: user.color || "#a855f7" }}
            title={user.userName}
          >
            <div className="absolute inset-0 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user.userName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>

            {/* Active indicator */}
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        ))}

        {/* More users indicator */}
        {otherActiveUsers.length > 3 && (
          <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">+{otherActiveUsers.length - 3}</span>
          </div>
        )}
      </div>
    </div>
  );
};
