import { ENVELOPE_TYPES } from "@/constants/categories";

// Valid envelope types from ENVELOPE_TYPES constant
const VALID_ENVELOPE_TYPES = Object.values(ENVELOPE_TYPES);

/**
 * Validate if an envelope type is a known valid type
 */
export const isValidEnvelopeType = (envelopeType: string | undefined): boolean => {
  return (
    !!envelopeType &&
    VALID_ENVELOPE_TYPES.includes(
      envelopeType as (typeof ENVELOPE_TYPES)[keyof typeof ENVELOPE_TYPES]
    )
  );
};
