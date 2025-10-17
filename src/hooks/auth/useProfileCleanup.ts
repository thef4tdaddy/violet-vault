/**
 * Hook for profile cleanup operations
 * Wraps localStorage cleanup to comply with architecture patterns
 */
export const useProfileCleanup = () => {
  const clearProfile = () => {
    const keysToRemove = [
      "violet_vault_user_profile",
      "violet-vault-user-data",
      "violet-vault-auth-salt",
    ];

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    });
  };

  return { clearProfile };
};
