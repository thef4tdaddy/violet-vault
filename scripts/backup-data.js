#!/usr/bin/env node

/**
 * VioletVault Data Backup Script
 *
 * This script creates a backup of user data stored in localStorage
 * for safety before deployments or major updates.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, "..", "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

// Ensure backups directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log("🔄 VioletVault Data Backup Utility");
console.log("=====================================");

// Note: This script provides the framework for data backup
// Actual localStorage data would need to be backed up from the browser
// This could be enhanced to integrate with browser automation tools

const backupInstructions = `
MANUAL BACKUP INSTRUCTIONS:

1. Open VioletVault in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage tab
4. Click on Local Storage -> your domain
5. Find key: "envelopeBudgetData"
6. Copy the entire value
7. Save to: backups/backup-${timestamp}.json

AUTOMATED BACKUP (Future Enhancement):
This script could be enhanced to work with:
- Browser automation (Puppeteer/Playwright)
- File system watchers
- Cloud storage integration
- Database backups (if using external DB)

CURRENT BACKUP LOCATION: ${backupDir}
`;

// Create backup instructions file
const instructionsFile = path.join(backupDir, `backup-instructions-${timestamp}.txt`);
fs.writeFileSync(instructionsFile, backupInstructions);

console.log("📝 Backup instructions created:", instructionsFile);
console.log("\n💡 IMPORTANT: Follow the manual backup instructions above");
console.log("   before performing any major updates or deployments.");

// Check for existing backups
const existingBackups = fs
  .readdirSync(backupDir)
  .filter((file) => file.startsWith("backup-") || file.endsWith(".json"))
  .sort()
  .reverse();

if (existingBackups.length > 0) {
  console.log("\n📁 Existing backups found:");
  existingBackups.slice(0, 5).forEach((backup) => {
    const stats = fs.statSync(path.join(backupDir, backup));
    console.log(`   - ${backup} (${stats.mtime.toLocaleDateString()})`);
  });

  if (existingBackups.length > 5) {
    console.log(`   ... and ${existingBackups.length - 5} more`);
  }
}

// Clean up old backups (keep last 10)
if (existingBackups.length > 10) {
  console.log("\n🧹 Cleaning up old backups...");
  const toDelete = existingBackups.slice(10);
  toDelete.forEach((backup) => {
    try {
      fs.unlinkSync(path.join(backupDir, backup));
      console.log(`   Deleted: ${backup}`);
    } catch (error) {
      console.warn(`   Failed to delete: ${backup}`, error.message);
    }
  });
}

console.log("\n✅ Backup utility completed.");
console.log("🔒 Remember: Always backup before major changes!");
