import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

export interface UseKeyboardNavigationOptions {
  /** Total number of rows */
  rowCount: number;
  /** Total number of columns */
  columnCount: number;
  /** Enable wrap-around navigation */
  wrapAround?: boolean;
  /** Callback when cell is activated (Enter key) */
  onCellActivate?: (rowIndex: number, columnIndex: number) => void;
  /** Callback when focus changes */
  onFocusChange?: (rowIndex: number, columnIndex: number) => void;
  /** Custom key handlers */
  customHandlers?: Record<string, (event: KeyboardEvent, focusedCell: FocusedCell) => void>;
  /** Enable selection on Space key */
  enableSpaceSelect?: boolean;
  /** Callback when Space is pressed */
  onSpaceSelect?: (rowIndex: number) => void;
  /** Skip header row in navigation */
  skipHeader?: boolean;
}

export interface FocusedCell {
  rowIndex: number;
  columnIndex: number;
}

export interface UseKeyboardNavigationReturn {
  /** Currently focused cell */
  focusedCell: FocusedCell | null;
  /** Set focused cell */
  setFocusedCell: (rowIndex: number, columnIndex: number) => void;
  /** Handle keyboard event */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Clear focus */
  clearFocus: () => void;
  /** Check if a cell is focused */
  isCellFocused: (rowIndex: number, columnIndex: number) => boolean;
  /** Get tabIndex for a cell */
  getCellTabIndex: (rowIndex: number, columnIndex: number) => number;
  /** Ref for the container element */
  containerRef: React.RefObject<HTMLElement>;
  /** Focus the grid container */
  focusContainer: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * useKeyboardNavigation - Arrow key navigation for grid cells
 *
 * Provides accessible keyboard navigation following WAI-ARIA grid pattern.
 * Supports arrow keys, Home/End, Page Up/Down, and Enter/Space.
 *
 * @example
 * ```tsx
 * const {
 *   focusedCell,
 *   handleKeyDown,
 *   isCellFocused,
 *   getCellTabIndex,
 * } = useKeyboardNavigation({
 *   rowCount: data.length,
 *   columnCount: columns.length,
 *   onCellActivate: (row, col) => console.log('Activated:', row, col),
 * });
 *
 * <table onKeyDown={handleKeyDown}>
 *   {rows.map((row, rowIdx) => (
 *     <tr key={row.id}>
 *       {cells.map((cell, colIdx) => (
 *         <td
 *           key={cell.id}
 *           tabIndex={getCellTabIndex(rowIdx, colIdx)}
 *           data-focused={isCellFocused(rowIdx, colIdx)}
 *         >
 *           {cell.value}
 *         </td>
 *       ))}
 *     </tr>
 *   ))}
 * </table>
 * ```
 */
export function useKeyboardNavigation({
  rowCount,
  columnCount,
  wrapAround = false,
  onCellActivate,
  onFocusChange,
  customHandlers,
  enableSpaceSelect = true,
  onSpaceSelect,
  skipHeader = false,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const [focusedCell, setFocusedCellState] = useState<FocusedCell | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const minRow = skipHeader ? 1 : 0;
  const maxRow = rowCount - 1;
  const maxCol = columnCount - 1;

  // Set focused cell with bounds checking
  const setFocusedCell = useCallback(
    (rowIndex: number, columnIndex: number) => {
      const clampedRow = Math.max(minRow, Math.min(maxRow, rowIndex));
      const clampedCol = Math.max(0, Math.min(maxCol, columnIndex));

      setFocusedCellState({ rowIndex: clampedRow, columnIndex: clampedCol });
      onFocusChange?.(clampedRow, clampedCol);
    },
    [minRow, maxRow, maxCol, onFocusChange]
  );

  // Clear focus
  const clearFocus = useCallback(() => {
    setFocusedCellState(null);
  }, []);

  // Check if cell is focused
  const isCellFocused = useCallback(
    (rowIndex: number, columnIndex: number) => {
      return (
        focusedCell?.rowIndex === rowIndex &&
        focusedCell?.columnIndex === columnIndex
      );
    },
    [focusedCell]
  );

  // Get tabIndex for roving tabindex pattern
  const getCellTabIndex = useCallback(
    (rowIndex: number, columnIndex: number) => {
      // If no cell is focused, make first cell focusable
      if (!focusedCell) {
        return rowIndex === minRow && columnIndex === 0 ? 0 : -1;
      }
      // Otherwise, only the focused cell is focusable
      return isCellFocused(rowIndex, columnIndex) ? 0 : -1;
    },
    [focusedCell, minRow, isCellFocused]
  );

  // Focus container
  const focusContainer = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  // Navigate with optional wrap-around
  const navigate = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!focusedCell) {
        setFocusedCell(minRow, 0);
        return;
      }

      const { rowIndex, columnIndex } = focusedCell;

      switch (direction) {
        case 'up': {
          if (rowIndex > minRow) {
            setFocusedCell(rowIndex - 1, columnIndex);
          } else if (wrapAround) {
            setFocusedCell(maxRow, columnIndex);
          }
          break;
        }
        case 'down': {
          if (rowIndex < maxRow) {
            setFocusedCell(rowIndex + 1, columnIndex);
          } else if (wrapAround) {
            setFocusedCell(minRow, columnIndex);
          }
          break;
        }
        case 'left': {
          if (columnIndex > 0) {
            setFocusedCell(rowIndex, columnIndex - 1);
          } else if (wrapAround) {
            setFocusedCell(rowIndex, maxCol);
          }
          break;
        }
        case 'right': {
          if (columnIndex < maxCol) {
            setFocusedCell(rowIndex, columnIndex + 1);
          } else if (wrapAround) {
            setFocusedCell(rowIndex, 0);
          }
          break;
        }
      }
    },
    [focusedCell, minRow, maxRow, maxCol, wrapAround, setFocusedCell]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key, ctrlKey, metaKey } = event;
      const modKey = ctrlKey || metaKey;

      // Check for custom handlers first
      if (customHandlers?.[key] && focusedCell) {
        customHandlers[key](event.nativeEvent, focusedCell);
        return;
      }

      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          navigate('up');
          break;

        case 'ArrowDown':
          event.preventDefault();
          navigate('down');
          break;

        case 'ArrowLeft':
          event.preventDefault();
          navigate('left');
          break;

        case 'ArrowRight':
          event.preventDefault();
          navigate('right');
          break;

        case 'Home':
          event.preventDefault();
          if (modKey) {
            // Ctrl+Home: Go to first cell
            setFocusedCell(minRow, 0);
          } else {
            // Home: Go to first cell in current row
            if (focusedCell) {
              setFocusedCell(focusedCell.rowIndex, 0);
            }
          }
          break;

        case 'End':
          event.preventDefault();
          if (modKey) {
            // Ctrl+End: Go to last cell
            setFocusedCell(maxRow, maxCol);
          } else {
            // End: Go to last cell in current row
            if (focusedCell) {
              setFocusedCell(focusedCell.rowIndex, maxCol);
            }
          }
          break;

        case 'PageUp':
          event.preventDefault();
          if (focusedCell) {
            // Jump 10 rows up
            setFocusedCell(
              Math.max(minRow, focusedCell.rowIndex - 10),
              focusedCell.columnIndex
            );
          }
          break;

        case 'PageDown':
          event.preventDefault();
          if (focusedCell) {
            // Jump 10 rows down
            setFocusedCell(
              Math.min(maxRow, focusedCell.rowIndex + 10),
              focusedCell.columnIndex
            );
          }
          break;

        case 'Enter':
          if (focusedCell) {
            event.preventDefault();
            onCellActivate?.(focusedCell.rowIndex, focusedCell.columnIndex);
          }
          break;

        case ' ':
          if (enableSpaceSelect && focusedCell) {
            event.preventDefault();
            onSpaceSelect?.(focusedCell.rowIndex);
          }
          break;

        case 'Escape':
          clearFocus();
          break;

        default:
          // Let other keys pass through
          break;
      }
    },
    [
      focusedCell,
      navigate,
      setFocusedCell,
      clearFocus,
      onCellActivate,
      onSpaceSelect,
      enableSpaceSelect,
      customHandlers,
      minRow,
      maxRow,
      maxCol,
    ]
  );

  // Focus the actual DOM element when focused cell changes
  useEffect(() => {
    if (focusedCell && containerRef.current) {
      const selector = `[data-row="${focusedCell.rowIndex}"][data-col="${focusedCell.columnIndex}"]`;
      const element = containerRef.current.querySelector<HTMLElement>(selector);
      element?.focus();
    }
  }, [focusedCell]);

  return {
    focusedCell,
    setFocusedCell,
    handleKeyDown,
    clearFocus,
    isCellFocused,
    getCellTabIndex,
    containerRef: containerRef as React.RefObject<HTMLElement>,
    focusContainer,
  };
}

export default useKeyboardNavigation;
