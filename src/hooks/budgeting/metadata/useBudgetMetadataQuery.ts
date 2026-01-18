import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/core/common/queryClient";
import { getBudgetMetadata, setBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

interface BudgetMetadata {
  id: string;
  unassignedCash?: number;
  actualBalance?: number;
  isActualBalanceManual?: boolean;
  biweeklyAllocation?: number;
  supplementalAccounts?: Array<unknown>;
  lastModified: number;
  [key: string]: unknown;
}

export const useBudgetMetadataQuery = () => {
  const {
    data: metadata = {} as BudgetMetadata,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.budgetMetadata,
    queryFn: async (): Promise<BudgetMetadata> => {
      logger.debug("TanStack Query: Fetching budget metadata from Dexie");
      let result = await getBudgetMetadata();

      // Initialize metadata record if it doesn't exist (new users or clean installs)
      if (!result) {
        logger.debug("TanStack Query: No metadata found, initializing with defaults");
        const defaultMetadata: BudgetMetadata = {
          id: "metadata",
          unassignedCash: 0,
          actualBalance: 0,
          isActualBalanceManual: false,
          biweeklyAllocation: 0,
          supplementalAccounts: [],
          lastModified: Date.now(),
        };

        await setBudgetMetadata(defaultMetadata);
        result = defaultMetadata;

        logger.debug("TanStack Query: Budget metadata initialized with defaults", defaultMetadata);
      }

      logger.debug("TanStack Query: Budget metadata loaded", {
        unassignedCash: result?.unassignedCash || 0,
        actualBalance: result?.actualBalance || 0,
        hasData: !!result,
        wasInitialized: !result,
      });

      return result as BudgetMetadata;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Extract specific values with defaults
  const unassignedCash = metadata.unassignedCash || 0;
  const actualBalance = metadata.actualBalance || 0;
  const isActualBalanceManual = metadata.isActualBalanceManual || false;
  const biweeklyAllocation = metadata.biweeklyAllocation || 0;
  const supplementalAccounts = metadata.supplementalAccounts || [];

  return {
    metadata,
    unassignedCash,
    actualBalance,
    isActualBalanceManual,
    biweeklyAllocation,
    supplementalAccounts,
    isLoading,
    error,
    refetch,
  };
};
