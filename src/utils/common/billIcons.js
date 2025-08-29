// Smart Bill Icon System - Re-export from modular structure
// This file maintained for backward compatibility

// Re-export everything from the new modular structure
export {
  ALL_ICONS,
  BILL_PROVIDER_ICONS,
  CATEGORY_FALLBACK_ICONS,
  CATEGORY_PATTERNS,
  ICON_OPTIONS_BY_CATEGORY,
  DEFAULT_ICON_OPTIONS,
  getBillIcon,
  suggestBillCategoryAndIcon,
  getIconByName,
  getIconName,
  getIconNameForStorage,
  getBillIconOptions,
} from "../billIcons/index.js";

// Default export for backward compatibility
export { default } from "../billIcons/index.js";
