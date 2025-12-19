import type { TailGridColumn, FilterOperator, ColumnFilter } from '../../types';
import { getRowValue } from './sorting';

/**
 * Check if a value matches a filter condition
 */
function matchesFilter(
  value: unknown,
  filter: ColumnFilter,
  dataType?: string
): boolean {
  const filterValue = filter.value;

  // Handle isEmpty/isNotEmpty operators
  if (filter.operator === 'isEmpty') {
    return value == null || value === '' || (Array.isArray(value) && value.length === 0);
  }
  if (filter.operator === 'isNotEmpty') {
    return value != null && value !== '' && !(Array.isArray(value) && value.length === 0);
  }

  // For other operators, null values don't match
  if (value == null) return false;

  const stringValue = String(value).toLowerCase();
  const stringFilterValue = String(filterValue).toLowerCase();

  switch (filter.operator) {
    case 'equals':
      if (dataType === 'number' || dataType === 'currency') {
        return Number(value) === Number(filterValue);
      }
      if (dataType === 'boolean') {
        return value === filterValue;
      }
      if (dataType === 'date') {
        const dateValue = value instanceof Date ? value : new Date(String(value));
        const dateFilter = filterValue instanceof Date ? filterValue : new Date(String(filterValue));
        return dateValue.toDateString() === dateFilter.toDateString();
      }
      return stringValue === stringFilterValue;

    case 'notEquals':
      if (dataType === 'number' || dataType === 'currency') {
        return Number(value) !== Number(filterValue);
      }
      if (dataType === 'boolean') {
        return value !== filterValue;
      }
      return stringValue !== stringFilterValue;

    case 'contains':
      return stringValue.includes(stringFilterValue);

    case 'notContains':
      return !stringValue.includes(stringFilterValue);

    case 'startsWith':
      return stringValue.startsWith(stringFilterValue);

    case 'endsWith':
      return stringValue.endsWith(stringFilterValue);

    case 'gt':
      if (dataType === 'date') {
        const dateValue = value instanceof Date ? value : new Date(String(value));
        const dateFilter = filterValue instanceof Date ? filterValue : new Date(String(filterValue));
        return dateValue > dateFilter;
      }
      return Number(value) > Number(filterValue);

    case 'gte':
      if (dataType === 'date') {
        const dateValue = value instanceof Date ? value : new Date(String(value));
        const dateFilter = filterValue instanceof Date ? filterValue : new Date(String(filterValue));
        return dateValue >= dateFilter;
      }
      return Number(value) >= Number(filterValue);

    case 'lt':
      if (dataType === 'date') {
        const dateValue = value instanceof Date ? value : new Date(String(value));
        const dateFilter = filterValue instanceof Date ? filterValue : new Date(String(filterValue));
        return dateValue < dateFilter;
      }
      return Number(value) < Number(filterValue);

    case 'lte':
      if (dataType === 'date') {
        const dateValue = value instanceof Date ? value : new Date(String(value));
        const dateFilter = filterValue instanceof Date ? filterValue : new Date(String(filterValue));
        return dateValue <= dateFilter;
      }
      return Number(value) <= Number(filterValue);

    case 'between':
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        const [min, max] = filterValue;
        if (dataType === 'date') {
          const dateValue = value instanceof Date ? value : new Date(String(value));
          const minDate = min instanceof Date ? min : new Date(String(min));
          const maxDate = max instanceof Date ? max : new Date(String(max));
          return dateValue >= minDate && dateValue <= maxDate;
        }
        const numValue = Number(value);
        return numValue >= Number(min) && numValue <= Number(max);
      }
      return false;

    case 'inList':
      if (Array.isArray(filterValue)) {
        return filterValue.some((item) =>
          String(item).toLowerCase() === stringValue
        );
      }
      return false;

    default:
      return true;
  }
}

/**
 * Filter data by column filters
 */
export function filterData<TData>(
  data: TData[],
  columnFilters: ColumnFilter[],
  columns: TailGridColumn<TData>[]
): TData[] {
  if (!columnFilters.length) {
    return data;
  }

  // Create column lookup for performance
  const columnMap = new Map(columns.map((col) => [col.id, col]));

  return data.filter((row) => {
    return columnFilters.every((filter) => {
      const column = columnMap.get(filter.id);
      if (!column) return true; // Unknown column, skip filter

      const value = getRowValue(row, column);
      return matchesFilter(value, filter, column.dataType);
    });
  });
}

/**
 * Filter data by global search term
 */
export function globalFilterData<TData>(
  data: TData[],
  globalFilter: string,
  columns: TailGridColumn<TData>[]
): TData[] {
  if (!globalFilter || !globalFilter.trim()) {
    return data;
  }

  const searchTerm = globalFilter.toLowerCase().trim();

  return data.filter((row) => {
    return columns.some((column) => {
      // Skip columns that don't have filtering enabled
      if (column.enableFiltering === false) return false;

      const value = getRowValue(row, column);
      if (value == null) return false;

      return String(value).toLowerCase().includes(searchTerm);
    });
  });
}
