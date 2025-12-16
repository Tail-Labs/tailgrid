import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TailGridClassNames, TailGridColumn, FilterOperator, ColumnFilter as ColumnFilterType } from '@tailgrid/core';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface ColumnFilterProps<TData> {
  /** Column definition */
  column: TailGridColumn<TData>;
  /** Current filter value */
  filter?: ColumnFilterType;
  /** Callback when filter changes */
  onFilterChange: (filter: ColumnFilterType | null) => void;
  /** Class names map */
  classNames: TailGridClassNames;
  /** Available operators for this column type */
  operators?: FilterOperator[];
  /** Aria labels */
  ariaLabels?: {
    filterColumn?: string;
    clearFilter?: string;
    operator?: string;
    value?: string;
  };
}

// ============================================
// OPERATOR CONFIGS
// ============================================

const STRING_OPERATORS: FilterOperator[] = [
  'contains',
  'notContains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'isEmpty',
  'isNotEmpty',
];

const NUMBER_OPERATORS: FilterOperator[] = [
  'equals',
  'notEquals',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'isEmpty',
  'isNotEmpty',
];

const DATE_OPERATORS: FilterOperator[] = [
  'equals',
  'notEquals',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'isEmpty',
  'isNotEmpty',
];

const BOOLEAN_OPERATORS: FilterOperator[] = ['equals', 'notEquals'];

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  notEquals: 'Not equals',
  contains: 'Contains',
  notContains: 'Does not contain',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  between: 'Between',
  inList: 'In list',
  isEmpty: 'Is empty',
  isNotEmpty: 'Is not empty',
};

function getOperatorsForType(dataType?: string): FilterOperator[] {
  switch (dataType) {
    case 'number':
    case 'currency':
      return NUMBER_OPERATORS;
    case 'date':
      return DATE_OPERATORS;
    case 'boolean':
      return BOOLEAN_OPERATORS;
    default:
      return STRING_OPERATORS;
  }
}

// ============================================
// COMPONENT
// ============================================

/**
 * ColumnFilter - Per-column filter dropdown
 *
 * Provides operator selection and value input based on column data type.
 * Supports string, number, date, and boolean filtering.
 *
 * @example
 * ```tsx
 * <ColumnFilter
 *   column={column}
 *   filter={currentFilter}
 *   onFilterChange={(filter) => setColumnFilter(column.id, filter)}
 *   classNames={classNames}
 * />
 * ```
 */
export function ColumnFilter<TData>({
  column,
  filter,
  onFilterChange,
  classNames,
  operators,
  ariaLabels,
}: ColumnFilterProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const [operator, setOperator] = useState<FilterOperator>(filter?.operator || 'contains');
  const [value, setValue] = useState<string>(String(filter?.value ?? ''));
  const [value2, setValue2] = useState<string>(''); // For 'between' operator
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const availableOperators = operators || getOperatorsForType(column.dataType);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, []);

  // Apply filter
  const applyFilter = useCallback(() => {
    if (operator === 'isEmpty' || operator === 'isNotEmpty') {
      onFilterChange({
        id: column.id,
        operator,
        value: null,
      });
    } else if (operator === 'between') {
      onFilterChange({
        id: column.id,
        operator,
        value: [parseValue(value), parseValue(value2)],
      });
    } else if (value.trim()) {
      onFilterChange({
        id: column.id,
        operator,
        value: parseValue(value),
      });
    }
    setIsOpen(false);
  }, [column.id, operator, value, value2, onFilterChange]);

  // Parse value based on column type
  const parseValue = (val: string): unknown => {
    if (!val) return val;
    switch (column.dataType) {
      case 'number':
      case 'currency':
        return parseFloat(val) || 0;
      case 'boolean':
        return val === 'true';
      case 'date':
        return new Date(val).toISOString();
      default:
        return val;
    }
  };

  // Clear filter
  const clearFilter = useCallback(() => {
    setValue('');
    setValue2('');
    setOperator('contains');
    onFilterChange(null);
    setIsOpen(false);
  }, [onFilterChange]);

  const hasFilter = !!filter;
  const needsValue = operator !== 'isEmpty' && operator !== 'isNotEmpty';
  const needsTwoValues = operator === 'between';

  return (
    <div className="tailgrid-column-filter">
      {/* Filter trigger button */}
      <button
        ref={buttonRef}
        type="button"
        className={cx(
          'tailgrid-filter-trigger',
          hasFilter && 'tailgrid-filter-trigger-active'
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabels?.filterColumn || `Filter ${column.header}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={hasFilter ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

      {/* Filter popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={classNames.filterPopover}
          role="dialog"
          aria-label={`Filter options for ${column.header}`}
          onKeyDown={handleKeyDown}
        >
          <div className="tailgrid-filter-content">
            {/* Operator select */}
            <div className="tailgrid-filter-field">
              <label
                htmlFor={`filter-operator-${column.id}`}
                className="tailgrid-filter-label"
              >
                {ariaLabels?.operator || 'Operator'}
              </label>
              <select
                id={`filter-operator-${column.id}`}
                className="tailgrid-filter-select"
                value={operator}
                onChange={(e) => setOperator(e.target.value as FilterOperator)}
              >
                {availableOperators.map((op) => (
                  <option key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </option>
                ))}
              </select>
            </div>

            {/* Value input */}
            {needsValue && (
              <div className="tailgrid-filter-field">
                <label
                  htmlFor={`filter-value-${column.id}`}
                  className="tailgrid-filter-label"
                >
                  {ariaLabels?.value || 'Value'}
                </label>
                {column.dataType === 'boolean' ? (
                  <select
                    id={`filter-value-${column.id}`}
                    className="tailgrid-filter-select"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : column.dataType === 'date' ? (
                  <input
                    id={`filter-value-${column.id}`}
                    type="date"
                    className="tailgrid-filter-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                ) : column.dataType === 'number' || column.dataType === 'currency' ? (
                  <input
                    id={`filter-value-${column.id}`}
                    type="number"
                    className="tailgrid-filter-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter number..."
                  />
                ) : (
                  <input
                    id={`filter-value-${column.id}`}
                    type="text"
                    className="tailgrid-filter-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter value..."
                  />
                )}
              </div>
            )}

            {/* Second value for 'between' operator */}
            {needsTwoValues && (
              <div className="tailgrid-filter-field">
                <label
                  htmlFor={`filter-value2-${column.id}`}
                  className="tailgrid-filter-label"
                >
                  And
                </label>
                {column.dataType === 'date' ? (
                  <input
                    id={`filter-value2-${column.id}`}
                    type="date"
                    className="tailgrid-filter-input"
                    value={value2}
                    onChange={(e) => setValue2(e.target.value)}
                  />
                ) : (
                  <input
                    id={`filter-value2-${column.id}`}
                    type="number"
                    className="tailgrid-filter-input"
                    value={value2}
                    onChange={(e) => setValue2(e.target.value)}
                    placeholder="Enter number..."
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="tailgrid-filter-actions">
              <button
                type="button"
                className="tailgrid-filter-btn tailgrid-filter-btn-clear"
                onClick={clearFilter}
                aria-label={ariaLabels?.clearFilter || 'Clear filter'}
              >
                Clear
              </button>
              <button
                type="button"
                className="tailgrid-filter-btn tailgrid-filter-btn-apply"
                onClick={applyFilter}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColumnFilter;
