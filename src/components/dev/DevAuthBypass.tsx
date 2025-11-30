import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import logger from "@/utils/common/logger";
import { useAuth } from "@/contexts/AuthContext";
import { UserData } from "@/types/auth";

/**
 * Development Authentication Bypass
 * Simple authentication bypass for Lighthouse testing
 *
 * Part of Lighthouse monitoring workflow - Issue #621
 * Related to Epic #158 - Mobile UI/UX Enhancements
 *
 * Usage: /__dev_auth?token=<token>&target=<redirect_path>
 */
const DevAuthBypass = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token") || "";
    const target = searchParams.get("target") || "/app/dashboard";

    // Only allow in development or staging environments
    const isDevMode =
      process.env.NODE_ENV === "development" ||
      window.location.hostname.includes("staging.violetvault.app") ||
      window.location.hostname.includes("staging.") ||
      window.location.hostname.includes("dev.");

    if (!isDevMode) {
      logger.warn("Dev auth bypass attempted in non-dev environment");
      navigate("/");
      return;
    }

    if (!token) {
      logger.error("Dev auth bypass: No token provided");
      navigate("/");
      return;
    }

    // Simple token validation - just check if it looks like our format
    const tokenPattern = /^\d{10}\.[a-f0-9]{32}$/;
    if (!tokenPattern.test(token)) {
      logger.error("Dev auth bypass: Invalid token format");
      navigate("/");
      return;
    }

    logger.info("Dev auth bypass: Authenticating with local user");

    // Create a temporary dev user for testing
    const devUser: UserData = {
      userName: "Lighthouse",
      userColor: "#0D47A1",
    };

    // Set auth state for testing
    try {
      // Trigger auth state change to unlock the app
      setAuthenticated(devUser);

      logger.info(`Dev auth bypass: Redirecting to ${target}`);

      // Small delay to ensure auth state is set
      setTimeout(() => {
        navigate(target);
      }, 100);
    } catch (error) {
      logger.error("Dev auth bypass: Error setting auth state:", error);
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating for Lighthouse testing...</p>
      </div>
    </div>
  );
};

export default DevAuthBypass;
