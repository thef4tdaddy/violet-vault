import React, { useState } from "react";
import { Shield, Users, Eye, EyeOff } from "lucide-react";
import logoOnly from "../assets/Logo Only 1024x1024.png";

const UserSetup = ({ onSetupComplete }) => {
  const [step, setStep] = useState(1);
  const [masterPassword, setMasterPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#a855f7");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!masterPassword || !userName.trim()) return;

    setIsLoading(true);
    try {
      await onSetupComplete({
        password: masterPassword,
        userName: userName.trim(),
        userColor,
      });
    } catch (error) {
      console.error("Setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16">
              <img 
                src={logoOnly} 
                alt="VioletVault Logo" 
                className="w-16 h-16"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? "🔐 Welcome Back" : "✨ Set Up Profile"}
          </h1>
          <p className="text-gray-600">
            {step === 1
              ? "Enter your family's master password"
              : "Choose your name and color for tracking"}
          </p>
        </div>

        <form
          onSubmit={
            step === 2
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  setStep(2);
                }
          }
          className="space-y-6"
        >
          {step === 1 && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Master password"
                  className="w-full px-4 py-4 text-lg border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={!masterPassword || isLoading}
                className="w-full btn btn-primary py-4 text-lg font-semibold rounded-2xl"
              >
                {isLoading ? "Unlocking..." : "Continue →"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., Sarah, John, etc."
                  className="w-full px-4 py-3 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setUserColor(color.value)}
                      className={`w-12 h-12 rounded-2xl border-2 transition-all ${
                        userColor === color.value
                          ? "border-gray-900 scale-110 shadow-lg"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn btn-secondary py-3 rounded-2xl"
                  disabled={isLoading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={!userName.trim() || isLoading}
                  className="flex-1 btn btn-primary py-3 rounded-2xl"
                >
                  {isLoading ? "Setting up..." : "Start Tracking ✨"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            🔒 Your data is encrypted client-side for maximum security
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;
