# Design Standards

## Hard Black Borders

- **Standard Border**: `border border-white/20 ring-1 ring-gray-800/10`
- **Usage**: Cards, modals, filters, summary components, and other major UI surfaces
- **Benefits**: Provides depth, consistent hierarchy, and a cohesive look

## Main Container Purple Tint

- **Style**: `rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm`
- **Usage**: Primary page containers (e.g., BillManager, DebtManager)
- **Benefits**: Establishes branded identity while keeping content legible

## Typography Hierarchy

- **Primary Headers**: ALL CAPS with enlarged first letters (`font-black text-black text-base`, individual letters get `text-lg`)
- **Secondary Text**: `text-purple-900` for branded descriptive copy
- **Text Outlines**: Apply a black multi-direction text shadow for colored text that needs contrast:
  - `textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black, 0px 2px 0px black, 2px 0px 0px black, 0px -2px 0px black, -2px 0px 0px black'`
- **Justified Blocks**: Use `textAlign: 'justify', textAlignLast: 'justify'` for formal text that needs clean edges

## Button Styling

- All action buttons must include `border-2 border-black` to match the shared visual weight standard.

## Background Treatments

### Subtle Texture

- **Pattern**: `backgroundImage: "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)"`
- **Size**: `backgroundSize: "100px 100px"`
- **Overlay**: Apply `opacity-10` for a restrained effect
- **Usage**: Full-screen backgrounds, onboarding, marketing surfaces

### Heavy Blur Overlays

- **Styles**: `backdrop-blur-3xl` with `bg-purple-900/60` or `bg-black/60`
- **Usage**: Modals, safety lock screens, critical overlays

## Glassmorphism Language

- Base class: `.glassmorphism` with `backdrop-filter: blur(20px)` and semi-transparent backgrounds
- Typical combo: `glassmorphism rounded-lg border border-white/20 ring-1 ring-gray-800/10 shadow-lg`
- Use for primary containers, filters, cards, and overlays that participate in the glassmorphism aesthetic

## Tab Connection Pattern

- **Tab Styling**: Rounded top corners (`rounded-t-lg`) with hard black borders
- **Connection**: Apply `-mb-1` on the filter component to close gaps between tabs and body content
- **Body Styling**: Ensure connected content uses matching borders and glassmorphism so the transition appears seamless

```jsx
<div className="space-y-0">
  <StandardTabs variant="colored" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  <StandardFilters
    filters={filters}
    onFilterChange={handleFilterChange}
    filterConfigs={configs}
    className="-mb-1"
  />
</div>
```

## Summary Card Color Standards

Use gradient pairs (`from-[color]-500 to-[color]-600`) for page-level metrics. See the [Component Catalog](components.md#summary-card-visual-standards) for detailed usage guidance.

## Design Goals

1. Deliver a consistent, branded experience across the application.
2. Maintain high readability and contrast in every theme.
3. Reinforce hierarchy with typography and border treatments.
4. Ensure modular pieces snap together cleanly (tabs + filters + bodies).
5. Provide clear guidance for future component or page designs.

When introducing new UI elements, align with these standards before shipping. Deviations should be documented and justified in design reviews.
