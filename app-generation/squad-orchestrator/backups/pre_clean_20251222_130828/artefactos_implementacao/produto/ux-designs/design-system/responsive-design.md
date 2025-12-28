# Responsive Design Considerations

**Document**: Responsive design guidelines for SuperCore v2.0  
**Stack**: TailwindCSS + Next.js 14  
**Target Devices**: Mobile, Tablet, Desktop

---

## Breakpoint Strategy

### Tailwind Breakpoints
```
sm:  640px  (Mobile landscape, small tablets)
md:  768px  (Tablets)
lg:  1024px (Desktops, laptops)
xl:  1280px (Large desktops)
2xl: 1536px (Ultra-wide displays)
```

### Design Approach
**Mobile-First**: Design for mobile first, then enhance for larger screens

---

## Layout Patterns by Screen Size

### Mobile (< 768px)

#### Navigation
- Sidebar collapses to hamburger menu (Sheet component)
- Top nav bar stacks vertically if needed
- Bottom navigation for quick actions (future consideration)

#### Content Layout
- Single column layout
- Stats cards stack vertically
- Tables convert to cards/list view
- Modals become full-screen sheets

#### Typography
- Slightly larger base font (16px minimum for readability)
- Reduced heading sizes (h1: 1.5rem instead of 2rem)
- Larger touch targets (min 44x44px)

#### Spacing
- Reduced padding (p-4 instead of p-8)
- Tighter spacing between elements
- More whitespace around interactive elements

#### Forms
- Full-width inputs
- Larger input height (h-12 instead of h-10)
- Stack labels above inputs
- Simplified multi-step forms

#### Example:
```tsx
<div className="p-4 md:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Dashboard
  </h1>
  
  {/* Stats cards - stack on mobile */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard title="Oráculos" value={5} />
    <StatCard title="Objects" value={23} />
    <StatCard title="Agentes" value={8} />
  </div>
</div>
```

---

### Tablet (768px - 1024px)

#### Navigation
- Sidebar can toggle between collapsed (icons only) and expanded
- Top nav remains visible
- Breadcrumbs added

#### Content Layout
- 2-column layout for cards
- Tables with horizontal scroll if needed
- Modals are centered, not full-screen

#### Typography
- Standard font sizes
- Normal heading hierarchy

#### Spacing
- Standard padding (p-6 md:p-8)

#### Forms
- Can use 2-column layouts for related fields
- Standard input sizing

---

### Desktop (> 1024px)

#### Navigation
- Full sidebar always visible
- Breadcrumbs for deep navigation
- Command palette (⌘K) available

#### Content Layout
- 3+ column layouts
- Maximum content width (max-w-7xl) to prevent overstretching
- Side-by-side forms and previews

#### Typography
- Full heading sizes
- Comfortable line heights (leading-relaxed)

#### Spacing
- Generous padding (p-8 lg:p-12)
- Adequate whitespace

#### Forms
- Multi-column layouts
- Inline labels for compact forms
- Side panels for additional info

#### Hover States
- All interactive elements have hover effects
- Tooltips on icons
- Preview on hover (e.g., Oracle cards)

#### Example:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {oracles.map(oracle => (
    <OracleCard 
      key={oracle.id}
      oracle={oracle}
      className="hover:shadow-lg transition-shadow"
    />
  ))}
</div>
```

---

## Component Responsive Behavior

### Sidebar Navigation
```tsx
// Mobile: Drawer (Sheet)
// Desktop: Fixed sidebar

<Sheet> {/* Mobile only */}
  <SheetTrigger asChild className="md:hidden">
    <Button variant="ghost" size="icon">
      <Menu />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SidebarContent />
  </SheetContent>
</Sheet>

<aside className="hidden md:block w-64 lg:w-72"> {/* Desktop only */}
  <SidebarContent />
</aside>
```

### Data Tables
```tsx
// Mobile: Card view
// Desktop: Table view

<div className="md:hidden"> {/* Mobile cards */}
  {items.map(item => (
    <Card key={item.id}>
      <CardHeader>{item.name}</CardHeader>
      <CardContent>{item.description}</CardContent>
    </Card>
  ))}
</div>

<div className="hidden md:block"> {/* Desktop table */}
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>...</TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Forms
```tsx
<form className="space-y-4">
  {/* Single column mobile, 2 column desktop */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="firstName">First Name</Label>
      <Input id="firstName" />
    </div>
    <div>
      <Label htmlFor="lastName">Last Name</Label>
      <Input id="lastName" />
    </div>
  </div>
</form>
```

### Modals/Dialogs
```tsx
<Dialog>
  <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl">
    {/* Modal scales with screen size */}
  </DialogContent>
</Dialog>
```

---

## Touch Target Sizes

### Minimum Sizes (WCAG AAA)
- Touch targets: 44x44px minimum
- Desktop click targets: 24x24px minimum

```tsx
<Button 
  size="icon"
  className="h-11 w-11 sm:h-10 sm:w-10" {/* Larger on mobile */}
>
  <Icon />
</Button>
```

---

## Images & Media

### Responsive Images
```tsx
import Image from 'next/image';

<Image
  src="/oracle-icon.png"
  alt="Oracle Icon"
  width={100}
  height={100}
  className="w-full h-auto md:w-1/2 lg:w-1/3"
  priority
/>
```

### Video Embedding
```tsx
<div className="aspect-video w-full">
  <video 
    src="/tutorial.mp4"
    controls
    className="w-full h-full"
  />
</div>
```

---

## Typography Scaling

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Heading
</h1>

<p className="text-sm sm:text-base md:text-lg">
  Body text
</p>
```

---

## Spacing Scale

```tsx
{/* Padding scales with screen size */}
<div className="p-4 md:p-6 lg:p-8 xl:p-12">
  Content
</div>

{/* Gaps scale */}
<div className="flex gap-2 md:gap-4 lg:gap-6">
  Items
</div>
```

---

## Performance Optimizations

### Lazy Loading Images
```tsx
<Image
  src={src}
  alt={alt}
  loading="lazy" {/* Lazy load off-screen images */}
/>
```

### Code Splitting
Next.js automatically code-splits by route.

For heavy components:
```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-side only if needed
});
```

### Responsive Fonts Loading
```tsx
// next.config.js
module.exports = {
  experimental: {
    optimizeFonts: true,
  },
};
```

---

## Testing Responsive Design

### Browser DevTools
- Chrome DevTools device toolbar
- Test common devices: iPhone SE, iPhone 14 Pro, iPad, Desktop

### Real Devices
- Test on at least one physical mobile device
- Test on at least one physical tablet

### Responsive Design Checklist
- [ ] All content readable without horizontal scroll
- [ ] Touch targets are min 44x44px on mobile
- [ ] Forms are usable on mobile (large inputs, good spacing)
- [ ] Images scale appropriately
- [ ] Navigation is accessible on all screens
- [ ] Modals/dialogs work on mobile (not cut off)
- [ ] Tables either scroll or convert to cards on mobile
- [ ] Font sizes are legible (min 16px body text on mobile)

---

## Common Patterns

### Container Widths
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  {/* Content constrained to readable width */}
</div>
```

### Flex Direction Changes
```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Stack vertically on mobile, horizontal on desktop */}
</div>
```

### Hide/Show by Breakpoint
```tsx
{/* Show only on mobile */}
<div className="block md:hidden">Mobile only</div>

{/* Show only on desktop */}
<div className="hidden md:block">Desktop only</div>

{/* Show only on tablet and up */}
<div className="hidden sm:block">Tablet+</div>
```

---

**Status**: Complete Guide  
**Maintained By**: Squad Produto (UX Designer)  
**Last Updated**: 2025-12-22
