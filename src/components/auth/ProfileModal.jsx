import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ProfileModal = ({ onClose }) => {
  const { currentUser, updateUser } = useAuth();
  const [name, setName] = useState(currentUser?.userName || "");
  const [color, setColor] = useState(currentUser?.userColor || "#a855f7");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...currentUser,
      userName: name.trim() || currentUser.userName,
      userColor: color,
      avatar,
    };
    updateUser(updatedUser);
    localStorage.setItem(
      "userProfile",
      JSON.stringify({ userName: updatedUser.userName, userColor: updatedUser.userColor, avatar })
    );
    if (onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="glassmorphism rounded-2xl p-6 w-full max-w-sm border border-white/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Avatar
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c.value ? "border-gray-900 scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <button onClick={handleSave} className="btn btn-primary w-full mt-2">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
