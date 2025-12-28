# Login / Registration Wireframes

**Screen**: Login & Registration
**Stack**: Next.js 14 + shadcn/ui + TailwindCSS + i18next
**Purpose**: Authentication entry point for SuperCore Super Portal

## 1. Login Screen - Main Layout

The login screen is centered, uses shadcn/ui Card component with dark mode support.

### Key Features:
- Language selector (PT-BR, EN, ES) top-right
- SuperCore branding and logo
- Email/password inputs with validation
- Remember me checkbox
- SSO/OAuth options
- Responsive (mobile-first)
- WCAG 2.1 AA compliant

### Components (shadcn/ui):
- Card, Input, Button, Checkbox, Select, Link
- Lucide icons: Eye, Globe, Mail, Lock

### Validation:
- Email format validation
- Password minimum 8 characters
- Error states with visual feedback

## 2. Registration Screen

### Additional Fields:
- Full Name (required)
- Confirm Password (must match)
- Role Selection (PM, Compliance, Admin)
- Terms acceptance checkbox (required)

### Password Strength Indicator:
- Visual feedback for password complexity
- Requirements: 8+ chars, 1 uppercase, 1 number

## 3. Responsive Behavior

### Mobile (< 768px):
- Full-width inputs
- Stacked layout
- Larger touch targets

### Desktop (> 1024px):
- Centered card (max-width 450px)
- Hover states
- Keyboard shortcuts

---

**Status**: Ready for Implementation
**Accessibility**: ✅ WCAG 2.1 AA compliant
**i18n**: ✅ Multi-language support
