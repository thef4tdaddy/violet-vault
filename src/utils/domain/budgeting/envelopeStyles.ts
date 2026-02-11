import {
  ENVELOPE_TYPE_CONFIG,
  AUTO_CLASSIFY_ENVELOPE_TYPE,
  EnvelopeType,
} from "@/constants/categories";

interface EnvelopeWithType {
  type?: string;
  envelopeType?: EnvelopeType;
  category?: string;
}

interface EnvelopeWithStatus extends EnvelopeWithType {
  status?: "overdue" | "overspent" | "underfunded" | "healthy";
}

/**
 * Get styling based on envelope type
 */
export const getEnvelopeTypeStyle = (envelope: EnvelopeWithType): string => {
  let envelopeType =
    envelope.envelopeType ||
    (envelope.type as EnvelopeType) ||
    AUTO_CLASSIFY_ENVELOPE_TYPE(envelope.category || "");

  // Map liability types to bill styling
  const liabilityTypes = [
    "liability",
    "credit_card",
    "mortgage",
    "auto",
    "student",
    "personal",
    "business",
    "other",
    "chapter13",
  ];

  if (liabilityTypes.includes(envelopeType)) {
    envelopeType = "bill";
  }

  const config = ENVELOPE_TYPE_CONFIG[envelopeType];

  if (!config) {
    // Fallback to variable/standard if type config missing
    if (envelopeType === "standard") {
      return "border-orange-500 bg-orange-50";
    }
    return "border-gray-200 bg-gray-50";
  }

  return `${config.borderColor} ${config.bgColor}`;
};

/**
 * Get styling based on envelope status
 */
export const getStatusStyle = (envelope: EnvelopeWithStatus): string => {
  const { status } = envelope;
  // Status overrides envelope type styling for critical states
  switch (status) {
    case "overdue":
      return "border-red-500 bg-red-50 border-2";
    case "overspent":
      return "border-orange-500 bg-orange-50 border-2";
    case "underfunded":
      return "border-yellow-500 bg-yellow-50 border-2";
    case "healthy":
    default:
      return getEnvelopeTypeStyle(envelope);
  }
};

/**
 * Get icon for envelope status
 */
export const getStatusIcon = (status: string | undefined): string => {
  switch (status) {
    case "overdue":
    case "overspent":
      return "AlertTriangle";
    case "underfunded":
      return "Clock";
    case "healthy":
    default:
      return "CheckCircle";
  }
};

/**
 * Get color classes for utilization rate display
 */
export const getUtilizationColor = (
  utilizationRate: number,
  status: string | undefined
): string => {
  if (status === "overdue" || status === "overspent") {
    return "text-red-600 bg-red-100";
  }
  if (status === "underfunded") {
    return "text-yellow-600 bg-yellow-100";
  }
  if (utilizationRate >= 0.8) {
    return "text-orange-600 bg-orange-100";
  }
  if (utilizationRate >= 0.5) {
    return "text-blue-600 bg-blue-100";
  }
  return "text-green-600 bg-green-100";
};
