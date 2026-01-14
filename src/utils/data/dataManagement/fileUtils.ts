import logger from "@/utils/core/common/logger";

export const readFileContent = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided."));
    }

    logger.info("Reading file content");
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result ?? null);
    reader.onerror = (e: ProgressEvent<FileReader>) => {
      logger.error("Failed to read file", e);
      reject(new Error("Failed to read file."));
    };
    reader.readAsText(file);
  });
};
