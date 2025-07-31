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
      setTimeout(() => reject(new Error("Login timeout after 10 seconds")), 10000)
    );

    const loginPromise = (async () => {
      try {
        if (userData) {
          const { salt, key } = await encryptionUtils.deriveKey(password);
          const finalUserData = {
            ...userData,
            budgetId: userData.budgetId || encryptionUtils.generateBudgetId(password),
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
            error: "Local data is corrupted. Please clear data and start fresh.",
          };
        }
        const saltArray = new Uint8Array(savedSalt);
        const key = await encryptionUtils.deriveKeyFromSalt(password, saltArray);
        const decryptedData = await encryptionUtils.decrypt(encryptedData, key, iv);
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
        if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
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

  setEncryption: ({ key, salt }) =>
    set({
      encryptionKey: key,
      salt,
    }),

  changePassword: async (oldPassword, newPassword) => {
    try {
      const savedData = localStorage.getItem("envelopeBudgetData");
      if (!savedData) {
        return { success: false, error: "No saved data found." };
      }

      const { salt: savedSalt, encryptedData, iv } = JSON.parse(savedData);
      const saltArray = new Uint8Array(savedSalt);
      const oldKey = await encryptionUtils.deriveKeyFromSalt(oldPassword, saltArray);

      const decryptedData = await encryptionUtils.decrypt(encryptedData, oldKey, iv);

      const { key: newKey, salt: newSalt } = await encryptionUtils.deriveKey(newPassword);
      const encrypted = await encryptionUtils.encrypt(decryptedData, newKey);

      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          encryptedData: encrypted.data,
          salt: Array.from(newSalt),
          iv: encrypted.iv,
        })
      );

      set({ salt: newSalt, encryptionKey: newKey });
      return { success: true };
    } catch (error) {
      if (error.name === "OperationError" || error.message.toLowerCase().includes("decrypt")) {
        return { success: false, error: "Invalid current password." };
      }
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (updatedProfile) => {
    try {
      const { encryptionKey, salt: currentSalt } = useAuthStore.getState();

      if (!encryptionKey || !currentSalt) {
        return { success: false, error: "Not authenticated." };
      }

      // Update the current user in the store
      set(() => ({
        currentUser: updatedProfile,
      }));

      // Update localStorage profile
      const profileData = {
        userName: updatedProfile.userName,
        userColor: updatedProfile.userColor,
      };
      localStorage.setItem("userProfile", JSON.stringify(profileData));

      // Update the encrypted budget data to include the updated user profile
      const savedData = localStorage.getItem("envelopeBudgetData");
      if (savedData) {
        const { encryptedData, iv } = JSON.parse(savedData);
        const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

        // Update the currentUser in the encrypted data
        const updatedData = {
          ...decryptedData,
          currentUser: updatedProfile,
        };

        const encrypted = await encryptionUtils.encrypt(updatedData, encryptionKey);
        localStorage.setItem(
          "envelopeBudgetData",
          JSON.stringify({
            encryptedData: encrypted.data,
            salt: Array.from(currentSalt),
            iv: encrypted.iv,
          })
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to update profile:", error);
      return { success: false, error: error.message };
    }
  },
}));

export default useAuthStore;
