/**
 * Suggest envelope based on transaction description
 * Consolidated from components/transactions/utils/envelopeMatching.js
 */

interface Envelope {
  id: string;
  name: string;
  category?: string;
}

interface Transaction {
  envelopeId?: string;
  description?: string;
  [key: string]: unknown;
}

export const suggestEnvelope = (description: string, envelopes: Envelope[]): Envelope | null => {
  const desc = description.toLowerCase();

  // First, try exact name matching
  const exactMatch = envelopes.find((env) => desc.includes(env.name.toLowerCase()));
  if (exactMatch) return exactMatch;

  // Then try category-based matching with keywords
  const categoryMappings = {
    grocery: ["food", "kroger", "walmart", "safeway", "whole foods", "grocery"],
    gas: ["shell", "exxon", "chevron", "bp", "gas station", "fuel"],
    restaurant: ["restaurant", "cafe", "pizza", "mcdonalds", "starbucks", "food"],
    utilities: ["electric", "water", "gas bill", "internet", "phone", "utility"],
    entertainment: ["netflix", "spotify", "movie", "theater", "game", "entertainment"],
    transportation: ["uber", "lyft", "taxi", "parking", "toll", "subway"],
    shopping: ["amazon", "target", "store", "mall", "shop"],
    medical: ["pharmacy", "doctor", "hospital", "medical", "cvs", "walgreens"],
    bills: ["insurance", "subscription", "membership", "premium"],
  };

  for (const [category, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some((keyword) => desc.includes(keyword))) {
      const categoryMatch = envelopes.find(
        (env) =>
          env.category?.toLowerCase().includes(category) ||
          env.name.toLowerCase().includes(category)
      );
      if (categoryMatch) return categoryMatch;
    }
  }

  return null;
};

/**
 * Auto-assign envelope to transactions based on patterns
 */
export const autoAssignEnvelopes = (transactions: Transaction[], envelopes: Envelope[]) => {
  return transactions.map((transaction) => {
    if (!transaction.envelopeId && transaction.description) {
      const suggestedEnvelope = suggestEnvelope(transaction.description, envelopes);
      if (suggestedEnvelope) {
        return {
          ...transaction,
          envelopeId: suggestedEnvelope.id,
          suggestedEnvelope: true, // Flag for user review
        };
      }
    }
    return transaction;
  });
};

/**
 * Get matching confidence score for envelope suggestion
 */
export const getMatchingConfidence = (description: string, envelope: Envelope): number => {
  const desc = description.toLowerCase();
  const envName = envelope.name.toLowerCase();
  const envCategory = envelope.category?.toLowerCase() || "";

  // Exact name match - highest confidence
  if (desc.includes(envName) || envName.includes(desc)) {
    return 0.9;
  }

  // Category match - medium confidence
  if (envCategory && desc.includes(envCategory)) {
    return 0.7;
  }

  // Keyword match - lower confidence
  const keywords = [envName, envCategory].join(" ").split(/\s+/);
  const matchingKeywords = keywords.filter(
    (keyword) => keyword.length > 2 && desc.includes(keyword)
  );

  if (matchingKeywords.length > 0) {
    return Math.min(0.6, matchingKeywords.length * 0.2);
  }

  return 0;
};
