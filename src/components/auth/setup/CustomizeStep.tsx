import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

const AVAILABLE_COLORS = [
  { name: "Purple", value: "#a855f7" },
  { name: "Emerald", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
];

interface CustomizeStepProps {
  userName: string;
  userColor: string;
  loading: boolean;
  onUserNameChange: (name: string) => void;
  onUserColorChange: (color: string) => void;
  onBack: () => void;
  onStart: () => void;
}

const CustomizeStep: React.FC<CustomizeStepProps> = ({
  userName,
  userColor,
  loading,
  onUserNameChange,
  onUserColorChange,
  onBack,
  onStart,
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Profile</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {React.createElement(getIcon("Palette"), {
              className: "h-4 w-4 inline mr-1",
            })}
            Profile Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVAILABLE_COLORS.map((color) => (
              <Button
                key={color.value}
                type="button"
                onClick={() => onUserColorChange(color.value)}
                className={`w-12 h-12 rounded-xl border-2 transition-all ${
                  userColor === color.value
                    ? "border-gray-900 scale-110 shadow-lg ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-400 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

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
    </div>

    <div className="flex gap-3">
      <Button
        onClick={onBack}
        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Back
      </Button>
      <Button
        onClick={onStart}
        disabled={loading || !userName.trim()}
        className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Starting..." : "Start Local-Only Mode"}
      </Button>
    </div>
  </div>
);

export default CustomizeStep;
