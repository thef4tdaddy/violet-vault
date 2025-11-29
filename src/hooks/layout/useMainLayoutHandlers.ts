/**
 * useMainLayoutHandlers - Extracts and type-guards auth handler functions
 * Consolidates legacy auth data extraction with proper type checking
 */

interface LayoutHandlers {
  isLocalOnlyMode: boolean;
  handleLogout: () => void;
  handleSetup: (payload: unknown, userData?: unknown) => Promise<void> | void;
  handleChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  securityManager: unknown;
}

export const useMainLayoutHandlers = (auth: unknown): LayoutHandlers => {
  const _legacy = ((auth as Record<string, unknown>)?._legacy as Record<string, unknown>) || {};
  const {
    isLocalOnlyMode: rawIsLocalOnlyMode = false,
    handleSetup: _handleSetup,
    handleLogout: rawHandleLogout,
    handleChangePassword,
  } = _legacy;

  const _internal = (_legacy._internal as Record<string, unknown>) || {};
  const securityManager = _internal.securityManager || {};

  // Type guards for handler functions and values
  const isLocalOnlyMode = typeof rawIsLocalOnlyMode === "boolean" ? rawIsLocalOnlyMode : false;
  const handleLogoutFn = (
    typeof rawHandleLogout === "function" ? rawHandleLogout : () => {}
  ) as () => void;
  const handleSetupFn = (typeof _handleSetup === "function" ? _handleSetup : async () => {}) as (
    payload: unknown,
    userData?: unknown
  ) => Promise<void> | void;
  const handleChangePasswordFn = (
    typeof handleChangePassword === "function" ? handleChangePassword : async () => {}
  ) as (old: string, newPwd: string) => Promise<void>;

  return {
    isLocalOnlyMode,
    handleLogout: handleLogoutFn,
    handleSetup: handleSetupFn,
    handleChangePassword: handleChangePasswordFn,
    securityManager,
  };
};
