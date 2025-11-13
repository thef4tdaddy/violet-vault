import { useState, useEffect } from "react";
import { COMPANY_MAPPINGS } from "../../components/bills/smartBillMatcherHelpers";
import type { Bill, Envelope } from "@/types/bills";

interface SmartSuggestion {
  type: "exact" | "bill" | "category" | "partial";
  envelope: Envelope;
  bill?: Bill;
  confidence: number;
  reason: string;
}

/**
 * Hook for generating smart bill suggestions
 * Extracted from SmartBillMatcher to reduce component size
 */
export const useSmartBillSuggestions = (
  bills: Bill[],
  envelopes: Envelope[],
  searchQuery: string
): SmartSuggestion[] => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);

  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      generateSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, envelopes, bills]);

  const generateSuggestions = (query: string): void => {
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions: SmartSuggestion[] = [];

    // Find exact envelope matches
    envelopes.forEach((envelope) => {
      if (envelope.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.push({
          type: "exact",
          envelope,
          confidence: 100,
          reason: "Exact envelope match",
        });
      }
    });

    // Find bill-based matches
    bills.forEach((bill) => {
      if (bill.name.toLowerCase().includes(normalizedQuery)) {
        const matchingEnvelope = envelopes.find((env) => env.billId === bill.id);
        if (matchingEnvelope) {
          suggestions.push({
            type: "bill",
            envelope: matchingEnvelope,
            bill,
            confidence: 95,
            reason: "Matches existing bill",
          });
        }
      }
    });

    // Find category-based matches
    Object.entries(COMPANY_MAPPINGS).forEach(([company, categories]) => {
      if (
        normalizedQuery.includes(company) ||
        categories.some((cat) => normalizedQuery.includes(cat))
      ) {
        // Find envelopes that match these categories
        envelopes.forEach((envelope) => {
          const envelopeName = envelope.name.toLowerCase();
          const envelopeCategory = envelope.category?.toLowerCase() || "";

          if (
            categories.some((cat) => envelopeName.includes(cat) || envelopeCategory.includes(cat))
          ) {
            // Avoid duplicates
            if (!suggestions.find((s) => s.envelope.id === envelope.id)) {
              suggestions.push({
                type: "category",
                envelope,
                confidence: 80,
                reason: `Matches ${company} category`,
              });
            }
          }
        });
      }
    });

    // Find partial name matches
    envelopes.forEach((envelope) => {
      const envelopeName = envelope.name.toLowerCase();
      const queryWords = normalizedQuery.split(" ");

      const matchingWords = queryWords.filter(
        (word: string) => word.length > 2 && envelopeName.includes(word)
      );

      if (matchingWords.length > 0 && !suggestions.find((s) => s.envelope.id === envelope.id)) {
        const confidence = (matchingWords.length / queryWords.length) * 70;
        suggestions.push({
          type: "partial",
          envelope,
          confidence: Math.round(confidence),
          reason: `Partial match (${matchingWords.join(", ")})`,
        });
      }
    });

    // Sort by confidence and remove duplicates
    const uniqueSuggestions = suggestions
      .filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.envelope.id === suggestion.envelope.id)
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 suggestions

    setSuggestions(uniqueSuggestions);
  };

  return suggestions;
};
