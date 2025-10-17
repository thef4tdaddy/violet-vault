/**
 * Auth query keys
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
  validation: (password: string) => [...authQueryKeys.all, "validation", password] as const,
};
