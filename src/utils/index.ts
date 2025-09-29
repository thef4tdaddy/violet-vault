/**
 * Centralized utilities export
 * TypeScript conversion - main utilities entry point
 */

// Icon utilities - primary export for app-wide icon usage
export {
  default as Icons,
  getIcon,
  renderIcon,
  ICON_REGISTRY,
} from "./icons/index.js";
export * as IconUtils from "./icons/index.js";

// Performance utilities
export * from "./performanceUtils";

// Type definitions for commonly used utility types
export type { 
  PerformanceScore, 
  AlertType, 
  RecommendationType, 
  IconConfig 
} from "./performanceUtils";

// Other utilities can be added here as needed
