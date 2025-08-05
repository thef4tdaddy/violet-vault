# UI Component Patterns & Solutions

This document contains proven solutions for common UI layout issues in VioletVault.

## Radio Button Positioning Issue

### Problem
Radio buttons in form layouts consistently appear centered instead of at the far left, causing poor UX with excessive white space.

### Root Cause
Flexbox's `items-center` and centering behaviors override attempts to position radio buttons at the absolute left edge.

### ❌ Problematic Patterns
```jsx
// These approaches fail due to flex centering behaviors:
<label className="flex items-center space-x-3">
  <input type="radio" className="w-4 h-4" />
  <div>Content</div>
</label>

<div className="flex items-center">
  <input type="radio" className="mr-3" />
  <div className="flex-1">Content</div>
</div>
```

### ✅ Proven Solution: CSS Grid
```jsx
<div className="glassmorphism border-2 border-white/20 rounded-xl p-2">
  <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
    <input
      type="radio"
      value="option"
      className="w-4 h-4 text-purple-600 mt-0.5 justify-self-start"
    />
    <div>
      <div className="flex items-center mb-1">
        <Icon className="h-4 w-4 mr-2" />
        <span className="font-medium text-sm">Option Label</span>
      </div>
<<<<<<< HEAD
      <p className="text-xs text-gray-600 leading-tight ml-6">Description text</p>
=======
      <p className="text-xs text-gray-600 leading-tight ml-6">
        Description text
      </p>
>>>>>>> origin/develop
    </div>
  </div>
</div>
```

### Key CSS Grid Properties
<<<<<<< HEAD

=======
>>>>>>> origin/develop
- `grid-cols-[auto_1fr]`: Auto-sized first column for radio, remaining space for content
- `justify-self-start`: Forces radio button to absolute left of its grid cell
- `gap-3`: Consistent spacing between radio and content
- `items-start`: Aligns content to top (prevents vertical centering)
- `mt-0.5`: Aligns radio button with first line of text

### When to Use This Pattern
<<<<<<< HEAD

=======
>>>>>>> origin/develop
- Radio button groups
- Checkbox lists
- Any form input that needs to be positioned at the absolute left edge
- Components where flexbox centering is causing layout issues

### Components Using This Pattern
<<<<<<< HEAD

- `PaycheckProcessor.jsx` - Allocation mode selection (commit: 658c91a)

### Notes

- This pattern eliminates the recurring radio button centering issue
- CSS Grid provides absolute positioning control that flexbox lacks
- Use `justify-self-start` to ensure elements stick to the left edge
- Always test with different content lengths to ensure consistency
=======
- `PaycheckProcessor.jsx` - Allocation mode selection (commit: 658c91a)

### Notes
- This pattern eliminates the recurring radio button centering issue
- CSS Grid provides absolute positioning control that flexbox lacks
- Use `justify-self-start` to ensure elements stick to the left edge
- Always test with different content lengths to ensure consistency
>>>>>>> origin/develop
