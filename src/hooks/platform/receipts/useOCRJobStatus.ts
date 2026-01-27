import { useQuery } from "@tanstack/react-query";
import { fetchOCRStatus } from "@/services/ocr/ocrStatusService";

export const useOCRJobStatus = (receiptId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ocr-status", receiptId],
    queryFn: () => fetchOCRStatus(receiptId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll every 2s while processing or extracting
      return status === "processing" || status === "extracting" || status === "queued"
        ? 2000
        : false;
    },
    enabled: !!receiptId,
  });

  return {
    status: data?.status || "idle",
    progress: data?.progress || 0,
    isLoading,
    error,
  };
};
