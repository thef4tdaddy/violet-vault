import logger from "../common/logger";

/**
 * Patch Notes Manager
 * Handles fetching and parsing patch notes from CHANGELOG.md
 */

class PatchNotesManager {
  changelogCache: string | null;
  cacheTimestamp: number | null;
  cacheTTL: number;

  constructor() {
    this.changelogCache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = 30 * 60 * 1000; // 30 minutes cache
  }

  /**
   * Fetch the full CHANGELOG.md content
   */
  async fetchChangelog() {
    // Check cache first
    const now = Date.now();
    if (this.changelogCache && this.cacheTimestamp && now - this.cacheTimestamp < this.cacheTTL) {
      logger.debug("Using cached changelog");
      return this.changelogCache;
    }

    try {
      // Try to fetch CHANGELOG.md from the same origin
      const response = await fetch("/CHANGELOG.md", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch changelog: ${response.status}`);
      }

      const content = await response.text();

      // Cache the content
      this.changelogCache = content;
      this.cacheTimestamp = now;

      logger.debug("Fetched and cached changelog", { size: content.length });
      return content;
    } catch (error) {
      logger.warn("Failed to fetch changelog:", error as Record<string, unknown>);

      // Return fallback content if fetch fails
      return this.getFallbackChangelog();
    }
  }

  /**
   * Extract patch notes for a specific version
   */
  async getPatchNotesForVersion(version: string): Promise<Record<string, unknown>> {
    try {
      const changelog = await this.fetchChangelog();
      return this.extractVersionNotes(changelog, version);
    } catch (error) {
      logger.error("Failed to get patch notes for version", error);
      return this.getFallbackPatchNotes(version);
    }
  }

  /**
   * Extract notes for a version from changelog content
   */
  extractVersionNotes(changelog: string, version: string): Record<string, unknown> {
    // Look for version header (e.g., "## [1.9.0]" or "# v1.9.0")
    const versionRegex = new RegExp(
      `(?:^|\\n)(?:##?\\s*(?:\\[?v?${version.replace(/\./g, "\\.")}\\]?|${version.replace(/\./g, "\\.")}))(?:\\s*-[^\\n]*)?(?:\\n|$)`,
      "i"
    );

    const match = changelog.match(versionRegex);
    if (!match || match.index === undefined) {
      logger.warn(`No changelog entry found for version ${version}`);
      return this.getFallbackPatchNotes(version);
    }

    // Find the start of this version's content
    const startIndex = match.index + match[0].length;

    // Find the next version header or end of file
    const remainingContent = changelog.slice(startIndex);
    const nextVersionMatch = remainingContent.match(/^##?\s*(?:\[?v?\d+\.\d+\.\d+|\d+\.\d+\.\d+)/m);

    let versionContent;
    if (nextVersionMatch) {
      versionContent = remainingContent.slice(0, nextVersionMatch.index).trim();
    } else {
      versionContent = remainingContent.trim();
    }

    // Parse the content into structured data
    return this.parseVersionContent(versionContent, version);
  }

  /**
   * Parse version content into structured format
   */
  parseVersionContent(content: string, version: string): Record<string, unknown> {
    const lines = content.split("\n").filter((line: string) => line.trim());

    let summary = "";
    const features = [];
    const fixes = [];
    const breaking = [];
    const other = [];

    let currentSection = "summary";

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) continue;

      // Detect section headers
      if (trimmedLine.match(/^###?\s*(added|features?)/i)) {
        currentSection = "features";
        continue;
      } else if (trimmedLine.match(/^###?\s*(fixed?|bug\s*fixes?)/i)) {
        currentSection = "fixes";
        continue;
      } else if (trimmedLine.match(/^###?\s*(breaking|breaking\s*changes?)/i)) {
        currentSection = "breaking";
        continue;
      } else if (trimmedLine.match(/^###?\s*(changed|improvements?|enhanced?)/i)) {
        currentSection = "other";
        continue;
      }

      // Parse bullet points
      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        const item = trimmedLine.substring(2).trim();

        switch (currentSection) {
          case "features":
            features.push(item);
            break;
          case "fixes":
            fixes.push(item);
            break;
          case "breaking":
            breaking.push(item);
            break;
          case "other":
            other.push(item);
            break;
          default:
            // If no specific section, try to categorize automatically
            if (item.toLowerCase().includes("fix") || item.toLowerCase().includes("bug")) {
              fixes.push(item);
            } else if (item.toLowerCase().includes("feat") || item.toLowerCase().includes("add")) {
              features.push(item);
            } else {
              other.push(item);
            }
        }
      } else if (currentSection === "summary" && !trimmedLine.startsWith("#")) {
        // Collect summary text (non-header, non-bullet)
        summary += (summary ? " " : "") + trimmedLine;
      }
    }

    // Generate a summary if none was found
    if (!summary && (features.length > 0 || fixes.length > 0 || other.length > 0)) {
      const totalChanges = features.length + fixes.length + other.length;
      summary = `Version ${version} includes ${totalChanges} improvements and updates.`;
    }

    return {
      version,
      summary: summary || `New features and improvements in version ${version}.`,
      features,
      fixes,
      breaking,
      other,
      hasContent: features.length > 0 || fixes.length > 0 || other.length > 0 || summary.length > 0,
    };
  }

  /**
   * Get top highlights for the popup (first 3-5 most important items)
   */
  getTopHighlights(patchNotes: Record<string, unknown>): Array<{ type: string; text: string }> {
    const highlights: Array<{ type: string; text: string }> = [];
    const breaking = (patchNotes.breaking as string[]) || [];
    const features = (patchNotes.features as string[]) || [];
    const fixes = (patchNotes.fixes as string[]) || [];
    const other = (patchNotes.other as string[]) || [];

    // Prioritize breaking changes, then features, then fixes
    if (breaking.length > 0) {
      highlights.push(
        ...breaking.slice(0, 2).map((item: string) => ({ type: "breaking", text: item }))
      );
    }

    if (highlights.length < 5 && features.length > 0) {
      const remaining = 5 - highlights.length;
      highlights.push(
        ...features.slice(0, remaining).map((item: string) => ({ type: "feature", text: item }))
      );
    }

    if (highlights.length < 5 && fixes.length > 0) {
      const remaining = 5 - highlights.length;
      highlights.push(
        ...fixes.slice(0, remaining).map((item: string) => ({ type: "fix", text: item }))
      );
    }

    if (highlights.length < 5 && other.length > 0) {
      const remaining = 5 - highlights.length;
      highlights.push(
        ...other.slice(0, remaining).map((item: string) => ({ type: "other", text: item }))
      );
    }

    return highlights;
  }

  /**
   * Get fallback patch notes when fetch fails
   */
  getFallbackPatchNotes(version: string): Record<string, unknown> {
    return {
      version,
      summary: `Version ${version} includes new features, improvements, and bug fixes.`,
      features: [
        "Enhanced user experience and interface improvements",
        "Performance optimizations and stability updates",
      ],
      fixes: ["Various bug fixes and stability improvements"],
      breaking: [],
      other: ["Updated dependencies and security enhancements"],
      hasContent: true,
      isFallback: true,
    };
  }

  /**
   * Get fallback changelog content
   */
  getFallbackChangelog() {
    return `# Changelog

## [1.9.0] - 2025-01-16
### Added
- Enhanced user experience and interface improvements
- Performance optimizations and stability updates

### Fixed
- Various bug fixes and stability improvements

### Changed
- Updated dependencies and security enhancements
`;
  }

  /**
   * Clear the changelog cache
   */
  clearCache() {
    this.changelogCache = null;
    this.cacheTimestamp = null;
    logger.debug("Cleared changelog cache");
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus() {
    const now = Date.now();
    const isValid =
      this.changelogCache && this.cacheTimestamp && now - this.cacheTimestamp < this.cacheTTL;

    return {
      hasCache: !!this.changelogCache,
      isValid,
      cacheAge: this.cacheTimestamp ? now - this.cacheTimestamp : 0,
      timeUntilExpiry:
        isValid && this.cacheTimestamp !== null ? this.cacheTTL - (now - this.cacheTimestamp) : 0,
    };
  }
}

// Create singleton instance
const patchNotesManager = new PatchNotesManager();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).patchNotesManager = patchNotesManager;
}

export default patchNotesManager;
