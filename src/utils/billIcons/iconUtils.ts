// Core icon utility functions
import { FileText } from "../icons";
import { ALL_ICONS } from "./iconDefinitions.ts";
import { BILL_PROVIDER_ICONS } from "./providerMappings.ts";
import { CATEGORY_FALLBACK_ICONS, CATEGORY_PATTERNS } from "./categoryMappings.ts";

/**
 * Get appropriate icon based on provider name, description, and category
 */
export const getBillIcon = (provider = "", description = "", category = "") => {
  const searchText = `${provider} ${description}`.toLowerCase().trim();

  // First, try exact provider matching
  for (const [providerKey, icon] of Object.entries(BILL_PROVIDER_ICONS)) {
    if (searchText.includes(providerKey)) {
      return icon;
    }
  }

  // Fall back to category-based icon
  const normalizedCategory = category.toLowerCase().trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryIcon = (CATEGORY_FALLBACK_ICONS as Record<string, any>)[normalizedCategory];

  return categoryIcon || FileText; // Default fallback
};

/**
 * Suggest category and icon based on provider and description
 */
export const suggestBillCategoryAndIcon = (provider = "", description = "") => {
  const searchText = `${provider} ${description}`.toLowerCase().trim();

  // Check each category's patterns
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, "i");
      if (regex.test(searchText)) {
        return {
          category,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          icon: (CATEGORY_FALLBACK_ICONS as Record<string, any>)[category] || FileText,
          iconName: getIconName(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (CATEGORY_FALLBACK_ICONS as Record<string, any>)[category] || FileText
          ),
          confidence: 0.8, // High confidence for pattern match
        };
      }
    }
  }

  // No pattern match found - return default
  return {
    category: "other",
    icon: FileText,
    iconName: "FileText",
    confidence: 0.1, // Low confidence - just a fallback
  };
};

/**
 * Get icon component from icon name string
 */
export const getIconByName = (iconName: string) => {
  if (!iconName || typeof iconName !== "string") {
    return FileText; // Default fallback
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ALL_ICONS as Record<string, any>)[iconName] || FileText;
};

/**
 * Get icon name from component (reverse lookup)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getIconName = (IconComponent: any) => {
  if (!IconComponent) return "FileText";

  // Find the name by comparing the component
  for (const [name, component] of Object.entries(ALL_ICONS)) {
    if (component === IconComponent) {
      return name;
    }
  }

  return "FileText"; // Default fallback
};

/**
 * Get icon name for storage (serialization)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getIconNameForStorage = (IconComponent: any) => {
  if (!IconComponent) return "FileText";
  return IconComponent.displayName || getIconName(IconComponent) || "FileText";
};
