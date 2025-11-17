# Accessibility Guide

Lit-Rift is built following WCAG 2.1 AA accessibility guidelines to ensure the application is usable by everyone, including people with disabilities.

## Overview

This guide covers:
- What accessibility features are implemented
- How to maintain accessibility standards
- Testing procedures
- Best practices for contributors

---

## Implemented Features

### ✅ Keyboard Navigation

All interactive elements are keyboard accessible:
- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dialogs and menus
- **Arrow keys**: Navigate within menus and lists

**Implementation:**
- All buttons, links, and form inputs are keyboard accessible
- Custom focus styles (2px blue outline) clearly indicate focused element
- Focus is never completely hidden
- Skip-to-content link for bypassing navigation

### ✅ Screen Reader Support

**ARIA Labels:**
- All icon buttons have descriptive labels
- Navigation landmarks (`<nav>`, `<main>`, etc.)
- Semantic HTML elements (`<header>`, `<article>`, etc.)
- Form inputs have associated labels
- Dynamic content changes are announced

**Examples:**
```tsx
// Button with icon - needs aria-label
<IconButton aria-label="Open user account menu">
  <Avatar />
</IconButton>

// Form input
<TextField
  label="Project title"
  inputProps={{ 'aria-label': 'Project title' }}
  required
  aria-required="true"
/>

// Dialog
<Dialog
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Create New Project</DialogTitle>
  <DialogContent id="dialog-description">...</DialogContent>
</Dialog>
```

### ✅ Focus Management

**Skip to Content:**
- First interactive element when tabbing
- Hidden until focused
- Jumps directly to main content
- Located in `components/SkipToContent.tsx`

**Focus Visible Styles:**
- 2px solid blue outline (`#6366f1`)
- 2px outline offset for breathing room
- Semi-transparent shadow for extra visibility
- Located in `styles/accessibility.css`

**Focus Trap:**
- Dialogs trap focus within themselves
- Escape key closes and returns focus
- Material-UI handles this automatically

### ✅ Color Contrast

**WCAG AA Compliance:**
- Text contrast ratio: minimum 4.5:1 for normal text
- Large text (18px+): minimum 3:1
- UI components: minimum 3:1 against background

**Dark Theme Colors:**
```css
Background: #0f172a (slate-900)
Paper: #1e293b (slate-800)
Primary: #6366f1 (indigo-500)
Text Primary: #f1f5f9 (slate-100)
Text Secondary: #94a3b8 (slate-400)
```

All combinations meet WCAG AA standards.

### ✅ Semantic HTML

**Landmarks:**
```tsx
<header> - Page header with logo and navigation
<nav aria-label="Main navigation"> - Primary navigation
<main id="main-content" role="main"> - Main content area
<article> - Individual project cards
<section aria-label="Projects"> - Projects list
```

**Headings:**
- Proper heading hierarchy (h1 → h2 → h3)
- No skipped levels
- Descriptive headings

### ✅ Form Accessibility

**Labels:**
- All inputs have associated labels
- Required fields indicated with `aria-required`
- Error messages use `aria-invalid` and `aria-describedby`

**Validation:**
- Real-time validation feedback
- Error messages announced to screen readers
- Clear instructions for fixing errors

**Example:**
```tsx
<TextField
  label="Email"
  required
  aria-required="true"
  error={!!errors.email}
  aria-invalid={!!errors.email}
  helperText={errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
```

### ✅ Loading States

**Accessibility:**
- Loading spinners have `role="progressbar"`
- Skeleton loaders have appropriate ARIA labels
- Loading state announced with `aria-busy`
- Prevents interaction during loading

**Example:**
```tsx
<Button
  onClick={handleSubmit}
  disabled={loading}
  aria-busy={loading}
>
  {loading ? (
    <CircularProgress size={24} aria-label="Submitting" />
  ) : (
    'Submit'
  )}
</Button>
```

### ✅ Responsive Design

**Touch Targets:**
- Minimum 44x44px for interactive elements
- Adequate spacing between clickable items
- Implemented in `styles/accessibility.css`

**Responsive:**
- Works at all viewport sizes
- Text reflows appropriately
- No horizontal scrolling required

---

## Accessibility Features by Component

### SkipToContent
- **Purpose**: Bypass navigation for keyboard users
- **Location**: `components/SkipToContent.tsx`
- **Usage**: Automatically included in App.tsx
- **Behavior**: Hidden until Tab is pressed, jumps to `#main-content`

### UserMenu
- **ARIA**: `aria-controls`, `aria-haspopup`, `aria-expanded`, `aria-label`
- **Keyboard**: Opens with Enter/Space, navigates with arrows, closes with Escape
- **Screen Reader**: Announces menu state and items

### HomePage
- **Landmarks**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`
- **ARIA Labels**: All buttons and interactive elements labeled
- **Empty State**: Helpful message when no projects exist
- **Form**: All inputs properly labeled and validated

### LoadingSpinner
- **ARIA**: `role="progressbar"`
- **Message**: Customizable loading message
- **Visibility**: Always visible to screen readers

### ErrorBoundary
- **Graceful Failure**: Shows error UI instead of blank screen
- **Recovery**: "Try Again" button to attempt recovery
- **Navigation**: "Go Home" button for escape route

---

## Testing for Accessibility

### Keyboard Testing

1. **Tab Navigation**
   - Press Tab repeatedly
   - Verify all interactive elements receive focus
   - Check focus indicator is clearly visible
   - Ensure logical focus order

2. **Skip Link**
   - Press Tab on page load
   - Verify skip link appears
   - Press Enter
   - Verify focus moves to main content

3. **Dialogs**
   - Open dialog
   - Press Tab - focus should stay in dialog
   - Press Escape - dialog should close
   - Focus should return to trigger element

4. **Forms**
   - Navigate with Tab
   - Submit with Enter
   - Check error messages appear
   - Verify required fields validation

### Screen Reader Testing

**Recommended Tools:**
- **NVDA** (Windows, Free)
- **JAWS** (Windows, Commercial)
- **VoiceOver** (Mac, Built-in)
- **TalkBack** (Android, Built-in)

**Testing Checklist:**
- [ ] All images have alt text
- [ ] Buttons announce their purpose
- [ ] Form inputs announce labels
- [ ] Errors are announced
- [ ] Loading states are announced
- [ ] Headings create logical structure
- [ ] Links make sense out of context

### Automated Testing

**Tools:**
- **axe DevTools** - Chrome/Firefox extension
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Chrome DevTools audit

**Running Lighthouse:**
```bash
# In Chrome DevTools
1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Accessibility"
4. Click "Generate report"
5. Fix any issues found
```

**Expected Score:** 95+ (some Material-UI components may flag)

### Manual Testing Checklist

- [ ] All functionality available via keyboard
- [ ] Focus indicator always visible
- [ ] Skip link works
- [ ] ARIA labels on icon buttons
- [ ] Form validation accessible
- [ ] Error messages descriptive
- [ ] Loading states announced
- [ ] Color contrast meets AA standards
- [ ] Text resizes up to 200%
- [ ] No keyboard traps
- [ ] Dialogs manage focus correctly

---

## Best Practices for Contributors

### DO:

✅ Use semantic HTML elements
```tsx
// Good
<nav><a href="/home">Home</a></nav>

// Bad
<div><span onClick={goHome}>Home</span></div>
```

✅ Add aria-label to icon-only buttons
```tsx
// Good
<IconButton aria-label="Delete item">
  <DeleteIcon />
</IconButton>

// Bad
<IconButton>
  <DeleteIcon />
</IconButton>
```

✅ Use proper heading hierarchy
```tsx
// Good
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>

// Bad - skips h2
<h1>Page Title</h1>
  <h3>Section</h3>
```

✅ Provide alt text for images
```tsx
// Good
<img src="logo.png" alt="Company logo" />

// Decorative images
<img src="decoration.png" alt="" role="presentation" />
```

✅ Make forms accessible
```tsx
// Good
<TextField
  label="Email"
  required
  aria-required="true"
  inputProps={{ 'aria-label': 'Email address' }}
/>
```

### DON'T:

❌ Use onClick on non-interactive elements
```tsx
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>
```

❌ Remove focus indicators
```tsx
// Bad
*:focus { outline: none; }

// Good - use custom focus styles instead
```

❌ Use placeholder as label
```tsx
// Bad
<input placeholder="Enter email" />

// Good
<TextField label="Email" placeholder="example@domain.com" />
```

❌ Rely only on color for information
```tsx
// Bad - color alone
<span style={{ color: 'red' }}>Error</span>

// Good - icon + text
<Alert severity="error">
  <ErrorIcon /> Error: Invalid input
</Alert>
```

---

## Accessibility Checklist for New Features

When adding new features, ensure:

- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] ARIA labels where needed
- [ ] Color contrast compliant
- [ ] Focus management proper
- [ ] Forms properly labeled
- [ ] Errors announced
- [ ] Loading states accessible
- [ ] Semantic HTML used
- [ ] Tested with keyboard
- [ ] Tested with screen reader
- [ ] Lighthouse score 95+

---

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### ARIA
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Material-UI
- [MUI Accessibility](https://mui.com/material-ui/guides/accessibility/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Learning
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## Support

For accessibility questions or to report issues:
1. Check this guide first
2. Review WCAG 2.1 guidelines
3. Test with automated tools
4. Create an issue on GitHub with "a11y" label

Remember: Accessibility is not a feature, it's a requirement. Building accessible applications benefits everyone.
