/**
 * Activity icon utilities
 * Extracted from ActivityFeed.jsx for better maintainability and ESLint compliance
 */
import React from "react";
import { getIcon } from "../icons";
import { ENTITY_TYPES } from "@/services/logging/activityLogger";

export interface IconInfo {
  component: React.ComponentType<{ className?: string }>;
  className: string;
}

/**
 * Get icon component and props based on action type
 */
export const getActionIconInfo = (action: string): IconInfo | null => {
  if (action.includes("created") || action.includes("added")) {
    return { component: getIcon("plus"), className: "h-4 w-4 text-green-600" };
  } else if (action.includes("updated") || action.includes("paid")) {
    return { component: getIcon("edit"), className: "h-4 w-4 text-blue-600" };
  } else if (action.includes("deleted")) {
    return { component: getIcon("trash"), className: "h-4 w-4 text-red-600" };
  }
  return null;
};

/**
 * Get icon component and props based on entity type
 */
export const getEntityIconInfo = (entityType: string): IconInfo => {
  switch (entityType) {
    case ENTITY_TYPES.ENVELOPE:
      return {
        component: getIcon("Wallet"),
        className: "h-4 w-4 text-purple-600",
      };
    case ENTITY_TYPES.TRANSACTION:
      return {
        component: getIcon("arrow-right"),
        className: "h-4 w-4 text-gray-600",
      };
    case ENTITY_TYPES.BILL:
      return {
        component: getIcon("Receipt"),
        className: "h-4 w-4 text-orange-600",
      };
    case ENTITY_TYPES.PAYCHECK:
      return {
        component: getIcon("DollarSign"),
        className: "h-4 w-4 text-emerald-600",
      };
    case ENTITY_TYPES.DEBT:
      return {
        component: getIcon("CreditCard"),
        className: "h-4 w-4 text-red-600",
      };
    case ENTITY_TYPES.SAVINGS_GOAL:
      return {
        component: getIcon("piggy-bank"),
        className: "h-4 w-4 text-blue-600",
      };
    default:
      return {
        component: getIcon("activity"),
        className: "h-4 w-4 text-gray-600",
      };
  }
};

/**
 * Get appropriate icon info for activity
 */
export const getActivityIconInfo = (action: string, entityType: string): IconInfo => {
  // First try to get action-specific icon
  const actionInfo = getActionIconInfo(action);
  if (actionInfo) return actionInfo;

  // Fall back to entity-specific icon
  return getEntityIconInfo(entityType);
};
