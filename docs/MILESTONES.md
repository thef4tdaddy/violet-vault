# VioletVault Milestones & Release Planning

## 📋 Overview

This document tracks VioletVault's milestone-based development using **weekly release cycles** with semantic versioning handled by **release-please**.

## 🎯 Versioning Strategy

### Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR (X)**: Breaking changes, major redesigns
- **MINOR (Y)**: New features, backward-compatible (Weekly releases)
- **PATCH (Z)**: Bug fixes, small improvements (Hotfixes)

### Release Please Automation

- `feat:` commits → **MINOR** version bump
- `fix:` commits → **PATCH** version bump
- `feat!:` or `BREAKING CHANGE:` → **MAJOR** version bump

---

## 🚀 Active Milestones

### v1.7.0 - Cash Management (Week of Aug 5)

**Due: August 11, 2025**
**Status: In Progress**

#### ✅ Already Completed

- **#106** - Compact Bill Layout (**COMPLETED** in PR #110)
  - **Status**: Merged and deployed
  - **Description**: Responsive grid layout for bills (1/2/3 columns)

#### In Progress Branches

- **#96** - Layout Architecture Refactor
  - **Branch**: `refactor/layout-ui-architecture-2025-08-04`
  - **Status**: Contains error tracking migration and ESLint cleanup
  - **Last Commit**: "feat: migrate error tracking from Sentry to Highlight.io"

#### New Features to Build

- **#111** - Unassigned Cash Distribution Modal
  - **Description**: Click-to-distribute modal for unassigned cash
  - **Includes**: Manual/auto distribution, negative balance handling
- **#114** - Negative Virtual Balance Support
  - **Description**: Handle and display negative balances properly
  - **Includes**: Visual warnings, recovery suggestions
- **#112** - Collapsible Smart Suggestions
  - **Description**: Collapse/expand Smart Envelope Suggestions panel
  - **Includes**: Persistent state, smooth animations

#### Commit Strategy for v1.7.0

```bash
# When completing features
git commit -m "feat: add compact bill layout with responsive grid"
git commit -m "feat: add unassigned cash distribution modal"
git commit -m "feat: support negative virtual balance display"
git commit -m "feat: add collapsible smart envelope suggestions"
git commit -m "refactor: improve layout architecture and error tracking"
```

---

## 📅 Planned Future Milestones

### v1.8.0 - Balance & UI Polish (Week of Aug 12)

**Due: August 18, 2025**
**Planned Features**:

- **#113** - Manual Virtual Balance Override
- Performance improvements
- Mobile UX enhancements
- Testing framework setup

### v1.9.0 - Debt Tracking Foundation (Week of Aug 19)

**Due: August 25, 2025**
**Planned Features**:

- **#115** - Comprehensive Debt Tracking System (Phase 1)
- Basic debt entry and tracking
- Interest calculations
- Payment history

### v1.10.0 - OCR System Phase 1 (Week of Aug 26)

**Due: September 1, 2025**
**Planned Features**:

- **#116** - Universal OCR System (Foundation)
- Receipt scanning basics
- Document processing pipeline
- Integration with transactions

---

## 🏗️ Long-Term Milestone Structure

### Current Major Milestones (Legacy - Being Reorganized)

- **v1.7.0 – Vault Core Features** (13 open, 4 closed) → Breaking into weekly releases
- **v1.8.0 – Security & Compliance** (9 open, 1 closed) → Future major milestone
- **v1.9.0 – Visualization & Reports** (6 open, 0 closed) → Future major milestone
- **v2.0.0 – Mobile & PWA** (8 open, 0 closed) → Major version milestone
- **vFuture – Backlog & Exploration** (3 open, 0 closed) → Research items

### Major Version Planning (v2.0.0)

**Breaking Changes Planned**:

- New authentication system
- Mobile-first redesign
- PWA capabilities
- API restructuring

---

## 📊 Weekly Milestone Guidelines

### Milestone Rules

- **3-5 issues maximum** per weekly milestone
- **1 week duration** (Sunday deadline)
- **Thematic focus** (cash management, UI polish, etc.)
- **Clear deliverables** that can be completed in a week

### Issue Assignment Strategy

1. **Include ready branches first** (existing PRs)
2. **Group related features** thematically
3. **Balance complexity** across issues
4. **Consider dependencies** between features

### Release Process

1. **Complete milestone issues**
2. **Use conventional commits**
3. **Merge to main branch**
4. **Release-please creates release automatically**
5. **Close milestone and create next week's**

---

## 🔄 Branch Management

### Current Active Branches

- `feature/compact-bill-layout` → Ready for v1.7.0
- `refactor/layout-ui-architecture-2025-08-04` → In progress for v1.7.0
- `fix/combined-bill-and-ui-fixes` → Already merged (#110)

### Branch Naming Convention

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/area-being-refactored` - Code refactoring
- `docs/documentation-update` - Documentation changes

---

## 📈 Success Metrics

### Weekly Release Goals

- **Consistent delivery** of 3-5 features per week
- **High-quality releases** with minimal hotfixes needed
- **User feedback incorporation** within 1-2 weeks
- **Technical debt reduction** included in each milestone

### Quality Gates

- All PRs require code review
- ESLint warnings kept under control
- Build passes without errors
- New features include basic testing

---

## 📝 Notes & Decisions

### August 2, 2025 Planning Session

- Restructured from large quarterly milestones to weekly releases
- Identified existing branches that need to be included in v1.7.0
- Established release-please compatibility with milestone planning
- Prioritized cash management features as first weekly theme

### Key Decisions Made

1. **Weekly MINOR releases** instead of quarterly
2. **Theme-based grouping** of features per week
3. **Include existing branches** in current milestone
4. **Let release-please handle versioning** automatically

---

## 🎯 Next Actions

### Immediate (This Week)

- [ ] Merge PR #108 (Compact Bill Layout)
- [ ] Complete architecture refactor branch
- [ ] Start building cash distribution modal (#111)
- [ ] Implement negative balance support (#114)
- [ ] Add collapsible suggestions (#112)

### Next Week Setup

- [ ] Create v1.8.0 milestone with due date
- [ ] Assign balance/UI polish issues
- [ ] Plan testing framework integration
- [ ] Review and triage unassigned issues

---

_Last Updated: August 2, 2025_
_Next Review: August 11, 2025 (v1.7.0 release)_
