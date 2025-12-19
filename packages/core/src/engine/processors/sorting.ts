import type { TailGridColumn } from '../../types';

export interface SortConfig {
  id: string;
  desc: boolean;
}

export type SortingState = SortConfig[];

/**
 * Get value from row using column accessor
 */
export function getRowValue<TData>(
  row: TData,
  column: TailGridColumn<TData>
): unknown {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return (row as Record<string, unknown>)[column.accessorKey];
  }
  return undefined;
}

/**
 * Compare two values for sorting
 */
function compareValues(
  a: unknown,
  b: unknown,
  dataType?: string
): number {
  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  // Type-specific comparison
  switch (dataType) {
    case 'number':
    case 'currency':
      return Number(a) - Number(b);

    case 'date':
      const dateA = a instanceof Date ? a : new Date(String(a));
      const dateB = b instanceof Date ? b : new Date(String(b));
      return dateA.getTime() - dateB.getTime();

    case 'boolean':
      return (a === true ? 1 : 0) - (b === true ? 1 : 0);

    case 'string':
    default:
      return String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
  }
}

/**
 * Sort data by multiple columns
 */
export function sortData<TData>(
  data: TData[],
  sorting: SortingState,
  columns: TailGridColumn<TData>[]
): TData[] {
  if (!sorting.length) {
    return data;
  }

  // Create column lookup for performance
  const columnMap = new Map(columns.map((col) => [col.id, col]));

  return [...data].sort((rowA, rowB) => {
    for (const sort of sorting) {
      const column = columnMap.get(sort.id);
      if (!column) continue;

      const valueA = getRowValue(rowA, column);
      const valueB = getRowValue(rowB, column);

      const result = compareValues(valueA, valueB, column.dataType);

      if (result !== 0) {
        return sort.desc ? -result : result;
      }
    }
    return 0;
  });
}
