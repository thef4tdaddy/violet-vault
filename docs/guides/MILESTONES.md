# VioletVault Milestones & Release Planning

## 📋 Overview

This document tracks VioletVault's milestone-based development. Following the major v2.0 architectural shift, the project focuses on stability, intelligent automation, and hybrid synchronization.

## 🎯 Versioning Strategy

### Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR (X)**: Breaking changes, major architectural shifts (e.g., v2.0 TypeScript conversion)
- **MINOR (Y)**: New features, backward-compatible enhancements
- **PATCH (Z)**: Bug fixes and minor security updates

---

## 🚀 Completed Milestones

### v2.0.0 - Unified Model & TypeScript (Jan 2026)

**Status: ✅ Baseline Established**

#### ✅ Core Achievements

- **Full TypeScript Conversion**: 100% type safety across the application.
- **Unified Data Model**: Simplified system to Envelopes and Transactions.
- **Hybrid Sync (v2)**: Robust Dexie + Firebase synchronization with chunking support.
- **Validation Layer**: Global Zod schema integration for runtime safety.
- **Auth Refactor**: Transitioned from Zustand to React Context for authentication.
- **Dependency Refresh**: Updated to React 19, Vite 7, and TanStack Query 5.

---

## 📅 Active & Upcoming Milestones

### v2.1.0 - Intelligent Automation & Discovery (Current)

**Due: March 1, 2026**
**Epic: #1463**

#### 🎯 Objectives

- **Domain Logic Decoupling**: Separation of side effects from pure business rules.
- **Enhanced Bill Discovery**: Automated matching patterns with verification plans.
- **Paycheck Orchestration**: Refactored income distribution with structured execution plans.
- **Automation Rule Builder**: Advanced UI for managing auto-funding triggers.

### v2.2.0 - Performance & Visualization

**Target: Q2 2026**

#### 🎯 Objectives

- **Virtualized Transaction Ledger**: High-performance scrolling for 10,000+ operations.
- **Advanced Forecasts**: burn-rate analysis and envelope runway projections.
- **Report Exporter**: PDF/CSV generation for financial exports.
- **Performance Audit**: Sub-100ms interaction latency for mobile devices.

### v3.0.0 - Collaborative Budgeting (Long-term)

**Target: 2027**

#### 🎯 Objectives

- **Shared Vaults**: Multiple users collaborating on a single budget.
- **Role-Based Access**: View-only vs. Editor permissions.
- **Real-time Presence**: Seeing who is currently editing specific envelopes.

---

## 🏗️ Release Guidelines

### Milestone Management

- **Thematic focus** for each minor version.
- **Standardized naming**: `feat/` and `fix/` prefixes for PRs.
- **Mandatory 80%+ test coverage** for all features entering the main branch.

---

_Last Updated: January 18, 2026_
