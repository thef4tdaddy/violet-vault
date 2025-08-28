import React, { useState, useEffect, useRef } from "react";
import { Lock, Unlock, Eye, EyeOff, AlertCircle, Shield, Clock } from "lucide-react";
import { useSecurityManager } from "../../hooks/auth/useSecurityManager";
import { useAuth } from "../../stores/auth/authStore";
import shieldLogo from "../../assets/logo-512x512.png";

const LockScreen = () => {
  const { isLocked, unlockApp, securityEvents } = useSecurityManager();
  const logout = useAuth((state) => state.logout);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const passwordInputRef = useRef(null);

  // Count recent failed attempts from security events
  useEffect(() => {
    if (isLocked) {
      const recentFailures = securityEvents.filter(
        (event) =>
          event.type === "FAILED_UNLOCK" &&
          Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000 // last 5 minutes
      ).length;
      setFailedAttempts(recentFailures);
    }
  }, [isLocked, securityEvents]);

  // Focus password input when locked
  useEffect(() => {
    if (isLocked && passwordInputRef.current) {
      const timer = setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  // Clear error when user starts typing
  useEffect(() => {
    if (password && error) {
      setError("");
    }
  }, [password, error]);

  const handleUnlock = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsUnlocking(true);
    setError("");

    try {
      const result = await unlockApp(password);

      if (result.success) {
        setPassword("");
        setFailedAttempts(0);
        setError("");
      } else {
        setError(result.error || "Invalid password");
        setFailedAttempts((prev) => prev + 1);
        setPassword("");

        // Add delay after failed attempts
        if (failedAttempts >= 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } catch {
      setError("Failed to unlock application");
      setPassword("");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleUnlock(e);
    }
  };

  if (!isLocked) return null;

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset and return to the login screen? This will end your current session."
      )
    ) {
      logout();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4 z-[9999]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)",
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Lock Icon and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 border-2 border-black p-2">
            <img
              src={shieldLogo}
              alt="Violet Vault Shield"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Violet Vault</h1>
          <p className="text-purple-100">Your session has been locked for security</p>
        </div>

        {/* Unlock Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border-2 border-black">
          <form onSubmit={handleUnlock} className="space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Enter Password to Unlock
              </label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isUnlocking}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border-2 border-black rounded-lg text-white placeholder-purple-100 focus:bg-opacity-30 focus:border-black focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isUnlocking}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-100 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-300 bg-red-500 bg-opacity-20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Failed Attempts Warning */}
            {failedAttempts > 0 && (
              <div className="flex items-center gap-2 text-orange-300 bg-orange-500 bg-opacity-20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">
                  {failedAttempts} failed attempt
                  {failedAttempts !== 1 ? "s" : ""}
                  {failedAttempts >= 3 && " - delays are being applied for security"}
                </span>
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={isUnlocking || !password.trim()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 border-2 border-black"
            >
              {isUnlocking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unlock Application
                </>
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Lock className="h-4 w-4" />
              <span>Protected by Violet Vault Security</span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Enter your budget password to continue using the application
            </p>

            {/* Reset Link */}
            <div className="mt-4 pt-3 border-t border-white border-opacity-20">
              <button
                onClick={handleReset}
                className="text-xs text-purple-200 hover:text-white underline transition-colors"
              >
                Having trouble? Reset and return to login screen
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-200 text-xs">
            Use the same password you set when first opening the app
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
