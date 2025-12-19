import type { TailGridColumn } from '../../types';
import type { SortingState } from '../processors/sorting';

/**
 * Represents a column in the grid with sort/filter state
 */
export interface GridColumn<TData> {
  /** Column ID */
  id: string;
  /** Column definition */
  columnDef: TailGridColumn<TData>;
  /** Can this column be sorted */
  canSort: boolean;
  /** Current sort direction or false if not sorted */
  isSorted: false | 'asc' | 'desc';
  /** Column width in pixels */
  size: number;
  /** Is column currently being resized */
  isResizing: boolean;
}

/**
 * Create GridColumn from column definition
 */
export function createColumn<TData>(
  columnDef: TailGridColumn<TData>,
  sorting: SortingState,
  enableSorting: boolean,
  columnSizing: Record<string, number>,
  resizingColumnId: string | null
): GridColumn<TData> {
  const sortConfig = sorting.find((s) => s.id === columnDef.id);

  return {
    id: columnDef.id,
    columnDef,
    canSort: columnDef.enableSorting ?? enableSorting,
    isSorted: sortConfig ? (sortConfig.desc ? 'desc' : 'asc') : false,
    size: columnSizing[columnDef.id] ?? columnDef.width ?? 150,
    isResizing: resizingColumnId === columnDef.id,
  };
}

/**
 * Create all columns from column definitions
 */
export function createColumns<TData>(
  columnDefs: TailGridColumn<TData>[],
  sorting: SortingState,
  enableSorting: boolean,
  columnSizing: Record<string, number>,
  resizingColumnId: string | null
): GridColumn<TData>[] {
  return columnDefs.map((def) =>
    createColumn(def, sorting, enableSorting, columnSizing, resizingColumnId)
  );
}
