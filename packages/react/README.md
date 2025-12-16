# @tailgrid/react

React components for TailGrid - the AI-native data grid for modern web apps.

## Installation

```bash
npm install @tailgrid/react
# or
pnpm add @tailgrid/react
```

## Quick Start

```tsx
import { TailGrid } from '@tailgrid/react';

const columns = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'email', header: 'Email', accessorKey: 'email' },
  { id: 'role', header: 'Role', accessorKey: 'role' },
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

## Features

- **Sorting** - Click headers to sort
- **Filtering** - Column and global filters
- **Pagination** - Built-in pagination controls
- **Selection** - Row selection with checkboxes
- **Customizable** - Custom cell and header renderers
- **Headless Option** - Use `useTailGrid` hook for full control

## Components

### `<TailGrid />`

Main grid component with built-in UI.

```tsx
<TailGrid
  data={data}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
  enableRowSelection
  loading={isLoading}
  emptyMessage="No users found"
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of data |
| `columns` | `TailGridColumn<T>[]` | Column definitions |
| `enableSorting` | `boolean` | Enable column sorting |
| `enableFiltering` | `boolean` | Enable filtering |
| `enablePagination` | `boolean` | Enable pagination |
| `enableRowSelection` | `boolean` | Enable row selection |
| `loading` | `boolean` | Show loading state |
| `emptyMessage` | `string` | Empty state message |
| `className` | `string` | Custom CSS class |

## Hooks

### `useTailGrid()`

Headless hook for full control over rendering.

```tsx
import { useTailGrid } from '@tailgrid/react';

function CustomGrid() {
  const {
    table,
    rows,
    sorting,
    setSorting,
    paginationInfo,
    nextPage,
    previousPage,
  } = useTailGrid({
    data: users,
    columns,
    enableSorting: true,
    enablePagination: true,
  });

  return (
    <div>
      {/* Custom table rendering */}
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {/* ... */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Custom pagination */}
      <button onClick={previousPage}>Previous</button>
      <span>Page {paginationInfo.pageIndex + 1}</span>
      <button onClick={nextPage}>Next</button>
    </div>
  );
}
```

## Custom Renderers

```tsx
<TailGrid
  data={users}
  columns={columns}
  renderHeaderCell={(column) => (
    <div className="custom-header">{column.header}</div>
  )}
  renderCell={(value, row, column) => (
    <div className="custom-cell">{String(value)}</div>
  )}
  renderToolbar={(grid) => (
    <input
      placeholder="Search..."
      onChange={(e) => grid.setGlobalFilter(e.target.value)}
    />
  )}
  renderPagination={(grid) => (
    <div>
      <button onClick={grid.previousPage}>Prev</button>
      <button onClick={grid.nextPage}>Next</button>
    </div>
  )}
/>
```

## Styling

Import default styles or create your own:

```tsx
// Option 1: Import default styles
import '@tailgrid/react/styles.css';

// Option 2: Use Tailwind classes
<TailGrid className="border rounded-lg" />

// Option 3: Full custom CSS (target .tailgrid-* classes)
```

## License

MIT - Part of the [TailGrid](https://tailgrid.dev) project.
