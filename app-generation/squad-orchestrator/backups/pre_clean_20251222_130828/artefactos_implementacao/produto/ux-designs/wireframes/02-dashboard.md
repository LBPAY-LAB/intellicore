# Dashboard Wireframe

**Screen**: Main Dashboard
**Stack**: Next.js 14 + shadcn/ui + TailwindCSS + i18next
**Purpose**: Central hub - overview of Oracles and quick actions

## Layout Components

### Top Navigation
- Logo/Brand: SuperCore v2.0
- Global Search bar
- Notifications bell with badge
- User menu dropdown
- Language selector

### Sidebar Navigation (Icons from Lucide)
1. Oráculos (Database icon)
2. Objetos (Package icon)
3. Agentes (Bot icon)
4. Workflows (GitBranch icon)
5. Deploy (Rocket icon)
6. Settings
7. Docs
8. Logout

### Stats Cards (3 cards)
1. Oráculos Ativos: 5
2. Objects Definidos: 23
3. Agentes Executando: 8

### Oracle Cards List
Each card shows:
- Icon + Name
- Description
- Domain type, object count, agent count
- Status indicator (Active/Paused/Error/Stopped)
- Last updated timestamp
- Actions: Ver Detalhes, Gerenciar, Play button
- Menu dropdown (Edit, Clone, Export, Delete)

## Responsive Behavior
- Mobile: Sidebar collapses, cards stack
- Tablet: 2-column grid
- Desktop: 3-column grid, full sidebar

## Accessibility (WCAG 2.1 AA)
- Keyboard navigation
- Screen reader support
- Color contrast 4.5:1
- Focus indicators

---

**Status**: Ready for Implementation
**Stack Compliance**: ✅ Next.js 14, shadcn/ui, Lucide Icons
**Accessibility**: ✅ WCAG 2.1 AA
**Responsive**: ✅ Mobile, Tablet, Desktop
