import React, { useState, useEffect } from "react";
import { Shield, Users, Eye, EyeOff } from "lucide-react";
import logoOnly from "../../assets/Logo Only 1024x1024.png";

const UserSetup = ({ onSetupComplete }) => {
  console.log("🏗️ UserSetup component rendered", {
    onSetupComplete: !!onSetupComplete,
  });

  const [step, setStep] = useState(1);
  const [masterPassword, setMasterPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#a855f7");
  const [userAvatar, setUserAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add quick timeout to prevent hanging
  const handleWithTimeout = async (asyncFn, timeoutMs = 5000) => {
    return Promise.race([
      asyncFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  };

  const [isReturningUser, setIsReturningUser] = useState(false);

  // Load saved user profile on component mount
  useEffect(() => {
    console.log("🔍 UserSetup mounted, checking for saved profile");
    const savedProfile = localStorage.getItem("userProfile");
    const savedData = localStorage.getItem("envelopeBudgetData");

    if (savedProfile && savedData) {
      try {
        const profile = JSON.parse(savedProfile);
        console.log("📋 Found saved profile:", profile);
        setUserName(profile.userName || "");
        setUserColor(profile.userColor || "#a855f7");
        setUserAvatar(profile.userAvatar || null);
        setIsReturningUser(true);
        console.log("👋 Returning user detected");
      } catch (error) {
        console.warn("Failed to load saved profile:", error);
      }
    } else {
      console.log("📋 No saved profile found, new user");
      setIsReturningUser(false);
    }
  }, []);

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
    console.log("🔄 Form submitted - STEP 2 HANDLER:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      console.warn("⚠️ Form validation failed:", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("🚀 Calling onSetupComplete...");
      await onSetupComplete({
        password: masterPassword,
        userName: userName.trim(),
        userColor,
        userAvatar,
      });
      console.log("✅ onSetupComplete succeeded");
    } catch (error) {
      console.error("❌ Setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Continue = async (e) => {
    e.preventDefault();
    console.log("🔄 Step 1 continue clicked:", {
      step,
      masterPassword: !!masterPassword,
      isReturningUser,
    });

    if (isReturningUser) {
      // For returning users, try to login directly
      if (!masterPassword) {
        alert("Please enter your password");
        return;
      }

      setIsLoading(true);
      try {
        console.log("🚀 Attempting login for returning user...");
        await onSetupComplete({
          password: masterPassword,
          userName,
          userColor,
          userAvatar,
        });
        console.log("✅ Returning user login succeeded");
      } catch (error) {
        console.error("❌ Login failed:", error);
        alert("Incorrect password. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new users, proceed to step 2
      setStep(2);
    }
  };

  const handleAvatarInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartTrackingClick = async (e) => {
    e.preventDefault();
    console.log("🎯 Start Tracking button clicked:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      console.warn("⚠️ Validation failed on Start Tracking:", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      alert("Please fill in both password and name");
      return;
    }

    setIsLoading(true);
    try {
      console.log("🚀 Calling onSetupComplete from Start Tracking...");

      // Add timeout protection
      await handleWithTimeout(async () => {
        await onSetupComplete({
          password: masterPassword,
          userName: userName.trim(),
          userColor,
          userAvatar,
        });
      }, 10000);

      console.log("✅ onSetupComplete succeeded from Start Tracking");
    } catch (error) {
      console.error("❌ Setup failed from Start Tracking:", error);
      alert(`Setup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSavedProfile = () => {
    console.log("🗑️ Clearing saved profile");
    localStorage.removeItem("userProfile");
    setUserName("");
    setUserColor("#a855f7");
    setUserAvatar(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glassmorphism rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <img
              src={logoOnly}
              alt="VioletVault Logo"
              style={{ width: "96px", height: "96px", objectFit: "contain" }}
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isReturningUser ? (
              <span>
                Welcome Back,{" "}
                <span className="inline-flex items-center" style={{ color: userColor }}>
                  {userName}
                </span>
                !
              </span>
            ) : step === 1 ? (
              "Get Started"
            ) : (
              "Set Up Profile"
            )}
          </h1>
          <p className="text-gray-600">
            {isReturningUser
              ? "Enter your password to continue"
              : step === 1
                ? "Create a secure master password to protect your data"
                : "Choose your name and color for tracking"}
          </p>
        </div>

        <form
          onSubmit={isReturningUser || step === 1 ? handleStep1Continue : handleSubmit}
          className="space-y-6"
        >
          {(step === 1 || isReturningUser) && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={masterPassword}
                  onChange={(e) => {
                    console.log("🔐 Password input changed");
                    setMasterPassword(e.target.value);
                  }}
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {isReturningUser ? (
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={!masterPassword || isLoading}
                    className="w-full btn btn-primary py-4 text-lg font-semibold rounded-2xl"
                  >
                    {isLoading ? "Unlocking..." : "Login"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReturningUser(false);
                        setStep(2);
                      }}
                      disabled={isLoading}
                      className="flex-1 btn btn-secondary py-3 text-sm font-medium rounded-2xl"
                    >
                      Change Profile
                    </button>
                    <button
                      type="button"
                      onClick={clearSavedProfile}
                      disabled={isLoading}
                      className="flex-1 btn btn-secondary py-3 text-sm font-medium rounded-2xl"
                    >
                      Start Fresh
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!masterPassword || isLoading}
                  className="w-full btn btn-primary py-4 text-lg font-semibold rounded-2xl"
                >
                  {isLoading ? "Creating..." : "Continue"}
                </button>
              )}
            </>
          )}

          {step === 2 && !isReturningUser && (
            <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                console.log("👤 Name input changed:", e.target.value);
                setUserName(e.target.value);
              }}
              placeholder="e.g., Sarah, John, etc."
              className="w-full px-4 py-3 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Avatar</label>
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarInput} />
            </div>
          </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Color</label>
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
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStartTrackingClick}
                  disabled={!userName.trim() || isLoading}
                  className="flex-1 btn btn-primary py-3 rounded-2xl"
                >
                  {isLoading ? "Setting up..." : "Start Tracking"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Your data is encrypted client-side for maximum security
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;
