# Changelog

## [2.0.0] - 2026-03-01 (Target)

### Breaking Changes

**v2.0 is a complete rewrite with a fresh start - no data migration from v1.x**

- ⚠️ **No Migration Support**: Users must start with a clean slate
- **Unified Data Model**: Bills, debts, savings goals, and paycheck history unified into envelopes and transactions
- **Database Schema v11**: New baseline schema for v2.0
- **Removed Legacy Code**: All v1.x migration code removed

### Removed

- Legacy migration code from localStorage (`budget-store` → `violet-vault-store`)
- `runMigrationIfNeeded()` method from UI store
- Migration helper functions: `transformOldData`, `seedDexieWithMigratedData`, `migrateOldData`
- Support for legacy database schemas (v1-v10)

### Added

- Fresh start documentation in README.md
- v2.0 baseline schema (version 11) with unified tables

### Recommendation

Users should export v1.x data before upgrading if they need historical records.

---

## [2.0.1-prerelease.2618] - 2025-11-29

### Pre-release

- Pre-release for develop branch (commit count: 2618)
