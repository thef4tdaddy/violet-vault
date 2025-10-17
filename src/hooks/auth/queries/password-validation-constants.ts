/**
 * Password validation query keys
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

export const passwordValidationQueryKeys = {
  validation: (password: string) => ["auth", "validation", password],
};
