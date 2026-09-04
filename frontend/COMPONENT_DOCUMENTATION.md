# Component Documentation

## Overview
This document provides a comprehensive guide to the React-SkillBridge component architecture and usage patterns.

## Shared Components

### FormInput
**Location:** `src/components/shared/FormInput.jsx`

A reusable form input component with integrated validation, error handling, and theme support.

**Features:**
- Multiple input types (text, email, password, textarea, select)
- Real-time validation with customizable rules
- Error state with visual feedback (red background, icon)
- Success state with confirmation indicator
- Character count display
- Icon support (left/right positioning)
- Accessibility features (aria labels, descriptions)

**Usage:**
```jsx
<FormInput
  name="email"
  type="email"
  label="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  success={emailValidated}
  validationType="email"
  required
  placeholder="Enter your email"
/>
```

**Props:**
- `name` (string): Field name for form submission
- `type` (string): HTML input type (default: 'text')
- `inputType` (string): Component type - 'input', 'textarea', or 'select'
- `label` (string): Field label text
- `value` (any): Current field value
- `onChange` (function): Change handler
- `error` (string): Error message to display
- `success` (boolean): Show success state
- `validationType` (string): Auto-validation type ('email', 'password', 'url', etc.)

---

### PaginationControls
**Location:** `src/components/shared/PaginationControls.jsx`

Navigation component for paginated content with previous/next buttons.

**Features:**
- Prev/next button navigation
- Page indicator display
- Disabled state for boundary pages
- Customizable label text
- Theme-aware styling

**Usage:**
```jsx
<PaginationControls
  currentPage={page}
  totalPages={totalPages}
  onPrev={() => setPage(page - 1)}
  onNext={() => setPage(page + 1)}
  label={`Page ${page} of ${totalPages}`}
/>
```

---

## Page Components

### Dashboard (Analytics.jsx)
**Location:** `src/pages/Analytics.jsx`

Main analytics and statistics dashboard displaying user insights.

**Sub-components:**
- `AnalyticsOverview`: Key metrics cards
- `ApplicationsTrend`: Line chart showing applications over time
- `ApplicationStatus`: Pie chart of application statuses
- `VerificationMetrics`: Verification status breakdown

**Styling Pattern:**
- White cards with gray borders
- Dark mode: `dark:bg-gray-800 dark:border-gray-700`
- Hover effects: `hover:shadow-lg transition-all duration-300`

---

### Profile Settings (ProfileSettings.jsx)
**Location:** `src/pages/ProfileSettings.jsx`

User profile management form with multiple configuration sections.

**Sections:**
1. **Basic Information**: Name, bio, profile picture
2. **Public Presence**: Social links, portfolio URL
3. **Notification Preferences**: Email opt-ins, notification types
4. **Professional Details**: Skills, experience, certifications

**Form Pattern:**
- Uses `FormInput` component for all fields
- Validation on blur and change
- Success/error states per field
- Responsive grid layout (1 col mobile, 2 col desktop)

---

### Projects/Listings (Listings.jsx)
**Location:** `src/pages/Listings.jsx`

Grid layout for displaying projects or freelancer listings with filtering.

**Features:**
- Responsive grid (1 col mobile, 3 cols tablet, 4 cols desktop)
- Filter panel with sticky positioning
- Project cards with priority indicators
- Pagination integration

**Responsive Breakpoints:**
- Mobile: `grid-cols-1 gap-4 px-3 sm:px-4`
- Tablet: `md:grid-cols-3 gap-4 sm:gap-6`
- Desktop: `lg:grid-cols-4 md:px-6 lg:px-8`

---

## Theme and Styling

### Design Tokens
**Location:** `src/utils/designTokens.js`

Central configuration for typography, spacing, and component styling.

**Color Palette:**
- Primary: `#222831` (dark)
- Secondary: `#393E46` (darker)
- Accent: `#00ADB5` (cyan/teal)
- Light: `#EEEEEE` (off-white)

**Custom CSS Classes:**
- `theme-bg`: Background color with dark mode support
- `theme-text`: Text color with proper contrast
- `theme-text-secondary`: Secondary text (80% opacity)
- `theme-text-muted`: Muted text (60% opacity)
- `theme-border`: Border color
- `theme-input`: Input field background

---

## Animation

### Motion Configuration
**Location:** `src/utils/animationConfig.js`

Centralized animation presets supporting `prefers-reduced-motion` accessibility preference.

**Presets:**
- `default`: Fade + slide up transition
- `fade`: Simple opacity transition
- `scale`: Opacity + scale combination
- `slideInLeft`: Horizontal slide from left
- `slideInRight`: Horizontal slide from right

**Usage:**
```jsx
import { getMotionConfig } from '@/utils/animationConfig'

const config = getMotionConfig('scale')
<motion.div {...config}>Content</motion.div>
```

**Accessibility:**
Automatically reduces animation duration when user has enabled `prefers-reduced-motion` system preference.

---

## Form Validation

### Validation Utilities
**Location:** `src/utils/formValidation.js`

Comprehensive form field validation with support for common validation types.

**Supported Types:**
- `email`: Email address validation
- `password`: Strong password requirements
- `url`: URL format validation
- `phone`: Phone number validation
- `text`: Basic text validation
- `number`: Numeric value validation

**Usage:**
```jsx
const { isValid, error } = validateField('email', value, { required: true })

if (!isValid) {
  setErrors({ ...errors, email: error })
}
```

---

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

### Spacing Pattern
**Padding:** `px-3 sm:px-4 md:px-6 lg:px-8`
**Gap:** `gap-4 sm:gap-6`
**Space:** `space-y-4 sm:space-y-6`

---

## Dark Mode

### Implementation
- Uses CSS class-based approach (`.dark` class on root element)
- Toggle via `ThemeContext` (`useTheme()` hook)
- Tailwind dark mode utilities

**Color Adjustments:**
- Text: Lighter shades for dark mode
- Backgrounds: Gray-800/900 instead of white
- Borders: Gray-700 instead of gray-200
- Hover effects: Darker gray shades

---

## Testing

### Test Structure
- Test files located in `__tests__` directories
- Jest configuration in `frontend/jest.config.js`
- Setup files include DOM mocking and polyfills

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npm test -- --watch         # Watch mode
```

### Test Coverage Targets
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## Best Practices

1. **Component Composition**: Build complex UIs from smaller, single-purpose components
2. **Theme Consistency**: Always use theme classes and custom CSS classes for styling
3. **Accessibility**: Include proper ARIA labels, semantic HTML, and keyboard navigation
4. **Responsive Design**: Test mobile, tablet, and desktop layouts using provided breakpoints
5. **Error Handling**: Provide clear error messages and visual feedback
6. **Performance**: Use memoization for expensive computations and animations with `will-change`
7. **Documentation**: Include JSDoc comments on all components and utilities

---

## Migration Guide

### From Gradient Backgrounds to Minimal Design
Replace:
```jsx
// Old
className="bg-gradient-to-r from-primary to-secondary/50 backdrop-blur-lg"

// New
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
```

### Hover Effects
Replace:
```jsx
// Old
className="hover:shadow-md hover:scale-[1.01]"

// New
className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
```

---

## Troubleshooting

### Dark Mode Not Working
- Ensure `ThemeProvider` wraps your app root
- Check that `.dark` class is applied to `document.documentElement`
- Verify dark mode classes are using Tailwind prefix

### Form Validation Not Triggering
- Ensure `validationType` prop is set on `FormInput`
- Check that `onValidate` callback is properly defined
- Verify validation rules in `formValidation.js` for your validation type

### Animation Performance Issues
- Use `animate-gpu` class for GPU acceleration
- Enable `will-change` only during animation
- Consider reducing animation duration on slower devices
- Check browser DevTools Performance tab

---

*Last Updated: September 4, 2026*
