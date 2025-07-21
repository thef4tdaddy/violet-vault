// components/SmartBillMatcher.jsx
import React, { useState, useEffect } from "react";
import { Search, Target, Zap, CheckCircle } from "lucide-react";

const SmartBillMatcher = ({
  bills,
  envelopes,
  onSuggestEnvelope,
  searchQuery,
}) => {
  const [suggestions, setSuggestions] = useState([]);

  // Common company mappings for smart suggestions
  const companyMappings = {
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

  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      generateSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, envelopes, bills]);

  const generateSuggestions = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = [];

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
        const matchingEnvelope = envelopes.find(
          (env) => env.billId === bill.id
        );
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
    Object.entries(companyMappings).forEach(([company, categories]) => {
      if (
        normalizedQuery.includes(company) ||
        categories.some((cat) => normalizedQuery.includes(cat))
      ) {
        // Find envelopes that match these categories
        envelopes.forEach((envelope) => {
          const envelopeName = envelope.name.toLowerCase();
          const envelopeCategory = envelope.category?.toLowerCase() || "";

          if (
            categories.some(
              (cat) =>
                envelopeName.includes(cat) || envelopeCategory.includes(cat)
            )
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
        (word) => word.length > 2 && envelopeName.includes(word)
      );

      if (
        matchingWords.length > 0 &&
        !suggestions.find((s) => s.envelope.id === envelope.id)
      ) {
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
          index ===
          self.findIndex((s) => s.envelope.id === suggestion.envelope.id)
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 suggestions

    setSuggestions(uniqueSuggestions);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "text-green-600 bg-green-100";
    if (confidence >= 70) return "text-blue-600 bg-blue-100";
    if (confidence >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 90) return CheckCircle;
    if (confidence >= 70) return Target;
    return Zap;
  };

  if (!searchQuery || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2">
      <div className="flex items-center mb-3">
        <Search className="h-4 w-4 mr-2 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Smart envelope suggestions for "{searchQuery}"
        </span>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const ConfidenceIcon = getConfidenceIcon(suggestion.confidence);

          return (
            <button
              key={`${suggestion.envelope.id}-${index}`}
              onClick={() => onSuggestEnvelope(suggestion.envelope)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: suggestion.envelope.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.envelope.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.reason}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(
                    suggestion.confidence
                  )}`}
                >
                  {suggestion.confidence}%
                </span>
                <ConfidenceIcon className="h-4 w-4 text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Click a suggestion to assign this transaction to that envelope
        </p>
      </div>
    </div>
  );
};

export default SmartBillMatcher;
