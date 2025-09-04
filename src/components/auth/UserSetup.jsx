import React, { useState, useEffect } from "react";
import { Shield, Users, Eye, EyeOff } from "lucide-react";
import logoOnly from "../../assets/icon-512x512.png";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

const UserSetup = ({ onSetupComplete }) => {
  logger.debug("🏗️ UserSetup component rendered", {
    onSetupComplete: !!onSetupComplete,
  });

  const [step, setStep] = useState(1);
  const [masterPassword, setMasterPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#a855f7");
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
    logger.debug("🔍 UserSetup mounted, checking for saved profile");
    const savedProfile = localStorage.getItem("userProfile");
    const savedData = localStorage.getItem("envelopeBudgetData");

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        logger.debug("📋 Found saved profile:", profile);
        setUserName(profile.userName || "");
        setUserColor(profile.userColor || "#a855f7");
        setIsReturningUser(true);
        logger.debug("👋 Returning user detected", {
          hasProfile: !!savedProfile,
          hasData: !!savedData,
          userName: profile.userName,
        });
      } catch (error) {
        logger.warn("Failed to load saved profile:", error);
        setIsReturningUser(false);
      }
    } else {
      logger.debug("📋 No saved profile found, new user");
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
    logger.debug("🔄 Form submitted - STEP 2 HANDLER:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Form validation failed:", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      return;
    }

    setIsLoading(true);
    try {
      logger.debug("🚀 Calling onSetupComplete...");
      await onSetupComplete({
        password: masterPassword,
        userName: userName.trim(),
        userColor,
      });
      logger.debug("✅ onSetupComplete succeeded");
    } catch (error) {
      logger.error("❌ Setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Continue = async (e) => {
    e.preventDefault();
    logger.debug("🔄 Step 1 continue clicked:", {
      step,
      masterPassword: !!masterPassword,
      isReturningUser,
    });

    if (isReturningUser) {
      // For returning users, try to login directly
      if (!masterPassword) {
        globalToast.showError("Please enter your password", "Password Required");
        return;
      }

      setIsLoading(true);
      try {
        logger.debug("🚀 Attempting login for returning user...");
        await onSetupComplete({
          password: masterPassword,
          userName,
          userColor,
        });
        logger.debug("✅ Returning user login succeeded");
      } catch (error) {
        logger.error("❌ Login failed:", error);
        globalToast.showError("Incorrect password. Please try again.", "Login Failed");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new users, proceed to step 2
      setStep(2);
    }
  };

  const handleStartTrackingClick = async (e) => {
    e.preventDefault();
    logger.debug("🎯 Start Tracking button clicked:", {
      step,
      masterPassword: !!masterPassword,
      userName: userName.trim(),
      userColor,
    });

    if (!masterPassword || !userName.trim()) {
      logger.warn("⚠️ Validation failed on Start Tracking:", {
        masterPassword: !!masterPassword,
        userName: userName.trim(),
      });
      globalToast.showError("Please fill in both password and name", "Required Fields");
      return;
    }

    setIsLoading(true);
    try {
      logger.debug("🚀 Calling onSetupComplete from Start Tracking...");

      // Add timeout protection
      await handleWithTimeout(async () => {
        await onSetupComplete({
          password: masterPassword,
          userName: userName.trim(),
          userColor,
        });
      }, 10000);

      logger.debug("✅ onSetupComplete succeeded from Start Tracking");
    } catch (error) {
      logger.error("❌ Setup failed from Start Tracking:", error);
      globalToast.showError(`Setup failed: ${error.message}`, "Setup Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSavedProfile = () => {
    logger.debug("🗑️ Clearing saved profile");
    localStorage.removeItem("userProfile");
    setUserName("");
    setUserColor("#a855f7");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
      <div className="rounded-3xl p-8 w-full max-w-md border-2 border-black bg-purple-100/40 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full border-2 border-black p-3">
              <img
                src={logoOnly}
                alt="VioletVault Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-2">
            {isReturningUser ? (
              <span className="uppercase tracking-wider text-black">
                <span className="text-4xl">W</span>ELCOME <span className="text-4xl">B</span>ACK,{" "}
                <span 
                  className="inline-flex items-center text-4xl font-black" 
                  style={{ 
                    color: userColor,
                    textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black, 0px 2px 0px black, 2px 0px 0px black, 0px -2px 0px black, -2px 0px 0px black'
                  }}
                >
                  {userName.toUpperCase()}
                </span>
                !
              </span>
            ) : step === 1 ? (
              <span className="uppercase tracking-wider text-black">
                <span className="text-4xl">G</span>ET <span className="text-4xl">S</span>TARTED
              </span>
            ) : (
              <span className="uppercase tracking-wider text-black">
                <span className="text-4xl">S</span>ET <span className="text-4xl">U</span>P <span className="text-4xl">P</span>ROFILE
              </span>
            )}
          </h1>
          <p className="text-purple-900 font-medium uppercase tracking-wider">
            {isReturningUser
              ? <span><span className="text-lg">E</span>NTER YOUR PASSWORD TO CONTINUE</span>
              : step === 1
                ? <span><span className="text-lg">C</span>REATE A SECURE MASTER PASSWORD TO PROTECT YOUR DATA</span>
                : <span><span className="text-lg">C</span>HOOSE YOUR NAME AND COLOR FOR TRACKING</span>}
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
                    logger.debug("🔐 Password input changed");
                    setMasterPassword(e.target.value);
                  }}
                  placeholder="MASTER PASSWORD"
                  className="w-full px-4 py-4 text-lg border-2 border-black rounded-2xl focus:ring-2 focus:ring-purple-500 bg-white/90 placeholder-gray-500 uppercase tracking-wider font-medium"
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
                    className="w-full btn btn-primary py-4 text-lg font-black rounded-2xl border-2 border-black uppercase tracking-wider"
                  >
                    {isLoading ? <span><span className="text-xl">U</span>NLOCKING...</span> : <span><span className="text-xl">L</span>OGIN</span>}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReturningUser(false);
                        setStep(2);
                      }}
                      disabled={isLoading}
                      className="flex-1 py-3 text-sm font-black rounded-2xl border-2 border-black bg-orange-600 hover:bg-orange-700 text-white uppercase tracking-wider"
                    >
                      <span className="text-base">C</span>HANGE <span className="text-base">P</span>ROFILE
                    </button>
                    <button
                      type="button"
                      onClick={clearSavedProfile}
                      disabled={isLoading}
                      className="flex-1 py-3 text-sm font-black rounded-2xl border-2 border-black bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
                    >
                      <span className="text-base">S</span>TART <span className="text-base">F</span>RESH
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
                    logger.debug("👤 Name input changed:", e.target.value);
                    setUserName(e.target.value);
                  }}
                  placeholder="e.g., Sarah, John, etc."
                  className="w-full px-4 py-3 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                  required
                />
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
          <p className="text-xs text-black font-medium uppercase tracking-wider">
            <span className="text-sm">Y</span>OUR DATA IS ENCRYPTED CLIENT-SIDE FOR MAXIMUM SECURITY
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;
