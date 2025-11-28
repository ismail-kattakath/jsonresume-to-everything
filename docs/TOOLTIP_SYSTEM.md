# Tooltip System Documentation

## Overview

The Resume Builder uses **react-tooltip** to provide contextual help throughout the application. Tooltips appear on hover (desktop) or tap (mobile) and provide concise explanations of UI elements.

## Architecture

### Components

1. **Tooltip Component** (`src/components/ui/Tooltip.tsx`)
   - Global tooltip renderer
   - Singleton pattern - one instance handles all tooltips
   - Automatically styled with dark theme

2. **Tooltip Configuration** (`src/config/tooltips.ts`)
   - Centralized content management
   - Organized by feature area (navigation, sections, forms, etc.)
   - Type-safe with TypeScript

### Integration Pattern

```tsx
// 1. Add <Tooltip /> once at app root
import { Tooltip } from '@/components/ui/Tooltip'

function App() {
  return (
    <>
      <Tooltip />
      {/* Rest of app */}
    </>
  )
}

// 2. Use data attributes on any element
import { tooltips } from '@/config/tooltips'
;<button
  data-tooltip-id="app-tooltip"
  data-tooltip-content={tooltips.navigation.printButton}
  data-tooltip-place="bottom"
>
  Print
</button>
```

## Adding New Tooltips

### Step 1: Add Content to Config

Edit `src/config/tooltips.ts`:

```typescript
export const tooltips = {
  // ... existing categories
  myNewSection: {
    buttonName: 'Description of what this button does',
    fieldName: 'Explanation of this form field',
  },
}
```

### Step 2: Apply to Elements

```tsx
<button
  data-tooltip-id="app-tooltip"
  data-tooltip-content={tooltips.myNewSection.buttonName}
  data-tooltip-place="top" // top | right | bottom | left
>
  My Button
</button>
```

## Best Practices

### Writing Tooltip Content

✅ **DO:**

- Be concise (10-15 words max)
- Use action verbs ("Click to...", "Drag to...")
- Tell exactly what happens
- Use plain English

❌ **DON'T:**

- State the obvious ("Button to click")
- Use jargon without explanation
- Write long paragraphs
- Repeat visible text

### Examples

**Good:**

- "Download your resume as PDF or send to printer"
- "Reorder items by dragging this handle"
- "AI will generate content based on your job description"

**Bad:**

- "Print button" (too obvious)
- "This is where you configure the AI" (too wordy)
- "Utilize the drag functionality" (jargon)

### Placement

- **top**: Default, good for buttons at bottom of screen
- **right**: Good for left sidebar items
- **bottom**: Good for top navigation/headers
- **left**: Good for right sidebar items

## Technical Details

### Library: react-tooltip

- **Size:** ~20KB (lightweight)
- **Accessibility:** Built-in ARIA attributes
- **Performance:** Lazy-loaded, minimal overhead
- **Mobile:** Touch-friendly (tap to show)

### Styling

Tooltips use consistent styling defined in `src/components/ui/Tooltip.tsx`:

```typescript
{
  backgroundColor: '#111827', // gray-900
  color: '#ffffff',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
}
```

### Configuration Options

```tsx
<Tooltip
  id="app-tooltip" // Required: ID to match data-tooltip-id
  place="top" // Placement (default)
  delayShow={300} // Show delay in ms
  delayHide={0} // Hide delay in ms
  opacity={1} // Full opacity
/>
```

## Testing

Tooltips are mocked in tests to avoid ESM issues:

```javascript
// jest.setup.js
jest.mock('react-tooltip', () => ({
  Tooltip: () => null,
}))
```

To test tooltip presence:

```typescript
const button = screen.getByRole('button', { name: /print/i })
expect(button).toHaveAttribute('data-tooltip-content', 'Expected text')
```

## Maintenance

### Updating Content

1. Edit `src/config/tooltips.ts`
2. Content updates are type-safe - TypeScript will catch typos
3. No other changes needed - tooltips update automatically

### Adding New Categories

```typescript
// src/config/tooltips.ts
export const tooltips = {
  // ... existing
  newFeature: {
    element1: 'Tooltip text',
    element2: 'Tooltip text',
  },
} as const
```

## Troubleshooting

### Tooltip Not Showing

1. **Check ID:** data-tooltip-id="app-tooltip" must match
2. **Check Content:** data-tooltip-content must have non-empty string
3. **Check Rendering:** <Tooltip /> must be rendered in component tree
4. **Check Z-Index:** Tooltip has z-index 10000, ensure nothing blocks it

### Tooltip Positioning Wrong

- Use `data-tooltip-place` to override default placement
- Options: "top" | "right" | "bottom" | "left"

### Tooltip Text Cut Off

- Tooltip has max-width of 24rem (384px)
- Content will wrap automatically
- For very long text, consider splitting into multiple tooltips

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari/Chrome (touch-friendly)

## Performance

- **Initial Load:** ~20KB (minified + gzipped)
- **Runtime:** <1ms per tooltip show/hide
- **Memory:** Minimal - single tooltip instance

## Related Files

- `src/components/ui/Tooltip.tsx` - Component
- `src/config/tooltips.ts` - Content
- `src/app/resume/builder/page.tsx` - Usage example
- `jest.setup.js` - Test mocks
