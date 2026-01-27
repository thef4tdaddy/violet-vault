import Dexie, { type Table } from "dexie";

export interface OfflineUpload {
  id: string; // uuid
  file: Blob; // The receipt image
  filename: string;
  timestamp: number;
  status: "pending" | "uploading" | "failed";
  retryCount: number;
}

export class OfflineDatabase extends Dexie {
  uploads!: Table<OfflineUpload>;

  constructor() {
    super("VioletVaultOfflineDB");
    this.version(1).stores({
      uploads: "id, timestamp, status", // Primary key and indexes
    });
  }
}

export const db = new OfflineDatabase();
