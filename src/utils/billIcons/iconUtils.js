// Core icon utility functions
import { FileText } from "lucide-react";
import { ALL_ICONS } from "./iconDefinitions.js";
import { BILL_PROVIDER_ICONS } from "./providerMappings.js";
import {
  CATEGORY_FALLBACK_ICONS,
  CATEGORY_PATTERNS,
} from "./categoryMappings.js";

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
  const categoryIcon = CATEGORY_FALLBACK_ICONS[normalizedCategory];

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
          icon: CATEGORY_FALLBACK_ICONS[category] || FileText,
          iconName: getIconName(CATEGORY_FALLBACK_ICONS[category] || FileText),
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
export const getIconByName = (iconName) => {
  if (!iconName || typeof iconName !== "string") {
    return FileText; // Default fallback
  }
  return ALL_ICONS[iconName] || FileText;
};

/**
 * Get icon name from component (reverse lookup)
 */
export const getIconName = (IconComponent) => {
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
export const getIconNameForStorage = (IconComponent) => {
  if (!IconComponent) return "FileText";
  return IconComponent.displayName || getIconName(IconComponent) || "FileText";
};
