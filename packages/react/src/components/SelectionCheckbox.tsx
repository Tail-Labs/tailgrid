import React, { useRef, useEffect } from 'react';
import type { TailGridClassNames } from '@tailgrid/core';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface SelectionCheckboxProps {
  /** Class names map */
  classNames: TailGridClassNames;
  /** Checked state */
  checked: boolean;
  /** Indeterminate state (for "select all" with partial selection) */
  indeterminate?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Click handler (for stopping propagation) */
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  /** ARIA label */
  'aria-label'?: string;
}

// ============================================
// COMPONENT
// ============================================

/**
 * SelectionCheckbox - Checkbox for row/all selection with indeterminate support
 *
 * @example
 * ```tsx
 * // Header checkbox (select all)
 * <SelectionCheckbox
 *   classNames={classNames}
 *   checked={table.getIsAllRowsSelected()}
 *   indeterminate={table.getIsSomeRowsSelected()}
 *   onChange={table.getToggleAllRowsSelectedHandler()}
 *   aria-label="Select all rows"
 * />
 *
 * // Row checkbox
 * <SelectionCheckbox
 *   classNames={classNames}
 *   checked={row.getIsSelected()}
 *   disabled={!row.getCanSelect()}
 *   onChange={row.getToggleSelectedHandler()}
 *   aria-label="Select row"
 * />
 * ```
 */
export function SelectionCheckbox({
  classNames,
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  onClick,
  'aria-label': ariaLabel,
}: SelectionCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Handle indeterminate state (can't be set via attribute)
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cx(
        classNames.checkbox,
        checked && classNames.checkboxChecked,
        indeterminate && classNames.checkboxIndeterminate,
        disabled && 'tailgrid-checkbox-disabled'
      )}
    >
      <input
        ref={checkboxRef}
        type="checkbox"
        className="tailgrid-checkbox-input"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        onClick={onClick}
        aria-label={ariaLabel}
      />
      <span className="tailgrid-checkbox-visual">
        {checked && !indeterminate && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
        {indeterminate && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        )}
      </span>
    </label>
  );
}

export default SelectionCheckbox;
