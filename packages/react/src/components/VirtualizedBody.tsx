import React, { useCallback } from 'react';
import type { TailGridClassNames, TailGridColumn, GridRow, GridCell } from '@tailgrid/core';
import { useVirtualization } from '../hooks/useVirtualization';
import { SelectionCheckbox } from './SelectionCheckbox';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface VirtualizedBodyProps<TData> {
  /** Row model from grid engine */
  rowModel: GridRow<TData>[];
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
  /** Callback when a row is selected */
  onRowSelect?: (rowId: string) => void;
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
 *   rowModel={rowModel}
 *   columns={columns}
 *   classNames={classNames}
 *   height={500}
 *   rowHeight={48}
 *   onRowSelect={(rowId) => toggleRowSelection(rowId)}
 *   onLoadMore={fetchNextPage}
 *   hasMore={hasNextPage}
 *   isLoadingMore={isFetching}
 * />
 * ```
 */
export function VirtualizedBody<TData>({
  rowModel,
  columns,
  classNames,
  enableRowSelection,
  enableMultiRowSelection = true,
  renderCell,
  onRowSelect,
  rowHeight = 48,
  height = 500,
  overscan = 10,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  ariaLabels,
}: VirtualizedBodyProps<TData>) {
  const {
    containerRef,
    virtualItems,
    totalSize,
    measureElement,
  } = useVirtualization({
    count: rowModel.length,
    estimateSize: rowHeight,
    overscan,
    getItemKey: (index) => rowModel[index]?.id ?? index,
    onLoadMore,
    isLoadingMore,
    hasMore,
    loadMoreThreshold: rowHeight * 5,
  });

  // Render a single row
  const renderRow = useCallback(
    (row: GridRow<TData>, virtualRow: { index: number; start: number; size: number }) => {
      return (
        <tr
          key={row.id}
          ref={measureElement}
          data-index={virtualRow.index}
          className={cx(
            classNames.row,
            row.isSelected && classNames.rowSelected
          )}
          onClick={enableRowSelection && onRowSelect ? () => onRowSelect(row.id) : undefined}
          data-selected={row.isSelected}
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
                checked={row.isSelected}
                disabled={!row.canSelect}
                onChange={onRowSelect ? () => onRowSelect(row.id) : undefined}
                onClick={(e) => e.stopPropagation()}
                aria-label={ariaLabels?.selectRow || 'Select row'}
              />
            </td>
          )}

          {row.getVisibleCells().map((cell: GridCell<TData>) => {
            const columnDef = cell.column;
            return (
              <td
                key={cell.id}
                className={classNames.td}
                style={{
                  textAlign: columnDef?.align || 'left',
                }}
              >
                {renderCell && columnDef ? (
                  renderCell(cell.value, row.original, columnDef)
                ) : columnDef.cell ? (
                  columnDef.cell({ value: cell.value, row: row.original, column: columnDef, rowIndex: row.index }) as React.ReactNode
                ) : (
                  String(cell.value ?? '')
                )}
              </td>
            );
          })}
        </tr>
      );
    },
    [classNames, enableRowSelection, renderCell, ariaLabels, measureElement, onRowSelect]
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
            const row = rowModel[virtualRow.index];
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
      {!hasMore && rowModel.length > 0 && (
        <div className="tailgrid-end-of-data">
          No more data to load
        </div>
      )}
    </div>
  );
}

export default VirtualizedBody;
