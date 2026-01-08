import type { useAuth } from "@/hooks/auth/useAuth";
import type { UserData } from "@/types/auth";

/**
 * useMainLayoutHandlers - Extracts and type-guards auth handler functions
 * Consolidates legacy auth data extraction with proper type checking
 */

type AuthHookType = ReturnType<typeof useAuth>;

interface LayoutHandlers {
  isLocalOnlyMode: boolean;
  handleLogout: () => void;
  handleSetup: (password: string, userData?: UserData) => Promise<void>;
  handleChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  securityManager: AuthHookType["securityManager"];
}

export const useMainLayoutHandlers = (auth: AuthHookType): LayoutHandlers => {
  const isLocalOnlyMode = !!auth?.user?.isLocalOnly;
  const securityManager = auth?.securityManager;

  // Wrap async handlers to return Promise<void> to match component props
  const handleSetup = async (password: string, userData?: UserData) => {
    await auth.login({ password, userData });
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await auth.changePassword({ oldPassword, newPassword });
  };

  return {
    isLocalOnlyMode,
    handleLogout: auth?.logout || (() => {}),
    handleSetup,
    handleChangePassword,
    securityManager,
  };
};
