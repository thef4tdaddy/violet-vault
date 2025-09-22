// Auth hooks exports

// Legacy hooks (gradually being replaced)
export { useAuthenticationManager } from "./useAuthenticationManager";
export { default as useAuthFlow } from "./useAuthFlow";
export { useSecurityManager } from "./useSecurityManager";

// New TanStack Query + Context based auth (Epic #665)
export {
  useLoginMutation,
  useJoinBudgetMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  usePasswordValidation,
  authQueryKeys,
} from "./useAuthQueries";

// Unified auth manager (preferred interface)
export { useAuthManager } from "./useAuthManager";
