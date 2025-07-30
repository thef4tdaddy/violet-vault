import { create } from "zustand";
import { encryptionUtils } from "../utils/encryption";

const useAuthStore = create((set) => ({
  isUnlocked: false,
  encryptionKey: null,
  salt: null,
  currentUser: null,
  lastActivity: null,
  budgetId: null,

  login: async (password, userData = null) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Login timeout after 10 seconds")),
        10000,
      ),
    );

    const loginPromise = (async () => {
      try {
        if (userData) {
          const { salt, key } = await encryptionUtils.deriveKey(password);
          const finalUserData = {
            ...userData,
            budgetId:
              userData.budgetId || encryptionUtils.generateBudgetId(password),
          };
          set({
            salt,
            encryptionKey: key,
            currentUser: finalUserData,
            budgetId: finalUserData.budgetId,
            isUnlocked: true,
            lastActivity: Date.now(),
          });
          const profileData = {
            userName: finalUserData.userName,
            userColor: finalUserData.userColor,
          };
          localStorage.setItem("userProfile", JSON.stringify(profileData));
          return { success: true };
        }
        const savedData = localStorage.getItem("envelopeBudgetData");
        if (!savedData) {
          return {
            success: false,
            error: "No saved data found. Try creating a new budget.",
          };
        }
        const { salt: savedSalt, encryptedData, iv } = JSON.parse(savedData);
        if (!savedSalt || !encryptedData || !iv) {
          return {
            success: false,
            error:
              "Local data is corrupted. Please clear data and start fresh.",
          };
        }
        const saltArray = new Uint8Array(savedSalt);
        const key = await encryptionUtils.deriveKeyFromSalt(
          password,
          saltArray,
        );
        const decryptedData = await encryptionUtils.decrypt(
          encryptedData,
          key,
          iv,
        );
        const currentUserData = decryptedData.currentUser;
        set({
          salt: saltArray,
          encryptionKey: key,
          currentUser: currentUserData,
          budgetId: currentUserData.budgetId,
          isUnlocked: true,
          lastActivity: Date.now(),
        });
        return { success: true, data: decryptedData };
      } catch (error) {
        if (
          error.name === "OperationError" ||
          error.message.toLowerCase().includes("decrypt")
        ) {
          return { success: false, error: "Invalid password." };
        }
        return { success: false, error: "Invalid password or corrupted data." };
      }
    })();

    return Promise.race([loginPromise, timeoutPromise]);
  },

  logout: () =>
    set({
      isUnlocked: false,
      encryptionKey: null,
      salt: null,
      currentUser: null,
      lastActivity: null,
      budgetId: null,
    }),

  updateUser: (updatedUser) =>
    set((state) => ({
      currentUser: updatedUser,
      budgetId: updatedUser?.budgetId || state.budgetId,
    })),

  setLastActivity: (timestamp) => set({ lastActivity: timestamp }),
}));

export default useAuthStore;
