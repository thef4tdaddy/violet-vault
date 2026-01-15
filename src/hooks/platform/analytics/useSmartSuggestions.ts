import { useCallback, useMemo } from "react";
import { useSmartCategoryAnalysis } from "@/hooks/platform/analytics/useSmartCategoryAnalysis";
import { MERCHANT_CATEGORY_PATTERNS } from "@/constants/categories";
import {
  suggestBillCategoryAndIcon,
  getBillIconOptions,
  type BillIconOption,
} from "@/utils/ui/icons";
import type { TransactionForStats } from "@/utils/features/analytics/categoryHelpers";

export interface TransactionCategorySuggestion {
  category: string;
  merchant: string;
  confidence: number;
  source: "analysis" | "pattern";
  reason?: string;
}

export interface BillSuggestion {
  category: string;
  iconName: string;
  iconSuggestions: BillIconOption[];
  confidence: number;
  source: "analysis" | "pattern" | "fallback";
}

interface UseSmartSuggestionsOptions {
  transactions?: TransactionForStats[];
  bills?: Array<Record<string, unknown>>;
}

type RawSuggestion = {
  suggestedCategory?: string;
  priority?: string;
  description?: string;
  data?: {
    merchant?: string;
  };
};

const getPriorityConfidence = (priority: string): number => {
  switch (priority) {
    case "high":
      return 0.9;
    case "medium":
      return 0.75;
    case "low":
      return 0.6;
    default:
      return 0.6;
  }
};

export const useSmartSuggestions = ({
  transactions = [],
  bills = [],
}: UseSmartSuggestionsOptions = {}) => {
  const { transactionAnalysis, extractMerchantName, suggestBillCategory } =
    useSmartCategoryAnalysis(transactions, bills);

  const transactionSuggestionMap = useMemo(() => {
    const map = new Map<string, TransactionCategorySuggestion>();

    transactionAnalysis.forEach((suggestion) => {
      const raw = suggestion as RawSuggestion;
      const merchant = raw.data?.merchant;
      if (!merchant || !raw.suggestedCategory) {
        return;
      }

      const normalized = merchant.toLowerCase();
      if (!map.has(normalized)) {
        map.set(normalized, {
          merchant,
          category: raw.suggestedCategory,
          confidence: getPriorityConfidence(raw.priority ?? "medium"),
          source: "analysis",
          reason: raw.description,
        });
      }
    });

    return map;
  }, [transactionAnalysis]);

  const suggestTransactionCategory = useCallback(
    (description: string | undefined | null): TransactionCategorySuggestion | null => {
      if (!description) {
        return null;
      }

      const merchant = extractMerchantName(description);
      if (!merchant) {
        return null;
      }

      const normalized = merchant.toLowerCase();
      const fromAnalysis = transactionSuggestionMap.get(normalized);
      if (fromAnalysis) {
        return fromAnalysis;
      }

      const patternMatch = Object.entries(MERCHANT_CATEGORY_PATTERNS).find(([_, regex]) =>
        regex.test(merchant)
      );

      if (patternMatch) {
        const [category] = patternMatch;
        return {
          merchant,
          category,
          confidence: 0.6,
          source: "pattern",
        };
      }

      return null;
    },
    [extractMerchantName, transactionSuggestionMap]
  );

  const suggestBillDetails = useCallback(
    (
      name: string | undefined | null,
      notes: string | undefined | null,
      currentCategory?: string
    ): BillSuggestion | null => {
      if (!name || name.trim() === "") {
        return null;
      }

      const trimmedName = name.trim();
      const patternCategory = suggestBillCategory(trimmedName) || undefined;
      const smartIcon = suggestBillCategoryAndIcon(trimmedName, notes ?? "");

      const resolvedCategory =
        (currentCategory && currentCategory.trim() !== "" && currentCategory) ||
        patternCategory ||
        smartIcon.category ||
        "Other";

      const iconName = smartIcon.iconName || "FileText";
      const iconSuggestions = getBillIconOptions(resolvedCategory);

      const source: BillSuggestion["source"] = patternCategory
        ? "pattern"
        : smartIcon.confidence > 0.7
          ? "analysis"
          : "fallback";

      const confidence = Math.max(smartIcon.confidence ?? 0.5, patternCategory ? 0.7 : 0.5);

      return {
        category: resolvedCategory,
        iconName,
        iconSuggestions,
        confidence,
        source,
      };
    },
    [suggestBillCategory]
  );

  return {
    suggestTransactionCategory,
    suggestBillDetails,
  };
};

export default useSmartSuggestions;
