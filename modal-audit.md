# Modal Slide-Up Conversion Audit

## ✅ Already Converted (Phase 1)
- ✅ CreateEnvelopeModal - slide-up implemented
- ✅ EditEnvelopeModal - slide-up implemented
- ✅ TransferModal - slide-up implemented
- ✅ AddBillModal - slide-up implemented

## 🔴 High Priority - Large/Complex Modals with ESLint Issues

### AccountFormModal.jsx
- **ESLint Issues**: 267 lines (max 75), complexity 28 (max 15)
- **Usage**: Account creation/editing
- **Priority**: HIGH - frequently used, significant ESLint violations

### BillDiscoveryModal.jsx
- **ESLint Issues**: 350 lines (max 75), nested component 137 lines, unused variable
- **Usage**: Bill discovery and auto-creation
- **Priority**: HIGH - large component, complex functionality

### UnassignedCashModal.jsx
- **ESLint Issues**: 254 lines (max 75), complexity 20, Zustand subscription
- **Usage**: Cash distribution interface
- **Priority**: HIGH - core budgeting flow

### ReceiptToTransactionModal.jsx
- **ESLint Issues**: Need to check
- **Usage**: Receipt processing workflow
- **Priority**: MEDIUM - newer feature

## 🟡 Medium Priority - Moderate ESLint Issues

### SavedAddEditGoalModal.jsx
- **ESLint Issues**: Need to check
- **Usage**: Savings goal management
- **Priority**: MEDIUM

### ShareCodeModal.jsx
- **ESLint Issues**: Need to check
- **Usage**: Budget sharing functionality
- **Priority**: MEDIUM

### DistributeModal.jsx
- **ESLint Issues**: Need to check
- **Usage**: Savings distribution
- **Priority**: MEDIUM

### ChangePasswordModal.jsx
- **ESLint Issues**: 96 lines (max 75)
- **Usage**: Password management
- **Priority**: MEDIUM

### DeleteEnvelopeModal.jsx
- **ESLint Issues**: 126 lines (max 75)
- **Usage**: Envelope deletion confirmation
- **Priority**: MEDIUM

## 🟢 Low Priority - Simple/Confirmation Modals

### ConfirmModal.jsx
- **Usage**: Generic confirmation dialogs
- **Priority**: LOW - used throughout app

### PromptModal.jsx
- **Usage**: Generic input prompts
- **Priority**: LOW - used throughout app

### InstallPromptModal.jsx
- **Usage**: PWA installation prompt
- **Priority**: LOW - PWA feature

### PatchNotesModal.jsx
- **Usage**: App update notifications
- **Priority**: LOW - informational

### UpdateAvailableModal.jsx
- **Usage**: Update notifications
- **Priority**: LOW - informational

## 📋 Strategy

**Phase 2 Target**: Focus on high-priority modals with significant ESLint violations
1. AccountFormModal - Extract form sections, implement slide-up
2. BillDiscoveryModal - Break down large component, implement slide-up
3. UnassignedCashModal - Fix Zustand subscriptions, implement slide-up
4. ReceiptToTransactionModal - Assess and convert

**Benefits**:
- Resolve major ESLint violations (267 → <75 lines)
- Improve mobile UX for frequently used flows
- Establish patterns for remaining modals