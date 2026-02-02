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
import { initializeDemoDatabase } from "@/services/demo/demoDataService";
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
      try {
        setIsLoading(true);

        if (demoConfig.isDemoMode) {
          logger.info("🎭 Initializing in Demo Mode");

          // Create in-memory database
          const inMemoryDb = createInMemoryDB();

          // Seed with demo data
          await initializeDemoDatabase(inMemoryDb);

          setDb(inMemoryDb);
        } else {
          logger.info("📚 Using persistent database");
          setDb(budgetDb);
        }

        setIsInitialized(true);
      } catch (error) {
        logger.error("Failed to initialize database", error);
        // Fallback to persistent database
        setDb(budgetDb);
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
