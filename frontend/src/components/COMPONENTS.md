# Shared Components Guide

## Overview
This directory contains reusable UI components used across the application.

## Components

### FormInput.jsx
**Purpose:** Standardized form field component with built-in validation and theme support.

**Key Features:**
- Input type flexibility (text, email, password, textarea, select)
- Real-time and blur validation
- Visual error states with red background
- Success state indicators
- Character count tracking
- Icon support with positioning control
- Full accessibility support (ARIA labels, descriptions)

**Basic Example:**
```jsx
import FormInput from '@/components/shared/FormInput'

const [email, setEmail] = useState('')
const [errors, setErrors] = useState({})

<FormInput
  name="email"
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  validationType="email"
  required
/>
```

**Advanced Example with Icons:**
```jsx
import FormInput from '@/components/shared/FormInput'
import { FiMail } from 'react-icons/fi'

<FormInput
  name="email"
  type="email"
  label="Work Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  success={emailValidated}
  validationType="email"
  icon={<FiMail />}
  iconPosition="left"
  placeholder="name@company.com"
  hint="Use your company email for verification"
/>
```

### PaginationControls.jsx
**Purpose:** Navigation component for paginated lists or multi-page content.

**Key Features:**
- Previous/Next navigation buttons
- Current page indicator
- Automatic disable on boundary pages
- Customizable label text
- Theme-aware styling with hover effects

**Example:**
```jsx
import PaginationControls from '@/components/shared/PaginationControls'

const [page, setPage] = useState(1)
const totalPages = Math.ceil(items.length / itemsPerPage)

<PaginationControls
  currentPage={page}
  totalPages={totalPages}
  onPrev={() => setPage(Math.max(1, page - 1))}
  onNext={() => setPage(Math.min(totalPages, page + 1))}
  label={`Page ${page} of ${totalPages}`}
/>
```

### Modal Components
**Purpose:** Dialog/modal windows for forms, confirmations, and information display.

**Styling Pattern:**
```jsx
// Modal background - semi-transparent black
className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"

// Modal container - white/dark with border
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"

// Close button with hover effect
className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300"
```

## Styling Patterns

### Card Components
All card-like components follow this pattern:

```jsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
  {/* Content */}
</div>
```

### Button Variants
Primary button:
```jsx
className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
```

Secondary button:
```jsx
className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
```

### Input Fields
Standard input styling:
```jsx
className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 theme-text focus:ring-2 focus:ring-accent/50 transition-all"
```

Error state:
```jsx
className="w-full px-3 py-2 rounded-lg border border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20 focus:ring-2 focus:ring-red-500/50"
```

## Accessibility Guidelines

1. **Labels**: All form inputs must have associated `<label>` elements
2. **ARIA Attributes**: Use `aria-label`, `aria-invalid`, `aria-describedby` appropriately
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Color Contrast**: Verify text meets WCAG AA standards (4.5:1 for body text)
5. **Focus Management**: Provide visible focus indicators for all buttons and inputs
6. **Error Messages**: Use `role="alert"` for dynamic error messages

## Performance Tips

1. Use `getMotionConfig()` to respect `prefers-reduced-motion`
2. Add `will-change: transform, opacity` to frequently animated elements
3. Use `transform: translate3d(0,0,0)` to enable GPU acceleration
4. Memoize expensive calculations with `useMemo`
5. Lazy load components with `React.lazy` for code splitting

## Component Tree Example

```
App
├── ThemeProvider
│   └── Layout
│       ├── Navigation
│       ├── Main Content
│       │   ├── Page Component
│       │   │   ├── FormInput
│       │   │   ├── FormInput
│       │   │   └── PaginationControls
│       │   └── ProjectCard
│       │       ├── FormInput (in modal)
│       │       └── Button
│       └── Footer
└── Notifications/Modals (Portal)
```

## Testing Components

Example test for FormInput:
```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormInput from '@/components/shared/FormInput'

describe('FormInput', () => {
  test('should display error message when validation fails', async () => {
    render(
      <FormInput
        name="email"
        type="email"
        value="invalid"
        validationType="email"
        onChange={() => {}}
      />
    )
    
    // Should display error after validation
  })
})
```

## Migration Checklist

When updating component styles:
- [ ] Update all theme color references
- [ ] Add/update dark mode variants
- [ ] Test hover and focus states
- [ ] Verify mobile responsiveness
- [ ] Check accessibility contrast ratios
- [ ] Update animation configs for `prefers-reduced-motion`
- [ ] Test with keyboard navigation
- [ ] Run test suite to verify no regressions

---

*Components follow React 18+ best practices with Tailwind CSS v3.4.19*
