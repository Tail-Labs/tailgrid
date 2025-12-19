import type { TailGridColumn } from '../../types';
import { getRowValue } from '../processors/sorting';

/**
 * Represents a row in the grid with selection and accessor methods
 */
export interface GridRow<TData> {
  /** Unique row identifier */
  id: string;
  /** Row index in the current view */
  index: number;
  /** Original row data */
  original: TData;
  /** Is this row selected */
  isSelected: boolean;
  /** Can this row be selected */
  canSelect: boolean;
  /** Get cell value for a column */
  getValue: (columnId: string) => unknown;
  /** Get all visible cells for this row */
  getVisibleCells: () => GridCell<TData>[];
}

/**
 * Represents a cell in the grid
 */
export interface GridCell<TData> {
  /** Cell ID (rowId_columnId) */
  id: string;
  /** Column this cell belongs to */
  column: TailGridColumn<TData>;
  /** Row this cell belongs to */
  row: GridRow<TData>;
  /** Cell value (computed) */
  value: unknown;
  /** Cell value getter function */
  getValue: () => unknown;
}

/**
 * Create a GridRow from raw data
 */
export function createRow<TData>(
  data: TData,
  index: number,
  rowId: string,
  columns: TailGridColumn<TData>[],
  isSelected: boolean,
  canSelect: boolean
): GridRow<TData> {
  const row: GridRow<TData> = {
    id: rowId,
    index,
    original: data,
    isSelected,
    canSelect,
    getValue: (columnId: string) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column) return undefined;
      return getRowValue(data, column);
    },
    getVisibleCells: () => {
      return columns.map((column) => createCell(row, column));
    },
  };

  return row;
}

/**
 * Create a GridCell
 */
export function createCell<TData>(
  row: GridRow<TData>,
  column: TailGridColumn<TData>
): GridCell<TData> {
  const value = row.getValue(column.id);
  return {
    id: `${row.id}_${column.id}`,
    column,
    row,
    value,
    getValue: () => value,
  };
}
