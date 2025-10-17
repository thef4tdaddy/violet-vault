import logger from "../common/logger";

export const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided."));
    }

    logger.info("Reading file content");
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => {
      logger.error("Failed to read file", e);
      reject(new Error("Failed to read file."));
    };
    reader.readAsText(file);
  });
};
