# UI Components Inventory

**Document**: Complete inventory of UI components used in SuperCore v2.0  
**Stack**: shadcn/ui + Lucide Icons + Custom Components  
**Purpose**: Reference for implementation and design system

---

## shadcn/ui Core Components

All components from [shadcn/ui](https://ui.shadcn.com/) used in SuperCore wireframes:

### Layout & Structure
- **Card**: Primary container for content blocks
  - CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Separator**: Visual divider between sections
- **ScrollArea**: Scrollable content areas
- **Accordion**: Collapsible content sections (Object Definitions list)
- **Tabs**: Tabbed interfaces (Oracle detail, Settings)
- **Sheet**: Mobile sidebar/drawer

### Navigation
- **NavigationMenu**: Top navigation bar
- **Breadcrumb**: Hierarchical navigation (future)

### Form Components
- **Form**: Form wrapper with validation (react-hook-form + Zod)
- **Input**: Text input fields
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Checkbox**: Boolean selection
- **RadioGroup**: Mutually exclusive options
- **Switch**: Toggle button
- **Label**: Form field labels
- **Button**: Primary actions, secondary actions, icon buttons

### Data Display
- **Table**: Data tables with sorting/filtering
- **DataTable**: Enhanced table with pagination
- **Badge**: Status indicators, tags, counts
- **Avatar**: User profile images
- **Progress**: Progress bars (upload progress)
- **Skeleton**: Loading placeholders

### Feedback
- **Alert**: Important messages (warnings, errors, info)
- **AlertDialog**: Confirmation modals
- **Dialog**: Generic modals
- **Toast**: Temporary notifications
- **Tooltip**: Contextual hints on hover

### Utility
- **DropdownMenu**: Context menus, action menus
- **Popover**: Floating content panels
- **Collapsible**: Expandable/collapsible content
- **Command**: Command palette (future)

---

## Lucide Icons

Icons used throughout the application from [Lucide Icons](https://lucide.dev/):

### Navigation & Actions
- Database, Package, Bot, GitBranch, Rocket (sidebar)
- Settings, Book, LogOut
- Search, Bell, Globe, ChevronLeft, ChevronRight, ChevronDown
- Menu (hamburger)

### CRUD & File Operations
- Plus, Edit, Trash2, Copy, Save, X (close)
- Upload, Download, File, FileText, FileSpreadsheet
- Folder, FolderOpen

### Status & State
- Check, CheckCircle, X, XCircle, AlertCircle, AlertTriangle
- Play, Pause, Square (stop)
- Eye, EyeOff (password visibility)

### User & Security
- User, Users, Shield, Lock, Key, Smartphone

### Data & Content
- Image, Video, Music, Link
- Table, BarChart, PieChart, TrendingUp

### Feedback
- Info, HelpCircle, MessageSquare
- ThumbsUp, ThumbsDown, Heart

---

## Custom Components

Components specific to SuperCore (to be implemented):

### OracleCard
Display Oracle summary with status, actions, metadata
- Props: oracle (object), onPlay, onManage, onDelete
- Uses: Card, Badge, DropdownMenu, Button

### ObjectDefinitionCard
Display Object Definition summary
- Props: objectDef (object), onEdit, onView
- Uses: Card, Badge, Icons

### KnowledgeGraphViewer
Interactive graph visualization using React Flow
- Props: oracleId, nodes, edges
- Library: react-flow-renderer
- Features: Zoom, pan, node click → navigate

### UploadZone
Drag-and-drop file upload area
- Props: onFilesSelected, acceptedFormats, maxSize
- Library: react-dropzone
- Features: Drag-drop, multiple files, format validation

### StatCard
Dashboard statistics card (Oracles Active, Objects, Agents)
- Props: title, value, icon, color
- Uses: Card, Icons

### ProcessingStatusCard
Show file upload/processing progress
- Props: filename, progress (0-100), status, steps
- Uses: Card, Progress, Badge

### PasswordStrengthIndicator
Visual password strength feedback
- Props: password (string)
- Returns: strength (weak/medium/strong), color, percentage

### FSMDiagram
Finite State Machine visual editor
- Props: states, transitions
- Library: React Flow
- Features: Edit states, transitions, conditions

### MarkdownEditor
Markdown editor with preview (for specifications)
- Props: initialValue, onChange
- Library: react-markdown + editor (monaco-editor or similar)

---

## Design Tokens (TailwindCSS)

### Colors
Using semantic tokens for dark mode support:

```css
/* Background */
--background: white (light) / slate-950 (dark)
--card: white / slate-900
--popover: white / slate-900

/* Foreground */
--foreground: slate-900 / white
--muted-foreground: slate-600 / slate-400

/* Borders */
--border: slate-200 / slate-800
--input: slate-200 / slate-800

/* Primary (brand) */
--primary: blue-600 / blue-500
--primary-foreground: white / white

/* Status Colors */
--success: green-600
--warning: yellow-600
--error: red-600
--info: blue-600
```

### Typography
```css
/* Font Families */
font-sans: Inter, system-ui, sans-serif
font-mono: 'Fira Code', monospace

/* Font Sizes (Tailwind scale) */
text-xs: 0.75rem
text-sm: 0.875rem
text-base: 1rem
text-lg: 1.125rem
text-xl: 1.25rem
text-2xl: 1.5rem
text-3xl: 1.875rem

/* Font Weights */
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Spacing
Using Tailwind's default spacing scale (0.25rem increments)

### Border Radius
```css
rounded-sm: 0.125rem
rounded: 0.25rem
rounded-md: 0.375rem
rounded-lg: 0.5rem
rounded-xl: 0.75rem
rounded-full: 9999px
```

---

## Responsive Breakpoints

```css
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X extra large devices */
```

---

## Component Usage Patterns

### Form Validation
```typescript
// Using react-hook-form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

### Toast Notifications
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: 'Success!',
  description: 'Oracle created successfully.',
  variant: 'default', // or 'destructive'
});
```

### Dark Mode Toggle
```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

// Toggle between light/dark
setTheme(theme === 'dark' ? 'light' : 'dark');
```

---

## Animation & Transitions

All animations use Tailwind's transition utilities:

```css
/* Hover effects */
transition-colors duration-200 hover:bg-primary

/* Focus states */
focus:ring-2 focus:ring-primary focus:ring-offset-2

/* Fade in/out */
animate-in fade-in duration-300
animate-out fade-out duration-200

/* Slide in/out */
slide-in-from-bottom-4
slide-out-to-bottom-4
```

---

## Dependencies

### Core UI
```json
{
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "lucide-react": "latest"
}
```

### Form & Validation
```json
{
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.22.0"
}
```

### Specialized
```json
{
  "react-flow-renderer": "^11.0.0",
  "react-dropzone": "^14.2.0",
  "react-markdown": "^9.0.0",
  "next-i18next": "^15.0.0"
}
```

---

**Status**: Complete Inventory  
**Usage**: Reference during implementation  
**Maintained By**: Squad Produto (UX Designer)  
**Last Updated**: 2025-12-22
