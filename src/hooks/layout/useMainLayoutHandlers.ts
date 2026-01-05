import type { useAuthManager } from "../auth/useAuthManager";
import type { UserData } from "@/types/auth";

/**
 * useMainLayoutHandlers - Extracts and type-guards auth handler functions
 * Consolidates legacy auth data extraction with proper type checking
 */

type AuthManagerType = ReturnType<typeof useAuthManager>;

interface LayoutHandlers {
  isLocalOnlyMode: boolean;
  handleLogout: () => void;
  handleSetup: (password: string, userData?: UserData) => Promise<void>;
  handleChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  securityManager: AuthManagerType["securityManager"];
}

export const useMainLayoutHandlers = (auth: AuthManagerType): LayoutHandlers => {
  const _legacy = (auth?._legacy || {}) as { isLocalOnlyMode?: boolean };
  const securityManager = auth?.securityManager;

  // Wrap async handlers to return Promise<void> to match component props
  const handleSetup = async (password: string, userData?: UserData) => {
    await auth.login(password, userData);
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await auth.changePassword(oldPassword, newPassword);
  };

  return {
    isLocalOnlyMode: !!_legacy.isLocalOnlyMode,
    handleLogout: auth?.logout || (() => {}),
    handleSetup,
    handleChangePassword,
    securityManager,
  };
};
