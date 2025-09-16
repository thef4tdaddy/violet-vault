# Refactoring Opportunities Guide

**IMPORTANT:** Always look for refactoring opportunities while doing regular development work.

## 🎯 When to Refactor During Development

### **Always Refactor When:**

1. **Touching a component with 75+ line functions** (ESLint warnings)
2. **Adding features to large components** (400+ lines total)
3. **Working on components with complexity warnings** (ESLint complexity > 15)
4. **Modifying files with max-statements warnings** (ESLint > 25 statements)

### **Opportunity Indicators:**

- ✅ ESLint `max-lines-per-function` warnings
- ✅ ESLint `complexity` warnings
- ✅ ESLint `max-statements` warnings
- ✅ Components requiring scrolling to navigate
- ✅ Mixed UI + business logic in render functions
- ✅ Duplicate calculations or data fetching patterns

## 🛠️ Quick Refactoring Strategy

### **Phase 1: Extract While You Work** (5-10 minutes)

```bash
# When adding a feature:
1. Look for ESLint warnings in the file
2. Extract obvious UI components (buttons, forms, sections)
3. Move calculations to utility functions
4. Extract data fetching to custom hooks
```

### **Phase 2: Apply Standards** (5 minutes)

```bash
# While the file is open:
1. Apply UI standards (glassmorphism, borders, typography)
2. Use shared UI components (StandardTabs, StandardFilters)
3. Follow established patterns from docs/Shared-UI-Components.md
```

## 📚 Reference Materials

### **Use Proven Methodology:**

- **Complete Guide:** `docs/Component-Refactoring-Standards.md`
- **7-Phase Process:** Analysis → Separation → Standards → Testing → ESLint → Visual → QA
- **UI Standards:** `docs/Shared-UI-Components.md`
- **Average Results:** 71% code reduction, 100% visual preservation

### **High-Priority Refactor Targets (from Issue #569):**

1. **MainLayout.jsx** (614 lines) - Core layout system
2. **ViewRenderer.jsx** (426 lines) - View rendering engine
3. **TransactionSplitterV2.jsx** (431 lines) - Transaction splitting
4. **SyncHealthIndicator.jsx** (438 lines) - Sync monitoring

## 🎯 Development Integration

### **Before Starting Any Work:**

```bash
# Check if the component needs refactoring:
1. npm run lint | grep [component-name]
2. wc -l src/path/to/component.jsx
3. Look for opportunity indicators above
```

### **During Feature Development:**

```bash
# Refactor as you work:
1. Extract UI pieces you're modifying anyway
2. Apply UI standards to new sections
3. Move business logic to hooks/utilities
4. Use shared components instead of custom implementations
```

### **Double Value Achievement:**

- ✅ **Feature implementation** + **code quality improvement**
- ✅ **Mobile optimization** + **component extraction**
- ✅ **Bug fixing** + **architecture cleanup**
- ✅ **UI updates** + **standards compliance**

## 🏆 Success Metrics

### **Proven Results from Issue #569:**

- **8 components refactored** with 71% average reduction
- **Record 88% reduction** (TrendAnalysisCharts: 457→55 lines)
- **100% visual preservation** across all refactors
- **Zero functionality regression**
- **Complete UI standards compliance**

### **Quick Wins Available:**

- **5-10 minute extractions** often yield 20-30% reductions
- **UI standards application** improves consistency immediately
- **Shared component usage** reduces maintenance burden
- **Logic extraction** improves testability and reusability

## 🔄 Always Remember

**Every time you open a component for ANY reason:**

1. ⚡ **Quick scan** - Look for ESLint warnings and size
2. 🎯 **Opportunistic extraction** - Extract obvious pieces while working
3. 🎨 **Standards application** - Apply UI standards to touched areas
4. 📝 **Documentation** - Note refactoring opportunities for future work

**Goal:** Make incremental improvements every time you touch code, leading to systematic architecture enhancement without dedicated refactoring time.
