import { useCallback } from "react";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

// Helper to apply create envelope suggestion
const applyCreateEnvelope = async (
  suggestion: { data: { name: string; [key: string]: unknown } },
  onCreateEnvelope: ((data: unknown) => void | Promise<void>) | undefined
) => {
  if (onCreateEnvelope) {
    await onCreateEnvelope(suggestion.data);
    globalToast.showSuccess(`Created "${suggestion.data.name}" envelope`, "Suggestion Applied");
  }
};

// Helper to apply budget change suggestion
const applyBudgetChange = async (
  suggestion: {
    data: {
      envelopeId: string;
      suggestedAmount: number;
      currentAmount?: number;
      [key: string]: unknown;
    };
  },
  onUpdateEnvelope:
    | ((envelopeId: string, updates: Record<string, unknown>) => void | Promise<void>)
    | undefined,
  actionType: "increase" | "decrease"
) => {
  if (onUpdateEnvelope) {
    await onUpdateEnvelope(suggestion.data.envelopeId, {
      monthlyAmount: suggestion.data.suggestedAmount,
    });
    const message =
      actionType === "increase"
        ? `Increased budget to $${suggestion.data.suggestedAmount}`
        : `Reduced budget to $${suggestion.data.suggestedAmount}`;
    globalToast.showSuccess(message, "Budget Updated");
  }
};

interface UseSuggestionActionsParams {
  onCreateEnvelope?: (data: unknown) => void | Promise<void>;
  onUpdateEnvelope?: (envelopeId: string, updates: Record<string, unknown>) => void | Promise<void>;
  onDismissSuggestion: (suggestionId: string) => void;
}

export const useSuggestionActions = ({
  onCreateEnvelope,
  onUpdateEnvelope,
  onDismissSuggestion,
}: UseSuggestionActionsParams) => {
  const handleApplySuggestion = useCallback(
    async (suggestion: {
      id: string;
      action: string;
      data: Record<string, unknown>;
      [key: string]: unknown;
    }) => {
      try {
        switch (suggestion.action) {
          case "create_envelope":
            await applyCreateEnvelope(
              suggestion as unknown as { data: { name: string; [key: string]: unknown } },
              onCreateEnvelope
            );
            break;
          case "increase_budget":
            await applyBudgetChange(
              suggestion as unknown as {
                data: {
                  envelopeId: string;
                  suggestedAmount: number;
                  currentAmount?: number;
                  [key: string]: unknown;
                };
              },
              onUpdateEnvelope,
              "increase"
            );
            break;
          case "decrease_budget":
            await applyBudgetChange(
              suggestion as unknown as {
                data: {
                  envelopeId: string;
                  suggestedAmount: number;
                  currentAmount?: number;
                  [key: string]: unknown;
                };
              },
              onUpdateEnvelope,
              "decrease"
            );
            break;
          default:
            logger.warn("Unknown suggestion action:", { action: suggestion.action });
            return;
        }
        onDismissSuggestion(suggestion.id);
      } catch (error) {
        logger.error("Error applying suggestion:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to apply suggestion";
        globalToast.showError(errorMessage, "Application Error", 8000);
      }
    },
    [onCreateEnvelope, onUpdateEnvelope, onDismissSuggestion]
  );

  return {
    handleApplySuggestion,
  };
};
