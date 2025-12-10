# Sprint 4 - Verification Checklist

## 🔍 Testing & Verification Guide

Use this checklist to verify that the Object Definitions CRUD is working correctly.

---

## Prerequisites

### Before Testing
- [ ] Backend running on `http://localhost:8080`
- [ ] Frontend running on `http://localhost:3000`
- [ ] User authenticated (Logto)
- [ ] Browser DevTools open (Console + Network tabs)

---

## 1. Navigation & Access

### Backoffice Access
- [ ] Navigate to `http://localhost:3000/backoffice`
- [ ] Dashboard loads successfully
- [ ] "Object Definitions" card visible
- [ ] Click "Object Definitions" → navigates to list page

### Sidebar Navigation
- [ ] Sidebar is visible on desktop
- [ ] "Object Definitions" menu item works
- [ ] Sidebar collapses on mobile (hamburger menu)

---

## 2. List Page Tests

### Basic Functionality
- [ ] URL: `/backoffice/object-definitions`
- [ ] Page title shows "Object Definitions"
- [ ] "New Object" button visible in top-right
- [ ] Search input present
- [ ] Table displays (even if empty)

### With Data
- [ ] Table shows all object definitions
- [ ] Columns display correctly:
  - Name (monospace font)
  - Display Name
  - Description (truncated)
  - Version (badge)
  - States (badge with count)
  - Status (Active/Inactive badge)
  - Created At (formatted date)
  - Actions (3 buttons)

### Search Functionality
- [ ] Type in search box
- [ ] Results filter in real-time
- [ ] Try searching by name: `cliente`
- [ ] Try searching by display name: `Cliente`
- [ ] Clear search → all results return

### Empty States
- [ ] If no data, see message: "No object definitions yet"
- [ ] "Create your first object" button present
- [ ] If search returns empty: "No object definitions found matching your search"

### Actions Buttons
- [ ] Each row has 3 buttons:
  - Eye icon (View)
  - Pencil icon (Edit)
  - Trash icon (Delete)
- [ ] Hover shows button highlights

---

## 3. Create Page Tests

### Navigation
- [ ] Click "New Object" button
- [ ] Redirects to `/backoffice/object-definitions/new`
- [ ] Page title: "Create Object Definition"
- [ ] "Back to List" button visible

### Form Structure
- [ ] 4 sections visible:
  1. Basic Information
  2. JSON Schema
  3. State Machine (FSM)
  4. UI Hints

### Basic Information Section
- [ ] Name field present (with asterisk)
- [ ] Display Name field present (with asterisk)
- [ ] Description textarea present (optional)
- [ ] Help text under each field

### JSON Schema Editor
- [ ] Monaco Editor loads
- [ ] Dark theme applied
- [ ] Default schema present:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the entity"
    }
  },
  "required": ["name"]
}
```
- [ ] Line numbers visible
- [ ] Syntax highlighting works

### FSM Editor
- [ ] Monaco Editor loads
- [ ] Default FSM present:
```json
{
  "initial": "ACTIVE",
  "states": ["ACTIVE", "INACTIVE"],
  "transitions": [...]
}
```

### UI Hints Editor
- [ ] Monaco Editor loads
- [ ] Empty object `{}` by default

### Form Actions
- [ ] "Cancel" button (goes back)
- [ ] "Create" button (primary color)

---

## 4. Form Validation Tests

### Name Validation
- [ ] Leave name empty → click Create
- [ ] Error: "Name is required"
- [ ] Enter uppercase name: `TestObject`
- [ ] Error: "Name must be lowercase with hyphens or underscores only"
- [ ] Enter valid name: `test_object` → error clears
- [ ] Try spaces: `test object` → error shown
- [ ] Try special chars: `test@object` → error shown

### Display Name Validation
- [ ] Leave empty → click Create
- [ ] Error: "Display name is required"
- [ ] Enter any text → error clears

### JSON Schema Validation
- [ ] Break JSON syntax: remove closing brace
- [ ] Error appears: "Invalid JSON syntax"
- [ ] Fix JSON → error clears
- [ ] Change type to "array"
- [ ] Error: "Schema root type must be 'object'"
- [ ] Remove "properties" field
- [ ] Error: "Schema must have 'properties' field"

### FSM Validation
- [ ] Break FSM JSON
- [ ] Error appears
- [ ] Remove "initial" field
- [ ] Error: "FSM must have an 'initial' state"
- [ ] Remove "states" field
- [ ] Error: "FSM must have a 'states' array"

### UI Hints Validation
- [ ] Break JSON syntax
- [ ] Error: "Invalid JSON syntax"
- [ ] Fix → error clears

### Submit with Errors
- [ ] Create form with validation errors
- [ ] Click "Create"
- [ ] Alert appears: "Please fix the errors in the form"
- [ ] All errors highlighted in red

---

## 5. Create Success Test

### Happy Path
- [ ] Fill valid data:
  - Name: `test_cliente`
  - Display Name: `Test Cliente`
  - Description: `Cliente de teste`
  - Schema: (use default or custom)
  - FSM: (use default)
  - UI Hints: (leave empty or add)
- [ ] Click "Create"
- [ ] "Saving..." shows on button
- [ ] Button disabled during save
- [ ] Success toast appears: "Object definition created successfully"
- [ ] Redirects to view page: `/backoffice/object-definitions/[id]`

---

## 6. View Page Tests

### Navigation
- [ ] From list, click eye icon on any row
- [ ] Redirects to `/backoffice/object-definitions/[id]`
- [ ] URL contains object definition ID (UUID)

### Header
- [ ] "Back" button present
- [ ] Display name as page title
- [ ] Status badge (Active/Inactive)
- [ ] Version badge (v1, v2, etc.)
- [ ] Monospace font for name below title
- [ ] "Edit" button in top-right

### Overview Card
- [ ] Shows basic information:
  - Name
  - Display Name
  - Version
  - Status (with icon)
  - Description
  - Created At (formatted)
  - Updated At (formatted)

### Tabs
- [ ] 5 tabs visible:
  1. Schema
  2. State Machine
  3. Validation Rules
  4. UI Hints
  5. Relationships
- [ ] Default tab selected (Schema or Overview)

### Schema Tab
- [ ] Click "Schema" tab
- [ ] JSON Schema card appears
- [ ] Title: "JSON Schema"
- [ ] Syntax highlighting applied
- [ ] Line numbers visible
- [ ] Scrollable if long
- [ ] Dark background

### State Machine Tab
- [ ] Click "State Machine" tab
- [ ] Card title: "State Machine"
- [ ] Section: "Initial State"
- [ ] Initial state shown as green badge
- [ ] Section: "States"
- [ ] All states shown as badges
- [ ] Initial state has green background
- [ ] Other states have gray background
- [ ] Section: "Transitions" (if any)
- [ ] Each transition shows: FROM → TO (on: event)

### Validation Rules Tab
- [ ] Click "Validation Rules" tab
- [ ] If rules exist, list shown
- [ ] Each rule shows: name, type badge, config JSON
- [ ] If no rules: "No validation rules defined"

### UI Hints Tab
- [ ] Click "UI Hints" tab
- [ ] JSON viewer shows UI hints
- [ ] Syntax highlighted
- [ ] If empty: shows `{}`

### Relationships Tab
- [ ] Click "Relationships" tab
- [ ] If relationships exist, badges shown
- [ ] If none: "No relationships defined"

---

## 7. Edit Page Tests

### Navigation
- [ ] From view page, click "Edit" button
- [ ] Redirects to `/backoffice/object-definitions/[id]/edit`
- [ ] OR from list, click pencil icon

### Form Pre-population
- [ ] All fields pre-filled with existing data
- [ ] Name field DISABLED (grayed out)
- [ ] Display Name editable
- [ ] Description editable
- [ ] Schema editor shows existing schema
- [ ] FSM editor shows existing FSM
- [ ] UI Hints editor shows existing hints

### Editing
- [ ] Change Display Name: `Updated Name`
- [ ] Change Description: `Updated description`
- [ ] Modify schema (add a field)
- [ ] Modify FSM (add a state)
- [ ] Modify UI Hints
- [ ] Click "Update" button
- [ ] "Saving..." shows
- [ ] Success toast: "Object definition updated successfully"
- [ ] Redirects to view page
- [ ] Changes reflected in view

### Edit Validation
- [ ] Same validation as create
- [ ] Cannot change name (field disabled)
- [ ] Other fields validated same way

---

## 8. Delete Tests

### Delete Flow
- [ ] From list, click trash icon
- [ ] Dialog appears: "Delete Object Definition"
- [ ] Warning text: "This action cannot be undone"
- [ ] Two buttons: "Cancel" and "Delete"
- [ ] Click "Cancel" → dialog closes, nothing happens
- [ ] Click trash icon again
- [ ] Click "Delete" (red button)
- [ ] "Deleting..." shows on button
- [ ] Success toast: "Object definition deleted successfully"
- [ ] Item removed from list
- [ ] Dialog closes

### Delete from View Page
- [ ] Navigate to view page
- [ ] Click "Edit" → Edit page
- [ ] No delete button on view page (by design)
- [ ] Delete only from list page

---

## 9. Responsive Design Tests

### Desktop (>1024px)
- [ ] Sidebar always visible
- [ ] Table shows all columns
- [ ] Monaco editor full height
- [ ] Form in single column or two columns
- [ ] Buttons aligned properly

### Tablet (768px - 1024px)
- [ ] Resize browser to tablet size
- [ ] Sidebar collapses (hamburger menu)
- [ ] Click hamburger → sidebar slides in
- [ ] Table responsive, may scroll horizontally
- [ ] Form still usable

### Mobile (<768px)
- [ ] Resize to mobile size
- [ ] Hamburger menu present
- [ ] Table converts to cards (or scrolls)
- [ ] Form inputs full width
- [ ] Monaco editor adjusts height
- [ ] Buttons stack vertically
- [ ] Touch-friendly button sizes

---

## 10. Error Handling Tests

### API Error
- [ ] Stop backend server
- [ ] Try to load list page
- [ ] Loading spinner shows
- [ ] Error message appears: "Failed to load object definitions"
- [ ] Error toast shows
- [ ] Helpful error text

### Network Error
- [ ] Disconnect internet
- [ ] Try any operation
- [ ] Error toast: "Network error"
- [ ] Graceful failure

### 404 Error
- [ ] Navigate to `/backoffice/object-definitions/invalid-uuid`
- [ ] Loading shows
- [ ] Error: "Object definition not found"
- [ ] OR 404 page shows

### Validation Error
- [ ] Create with invalid data
- [ ] Backend returns 400 error
- [ ] Error toast shows backend message
- [ ] Form errors highlighted

---

## 11. Loading States Tests

### List Page Loading
- [ ] Refresh page
- [ ] Loading spinner shows (centered)
- [ ] Spinner animates (spinning)
- [ ] Data loads → spinner disappears

### View Page Loading
- [ ] Click view on any item
- [ ] Loading spinner shows
- [ ] Data loads → content appears

### Edit Page Loading
- [ ] Navigate to edit page
- [ ] Loading spinner shows
- [ ] Form loads with data

### Button Loading States
- [ ] Click "Create" or "Update"
- [ ] Button shows "Saving..."
- [ ] Spinner icon on button
- [ ] Button disabled during save
- [ ] Re-enables after success/error

---

## 12. Toast Notifications Tests

### Success Toasts
- [ ] Create object → green toast "created successfully"
- [ ] Update object → green toast "updated successfully"
- [ ] Delete object → green toast "deleted successfully"
- [ ] Toast auto-dismisses after 3-5 seconds
- [ ] Can manually close toast (X button)

### Error Toasts
- [ ] API error → red toast with error message
- [ ] Validation error → red toast
- [ ] Network error → red toast
- [ ] Toast shows error icon

---

## 13. Browser Compatibility Tests

### Chrome
- [ ] All features work
- [ ] Monaco editor loads
- [ ] Syntax highlighting works
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Editor loads
- [ ] Toasts display correctly

### Safari
- [ ] All features work
- [ ] Editor loads
- [ ] CSS renders correctly

### Edge
- [ ] All features work
- [ ] No issues

---

## 14. Performance Tests

### Page Load Speed
- [ ] List page loads < 2 seconds
- [ ] View page loads < 1 second
- [ ] Create/Edit pages load < 1.5 seconds

### Monaco Editor Load
- [ ] Editor loads within 1 second
- [ ] No lag when typing
- [ ] Syntax highlighting instant

### Search Performance
- [ ] Search is instant (< 100ms)
- [ ] No lag with large datasets

---

## 15. Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Focus visible on all elements
- [ ] Enter submits form
- [ ] Esc closes dialogs
- [ ] Arrow keys work in Monaco editor

### Screen Reader
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] ARIA labels present

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Error messages have sufficient contrast
- [ ] Badges readable

---

## 16. Data Integrity Tests

### Create
- [ ] Created object appears in list
- [ ] All fields saved correctly
- [ ] Version is 1
- [ ] Status is Active
- [ ] Created/Updated timestamps set

### Update
- [ ] Changes persist after page refresh
- [ ] Version increments (v1 → v2)
- [ ] Updated timestamp changes
- [ ] Name stays same (immutable)

### Delete
- [ ] Deleted object removed from list
- [ ] Cannot access deleted object by ID
- [ ] Soft delete (not hard delete)

---

## 17. Edge Cases

### Long Names
- [ ] Create with very long name (50+ chars)
- [ ] Display truncates gracefully
- [ ] Full name visible on hover or view page

### Large JSON Schemas
- [ ] Create with 100+ properties
- [ ] Editor handles large JSON
- [ ] Scrollable in viewer
- [ ] No performance issues

### Special Characters
- [ ] Description with emoji: `Test 🚀`
- [ ] Displays correctly
- [ ] Saves and loads correctly

### Empty Fields
- [ ] Description empty → saves as null/empty
- [ ] UI Hints empty → saves as `{}`
- [ ] No errors

---

## 18. Integration Tests

### With Backend
- [ ] All API calls succeed
- [ ] Bearer token sent in headers
- [ ] Responses parsed correctly
- [ ] Error responses handled

### With Authentication
- [ ] Logged in user can access
- [ ] Logged out user redirected to login
- [ ] Token refresh works automatically

---

## 🎯 Summary Checklist

- [ ] All list page features work
- [ ] Create flow complete end-to-end
- [ ] View page displays all data correctly
- [ ] Edit flow preserves and updates data
- [ ] Delete flow with confirmation works
- [ ] Form validation catches all errors
- [ ] Monaco editor works for all fields
- [ ] FSM viewer displays correctly
- [ ] Search/filter works
- [ ] Toasts show for all actions
- [ ] Loading states present
- [ ] Error handling graceful
- [ ] Responsive on all screen sizes
- [ ] Keyboard accessible
- [ ] No console errors
- [ ] Performance acceptable

---

## 🐛 Bug Report Template

If you find issues, report using this format:

```
**Title**: [Brief description]

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Browser**: Chrome 120
**Screen Size**: 1920x1080
**URL**: /backoffice/object-definitions

**Screenshots**:
[Attach if helpful]

**Console Errors**:
[Copy from DevTools console]
```

---

## ✅ Sign-off

Once all items checked:

**Tested by**: ___________________
**Date**: ___________________
**Status**: APPROVED / NEEDS FIX
**Notes**:

---

**All checks passed? Ready for production! 🚀**
