// Bill Icons Module - Main exports
export { ALL_ICONS } from "./iconDefinitions.ts";
export { BILL_PROVIDER_ICONS } from "./providerMappings.ts";
export { CATEGORY_FALLBACK_ICONS, CATEGORY_PATTERNS } from "./categoryMappings.ts";
export {
  ICON_OPTIONS_BY_CATEGORY,
  DEFAULT_ICON_OPTIONS,
  getBillIconOptions,
} from "./iconOptions.ts";
export {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getIconByName,
  getIconName,
  getIconNameForStorage,
} from "./iconUtils.ts";

// Re-import functions for default export
import {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getIconByName,
  getIconName,
  getIconNameForStorage,
} from "./iconUtils.ts";
import { getBillIconOptions } from "./iconOptions.ts";

// Default export for backward compatibility
export default {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getBillIconOptions,
  getIconName,
  getIconByName,
  getIconNameForStorage,
};
