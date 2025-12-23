# Accessibility Requirements (WCAG 2.1 AA)

**Document**: Accessibility compliance guidelines for SuperCore v2.0  
**Standard**: WCAG 2.1 Level AA  
**Stack**: Next.js 14 + shadcn/ui + React + TypeScript  
**Testing**: axe DevTools, WAVE, Lighthouse

---

## WCAG 2.1 Principles (POUR)

### 1. Perceivable
Information and UI components must be presentable in ways users can perceive.

### 2. Operable
UI components and navigation must be operable.

### 3. Understandable
Information and operation of UI must be understandable.

### 4. Robust
Content must be robust enough to be interpreted by assistive technologies.

---

## Color and Contrast (Perceivable)

### Contrast Ratios (WCAG AA)
- **Normal text** (< 18pt): Minimum 4.5:1
- **Large text** (>= 18pt or 14pt bold): Minimum 3:1
- **UI components and icons**: Minimum 3:1
- **Focus indicators**: Minimum 3:1

### Implementation
All color combinations must meet minimum contrast ratios.
Use semantic color tokens that automatically adapt for dark mode.

### Color Usage Rules
- Never use color alone to convey information
- Always provide text labels, icons, or patterns alongside color
- Status indicators must have icon + text + color
- Dark mode must maintain sufficient contrast

---

## Keyboard Navigation (Operable)

### Focus Management
All interactive elements must be keyboard accessible with visible focus indicators.

#### Focus Order
Tab order must follow logical reading order (top-to-bottom, left-to-right).

#### Focus Indicators
Visible focus indicators required (minimum 2px outline with 2px offset).

### Keyboard Shortcuts
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter/Space: Activate buttons, links
- Esc: Close modals, cancel actions
- Arrow keys: Navigate lists, menus, tabs
- Home/End: Jump to start/end of lists

### Modal Focus Trap
When modal opens, focus must be trapped inside until closed.

---

## Screen Reader Support (Perceivable + Understandable)

### Semantic HTML
Use semantic HTML5 elements for proper structure:
- header, nav, main, article, section, aside, footer
- h1-h6 for headings in proper hierarchy
- ul/ol for lists
- button for actions, a for navigation

### ARIA Labels and Roles
Use ARIA attributes when semantic HTML is insufficient:
- Icon buttons need aria-label
- Status indicators need aria-live
- Loading states need role="status"
- Complex widgets need proper ARIA roles

### Landmarks
Define page regions for easy navigation:
- role="banner" for header
- role="navigation" for nav
- role="main" for main content
- role="complementary" for aside
- role="contentinfo" for footer

### Screen Reader Only Text
Hide visually but keep for screen readers using sr-only utility class.

---

## Forms Accessibility (Understandable + Robust)

### Labels
All form inputs must have associated labels using htmlFor/id.

### Required Fields
Indicate required fields with asterisk + aria-required="true".

### Error Messages
Errors must be programmatically associated with inputs using aria-describedby.
Error messages must have role="alert" for screen reader announcement.

### Input Types
Use appropriate input types for better UX:
- type="email" for email keyboard on mobile
- type="tel" for phone keyboard
- type="number" for numeric keyboard
- type="url" for URL keyboard
- type="date" for date picker

### Autocomplete
Enable autocomplete for common fields using autocomplete attribute.

---

## Tables Accessibility (Perceivable + Understandable)

### Table Headers
Use th with scope="col" or scope="row" attributes.

### Table Captions
Provide descriptive captions for all data tables.

### Responsive Tables
On mobile, convert to card view instead of just horizontal scroll.

---

## Images and Media (Perceivable)

### Alt Text
All images must have descriptive alt text.
Decorative images should have empty alt="" and aria-hidden="true".

### Video Captions
Provide captions/transcripts for all video content using track elements.

---

## Motion and Animation (Operable)

### Respect Reduced Motion
Disable animations for users with vestibular disorders using prefers-reduced-motion media query.

### No Autoplay
Do not autoplay videos/carousels without user control.

---

## Interactive Elements (Operable + Understandable)

### Touch Targets
Minimum size 44x44px on mobile, 24x24px on desktop.

### Link Purpose
Link text must describe destination, not generic "click here".

### Buttons vs Links
- Buttons: Trigger actions (submit, delete, open modal)
- Links: Navigate to pages

---

## Internationalization (i18n) (Understandable)

### Language Attributes
Declare page language using lang attribute on html element.
Use lang on inline elements when language changes.

### RTL Support
Use logical properties (margin-inline-start instead of margin-left) for RTL support.

---

## Error Handling (Robust + Understandable)

### Error Identification
Clearly identify errors and provide suggestions in plain language.

### Error Summary
Provide error summary at top of form with links to specific fields.

---

## Testing Checklist

### Automated Testing
- axe DevTools: 0 violations
- Lighthouse: Accessibility score >= 95
- WAVE: 0 errors
- Pa11y CI: Integrated in CI/CD

### Manual Testing
- Keyboard navigation: All features accessible
- Screen reader (NVDA/JAWS): All content announced
- High contrast mode: Content visible
- Zoom 200%: No horizontal scroll, all content visible
- Dark mode: Sufficient contrast

---

## Component-Specific Guidelines

### Navigation Menu
Use role="navigation" and aria-label.
Use aria-current for active page.

### Breadcrumbs
Use aria-label="Breadcrumb" on nav element.
Use aria-current="page" on current page.

### Tabs
Use role="tablist", role="tab", role="tabpanel".
Use aria-selected and aria-controls.

### Tooltips
Provide aria-label on trigger button.

---

## WCAG 2.1 AA Success Criteria Summary

### Level A (Must Have)
- 1.1.1 Non-text Content
- 1.2.1-1.2.3 Captions and alternatives
- 1.3.1-1.3.3 Info structure
- 1.4.1-1.4.2 Color and audio
- 2.1.1-2.1.2 Keyboard access
- 2.2.1-2.2.2 Timing control
- 2.3.1 Flash safety
- 2.4.1-2.4.4 Navigation
- 3.1.1 Language
- 3.2.1-3.2.2 Predictability
- 3.3.1-3.3.2 Error handling
- 4.1.1-4.1.2 Parsing and compatibility

### Level AA (Required)
- 1.2.4-1.2.5 Live captions
- 1.3.4-1.3.5 Orientation and input purpose
- 1.4.3 Contrast minimum (4.5:1)
- 1.4.4 Resize text (200%)
- 1.4.5 Images of text
- 1.4.10-1.4.13 Reflow, contrast, spacing, hover
- 2.4.5-2.4.7 Multiple ways, headings, focus visible
- 2.5.1-2.5.4 Pointer gestures
- 3.1.2 Language of parts
- 3.2.3-3.2.4 Consistent navigation
- 3.3.3-3.3.4 Error suggestion and prevention
- 4.1.3 Status messages

---

**Status**: Complete Compliance Guide  
**Maintained By**: Squad Produto (UX Designer)  
**Last Updated**: 2025-12-22  
**Testing**: Automated (axe, Lighthouse) + Manual (Screen readers, Keyboard)
