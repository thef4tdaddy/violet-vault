import React, { useState, useEffect, useRef } from "react";
import { useConfirm } from "../../hooks/common/useConfirm";
import { getIcon } from "../../utils";
import { useSecurityManager } from "../../hooks/auth/useSecurityManager";
import { useAuth } from "../../stores/auth/authStore";
import shieldLogo from "../../assets/logo-512x512.png";
import SecurityAlert from "../ui/SecurityAlert";

const LockScreen = () => {
  const { isLocked, unlockSession, securityEvents } = useSecurityManager();
  const logout = useAuth((state) => state.logout);
  const confirm = useConfirm();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [pendingConfirm, setPendingConfirm] = useState(null);
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
      // Validate password with auth store
      const authStore = useAuth.getState();
      const isValidPassword = await authStore.validatePassword(password);

      if (isValidPassword) {
        // Password is correct, unlock the session
        // Cancel any pending confirmation modals to prevent race condition
        if (pendingConfirm) {
          pendingConfirm.cancel();
          setPendingConfirm(null);
        }

        unlockSession();
        setPassword("");
        setFailedAttempts(0);
        setError("");
      } else {
        // Reset loading state immediately to unblock the UI
        setIsUnlocking(false);

        // Enhanced error message for wrong password
        // Wrap confirmation in a cancellable promise to prevent race conditions
        const confirmPromise = new Promise((resolve, reject) => {
          const originalConfirm = confirm({
            title: "Incorrect Password",
            message:
              "That isn't the correct password for this budget.\n\nWould you like to log out and start a new budget?",
            confirmText: "Start New Budget",
            cancelText: "Try Again",
            variant: "destructive",
          });

          originalConfirm.then(resolve).catch(reject);

          // Store cancellation function
          setPendingConfirm({
            cancel: () => {
              resolve(false); // Resolve as cancelled
            },
          });
        });

        let shouldCreateNew;
        try {
          shouldCreateNew = await confirmPromise;
        } finally {
          setPendingConfirm(null);
        }

        if (shouldCreateNew) {
          // User wants to create new budget - logout and clear data
          localStorage.removeItem("envelopeBudgetData");
          localStorage.removeItem("userProfile");
          logout();
          window.location.reload();
          return;
        }

        setError("Invalid password");
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

  const _handleReset = async () => {
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
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
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

      {/* Harder blur overlay for safety screen */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-purple-900/60"></div>

      <div className="relative w-full max-w-md">
        {/* Main Container - Everything inside */}
        <div className="rounded-2xl p-8 border-2 border-black bg-purple-100/40 backdrop-blur-sm text-center">
          {/* Lock Icon and Title */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 border-2 border-black p-2">
              <img
                src={shieldLogo}
                alt="Violet Vault Shield"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-black mb-2">
              <span className="text-3xl">V</span>IOLET <span className="text-3xl">V</span>AULT
            </h1>
            <div
              className="text-black font-medium uppercase tracking-wider text-justify space-y-1"
              style={{ textAlign: "justify", textAlignLast: "justify" }}
            >
              <p style={{ textAlign: "justify", textAlignLast: "justify" }}>
                <span className="text-lg">Y</span>OUR <span className="text-lg">B</span>UDGET HAS
                BEEN LOCKED FOR
              </p>
              <p style={{ textAlign: "justify", textAlignLast: "justify" }}>
                YOUR SAFETY BECAUSE YOU LEFT THE
              </p>
              <p style={{ textAlign: "justify", textAlignLast: "justify" }}>
                SCREEN. <span className="text-lg">U</span>SE PASSWORD TO GET BACK IN.
              </p>
            </div>
          </div>

          {/* Unlock Form */}
          <div>
            <form onSubmit={handleUnlock} className="space-y-4">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  <span className="text-base">E</span>NTER <span className="text-base">P</span>
                  ASSWORD TO <span className="text-base">U</span>NLOCK
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
                    {React.createElement(getIcon(showPassword ? "EyeOff" : "Eye"), { className: "h-5 w-5" })}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && <SecurityAlert type="error" message={error} variant="fullscreen" />}

              {/* Failed Attempts Warning */}
              {failedAttempts > 0 && (
                <SecurityAlert
                  type="warning"
                  message={`${failedAttempts} failed attempt${failedAttempts !== 1 ? "s" : ""}${failedAttempts >= 3 ? " - delays are being applied for security" : ""}`}
                  variant="fullscreen"
                />
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isUnlocking || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-black transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 border-2 border-black uppercase tracking-wider"
                >
                  {isUnlocking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>UNLOCKING...</span>
                    </>
                  ) : (
                    <>
                      {React.createElement(getIcon("Unlock"), { className: "h-4 w-4" })}
                      <span>UNLOCK APPLICATION</span>
                    </>
                  )}
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-black transition-colors border-2 border-black uppercase tracking-wider"
                >
                  {React.createElement(getIcon("UserX"), { className: "h-4 w-4" })}
                  <span>LOG OUT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
