export const suggestEnvelope = (description, envelopes) => {
  const desc = description.toLowerCase();

  const match = envelopes.find((env) => desc.includes(env.name.toLowerCase()));
  if (match) return match;

  const mappings = {
    grocery: ["food", "kroger", "walmart", "safeway", "whole foods"],
    gas: ["shell", "exxon", "chevron", "bp", "gas station"],
    restaurant: ["restaurant", "cafe", "pizza", "mcdonalds", "starbucks"],
    utilities: ["electric", "water", "gas bill", "internet", "phone"],
    entertainment: ["netflix", "spotify", "movie", "theater", "game"],
  };

  for (const [category, keywords] of Object.entries(mappings)) {
    if (keywords.some((keyword) => desc.includes(keyword))) {
      const match = envelopes.find(
        (env) =>
          env.category?.toLowerCase().includes(category) ||
          env.name.toLowerCase().includes(category)
      );
      if (match) return match;
    }
  }

  return null;
};