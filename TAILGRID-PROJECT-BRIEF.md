# TailGrid - Project Brief

> **The AI-native data grid for modern web apps**

---

## Executive Summary

TailGrid is an open-source, AI-powered data grid component that differentiates from existing solutions (AG Grid, TanStack Table) by offering **natural language querying**, smart filtering, and AI-assisted data exploration.

**Key Differentiator**: No major data grid offers AI-native features. TailGrid will be the first.

---

## Project Identity

| Item | Value |
|------|-------|
| **Name** | TailGrid |
| **Tagline** | "The AI-native data grid for modern web apps" |
| **GitHub** | github.com/Tail-Labs/tailgrid |
| **npm Scope** | @tailgrid |
| **Domain** | tailgrid.dev (everything - docs, blog, pricing) |
| **License** | MIT (open-source) |

---

## Market Opportunity

### Current Landscape

| Library | Downloads/Month | Model | Key Strength |
|---------|----------------|-------|--------------|
| TanStack Table | ~4M+ | 100% Free MIT | Headless, flexible |
| AG Grid Community | ~1.2M+ | Free + Enterprise ($999/dev) | Feature-rich |
| react-data-grid | ~500K+ | MIT | Excel-like editing |
| MUI X Data Grid | ~800K+ | Free + Pro/Premium | Material UI ecosystem |

### Competitor Success: AG Grid

- **Revenue**: £16M+ annually (2022)
- **Team**: 60+ employees in London
- **Customers**: 50%+ of Fortune 500
- **Model**: Open-core (Community free, Enterprise $999/dev)
- **Bootstrapped**: Self-funded, profitable

### Gap in the Market

**No grid offers AI-native features:**
- Natural language filtering
- Smart column suggestions
- Auto-generated insights
- Anomaly detection

---

## Unique Value Proposition

### Core AI Capabilities

#### 1. Natural Language Query Bar
```
User types: "customers in California with revenue > 10k"
     ↓
AI generates: {
  filters: [
    { column: 'state', value: 'CA' },
    { column: 'revenue', op: '>', value: 10000 }
  ]
}
```

#### 2. Smart Suggestions
- "3 customers have unusually high orders this week"
- "Revenue trending 15% up compared to last month"
- Auto-detect column types (dates, currencies, categories)

#### 3. AI-Assisted Configuration
- Suggest column widths based on content
- Recommend groupings based on data patterns
- Auto-format cells (currency, dates, percentages)

#### 4. Export with Insights
- AI-generated summary at top of exports
- Automatic chart suggestions

### AI Integration Options

| Option | Description | Target |
|--------|-------------|--------|
| **BYO API** | Users provide OpenAI/Claude/local LLM key | Free tier |
| **TailGrid Cloud** | Hosted AI service, no key needed | Premium tier |

---

## Technical Architecture

### Tech Stack

```
Core Stack:
├── TypeScript 5.x        # Type safety
├── TanStack Table v8     # Headless table logic (foundation)
├── Tailwind CSS v4       # Styling
├── Radix UI              # Accessible primitives
├── Framer Motion         # Animations
└── Vitest                # Testing

Build & Distribution:
├── Turborepo             # Monorepo management
├── pnpm                  # Package manager
├── tsup                  # Bundling (ESM + CJS)
├── Changesets            # Version management
└── Storybook             # Component docs

AI Integration:
├── Vercel AI SDK         # Streaming responses
├── Zod                   # Schema validation
└── Multi-provider        # OpenAI, Claude, Ollama
```

### Why TanStack Table as Foundation?

- Battle-tested table logic (sorting, filtering, pagination)
- 100% free MIT license
- Headless = we add our own UI + AI layer
- Avoids reinventing complex table algorithms
- Tanner Linsley partners with AG Grid

---

## Package Structure

```
tailgrid/                         # github.com/Tail-Labs/tailgrid
├── packages/
│   ├── @tailgrid/core            # Framework-agnostic (95% of logic)
│   │   ├── table/                # Table state, sorting, filtering
│   │   ├── ai/                   # AI query parsing types
│   │   └── types/                # Shared TypeScript types
│   │
│   ├── @tailgrid/react           # React adapter (~thin wrapper)
│   │   ├── components/           # TailGrid, GridHeader, GridCell, etc.
│   │   ├── hooks/                # useTailGrid, useAIQuery
│   │   └── themes/               # CSS themes
│   │
│   ├── @tailgrid/vue             # Vue adapter (future)
│   ├── @tailgrid/svelte          # Svelte adapter (future)
│   │
│   ├── @tailgrid/ai              # AI query parsing (multi-provider)
│   │   ├── providers/            # OpenAI, Anthropic, Ollama, Custom
│   │   ├── parseQuery.ts         # NL → filter/sort
│   │   └── generatePrompt.ts     # Schema → prompt
│   │
│   ├── @tailgrid/themes          # Pre-built themes
│   │   ├── default.css
│   │   ├── dark.css
│   │   └── minimal.css
│   │
│   └── @tailgrid/export          # Export utilities
│       ├── csv.ts
│       └── excel.ts
│
├── apps/
│   ├── docs/                     # Documentation (tailgrid.dev)
│   ├── playground/               # Interactive demo
│   └── storybook/                # Component stories
│
├── turbo.json
├── pnpm-workspace.yaml
├── LICENSE (MIT)
└── README.md
```

### Framework-Agnostic Architecture

```
@tailgrid/core (95% of logic)
       │
       ├──→ @tailgrid/react   (~50 lines wrapper)
       ├──→ @tailgrid/vue     (~50 lines wrapper) [future]
       └──→ @tailgrid/svelte  (~50 lines wrapper) [future]
```

Adding Vue/Svelte support: **1-2 days each** (following TanStack pattern)

---

## MVP Features (Phase 1)

### Must-Have (8-10 weeks)

| Feature | Description | Priority |
|---------|-------------|----------|
| Column Display | Headers, cells, custom renderers | P0 |
| Sorting | Single + multi-column | P0 |
| Filtering | Column filters, global search | P0 |
| Pagination | Client-side, configurable sizes | P0 |
| Row Selection | Checkbox, click, select all | P0 |
| Column Resizing | Drag handles, auto-fit | P0 |
| **AI Query Bar** | Natural language → filter/sort | P0 |
| Keyboard Nav | Arrow keys, Tab, Enter | P1 |
| Theming | Tailwind-based, dark mode | P1 |

### Post-MVP (Phase 2)

- Virtual scrolling (1000+ rows)
- Server-side pagination/filtering
- Column hiding/reordering
- Cell editing
- CSV export
- Row grouping (basic)

### Future (Phase 3+)

- Excel export
- Advanced AI insights
- Tree data
- Sparklines
- Master-detail rows

---

## Business Model

### Open Core (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  FREE (MIT License)                                         │
├─────────────────────────────────────────────────────────────┤
│  ✓ All table features (sorting, filtering, pagination)     │
│  ✓ Basic AI query bar (BYO API key)                        │
│  ✓ Default theme                                           │
│  ✓ Community support (GitHub issues)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PREMIUM ($99-299/year per developer)                       │
├─────────────────────────────────────────────────────────────┤
│  ✓ Advanced AI features (insights, anomalies)              │
│  ✓ TailGrid Cloud AI (no API key needed)                   │
│  ✓ Premium themes                                          │
│  ✓ Priority support (email, 48h response)                  │
│  ✓ Commercial license option                               │
└─────────────────────────────────────────────────────────────┘
```

### Revenue Projections (Conservative)

| Year | Free Users | Paid Users | Conversion | Revenue |
|------|-----------|------------|------------|---------|
| Y1 | 5,000 | 50 | 1% | $15K |
| Y2 | 25,000 | 500 | 2% | $150K |
| Y3 | 100,000 | 2,000 | 2% | $500K |

---

## Target Users

### Primary

| Segment | Need | Why TailGrid |
|---------|------|--------------|
| **Indie Developers** | Quick data display for SaaS | Free, easy to use |
| **Small Teams** | Data grids without $999/dev | MIT license, full features |
| **AI-Forward Companies** | Modern AI-native tools | Unique AI capabilities |

### Secondary

| Segment | Need | Why TailGrid |
|---------|------|--------------|
| **Enterprises** | AG Grid alternatives | Open-source, customizable |
| **Consultants** | Client dashboards | Quick integration |

### Use Cases

- Admin dashboards
- CRM systems
- Analytics platforms
- Internal tools
- Data exploration apps

---

## Competitive Positioning

```
                    FEATURES
                       ↑
      AG Grid Enterprise ●
                         │
                         │    ★ TailGrid (target)
                         │
      AG Grid Community ●│
                         │
           TanStack ●    │
              Table      │
                         └──────────────────→ AI CAPABILITIES
```

**Position**: Between TanStack Table (headless) and AG Grid (batteries-included), with unique AI layer.

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)

| Week | Tasks |
|------|-------|
| 1 | Setup monorepo, configure Turborepo, init packages |
| 2 | Build @tailgrid/core with TanStack Table wrapper |
| 3 | Build @tailgrid/react components (TailGrid, Header, Body, Cell) |
| 4 | Implement sorting, filtering, pagination |

### Phase 2: Polish (Weeks 5-6)

| Week | Tasks |
|------|-------|
| 5 | Column resizing, row selection, keyboard navigation |
| 6 | Theming system, accessibility audit, bug fixes |

### Phase 3: AI Integration (Weeks 7-8)

| Week | Tasks |
|------|-------|
| 7 | AI query bar component, schema → prompt generation |
| 8 | Multi-provider support (OpenAI, Claude, Ollama), error handling |

### Phase 4: Launch Prep (Weeks 9-10)

| Week | Tasks |
|------|-------|
| 9 | Documentation site, playground, Storybook |
| 10 | npm publish, GitHub setup, launch (Product Hunt, HN, Reddit) |

---

## Key Files to Create

### @tailgrid/core
```
src/
├── createTailGrid.ts      # Main factory function
├── types.ts               # TypeScript types
├── sorting.ts             # Sorting logic
├── filtering.ts           # Filtering logic
├── pagination.ts          # Pagination logic
├── selection.ts           # Row selection logic
└── index.ts               # Exports
```

### @tailgrid/react
```
src/
├── components/
│   ├── TailGrid.tsx       # Main component
│   ├── GridHeader.tsx     # Column headers
│   ├── GridBody.tsx       # Rows container
│   ├── GridRow.tsx        # Single row
│   ├── GridCell.tsx       # Single cell
│   ├── GridPagination.tsx # Pagination controls
│   ├── GridToolbar.tsx    # Search, filters, AI bar
│   ├── AIQueryBar.tsx     # Natural language input
│   └── ColumnResizer.tsx  # Resize handle
├── hooks/
│   ├── useTailGrid.ts     # Main hook
│   ├── useColumnResize.ts # Resize logic
│   └── useAIQuery.ts      # AI parsing hook
├── themes/
│   ├── default.css
│   └── dark.css
└── index.ts
```

### @tailgrid/ai
```
src/
├── parseQuery.ts          # NL → filter/sort
├── generatePrompt.ts      # Schema → prompt
├── providers/
│   ├── base.ts            # Provider interface
│   ├── openai.ts          # OpenAI adapter
│   ├── anthropic.ts       # Claude adapter
│   ├── ollama.ts          # Local LLM (Ollama)
│   └── custom.ts          # Custom endpoint
├── createAIProvider.ts    # Factory function
└── types.ts
```

---

## Success Metrics

### Launch Goals (3 months)

- [ ] npm packages published (@tailgrid/core, @tailgrid/react, @tailgrid/ai)
- [ ] 100+ GitHub stars
- [ ] 5+ community contributors
- [ ] Documentation complete (tailgrid.dev)
- [ ] 10+ real-world usage reports

### Year 1 Goals

- [ ] 5,000+ weekly npm downloads
- [ ] 1,000+ GitHub stars
- [ ] Featured on major React newsletters
- [ ] 50+ paying customers
- [ ] Break-even on development time

---

## Immediate Action Items

### Day 1: Setup - COMPLETED ✓

1. [x] Create GitHub organization: github.com/Tail-Labs
2. [x] Create tailgrid repository in Tail-Labs org
3. [x] Register domain: tailgrid.dev (~$12/yr)
4. [x] Initialize Turborepo monorepo structure
5. [x] Create @tailgrid/core package
6. [x] Create @tailgrid/react package
7. [x] Create @tailgrid/ai package (OpenAI, Anthropic, Ollama, Custom)
8. [ ] Reserve npm scope: @tailgrid
9. [ ] Set up Cloudflare DNS

**Note**: TailGrid is part of the TailLabs ecosystem (taillabs.io). All repos live under github.com/Tail-Labs. See TAILLABS-BRAND-ARCHITECTURE.md for full brand details.

### Pending (Do Later)

- [ ] Deploy docs site (tailgrid.dev)
- [ ] Set up Storybook
- [ ] Create playground app
- [ ] Publish to npm

---

## Domain Strategy

| Domain | Purpose | Status | Cost |
|--------|---------|--------|------|
| **tailgrid.dev** | Everything (docs, blog, pricing, playground) | To register | ~$12/yr |

### Why .dev Only?

- **.dev is better for developer tools** - Google-owned, HTTPS enforced, instant developer recognition
- **Single domain = concentrated SEO** - All backlinks build one domain's authority
- **Cost effective** - Skip .io (~$40/yr), save money
- **Industry standard** - Vite (vitejs.dev), web.dev, etc. use .dev for dev tools

### Site Structure

```
tailgrid.dev (Single Domain - Everything)
├── / (Homepage)
│   ├── Hero: "The AI-native data grid"
│   ├── Quick demo
│   ├── Feature highlights
│   └── Get started CTA
│
├── /docs
│   ├── Getting started
│   ├── API reference
│   ├── AI features
│   └── Theming
│
├── /examples
│   └── Live code examples
│
├── /playground
│   └── Interactive demo
│
├── /blog
│   ├── Release notes
│   ├── Tutorials
│   └── Case studies
│
├── /pricing
│   ├── Free (MIT)
│   └── Premium (Cloud AI)
│
└── /storybook
    └── Component explorer
```

---

## Contact & Resources

| Resource | Link |
|----------|------|
| Website | tailgrid.dev |
| Documentation | tailgrid.dev/docs |
| Playground | tailgrid.dev/playground |
| Storybook | tailgrid.dev/storybook |
| GitHub | github.com/Tail-Labs/tailgrid |
| npm | npmjs.com/org/tailgrid |

---

## Appendix: Example Usage

### Basic Usage

```tsx
import { TailGrid } from '@tailgrid/react';
import '@tailgrid/themes/default.css';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
];

function App() {
  return (
    <TailGrid
      data={users}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
    />
  );
}
```

### With AI Query Bar

```tsx
import { TailGrid } from '@tailgrid/react';
import { createOpenAIProvider } from '@tailgrid/ai';

const aiProvider = createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
});

function App() {
  return (
    <TailGrid
      data={customers}
      columns={columns}
      enableAI
      aiProvider={aiProvider}
      // User can type: "show customers in CA with revenue > 10k"
    />
  );
}
```

### With Multiple AI Providers

```tsx
import { createAIProvider } from '@tailgrid/ai';

// OpenAI
const openai = createAIProvider('openai', { apiKey: '...' });

// Anthropic (Claude)
const claude = createAIProvider('anthropic', { apiKey: '...' });

// Local LLM (Ollama)
const ollama = createAIProvider('ollama', { endpoint: 'http://localhost:11434' });

// Custom endpoint
const custom = createAIProvider('custom', {
  endpoint: 'https://my-api.com/ai',
  headers: { 'Authorization': 'Bearer ...' }
});
```

---

## Part of TailLabs Ecosystem

TailGrid is the open-source foundation of the TailLabs product suite:

```
┌─────────────────────┐
│    taillabs.io      │  Parent / Auth Hub
└──────────┬──────────┘
           │
┌──────────┼───────────────────────────────┐
│          │           │                   │
▼          ▼           ▼                   ▼
tailcrm.app  tailforms.app  tailops.app  tailgrid.dev
(CRM)        (Forms)        (Ops)        (Open Source)
```

- **TailCRM**, **TailForms**, and **TailOps** are built with TailGrid
- All products share authentication via taillabs.io
- All repos live under **github.com/Tail-Labs**
- See [TAILLABS-BRAND-ARCHITECTURE.md](./TAILLABS-BRAND-ARCHITECTURE.md) for details

---

*Document Version: 1.2*
*Created: December 2024*
*Updated: December 2024 (Unified GitHub org: github.com/Tail-Labs)*
*Project: TailGrid - AI-Powered Open Source Data Grid*
