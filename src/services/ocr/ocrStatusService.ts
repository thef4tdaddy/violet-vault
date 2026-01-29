// Mock API function - in a real app this would be imported from an API service
export const fetchOCRStatus = async (
  _receiptId: string
): Promise<{
  status: "queued" | "processing" | "extracting" | "completed" | "failed";
  progress: number;
}> => {
  // Simulating API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "processing", progress: 0 });
    }, 100);
  });
};
