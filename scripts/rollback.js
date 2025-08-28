#!/usr/bin/env node

/**
 * VioletVault Rollback Script
 *
 * Handles rollback procedures in case of deployment issues
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..");

class RollbackManager {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    this.backupDir = path.join(projectRoot, "backups");
    this.rollbackDir = path.join(projectRoot, "rollbacks");
  }

  async rollback(target) {
    console.log("🔄 VioletVault Rollback Manager");
    console.log("===============================");
    console.log(`Target: ${target}`);
    console.log(`Timestamp: ${this.timestamp}\n`);

    try {
      switch (target) {
        case "commit":
          await this.rollbackToCommit();
          break;
        case "tag":
          await this.rollbackToTag();
          break;
        case "backup":
          await this.rollbackFromBackup();
          break;
        default:
          throw new Error(`Unknown rollback target: ${target}`);
      }

      console.log("\n✅ Rollback completed successfully!");
    } catch (error) {
      console.error("\n❌ Rollback failed:", error.message);
      process.exit(1);
    }
  }

  async rollbackToCommit() {
    console.log("🔍 Rolling back to previous commit...");

    // Get current branch
    const { stdout: branch } = await execAsync("git branch --show-current");
    const currentBranch = branch.trim();

    if (currentBranch !== "main") {
      throw new Error("Commit rollback should only be done on main branch");
    }

    // Get last few commits
    const { stdout: commits } = await execAsync("git log --oneline -5");
    console.log("\nRecent commits:");
    console.log(commits);

    // Get the previous commit hash
    const { stdout: lastCommit } = await execAsync('git log --format="%H" -n 2');
    const commitHashes = lastCommit.trim().split("\n");
    const previousCommit = commitHashes[1];

    console.log(`\nRolling back to: ${previousCommit}`);

    // Create backup of current state
    await this.createRollbackBackup();

    // Perform rollback
    await execAsync(`git reset --hard ${previousCommit}`);

    console.log("✅ Rollback to previous commit completed");
    console.log("⚠️  Remember to redeploy after rollback");
  }

  async rollbackToTag() {
    console.log("🏷️  Rolling back to tagged version...");

    // List available tags
    try {
      const { stdout: tags } = await execAsync("git tag -l --sort=-version:refname");
      const tagList = tags
        .trim()
        .split("\n")
        .filter((tag) => tag);

      if (tagList.length === 0) {
        throw new Error("No tags found. Create release tags for easier rollback.");
      }

      console.log("\nAvailable tags:");
      tagList.slice(0, 10).forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag}`);
      });

      // For now, rollback to latest tag
      const latestTag = tagList[0];
      console.log(`\nRolling back to latest tag: ${latestTag}`);

      // Create backup of current state
      await this.createRollbackBackup();

      // Checkout the tag
      await execAsync(`git checkout ${latestTag}`);

      console.log("✅ Rollback to tag completed");
      console.log("⚠️  You are now in detached HEAD state");
      console.log("⚠️  Create a new branch or merge changes as needed");
    } catch (error) {
      throw new Error(`Tag rollback failed: ${error.message}`);
    }
  }

  async rollbackFromBackup() {
    console.log("💾 Rolling back from data backup...");

    // Ensure rollback directory exists
    if (!fs.existsSync(this.rollbackDir)) {
      fs.mkdirSync(this.rollbackDir, { recursive: true });
    }

    // List available backups
    if (!fs.existsSync(this.backupDir)) {
      throw new Error("No backup directory found. Run backup script first.");
    }

    const backups = fs
      .readdirSync(this.backupDir)
      .filter((file) => file.endsWith(".json") || file.includes("backup-"))
      .sort()
      .reverse();

    if (backups.length === 0) {
      throw new Error("No backups found. Cannot perform data rollback.");
    }

    console.log("\nAvailable backups:");
    backups.slice(0, 5).forEach((backup, index) => {
      const stats = fs.statSync(path.join(this.backupDir, backup));
      console.log(`  ${index + 1}. ${backup} (${stats.mtime.toLocaleDateString()})`);
    });

    console.log("\n📋 MANUAL DATA ROLLBACK REQUIRED:");
    console.log("1. Choose a backup from the list above");
    console.log("2. Open VioletVault in browser");
    console.log("3. Open Developer Tools (F12)");
    console.log("4. Go to Application/Storage tab");
    console.log("5. Clear current localStorage data");
    console.log("6. Import backup data to localStorage");
    console.log("7. Refresh the application");

    console.log("✅ Backup rollback instructions provided");
  }

  async createRollbackBackup() {
    console.log("💾 Creating rollback backup...");

    // Ensure rollback directory exists
    if (!fs.existsSync(this.rollbackDir)) {
      fs.mkdirSync(this.rollbackDir, { recursive: true });
    }

    // Get current commit info
    const { stdout: commitInfo } = await execAsync('git log --format="%H %s" -n 1');
    const currentCommit = commitInfo.trim();

    // Create rollback info file
    const rollbackInfo = {
      timestamp: this.timestamp,
      currentCommit: currentCommit,
      branch: (await execAsync("git branch --show-current")).stdout.trim(),
      rollbackReason: "Automatic backup before rollback",
      canRestoreTo: currentCommit.split(" ")[0],
    };

    const rollbackFile = path.join(this.rollbackDir, `rollback-${this.timestamp}.json`);
    fs.writeFileSync(rollbackFile, JSON.stringify(rollbackInfo, null, 2));

    console.log(`✅ Rollback backup created: ${rollbackFile}`);
  }

  async listRollbackOptions() {
    console.log("📋 Available Rollback Options");
    console.log("==============================\n");

    // Git commits
    console.log("🔗 Recent Commits:");
    try {
      const { stdout: commits } = await execAsync("git log --oneline -5");
      console.log(commits);
    } catch {
      console.log("  No git history available");
    }

    // Git tags
    console.log("\n🏷️  Recent Tags:");
    try {
      const { stdout: tags } = await execAsync("git tag -l --sort=-version:refname");
      const tagList = tags
        .trim()
        .split("\n")
        .filter((tag) => tag);
      if (tagList.length > 0) {
        tagList.slice(0, 3).forEach((tag) => console.log(`  ${tag}`));
      } else {
        console.log("  No tags found");
      }
    } catch {
      console.log("  No tags available");
    }

    // Data backups
    console.log("\n💾 Data Backups:");
    if (fs.existsSync(this.backupDir)) {
      const backups = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.includes("backup-"))
        .sort()
        .reverse();

      if (backups.length > 0) {
        backups.slice(0, 3).forEach((backup) => {
          const stats = fs.statSync(path.join(this.backupDir, backup));
          console.log(`  ${backup} (${stats.mtime.toLocaleDateString()})`);
        });
      } else {
        console.log("  No data backups found");
      }
    } else {
      console.log("  No backup directory found");
    }

    // Previous rollbacks
    console.log("\n🔄 Previous Rollbacks:");
    if (fs.existsSync(this.rollbackDir)) {
      const rollbacks = fs
        .readdirSync(this.rollbackDir)
        .filter((file) => file.startsWith("rollback-"))
        .sort()
        .reverse();

      if (rollbacks.length > 0) {
        rollbacks.slice(0, 3).forEach((rollback) => {
          try {
            const rollbackData = JSON.parse(
              fs.readFileSync(path.join(this.rollbackDir, rollback), "utf8")
            );
            console.log(
              `  ${rollback} (${rollbackData.currentCommit.split(" ").slice(1).join(" ")})`
            );
          } catch {
            console.log(`  ${rollback} (details unavailable)`);
          }
        });
      } else {
        console.log("  No previous rollbacks found");
      }
    } else {
      console.log("  No rollback history found");
    }
  }
}

// CLI Interface
const action = process.argv[2];
const rollbackManager = new RollbackManager();

if (!action) {
  console.log("🔄 VioletVault Rollback Manager");
  console.log("================================");
  console.log("\nUsage:");
  console.log("  node scripts/rollback.js list     # List rollback options");
  console.log("  node scripts/rollback.js commit   # Rollback to previous commit");
  console.log("  node scripts/rollback.js tag      # Rollback to latest tag");
  console.log("  node scripts/rollback.js backup   # Rollback from data backup");
  process.exit(0);
}

if (action === "list") {
  rollbackManager.listRollbackOptions().catch(console.error);
} else {
  rollbackManager.rollback(action).catch(console.error);
}
