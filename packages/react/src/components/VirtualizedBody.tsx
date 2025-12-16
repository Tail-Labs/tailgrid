import React, { useCallback, forwardRef } from 'react';
import { flexRender } from '@tanstack/react-table';
import type { Table, Row } from '@tanstack/react-table';
import type { TailGridClassNames, TailGridColumn } from '@tailgrid/core';
import { useVirtualization } from '../hooks/useVirtualization';
import { SelectionCheckbox } from './SelectionCheckbox';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface VirtualizedBodyProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Column definitions */
  columns: TailGridColumn<TData>[];
  /** Class names map */
  classNames: TailGridClassNames;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable multi-row selection */
  enableMultiRowSelection?: boolean;
  /** Custom cell renderer */
  renderCell?: (value: unknown, row: TData, column: TailGridColumn<TData>) => React.ReactNode;
  /** Estimated row height */
  rowHeight?: number;
  /** Container height */
  height?: number | string;
  /** Overscan count */
  overscan?: number;
  /** Callback for infinite scroll */
  onLoadMore?: () => void;
  /** Is loading more data */
  isLoadingMore?: boolean;
  /** Has more data to load */
  hasMore?: boolean;
  /** Aria labels for accessibility */
  ariaLabels?: {
    selectRow?: string;
  };
}

// ============================================
// COMPONENT
// ============================================

/**
 * VirtualizedBody - Virtualized table body for large datasets
 *
 * Uses @tanstack/react-virtual for efficient rendering.
 * Supports infinite scrolling with onLoadMore callback.
 *
 * @example
 * ```tsx
 * <VirtualizedBody
 *   table={table}
 *   columns={columns}
 *   classNames={classNames}
 *   height={500}
 *   rowHeight={48}
 *   onLoadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoadingMore={isFetching}
 * />
 * ```
 */
export function VirtualizedBody<TData>({
  table,
  columns,
  classNames,
  enableRowSelection,
  enableMultiRowSelection = true,
  renderCell,
  rowHeight = 48,
  height = 500,
  overscan = 10,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  ariaLabels,
}: VirtualizedBodyProps<TData>) {
  const rows = table.getRowModel().rows;

  const {
    containerRef,
    virtualItems,
    totalSize,
    measureElement,
  } = useVirtualization({
    count: rows.length,
    estimateSize: rowHeight,
    overscan,
    getItemKey: (index) => rows[index]?.id ?? index,
    onLoadMore,
    isLoadingMore,
    hasMore,
    loadMoreThreshold: rowHeight * 5,
  });

  // Render a single row
  const renderRow = useCallback(
    (row: Row<TData>, virtualRow: { index: number; start: number; size: number }) => {
      return (
        <tr
          key={row.id}
          ref={measureElement}
          data-index={virtualRow.index}
          className={cx(
            classNames.row,
            row.getIsSelected() && classNames.rowSelected
          )}
          onClick={enableRowSelection ? () => row.toggleSelected() : undefined}
          data-selected={row.getIsSelected()}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          {/* Selection checkbox */}
          {enableRowSelection && (
            <td className={classNames.td} style={{ width: 40 }}>
              <SelectionCheckbox
                classNames={classNames}
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                onClick={(e) => e.stopPropagation()}
                aria-label={ariaLabels?.selectRow || 'Select row'}
              />
            </td>
          )}

          {row.getVisibleCells().map((cell) => {
            const column = columns.find((c) => c.id === cell.column.id);
            return (
              <td
                key={cell.id}
                className={classNames.td}
                style={{
                  textAlign: column?.align || 'left',
                  width: cell.column.getSize(),
                }}
              >
                {renderCell && column ? (
                  renderCell(cell.getValue(), row.original, column)
                ) : (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </td>
            );
          })}
        </tr>
      );
    },
    [classNames, columns, enableRowSelection, renderCell, ariaLabels, measureElement]
  );

  return (
    <div
      ref={containerRef}
      className="tailgrid-virtualized-container"
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <table
        className={classNames.table}
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <tbody className={classNames.tbody}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return renderRow(row, virtualRow);
          })}
        </tbody>
      </table>

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && (
        <div className="tailgrid-loading-more">
          <svg
            className="tailgrid-loading-spinner"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Loading more...</span>
        </div>
      )}

      {/* End of data indicator */}
      {!hasMore && rows.length > 0 && (
        <div className="tailgrid-end-of-data">
          No more data to load
        </div>
      )}
    </div>
  );
}

export default VirtualizedBody;
