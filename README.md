# TailGrid

[![CI](https://github.com/Tail-Labs/tailgrid/actions/workflows/ci.yml/badge.svg)](https://github.com/Tail-Labs/tailgrid/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@tailgrid/react.svg)](https://www.npmjs.com/package/@tailgrid/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI-native data grid for React** - Built on TanStack Table with natural language querying, virtual scrolling, and flexible styling.

[Documentation](https://tail-labs.github.io/tailgrid) | [Storybook](https://tail-labs.github.io/tailgrid) | [npm](https://www.npmjs.com/package/@tailgrid/react)

## Features

- **AI-Powered Queries** - Filter and sort with natural language (OpenAI, Anthropic, Ollama)
- **Virtual Scrolling** - Handle 100k+ rows with smooth performance
- **Infinite Scrolling** - Load data on demand as users scroll
- **Three Styling Options** - Plain CSS, Tailwind CSS, or CSS-in-JS
- **Full TypeScript Support** - Complete type safety out of the box
- **Accessible** - WCAG 2.1 compliant with keyboard navigation
- **Framework Agnostic Core** - React adapter with Vue/Svelte coming soon

## Installation

```bash
# npm
npm install @tailgrid/react

# pnpm
pnpm add @tailgrid/react

# yarn
yarn add @tailgrid/react
```

## Quick Start

```tsx
import { TailGrid } from '@tailgrid/react';
import '@tailgrid/react/themes/default.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns = [
  { id: 'name', header: 'Name', accessorKey: 'name', enableSorting: true },
  { id: 'email', header: 'Email', accessorKey: 'email', enableSorting: true },
  { id: 'role', header: 'Role', accessorKey: 'role' },
];

const data: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function App() {
  return (
    <TailGrid
      data={data}
      columns={columns}
      enableSorting
      enablePagination
      enableRowSelection
    />
  );
}
```

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@tailgrid/react`](./packages/react) | React components and hooks | ![npm](https://img.shields.io/npm/v/@tailgrid/react.svg) |
| [`@tailgrid/core`](./packages/core) | Framework-agnostic core | ![npm](https://img.shields.io/npm/v/@tailgrid/core.svg) |
| [`@tailgrid/ai`](./packages/ai) | AI query providers | ![npm](https://img.shields.io/npm/v/@tailgrid/ai.svg) |

## Theming

### Plain CSS (Default)
```tsx
import '@tailgrid/react/themes/default.css';
```

### Tailwind CSS
```tsx
import '@tailgrid/react/themes/tailwind.css';
```

### Dark Mode
```tsx
import '@tailgrid/react/themes/dark.css';
// Or add 'tailgrid-dark' class to container
```

### Custom (CSS-in-JS)
```tsx
<TailGrid
  classNames={{
    container: 'my-grid',
    table: 'my-table',
    th: 'my-header-cell',
    td: 'my-cell',
    // ... override any class
  }}
/>
```

## AI Integration

Enable natural language queries with multiple AI providers:

```tsx
import { TailGrid } from '@tailgrid/react';
import { createOpenAIProvider } from '@tailgrid/ai';

const aiProvider = createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
});

function App() {
  return (
    <TailGrid
      data={data}
      columns={columns}
      enableAI
      aiProvider={aiProvider}
      aiQueryBarMode="visible" // 'visible' | 'toggle' | 'hidden'
      onAIQuery={(result) => console.log('AI result:', result)}
    />
  );
}
```

### Supported Providers

```tsx
// OpenAI
import { createOpenAIProvider } from '@tailgrid/ai';
const openai = createOpenAIProvider({ apiKey: '...' });

// Anthropic (Claude)
import { createAnthropicProvider } from '@tailgrid/ai';
const claude = createAnthropicProvider({ apiKey: '...' });

// Ollama (Local)
import { createOllamaProvider } from '@tailgrid/ai';
const ollama = createOllamaProvider({ model: 'llama3' });

// Custom
import { createCustomProvider } from '@tailgrid/ai';
const custom = createCustomProvider({
  endpoint: 'https://my-api.com/ai',
  headers: { Authorization: 'Bearer xxx' },
});
```

## Virtual Scrolling

Handle large datasets efficiently:

```tsx
<TailGrid
  data={largeDataset} // 100k+ rows
  columns={columns}
  enableVirtualization
  virtualHeight={600}
  rowHeight={48}
  overscan={10}
/>
```

## Infinite Scrolling

Load data on demand:

```tsx
<TailGrid
  data={data}
  columns={columns}
  enableVirtualization
  enableInfiniteScroll
  onLoadMore={fetchNextPage}
  isLoadingMore={isFetching}
  hasMore={hasNextPage}
/>
```

## All Props

```tsx
interface TailGridProps<TData> {
  // Data
  data: TData[];
  columns: TailGridColumn<TData>[];

  // Sorting
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  initialSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;

  // Filtering
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  initialFilters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;

  // Pagination
  enablePagination?: boolean;
  initialPagination?: PaginationState;
  pageSizeOptions?: number[];
  onPaginationChange?: (pagination: PaginationState) => void;

  // Selection
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  initialRowSelection?: RowSelection;
  onRowSelectionChange?: (selection: RowSelection) => void;
  getRowId?: (row: TData, index: number) => string;

  // Column Features
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  enableColumnVisibility?: boolean;

  // Virtualization
  enableVirtualization?: boolean;
  virtualHeight?: number | string;
  rowHeight?: number;
  overscan?: number;

  // Infinite Scroll
  enableInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;

  // AI Features
  enableAI?: boolean;
  aiProvider?: AIProvider;
  aiQueryBarMode?: 'visible' | 'toggle' | 'hidden';
  onAIQuery?: (result: AIQueryResult) => void;

  // Accessibility
  enableAccessiblePrimitives?: boolean;
  enableKeyboardNavigation?: boolean;

  // Theming
  theme?: 'default' | 'dark' | 'none';
  classNames?: Partial<TailGridClassNames>;

  // UI State
  loading?: boolean;
  emptyMessage?: ReactNode;
  loadingMessage?: ReactNode;

  // Custom Rendering
  renderHeaderCell?: (column: TailGridColumn<TData>) => ReactNode;
  renderCell?: (value: unknown, row: TData, column: TailGridColumn<TData>) => ReactNode;
  renderToolbar?: (grid: TailGridRenderContext<TData>) => ReactNode;
  renderPagination?: (grid: TailGridRenderContext<TData>) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
}
```

## Hooks

```tsx
import {
  useTailGrid,
  useAIQuery,
  useVirtualization,
  useKeyboardNavigation,
  useAccessiblePrimitives,
} from '@tailgrid/react';

// Create grid instance
const grid = useTailGrid({ data, columns, enableSorting: true });

// AI query hook
const { query, loading, error, result } = useAIQuery({
  provider: aiProvider,
  columns,
  onResult: (result) => applyFilters(result.filters),
});

// Virtual scrolling
const { virtualItems, totalSize, containerRef } = useVirtualization({
  count: data.length,
  estimateSize: 48,
});

// Keyboard navigation
const { focusedCell, handleKeyDown } = useKeyboardNavigation({
  rowCount: data.length,
  columnCount: columns.length,
});
```

## Development

```bash
# Clone the repo
git clone https://github.com/Tail-Labs/tailgrid.git
cd tailgrid

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run Storybook
pnpm --filter @tailgrid/storybook run dev

# Run tests
pnpm run test

# Type check
pnpm run typecheck
```

## Part of TailLabs

TailGrid is the open-source foundation of the [TailLabs](https://taillabs.io) ecosystem:

- **TailCRM** - Modern CRM built with TailGrid
- **TailForms** - Form builder with TailGrid data tables
- **TailOps** - Service operations platform

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with love by <a href="https://taillabs.io">Tail Labs</a>
</p>
