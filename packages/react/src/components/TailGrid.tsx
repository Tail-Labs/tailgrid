import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { useTailGrid, type UseTailGridReturn } from '../hooks/useTailGrid';
import type { TailGridOptions, TailGridColumn } from '@tailgrid/core';

// ============================================
// TYPES
// ============================================

export interface TailGridProps<TData> extends TailGridOptions<TData> {
  /** Custom class name for the grid container */
  className?: string;
  /** Show loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Render custom header cell */
  renderHeaderCell?: (column: TailGridColumn<TData>) => React.ReactNode;
  /** Render custom body cell */
  renderCell?: (value: unknown, row: TData, column: TailGridColumn<TData>) => React.ReactNode;
  /** Render custom toolbar */
  renderToolbar?: (grid: UseTailGridReturn<TData>) => React.ReactNode;
  /** Render custom pagination */
  renderPagination?: (grid: UseTailGridReturn<TData>) => React.ReactNode;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * TailGrid - The AI-native data grid for React
 *
 * @example
 * ```tsx
 * <TailGrid
 *   data={users}
 *   columns={[
 *     { id: 'name', header: 'Name', accessorKey: 'name' },
 *     { id: 'email', header: 'Email', accessorKey: 'email' },
 *   ]}
 *   enableSorting
 *   enableFiltering
 *   enablePagination
 * />
 * ```
 */
export function TailGrid<TData>({
  className,
  loading = false,
  emptyMessage = 'No data available',
  renderHeaderCell,
  renderCell,
  renderToolbar,
  renderPagination,
  ...options
}: TailGridProps<TData>) {
  const grid = useTailGrid(options);
  const { table, rows, paginationInfo } = grid;

  return (
    <div className={`tailgrid ${className ?? ''}`}>
      {/* Toolbar */}
      {renderToolbar?.(grid)}

      {/* Table */}
      <div className="tailgrid-table-container">
        {loading ? (
          <div className="tailgrid-loading">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="tailgrid-empty">{emptyMessage}</div>
        ) : (
          <table className="tailgrid-table">
            <thead className="tailgrid-thead">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="tailgrid-header-row">
                  {headerGroup.headers.map((header) => {
                    const column = options.columns.find((c) => c.id === header.id);
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={`tailgrid-th ${canSort ? 'tailgrid-th-sortable' : ''}`}
                        style={{ width: header.getSize() }}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {renderHeaderCell && column ? (
                          renderHeaderCell(column)
                        ) : (
                          <div className="tailgrid-th-content">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {sortDirection && (
                              <span className="tailgrid-sort-indicator">
                                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="tailgrid-tbody">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`tailgrid-row ${row.getIsSelected() ? 'tailgrid-row-selected' : ''}`}
                  onClick={
                    options.enableRowSelection
                      ? () => row.toggleSelected()
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const column = options.columns.find((c) => c.id === cell.column.id);
                    return (
                      <td key={cell.id} className="tailgrid-td">
                        {renderCell && column ? (
                          renderCell(cell.getValue(), row.original, column)
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {options.enablePagination && (
        renderPagination ? (
          renderPagination(grid)
        ) : (
          <DefaultPagination grid={grid} options={options} />
        )
      )}
    </div>
  );
}

// ============================================
// DEFAULT PAGINATION
// ============================================

interface DefaultPaginationProps<TData> {
  grid: UseTailGridReturn<TData>;
  options: TailGridOptions<TData>;
}

function DefaultPagination<TData>({ grid, options }: DefaultPaginationProps<TData>) {
  const { paginationInfo, setPageIndex, setPageSize, nextPage, previousPage, firstPage, lastPage } = grid;
  const pageSizeOptions = options.pageSizeOptions ?? [10, 20, 50, 100];

  return (
    <div className="tailgrid-pagination">
      <div className="tailgrid-pagination-info">
        Showing {paginationInfo.pageIndex * paginationInfo.pageSize + 1} to{' '}
        {Math.min(
          (paginationInfo.pageIndex + 1) * paginationInfo.pageSize,
          paginationInfo.totalRows
        )}{' '}
        of {paginationInfo.totalRows}
      </div>

      <div className="tailgrid-pagination-controls">
        <button
          className="tailgrid-pagination-btn"
          onClick={firstPage}
          disabled={!paginationInfo.canPreviousPage}
        >
          {'<<'}
        </button>
        <button
          className="tailgrid-pagination-btn"
          onClick={previousPage}
          disabled={!paginationInfo.canPreviousPage}
        >
          {'<'}
        </button>

        <span className="tailgrid-pagination-page">
          Page {paginationInfo.pageIndex + 1} of {paginationInfo.pageCount}
        </span>

        <button
          className="tailgrid-pagination-btn"
          onClick={nextPage}
          disabled={!paginationInfo.canNextPage}
        >
          {'>'}
        </button>
        <button
          className="tailgrid-pagination-btn"
          onClick={lastPage}
          disabled={!paginationInfo.canNextPage}
        >
          {'>>'}
        </button>

        <select
          className="tailgrid-pagination-size"
          value={paginationInfo.pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
