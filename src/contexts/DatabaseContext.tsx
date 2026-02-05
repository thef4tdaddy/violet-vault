/**
 * Database Provider Context
 *
 * Provides database instance to the application
 * Automatically switches between:
 * - Persistent storage (normal mode)
 * - In-memory storage (demo mode)
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { VioletVaultDB, budgetDb } from "@/db/budgetDb";
import { createInMemoryDB } from "@/db/inMemoryDb";
import { getDemoModeConfig } from "@/utils/platform/demo/demoModeDetection";
import logger from "@/utils/core/common/logger";

interface DatabaseContextValue {
  db: VioletVaultDB;
  isDemoMode: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

/**
 * Database Provider Component
 * Manages database initialization and provides db instance to children
 */
export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
  const [db, setDb] = useState<VioletVaultDB>(budgetDb);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const demoConfig = getDemoModeConfig();

  useEffect(() => {
    const initializeDatabase = async () => {
      let currentDb: VioletVaultDB = budgetDb;
      try {
        setIsLoading(true);

        if (demoConfig.isDemoMode) {
          logger.info("🎭 Initializing in Demo Mode");

          // Create in-memory database
          const inMemoryDb = createInMemoryDB();
          currentDb = inMemoryDb;

          // CRITICAL: Expose window.budgetDb BEFORE auth flow completes
          // This prevents race condition where setAuthenticated tries to set budgetId
          // but window.budgetDb hasn't been exposed yet
          if (typeof window !== "undefined") {
            (window as any).budgetDb = inMemoryDb;
            logger.info("✓ Exposed in-memory database to window.budgetDb");
          }

          // Seed with demo data
          const { initializeDemoDatabase } = await import("@/services/demo/demoDataService");
          await initializeDemoDatabase(inMemoryDb);

          setDb(inMemoryDb);
        } else {
          logger.info("📚 Using persistent database");
          // Expose persistent database to window
          if (typeof window !== "undefined") {
            (window as any).budgetDb = budgetDb;
          }
          setDb(budgetDb);
        }

        setIsInitialized(true);
      } catch (error) {
        logger.error("Failed to initialize database", error);
        // Fallback to persistent database
        setDb(budgetDb);
        // Expose fallback database to window
        if (typeof window !== "undefined") {
          (window as any).budgetDb = budgetDb;
        }
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, [demoConfig.isDemoMode]);

  const value: DatabaseContextValue = {
    db,
    isDemoMode: demoConfig.isDemoMode,
    isInitialized,
    isLoading,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

/**
 * Hook to access the database instance
 */
export const useDatabase = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);

  if (context === undefined) {
    throw new Error("useDatabase must be used within DatabaseProvider");
  }

  return context;
};

/**
 * Hook to get the current database instance
 * Shorthand for useDatabase().db
 */
export const useDb = (): VioletVaultDB => {
  const { db } = useDatabase();
  return db;
};
