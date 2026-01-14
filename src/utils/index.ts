/**
 * Centralized utilities export
 */

// Icon utilities - primary export for app-wide icon usage
export { default as Icons, getIcon, renderIcon, ICON_REGISTRY } from "./ui/icons/index.ts";
export * as IconUtils from "./ui/icons/index.ts";

// Core utilities
export * as Core from "./core";

// Domain utilities
export * as Domain from "./domain";

// Platform utilities
export * as Platform from "./platform";

// Feature utilities
export * as Features from "./features";

// UI utilities
export * as UI from "./ui";

// Data utilities
export * as Data from "./data";

// Developer utilities
export * as Dev from "./dev";
