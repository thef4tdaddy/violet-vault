import Dexie from "dexie";

export const db = new Dexie("violetVaultDB");

// single table for encrypted budget data
// key is fixed 'budget'
db.version(1).stores({
  budget: "id",
});

export const getEncryptedData = async () => {
  try {
    return await db.table("budget").get("budgetData");
  } catch {
    return null;
  }
};

export const setEncryptedData = async (data) => {
  try {
    await db.table("budget").put({ id: "budgetData", ...data });
  } catch (err) {
    console.error("Dexie save error", err);
  }
};

export const clearEncryptedData = async () => {
  await db.table("budget").clear();
};
