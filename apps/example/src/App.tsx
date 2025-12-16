import { useState, useMemo } from 'react';
import { TailGrid, type TailGridColumn } from '@tailgrid/react';
import '@tailgrid/react/themes/default.css';
import { sampleUsers, largeDataset, type User } from './data';

function App() {
  const [enableSorting, setEnableSorting] = useState(true);
  const [enableFiltering, setEnableFiltering] = useState(true);
  const [enablePagination, setEnablePagination] = useState(true);
  const [enableRowSelection, setEnableRowSelection] = useState(true);
  const [enableVirtualization, setEnableVirtualization] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const data = useMemo(
    () => (enableVirtualization ? largeDataset : sampleUsers),
    [enableVirtualization]
  );

  const columns: TailGridColumn<User>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'User',
        accessorKey: 'name',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="user-cell">
            <div className="avatar">
              {row.original.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="user-info">
              <span className="user-name">{row.original.name}</span>
              <span className="user-email">{row.original.email}</span>
            </div>
          </div>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        accessorKey: 'role',
        enableSorting: true,
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return <span className={`badge badge-${role}`}>{role}</span>;
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableSorting: true,
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return <span className={`badge badge-${status}`}>{status}</span>;
        },
      },
      {
        id: 'department',
        header: 'Department',
        accessorKey: 'department',
        enableSorting: true,
      },
      {
        id: 'joinDate',
        header: 'Join Date',
        accessorKey: 'joinDate',
        enableSorting: true,
      },
      {
        id: 'lastActive',
        header: 'Last Active',
        accessorKey: 'lastActive',
        enableSorting: true,
      },
      {
        id: 'projects',
        header: 'Projects',
        accessorKey: 'projects',
        enableSorting: true,
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 500 }}>{getValue() as number}</span>
        ),
      },
    ],
    []
  );

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  return (
    <div className="app">
      <header className="header">
        <h1>TailGrid</h1>
        <p>AI-native data grid for React</p>
      </header>

      <section className="demo-section">
        <h2>Interactive Demo</h2>

        <div className="controls">
          <div className="control-group">
            <input
              type="checkbox"
              id="sorting"
              checked={enableSorting}
              onChange={(e) => setEnableSorting(e.target.checked)}
            />
            <label htmlFor="sorting">Sorting</label>
          </div>
          <div className="control-group">
            <input
              type="checkbox"
              id="filtering"
              checked={enableFiltering}
              onChange={(e) => setEnableFiltering(e.target.checked)}
            />
            <label htmlFor="filtering">Filtering</label>
          </div>
          <div className="control-group">
            <input
              type="checkbox"
              id="pagination"
              checked={enablePagination}
              onChange={(e) => setEnablePagination(e.target.checked)}
            />
            <label htmlFor="pagination">Pagination</label>
          </div>
          <div className="control-group">
            <input
              type="checkbox"
              id="selection"
              checked={enableRowSelection}
              onChange={(e) => setEnableRowSelection(e.target.checked)}
            />
            <label htmlFor="selection">Row Selection</label>
          </div>
          <div className="control-group">
            <input
              type="checkbox"
              id="virtualization"
              checked={enableVirtualization}
              onChange={(e) => setEnableVirtualization(e.target.checked)}
            />
            <label htmlFor="virtualization">
              Virtual Scrolling ({enableVirtualization ? '10k' : '100'} rows)
            </label>
          </div>
        </div>

        <TailGrid
          data={data}
          columns={columns}
          enableSorting={enableSorting}
          enableFiltering={enableFiltering}
          enablePagination={enablePagination}
          enableRowSelection={enableRowSelection}
          enableVirtualization={enableVirtualization}
          virtualHeight={enableVirtualization ? 500 : undefined}
          rowHeight={56}
          getRowId={(row) => row.id}
          onRowSelectionChange={setSelectedRows}
        />

        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total Rows</span>
            <span className="stat-value">{data.length.toLocaleString()}</span>
          </div>
          {enableRowSelection && (
            <div className="stat">
              <span className="stat-label">Selected</span>
              <span className="stat-value">{selectedCount}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
