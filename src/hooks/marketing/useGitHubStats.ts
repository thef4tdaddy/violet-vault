import { useQuery } from "@tanstack/react-query";

interface GitHubStats {
  stargazers_count: number;
  forks_count: number;
}

const fetchGitHubStats = async (): Promise<GitHubStats> => {
  const res = await fetch("https://api.github.com/repos/thef4tdaddy/violet-vault");
  if (!res.ok) {
    throw new Error("Failed to fetch GitHub stats");
  }
  return res.json();
};

export const useGitHubStats = () => {
  return useQuery({
    queryKey: ["github-stats"],
    queryFn: fetchGitHubStats,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: false,
  });
};
