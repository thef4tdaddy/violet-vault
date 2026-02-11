// Common company mappings for smart bill suggestions
// Extracted from SmartBillMatcher to reduce component size
export const COMPANY_MAPPINGS = {
  // Utilities
  electric: ["electricity", "power", "utility"],
  gas: ["natural gas", "utility"],
  water: ["water", "sewer", "utility"],
  internet: ["internet", "wifi", "broadband"],
  phone: ["mobile", "cell", "wireless"],

  // Entertainment
  netflix: ["streaming", "entertainment"],
  spotify: ["music", "entertainment"],
  disney: ["streaming", "entertainment"],
  hulu: ["streaming", "entertainment"],
  "amazon prime": ["streaming", "shopping"],

  // Insurance
  "state farm": ["insurance", "auto insurance"],
  geico: ["insurance", "auto insurance"],
  progressive: ["insurance", "auto insurance"],
  allstate: ["insurance", "auto insurance"],

  // Banking
  chase: ["banking", "credit card"],
  "wells fargo": ["banking", "mortgage"],
  "bank of america": ["banking", "credit card"],
  "capital one": ["credit card", "banking"],

  // Grocery
  walmart: ["groceries", "shopping"],
  target: ["groceries", "shopping"],
  kroger: ["groceries"],
  safeway: ["groceries"],

  // Transportation
  exxon: ["gas", "fuel", "transportation"],
  shell: ["gas", "fuel", "transportation"],
  chevron: ["gas", "fuel", "transportation"],
  uber: ["transportation", "rideshare"],
  lyft: ["transportation", "rideshare"],
};

// Helper functions for SmartBillMatcher
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return "text-green-600 bg-green-100";
  if (confidence >= 70) return "text-blue-600 bg-blue-100";
  if (confidence >= 50) return "text-yellow-600 bg-yellow-100";
  return "text-gray-600 bg-gray-100";
};

export const getConfidenceIcon = (confidence: number): string => {
  if (confidence >= 90) return "CheckCircle";
  if (confidence >= 70) return "Target";
  return "Zap";
};
