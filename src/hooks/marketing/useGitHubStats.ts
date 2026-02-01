import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { logger } from "@/utils/core/common/logger";

interface GitHubStats {
  stargazers_count: number;
  forks_count: number;
}

const fetchGitHubStats = async (): Promise<GitHubStats> => {
  const res = await fetch("/api/marketing/github");
  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub stats: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export const useGitHubStats = () => {
  const query = useQuery({
    queryKey: ["github-stats"],
    queryFn: fetchGitHubStats,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      logger.error("Failed to load GitHub stats", { error: query.error });
    }
  }, [query.isError, query.error]);

  return query;
};
