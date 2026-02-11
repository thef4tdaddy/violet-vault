export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return "text-green-600 bg-green-100";
  if (confidence >= 0.6) return "text-blue-600 bg-blue-100";
  if (confidence >= 0.4) return "text-orange-600 bg-orange-100";
  return "text-gray-600 bg-gray-100";
};
