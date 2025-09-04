import React, { useState, useEffect, useRef } from "react";
import { useConfirm } from "../../hooks/common/useConfirm";
import { Lock, Unlock, Eye, EyeOff, AlertCircle, Shield, Clock, UserX, RotateCcw } from "lucide-react";
import { useSecurityManager } from "../../hooks/auth/useSecurityManager";
import { useAuth } from "../../stores/auth/authStore";
import shieldLogo from "../../assets/logo-512x512.png";
import SecurityAlert from "../ui/SecurityAlert";

const LockScreen = () => {
  const { isLocked, unlockApp, securityEvents } = useSecurityManager();
  const logout = useAuth((state) => state.logout);
  const confirm = useConfirm();
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

  const handleReset = async () => {
    const confirmed = await confirm({
      title: "Reset Session",
      message:
        "Are you sure you want to reset and return to the login screen? This will end your current session.",
      confirmLabel: "Reset Session",
      cancelLabel: "Cancel",
      destructive: true,
    });

    if (confirmed) {
      logout();
    }
  };

  return (
    <div className="fixed inset-0 bg-purple-900 flex items-center justify-center p-4 z-[9999]">
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
          <h1 className="text-2xl font-black text-white mb-2">
            <span className="text-3xl">V</span>IOLET <span className="text-3xl">V</span>AULT
          </h1>
          <p className="text-white uppercase tracking-wider font-medium">
            <span className="text-lg">Y</span>OUR SESSION HAS BEEN LOCKED FOR SECURITY
          </p>
        </div>

        {/* Unlock Form */}
        <div className="rounded-2xl p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
          <form onSubmit={handleUnlock} className="space-y-4">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-purple-900 uppercase tracking-wider">
                <span className="text-base">E</span>NTER <span className="text-base">P</span>ASSWORD TO <span className="text-base">U</span>NLOCK
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
                  className="w-full px-4 py-3 bg-white/90 border-2 border-black rounded-lg text-black placeholder-gray-500 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
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
              <SecurityAlert 
                type="error" 
                message={error} 
                variant="fullscreen"
              />
            )}

            {/* Failed Attempts Warning */}
            {failedAttempts > 0 && (
              <SecurityAlert 
                type="warning" 
                message={`${failedAttempts} failed attempt${failedAttempts !== 1 ? 's' : ''}${failedAttempts >= 3 ? ' - delays are being applied for security' : ''}`}
                variant="fullscreen"
              />
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
              <span className="font-black uppercase tracking-wider">
                <span className="text-base">P</span>ROTECTED BY <span className="text-base">V</span>IOLET <span className="text-base">V</span>AULT <span className="text-base">S</span>ECURITY
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1 uppercase tracking-wider">
              <span className="text-sm">E</span>NTER YOUR BUDGET PASSWORD TO CONTINUE USING THE APPLICATION
            </p>

            {/* Reset Buttons */}
            <div className="mt-4 pt-3 border-t border-white border-opacity-20 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider border-2 border-black rounded transition-colors flex items-center justify-center gap-1"
                >
                  <UserX className="h-3 w-3" />
                  <span className="text-sm">S</span>TART <span className="text-sm">F</span>RESH
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider border-2 border-black rounded transition-colors flex items-center justify-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="text-sm">C</span>HANGE <span className="text-sm">P</span>ROFILE
                </button>
              </div>
              <p className="text-xs text-purple-200 text-center">
                HAVING TROUBLE? USE ONE OF THE OPTIONS ABOVE
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-200 text-xs uppercase tracking-wider font-medium">
            <span className="text-sm">U</span>SE THE SAME PASSWORD YOU SET WHEN FIRST OPENING THE APP
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
