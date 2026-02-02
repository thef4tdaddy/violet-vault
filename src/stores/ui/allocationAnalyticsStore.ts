import { create } from "zustand";
import { persist } from "zustand/middleware";
import logger from "@/utils/core/common/logger";

/**
 * Analytics tier types
 */
export type AnalyticsTier = "offline" | "private-backend" | "cloud-sync";

/**
 * Analytics tier metadata for UI display
 */
export interface AnalyticsTierInfo {
  id: AnalyticsTier;
  title: string;
  description: string;
  privacyLevel: "Maximum" | "High" | "Standard";
  bundleSize: string;
  features: string[];
  icon: string;
  disabled: boolean;
  comingSoon?: boolean;
}

/**
 * Store state interface
 */
interface AllocationAnalyticsStore {
  analyticsTier: AnalyticsTier;
  setAnalyticsTier: (tier: AnalyticsTier) => void;
}

/**
 * Allocation Analytics Store
 * Manages analytics tier selection with localStorage persistence
 *
 * Architecture:
 * - UI state only (follows Zustand rules)
 * - Persisted to localStorage
 * - Default: 'offline' for maximum privacy
 */
export const useAllocationAnalyticsStore = create<AllocationAnalyticsStore>()(
  persist(
    (set) => ({
      // State
      analyticsTier: "offline",

      // Actions
      setAnalyticsTier: (tier: AnalyticsTier) => {
        logger.info("Analytics tier changed", { tier });
        set({ analyticsTier: tier });
      },
    }),
    {
      name: "allocation-analytics-storage",
      version: 1,
    }
  )
);

/**
 * Analytics tier configurations
 * Used for rendering UI cards and tier selection
 */
export const ANALYTICS_TIERS: AnalyticsTierInfo[] = [
  {
    id: "offline",
    title: "100% Offline",
    description: "All calculations run locally in your browser. Nothing leaves your device.",
    privacyLevel: "Maximum",
    bundleSize: "~50 KB",
    features: [
      "Zero data transmission",
      "No server communication",
      "Complete privacy",
      "Instant calculations",
    ],
    icon: "Shield",
    disabled: false,
  },
  {
    id: "private-backend",
    title: "Private Backend",
    description: "Encrypted payload sent to Vercel for faster processing. Data is ephemeral.",
    privacyLevel: "High",
    bundleSize: "~150 KB",
    features: [
      "End-to-end encryption",
      "Ephemeral processing",
      "Faster computation",
      "No data retention",
    ],
    icon: "Lock",
    disabled: false,
  },
  {
    id: "cloud-sync",
    title: "Cloud Sync",
    description: "Full cloud synchronization for multi-device access and advanced analytics.",
    privacyLevel: "Standard",
    bundleSize: "~200 KB",
    features: [
      "Multi-device sync",
      "Advanced analytics",
      "Cloud backup",
      "Real-time updates",
    ],
    icon: "Cloud",
    disabled: true,
    comingSoon: true,
  },
];
