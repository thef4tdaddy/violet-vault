/**
 * Hook to check if encrypted data exists
 * Wraps localStorage check to comply with architecture patterns
 */
export const useEncryptedDataCheck = () => {
  const hasEncryptedData = () => {
    try {
      const savedData = localStorage.getItem("envelopeBudgetData");
      return !!savedData;
    } catch {
      return false;
    }
  };

  return { hasEncryptedData };
};
