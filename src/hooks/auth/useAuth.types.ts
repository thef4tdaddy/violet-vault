import type { SessionData } from "@/contexts/authConstants";
import type { UserData as GlobalUserData } from "@/types/auth";

export type UserData = GlobalUserData;

export interface LoginVariables {
  password: string;
  userData?: UserData;
  overrideBudgetId?: string;
  overrideSalt?: number[];
  overrideEncryptedData?: string;
  overrideIv?: number[];
}

export interface LoginResult {
  success: boolean;
  user?: UserData;
  sessionData?: SessionData;
  isNewUser?: boolean;
  error?: string;
  data?: Record<string, unknown>;
  suggestion?: string;
  code?: string;
  canCreateNew?: boolean;
}

export interface LogoutResult {
  success: boolean;
}

export interface JoinBudgetVariables {
  budgetId: string;
  password: string;
  userInfo: UserData;
  sharedBy: string;
  shareCode?: string;
}

export interface UpdateProfileInput {
  userName?: string;
  userColor?: string;
  budgetId?: string;
  [key: string]: unknown;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
  profile?: UpdateProfileInput;
}
