// Bill Icons Module - Main exports
export { ALL_ICONS } from "./iconDefinitions.js";
export { BILL_PROVIDER_ICONS } from "./providerMappings.js";
export {
  CATEGORY_FALLBACK_ICONS,
  CATEGORY_PATTERNS,
} from "./categoryMappings.js";
export {
  ICON_OPTIONS_BY_CATEGORY,
  DEFAULT_ICON_OPTIONS,
  getBillIconOptions,
} from "./iconOptions.js";
export {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getIconByName,
  getIconName,
  getIconNameForStorage,
} from "./iconUtils.js";

// Re-import functions for default export
import {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getIconByName,
  getIconName,
  getIconNameForStorage,
} from "./iconUtils.js";
import { getBillIconOptions } from "./iconOptions.js";

// Default export for backward compatibility
export default {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getBillIconOptions,
  getIconName,
  getIconByName,
  getIconNameForStorage,
};
