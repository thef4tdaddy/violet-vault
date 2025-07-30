import React, { useState, useEffect } from "react";
import { X, User as UserIcon } from "lucide-react";
import useAuthStore from "../../stores/authStore";

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

const ProfileSettings = ({ isOpen = false, onClose }) => {
  const { currentUser, updateUser } = useAuthStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[0].value);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.userName || "");
      setColor(currentUser.userColor || colors[0].value);
      setAvatar(currentUser.userAvatar || null);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await updateUser({ ...currentUser, userName: name.trim(), userColor: color, userAvatar: avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <label htmlFor="avatar-input" className="cursor-pointer">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-500" />
                </div>
              )}
            </label>
            <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-sm text-gray-500 mt-1">Click to change avatar</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c.value ? "border-gray-900" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.value }}
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

export default ProfileSettings;
