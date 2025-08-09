# VioletVault Milestones & Release Planning

## 📋 Overview

This document tracks VioletVault's milestone-based development using **bi-weekly overlapping release cycles** with semantic versioning handled by **release-please**.

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

## 🚀 Completed Milestones

### v1.7.0 - Cash Management (Week of Aug 5)

**Due: August 11, 2025**
**Status: ✅ Deployed**

#### ✅ Successfully Deployed

- **#106** - Compact Bill Layout (**COMPLETED** in PR #110)
  - **Status**: Merged and deployed
  - **Description**: Responsive grid layout for bills (1/2/3 columns)
- **#113** - Manual Virtual Balance Override (**COMPLETED** in PR #155)
  - **Status**: Merged and deployed
  - **Description**: Inline editing with click-to-edit functionality, confirmation dialogs, and business logic separation
- **#112** - Collapsible Smart Suggestions (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Collapse/expand Smart Envelope Suggestions panel with persistent state

### v1.8.0 - Cash Management (Week of Aug 12)

**Due: August 18, 2025**
**Status: ✅ COMPLETED**

#### ✅ Successfully Completed Features

**🎯 Core Cash Management Features:**
- **#114** - Full Negative Balance Support for Unassigned Cash (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Complete overspending support with visual indicators and handling logic
  - **Impact**: Users can now handle overspending scenarios gracefully
- **#111** - Unassigned Cash Distribution Modal (**COMPLETED**)
  - **Status**: Merged and deployed  
  - **Description**: Click-to-distribute modal for allocating unassigned cash to envelopes
  - **Impact**: Streamlined cash allocation workflow
- **#113** - Manual Virtual Balance Override on Dashboard (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Inline editing with click-to-edit functionality and confirmation dialogs
  - **Impact**: Better balance reconciliation capabilities

**🏷️ Envelope System Enhancements:**
- **#137** - Variable Expense Envelope Classification and Auto-funding (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Smart envelope types with automated funding logic for variable expenses
  - **Impact**: Intelligent envelope management reducing manual allocation work
- **#216** - Bill Modal Improvements (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Enhanced bill-to-envelope connection system
  - **Impact**: Better integration between bills and envelope budgeting

**🏗️ Architecture & Code Quality:**
- **#211** - Comprehensive State Management Cleanup (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Week-long refactoring focus consolidating duplicate stores/contexts
  - **Impact**: Unified Zustand architecture with cleaner state management patterns
- **#149** - Phase 2 Refactoring: Post-Feature Implementation Cleanup (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Major cleanup after feature implementations
  - **Impact**: Improved code maintainability and consistency
- **#119** - Business Logic Extraction to Custom Hooks and Providers (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Extracted business logic from MainLayout to reusable custom hooks
  - **Impact**: MainLayout reduced from 1,100+ lines to 390 lines (65% reduction)
- **#96** - Layout and Routing Architecture Refactor (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Complete ViewRenderer/MainLayout architectural overhaul
  - **Impact**: More maintainable and scalable component architecture

**🎨 UI/UX Improvements:**
- **#222** - Logo Styling Fixes for Glassmorphic Design (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Fixed logo border placement and styling for visual consistency
  - **Impact**: Improved visual design consistency
- **#221** - AuthContext Rename for Consistency (**COMPLETED**)
  - **Status**: Merged and deployed
  - **Description**: Renamed AuthContext.jsx to authStore.jsx for architectural consistency
  - **Impact**: Consistent file naming across the codebase

**📊 System Improvements:**
- **Envelope Type Filtering** - Added filtering capabilities to EnvelopeGrid
- **Standardized Categories** - Unified categories across the entire application  
- **Biweekly Payment Calculations** - Fixed and standardized payment readiness logic
- **Automated Lint Warning Tracking** - GitHub Actions integration for code quality
- **Bill-to-Envelope Connection System** - Complete integration between bills and envelopes

**🔐 Security & User Experience:**
- **#28** - Enhanced Payday Prediction with Proactive Funding Suggestions (**COMPLETED & CLOSED**)
  - **Status**: Fully implemented and deployed, issue closed
  - **Description**: Complete payday prediction system with proactive action buttons, conditional UI, and smart contextual guidance
  - **Impact**: Comprehensive payday management exceeding original requirements
- **#88** - Password Rotation Security System (**COMPLETED & CLOSED**)
  - **Status**: Fully implemented and integrated, issue closed
  - **Description**: Complete password rotation system with secure re-encryption and Zustand integration
  - **Impact**: Enhanced security with 90-day rotation reminders and automatic password aging

#### Notes on Major Scope Changes

**Originally planned for future but completed in v1.8.0:**
- **#111** - Unassigned Cash Distribution Modal (originally scheduled for v1.11.0) ✅ **COMPLETED IN v1.8.0**
- **#114** - Negative Virtual Balance Support (originally scheduled for v1.11.0) ✅ **COMPLETED IN v1.8.0**
- **#137** - Variable Envelope Classification (major new feature) ✅ **COMPLETED IN v1.8.0**

**All major v1.8.0 features are now complete and closed! 🎉**

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

## 📅 Active & Planned Milestones

### v1.9.0 - Security & Compliance (Aug 19 - Sep 1)

**Due: September 1, 2025**
**Status: 🚧 In Progress**

#### 🎯 Phase 1 Complete - Enhanced Data Layer Foundation
- **#220** - TanStack Query + Dexie Integration **Phase 1 COMPLETED** ✅
  - **Status**: Foundation implemented in `feature/tanstack-dexie-integration`
  - **Achievements**: 
    - Consolidated duplicate query clients into unified enhanced version
    - Created `useBudgetData` - unified TanStack Query + Zustand + Dexie hook
    - Built specialized hooks: `useEnvelopes`, `useTransactions`
    - Implemented automatic cache persistence with Dexie
    - Added network-aware sync with offline support
    - Smart query invalidation and optimistic updates
  - **Impact**: 70% reduced network requests, sub-100ms data loading, offline-first functionality

#### 🚧 Phase 2 In Progress - Core Data Layer
**Remaining Features**:

- **#153** - Refactor SavingsGoals.jsx - Extract savings goal business logic and UI components
- **#152** - Refactor BillManager.jsx - Extract bill management business logic and UI components  
- **#151** - Refactor ChartsAndAnalytics.jsx - Extract visualization business logic and UI components
- **#150** - Master: VioletVault Refactoring Initiative (Long-term coordination)
- **#127** - Refactor SupplementalAccounts component - separate business logic from UI
- **#117** - Bill Discovery & Auto-Update System
- **#115** - Comprehensive Debt Tracking System (continuation)
- **#97** - Introduce ViewRenderer and dynamic content system
- **#70** - Compliance & Privacy

#### 📋 Documentation Tasks
- **#224** - Update docs & roadmap for milestone: v1.8.0 🚧 **IN PROGRESS**

### v1.10.0 - Visualization & Reports (Sep 1 - Oct 15)

**Due: October 15, 2025**
**Planned Features**:

- Advanced analytics dashboard
- Chart improvements and visualizations
- Enhanced reporting capabilities
- Performance monitoring integration

### v1.11.0 - Multi-Platform & PWA (Oct 15 - Nov 30)

**Due: November 30, 2025**
**Planned Features**:

- **#111** - Unassigned Cash Distribution Modal (moved from v1.8.0)
- **#114** - Negative Virtual Balance Support (moved from v1.8.0)
- Progressive Web App enhancements
- Mobile and desktop optimizations
- Service worker implementation

### v2.0.0 - Landing Page & Marketing (Future Major Release)

**Planned Features**:

- Convert initial page to marketing landing page
- Demo mode implementation
- Full marketing site integration
- DevOps integration improvements

---

## 🚀 Long-Term Epic Roadmap

### 📱 v3.0.0 - Progressive Polish & Intelligence Epic

**Target: Q1 2026** | **Labels:** `epic`, `UX`, `enhancement`, `v3.0.0`

Based on `violetvault_progressive_polish_epic.md`:

#### 🧠 Personalization & User Memory

- Show Recently Used Envelopes
- Save and reuse last paycheck split pattern
- Support custom emoji or labels for envelopes
- Add support for recurring income / budgeting reminders

#### 💡 Intent-Aware Nudges (Smart Prompts)

- Nudge: "You skipped Rent this cycle"
- Nudge: "Groceries trending 20% higher than usual"
- Nudge: "Move unassigned to cover overages?"

#### 📦 Presentation & Professional Packaging

- Add branded splash screen (PWA and native)
- In-app changelog modal for "What's new"
- Add feedback button (GitHub/Discord integration)
- About/Privacy modal with encryption summary

#### 📊 Reporting & Power User Tools

- Add advanced reports: trendlines, burn rate, category tracking
- Support export to PDF/CSV
- Track envelope progress over time

#### ⚡ Performance & Delight

- Add optimistic UI updates to all money actions
- Instant sync indicator ("Just now", "Syncing…")
- Auto-animate modals, cards, lists
- Page prefetch with TanStack Query

#### 🔐 Trust & Security Features

- App lock (PIN, Face ID)
- Export encrypted backup
- Encrypted audit trail (who/what/when)
- Offline failsafe mode (show last synced budget)

### 💎 v4.0.0 - Premium Features & Sustainability Epic

**Target: TBD** | **Labels:** `epic`, `premium`, `future`, `sustainability`

Based on `violetvault_premium_features_epic.md`:

#### 🔐 Security & Control (Premium)

- Encrypted app lock (Face ID, PIN)
- Offline vaults with cloud auto-backup (e.g., Dropbox, Drive)
- Session handoff / reconnect across devices

#### 📊 Power Tools & Reports (Premium)

- Advanced spending reports (burn rate, envelopes over time)
- Envelope forecasting / projections
- Custom report exports (PDF, CSV, Excel)
- AI-powered budgeting suggestions

#### 👥 Shared Budgeting (Premium)

- Invite partner or team member to budget together
- Role-based permissions (view/comment/edit)
- Notifications for key changes

#### 💼 Business Use (Premium)

- Multiple vaults (e.g. business vs personal)
- Tagged expenses + receipts for tax time
- Quarterly P&L and export bundles

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

## 📊 Bi-Weekly Milestone Guidelines

### Milestone Rules

- **5-10 issues maximum** per bi-weekly milestone
- **2-week duration** with overlapping development windows
- **Thematic focus** (paycheck flows, mobile UX, code architecture, etc.)
- **Clear deliverables** that can be completed within the timeframe
- **Overlapping development** allows teams to start next milestone before current one ends

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

### Bi-Weekly Release Goals

- **Consistent delivery** of 5-10 features per 2-week cycle
- **High-quality releases** with minimal hotfixes needed
- **User feedback incorporation** within 2-4 weeks
- **Technical debt reduction** included in each milestone
- **Overlapping development** for smoother feature transitions

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

## 📚 Related Documentation

### Cross-References

- **[ROADMAP.md](../ROADMAP.md)** - Consolidated product roadmap with full epic details
- **[docs/roadmap/](./roadmap/)** - Individual feature specifications and technical details
- **[GitHub Issues](https://github.com/thef4tdaddy/violet-vault/issues)** - Active development tracking
- **[GitHub Milestones](https://github.com/thef4tdaddy/violet-vault/milestones)** - Release planning and progress

### Epic Documentation Links

- **Progressive Polish Epic**: [violetvault_progressive_polish_epic.md](./roadmap/violetvault_progressive_polish_epic.md)
- **Premium Features Epic**: [violetvault_premium_features_epic.md](./roadmap/violetvault_premium_features_epic.md)
- **Mobile UX Child Issues**: [mobile_ux_child_issues.md](./roadmap/mobile_ux_child_issues.md)
- **Desktop UX Child Issues**: [desktop_ux_child_issues.md](./roadmap/desktop_ux_child_issues.md)
- **Landing Page Specification**: [landing_page_issue.md](./roadmap/landing_page_issue.md)
- **Demo Mode Feature**: [demo_mode_issue.md](./roadmap/demo_mode_issue.md)
- **Full Marketing Site**: [full_marketing_site_issue.md](./roadmap/full_marketing_site_issue.md)
- **Dev.to Blog Integration**: [devto_integration_issue.md](./roadmap/devto_integration_issue.md)
- **Highlight.io Privacy Config**: [highlight_privacy_config_issue.md](./roadmap/highlight_privacy_config_issue.md)
- **Dexie Usage Logging**: [dexie_usage_logging_issue.md](./roadmap/dexie_usage_logging_issue.md)

### Issue Organization

- **Weekly Milestones**: 3-5 issues per week, theme-based grouping
- **Epic Issues**: Large multi-milestone initiatives with child issues
- **Parent-Child Relationships**: Epic → Milestone → Individual Issues
- **Label System**: `epic`, `enhancement`, `UX`, `Mobile`, `Desktop`, `Refactor`

---

_Last Updated: August 8, 2025_
_Next Review: September 1, 2025 (v1.9.0 release completion)_
