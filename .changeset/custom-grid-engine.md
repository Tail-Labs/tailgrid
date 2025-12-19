---
"@tailgrid/core": minor
"@tailgrid/react": minor
---

## Custom Grid Engine & TanStack Query Integration

### Breaking Changes
- Replaced TanStack Table with custom-built GridEngine for full control over data management
- Internal table instance API has changed (users relying on `table` internals may need updates)

### New Features

#### Custom GridEngine (`@tailgrid/core`)
- Full control over sorting, filtering, pagination, and selection logic
- Simpler debugging with no third-party abstractions
- Foundation for deeper AI integration

#### TanStack Query Integration (`@tailgrid/react`)
- New `useTailGridQuery` hook for seamless server-side pagination with caching
- Automatic background refetching and stale data management
- `keepPreviousData` for smooth pagination transitions
- `createFetchFn` helper for quick URL-based fetch configuration

#### Data Access API
- `getRowById(id)` - Get row data by ID
- `getCellValue(rowId, columnId)` - Get specific cell value
- `setCellValue(rowId, columnId, value)` - Update cell value
- `updateRow(rowId, updates)` - Partial row updates
- `getAllData()` - Get all current data

#### Responsive Sizing
- `height`, `maxHeight`, `minHeight` props for fixed/responsive layouts
- `autoResize` prop for automatic browser-based resizing

#### Remote Data Hooks
- `useRemoteData` - Simple fetch-based remote pagination
- `useTailGridQuery` - TanStack Query powered remote pagination (recommended)

### Example Usage

```tsx
import { useTailGridQuery, createFetchFn } from '@tailgrid/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const fetchUsers = createFetchFn<User>({
  url: 'https://api.example.com/users',
  params: { page: '_page', pageSize: '_limit' },
  response: { dataKey: 'data', totalKey: 'total' },
});

function App() {
  const { data, isLoading, page, setPage, totalPages } = useTailGridQuery({
    queryKey: 'users',
    fetchFn: fetchUsers,
    pageSize: 10,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TailGrid
        data={data}
        columns={columns}
        loading={isLoading}
        height="500px"
        autoResize
      />
    </QueryClientProvider>
  );
}
```

### Peer Dependencies
- Added `@tanstack/react-query` as optional peer dependency for `useTailGridQuery`
