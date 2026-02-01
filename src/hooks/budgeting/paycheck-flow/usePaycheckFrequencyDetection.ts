import { useState, useEffect } from "react";
import { budgetDb } from "@/db/budgetDb";
import { detectFrequencyFromAmount } from "@/services/api/predictionService";
import logger from "@/utils/core/common/logger";

interface FrequencyDetectionResult {
  paycheckFrequency: "weekly" | "biweekly" | "monthly";
  setPaycheckFrequency: (freq: "weekly" | "biweekly" | "monthly") => void;
  wasAutoDetected: boolean;
  setWasAutoDetected: (detected: boolean) => void;
  detectionMessage: string | null;
}

export function usePaycheckFrequencyDetection(
  paycheckAmountCents: number | null
): FrequencyDetectionResult {
  const [paycheckFrequency, setPaycheckFrequency] = useState<"weekly" | "biweekly" | "monthly">(
    "biweekly"
  );
  const [wasAutoDetected, setWasAutoDetected] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);

  useEffect(() => {
    const detectFrequency = async () => {
      if (!paycheckAmountCents) return;

      try {
        const history = await budgetDb.getPaycheckHistory(10);
        if (!history || history.length < 3) return;

        const allocationHistory = history.map((p) => ({
          date: typeof p.date === "string" ? p.date : p.date.toISOString(),
          amountCents: p.amount,
          envelopeAllocations: Object.entries(p.allocations || {}).map(
            ([envelopeId, amountCents]) => ({
              envelopeId,
              amountCents,
            })
          ),
        }));

        const suggestion = await detectFrequencyFromAmount(paycheckAmountCents, allocationHistory);

        if (suggestion.confidence >= 0.7 && suggestion.suggestedFrequency !== "unknown") {
          setPaycheckFrequency(suggestion.suggestedFrequency as "weekly" | "biweekly" | "monthly");
          setWasAutoDetected(true);
          setDetectionMessage(suggestion.reasoning);

          logger.info("Auto-detected paycheck frequency", {
            frequency: suggestion.suggestedFrequency,
            confidence: suggestion.confidence,
            reasoning: suggestion.reasoning,
          });
        }
      } catch (err) {
        logger.warn("Frequency auto-detection failed", { error: err });
      }
    };

    detectFrequency();
  }, [paycheckAmountCents]);

  return {
    paycheckFrequency,
    setPaycheckFrequency,
    wasAutoDetected,
    setWasAutoDetected,
    detectionMessage,
  };
}
