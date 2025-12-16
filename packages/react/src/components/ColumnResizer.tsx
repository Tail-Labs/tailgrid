import React, { useCallback } from 'react';
import type { Header, Table } from '@tanstack/react-table';
import type { TailGridClassNames } from '@tailgrid/core';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface ColumnResizerProps<TData> {
  /** Class names map */
  classNames: TailGridClassNames;
  /** TanStack Table header */
  header: Header<TData, unknown>;
  /** TanStack Table instance */
  table: Table<TData>;
}

// ============================================
// COMPONENT
// ============================================

/**
 * ColumnResizer - Drag handle for resizing columns
 *
 * Uses TanStack Table's built-in column resizing functionality.
 *
 * @example
 * ```tsx
 * <ColumnResizer
 *   classNames={classNames}
 *   header={header}
 *   table={table}
 * />
 * ```
 */
export function ColumnResizer<TData>({
  classNames,
  header,
  table,
}: ColumnResizerProps<TData>) {
  const isResizing = header.column.getIsResizing();

  // Handle double-click to auto-fit column
  const handleDoubleClick = useCallback(() => {
    header.column.resetSize();
  }, [header]);

  return (
    <div
      className={cx(
        classNames.resizer,
        isResizing && classNames.resizerActive
      )}
      onDoubleClick={handleDoubleClick}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      style={{
        transform: isResizing
          ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
          : undefined,
      }}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${header.column.id} column`}
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow keyboard resizing with arrow keys
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const currentSize = header.column.getSize();
          const delta = e.key === 'ArrowRight' ? 10 : -10;
          const newSize = Math.max(
            header.column.columnDef.minSize || 50,
            Math.min(
              header.column.columnDef.maxSize || 500,
              currentSize + delta
            )
          );
          header.column.getLeafColumns().forEach((col) => {
            table.setColumnSizing((old) => ({
              ...old,
              [col.id]: newSize,
            }));
          });
        }
      }}
    />
  );
}

export default ColumnResizer;
