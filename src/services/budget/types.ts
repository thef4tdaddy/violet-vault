export interface CommitOptions {
  entityType: string;
  entityId?: string | null;
  changeType: "create" | "update" | "delete" | "modify";
  description: string;
  beforeData: unknown;
  afterData: unknown;
  author?: string;
  deviceFingerprint?: string | null;
  parentHash?: string | null;
}

export interface UnassignedCashOptions {
  previousAmount: number;
  newAmount: number;
  author?: string;
  source?: string;
}

export interface ActualBalanceOptions {
  previousBalance: number;
  newBalance: number;
  isManual?: boolean;
  author?: string;
}

export interface DebtChangeOptions {
  debtId: string;
  changeType: "add" | "modify" | "delete";
  previousData: Record<string, unknown>;
  newData: Record<string, unknown>;
  author?: string;
}

export interface BranchOptions {
  fromCommitHash: string;
  branchName: string;
  description?: string;
  author?: string;
}

export interface TagOptions {
  commitHash: string;
  tagName: string;
  description?: string;
  tagType?: "release" | "milestone" | "backup";
  author?: string;
}

export interface ChangePatterns {
  totalChanges: number;
  changesByType: Record<string, number>;
  changesByEntity: Record<string, number>;
  authorActivity: Record<string, number>;
  dailyActivity: Record<string, number>;
  mostActiveHour: string | null;
  averageChangesPerDay: number;
}
