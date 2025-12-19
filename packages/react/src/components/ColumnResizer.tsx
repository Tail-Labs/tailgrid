import React, { useCallback, useRef, useEffect } from 'react';
import type { TailGridClassNames, TailGridColumn } from '@tailgrid/core';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface ColumnResizerProps<TData> {
  /** Class names map */
  classNames: TailGridClassNames;
  /** Column ID */
  columnId: string;
  /** Column definition */
  columnDef: TailGridColumn<TData>;
  /** Current column size */
  size: number;
  /** Whether this column is currently being resized */
  isResizing: boolean;
  /** Callback when column is resized */
  onResize: (size: number) => void;
  /** Callback when resize starts */
  onResizeStart: () => void;
  /** Callback when resize ends */
  onResizeEnd: () => void;
  /** Callback to reset column size */
  onResetSize: () => void;
}

// ============================================
// COMPONENT
// ============================================

/**
 * ColumnResizer - Drag handle for resizing columns
 *
 * @example
 * ```tsx
 * <ColumnResizer
 *   classNames={classNames}
 *   columnId="name"
 *   columnDef={columnDef}
 *   size={150}
 *   isResizing={false}
 *   onResize={(size) => setColumnSize('name', size)}
 *   onResizeStart={() => setResizingColumnId('name')}
 *   onResizeEnd={() => setResizingColumnId(null)}
 *   onResetSize={() => resetColumnSize('name')}
 * />
 * ```
 */
export function ColumnResizer<TData>({
  classNames,
  columnId,
  columnDef,
  size,
  isResizing,
  onResize,
  onResizeStart,
  onResizeEnd,
  onResetSize,
}: ColumnResizerProps<TData>) {
  const startXRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const minSize = columnDef.minWidth ?? 50;
      const maxSize = columnDef.maxWidth ?? 500;
      const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
      onResize(newSize);
    },
    [columnDef.minWidth, columnDef.maxWidth, onResize]
  );

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    onResizeEnd();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, onResizeEnd]);

  // Handle mouse down to start resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startXRef.current = e.clientX;
      startSizeRef.current = size;
      onResizeStart();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [size, onResizeStart, handleMouseMove, handleMouseUp]
  );

  // Handle touch start for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      if (!touch) return;
      startXRef.current = touch.clientX;
      startSizeRef.current = size;
      onResizeStart();

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const delta = touch.clientX - startXRef.current;
        const minSize = columnDef.minWidth ?? 50;
        const maxSize = columnDef.maxWidth ?? 500;
        const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
        onResize(newSize);
      };

      const handleTouchEnd = () => {
        onResizeEnd();
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    },
    [size, columnDef.minWidth, columnDef.maxWidth, onResize, onResizeStart, onResizeEnd]
  );

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle double-click to reset column size
  const handleDoubleClick = useCallback(() => {
    onResetSize();
  }, [onResetSize]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 10 : -10;
        const minSize = columnDef.minWidth ?? 50;
        const maxSize = columnDef.maxWidth ?? 500;
        const newSize = Math.max(minSize, Math.min(maxSize, size + delta));
        onResize(newSize);
      }
    },
    [size, columnDef.minWidth, columnDef.maxWidth, onResize]
  );

  return (
    <div
      className={cx(
        classNames.resizer,
        isResizing && classNames.resizerActive
      )}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${columnId} column`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    />
  );
}

export default ColumnResizer;
