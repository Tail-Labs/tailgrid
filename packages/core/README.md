# @tailgrid/core

Framework-agnostic core for TailGrid - the AI-native data grid for modern web apps.

## Installation

```bash
npm install @tailgrid/core
# or
pnpm add @tailgrid/core
```

## Usage

```typescript
import { createTailGrid } from '@tailgrid/core';

const grid = createTailGrid({
  data: users,
  columns: [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'email', header: 'Email', accessorKey: 'email' },
    { id: 'role', header: 'Role', accessorKey: 'role' },
  ],
  enableSorting: true,
  enableFiltering: true,
  enablePagination: true,
});

// Get paginated rows
const rows = grid.getPaginatedRows();

// Sort by column
grid.toggleSort('name');

// Filter
grid.setColumnFilter({ id: 'role', operator: 'equals', value: 'admin' });

// Pagination
grid.nextPage();
```

## Features

- **Sorting** - Single and multi-column sorting
- **Filtering** - Column filters and global search
- **Pagination** - Client-side pagination with configurable page sizes
- **Selection** - Row selection with multi-select support
- **Column Resizing** - Drag-to-resize columns
- **Built on TanStack Table** - Leverages battle-tested table logic

## API

### `createTailGrid(options)`

Creates a new TailGrid instance.

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `data` | `T[]` | Array of data |
| `columns` | `TailGridColumn<T>[]` | Column definitions |
| `enableSorting` | `boolean` | Enable sorting |
| `enableFiltering` | `boolean` | Enable filtering |
| `enablePagination` | `boolean` | Enable pagination |
| `enableRowSelection` | `boolean` | Enable row selection |

### Instance Methods

#### Sorting
- `getSorting()` - Get current sort state
- `setSorting(sorting)` - Set sort state
- `toggleSort(columnId)` - Toggle sort on column
- `clearSorting()` - Clear all sorting

#### Filtering
- `getFilters()` - Get current filter state
- `setColumnFilter(filter)` - Set column filter
- `setGlobalFilter(value)` - Set global search
- `clearFilters()` - Clear all filters

#### Pagination
- `getPaginationInfo()` - Get pagination details
- `setPageIndex(index)` - Go to page
- `setPageSize(size)` - Change page size
- `nextPage()` / `previousPage()` - Navigate pages

#### Selection
- `getSelectedRows()` - Get selected rows
- `toggleRowSelection(id)` - Toggle row selection
- `clearSelection()` - Clear selection

## License

MIT - Part of the [TailGrid](https://tailgrid.dev) project.
