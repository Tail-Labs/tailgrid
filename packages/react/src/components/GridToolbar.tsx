import React, { useState, useCallback } from 'react';
import type { TailGridClassNames, TailGridColumn, AIQueryBarMode } from '@tailgrid/core';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface GridToolbarProps<TData = unknown> {
  /** Class names map */
  classNames: TailGridClassNames;
  /** Current global filter value */
  globalFilter: string;
  /** Callback when global filter changes */
  onGlobalFilterChange: (value: string) => void;
  /** Enable global filter input */
  enableGlobalFilter?: boolean;
  /** Enable AI features */
  enableAI?: boolean;
  /** AI query bar mode */
  aiQueryBarMode?: AIQueryBarMode;
  /** Whether AI bar is currently shown */
  showAiBar?: boolean;
  /** Toggle AI bar visibility */
  onToggleAiBar?: () => void;
  /** Column definitions */
  columns?: TailGridColumn<TData>[];
  /** Current column filters */
  columnFilters?: Array<{ id: string; value: unknown }>;
  /** Clear all filters */
  onClearFilters?: () => void;
}

// ============================================
// COMPONENT
// ============================================

/**
 * GridToolbar - Toolbar with search, AI toggle, and filter chips
 *
 * @example
 * ```tsx
 * <GridToolbar
 *   classNames={classNames}
 *   globalFilter={globalFilter}
 *   onGlobalFilterChange={setGlobalFilter}
 *   enableGlobalFilter
 *   enableAI
 *   aiQueryBarMode="toggle"
 *   showAiBar={showAiBar}
 *   onToggleAiBar={toggleAiBar}
 * />
 * ```
 */
export function GridToolbar<TData>({
  classNames,
  globalFilter,
  onGlobalFilterChange,
  enableGlobalFilter = true,
  enableAI = false,
  aiQueryBarMode = 'hidden',
  showAiBar = false,
  onToggleAiBar,
  columns,
  columnFilters = [],
  onClearFilters,
}: GridToolbarProps<TData>) {
  const [searchFocused, setSearchFocused] = useState(false);

  // Get column name by ID
  const getColumnName = useCallback(
    (columnId: string): string => {
      const column = columns?.find((c) => c.id === columnId);
      return column?.header || columnId;
    },
    [columns]
  );

  // Format filter value for display
  const formatFilterValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return JSON.stringify(value);
  };

  const hasFilters = columnFilters.length > 0 || globalFilter;

  return (
    <div className={classNames.toolbar}>
      <div className="tailgrid-toolbar-left">
        {/* Global Search */}
        {enableGlobalFilter && (
          <div className={cx('tailgrid-search-wrapper', searchFocused && 'tailgrid-search-focused')}>
            <svg
              className="tailgrid-search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className={classNames.searchInput}
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search all columns"
            />
            {globalFilter && (
              <button
                className="tailgrid-search-clear"
                onClick={() => onGlobalFilterChange('')}
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* AI Toggle Button */}
        {enableAI && aiQueryBarMode === 'toggle' && (
          <button
            className={cx('tailgrid-ai-toggle', showAiBar && 'tailgrid-ai-toggle-active')}
            onClick={onToggleAiBar}
            aria-label={showAiBar ? 'Hide AI query bar' : 'Show AI query bar'}
            aria-expanded={showAiBar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
            <span>AI</span>
            <kbd className="tailgrid-shortcut-hint">⌘K</kbd>
          </button>
        )}
      </div>

      <div className="tailgrid-toolbar-right">
        {/* Filter Chips */}
        {hasFilters && (
          <div className="tailgrid-filter-chips">
            {/* Global filter chip */}
            {globalFilter && (
              <span className={classNames.filterChip}>
                <span className="tailgrid-filter-chip-label">Search:</span>
                <span className="tailgrid-filter-chip-value">"{globalFilter}"</span>
              </span>
            )}

            {/* Column filter chips */}
            {columnFilters.map((filter) => (
              <span key={filter.id} className={classNames.filterChip}>
                <span className="tailgrid-filter-chip-label">{getColumnName(filter.id)}:</span>
                <span className="tailgrid-filter-chip-value">{formatFilterValue(filter.value)}</span>
              </span>
            ))}

            {/* Clear all button */}
            {onClearFilters && (
              <button
                className="tailgrid-clear-filters"
                onClick={onClearFilters}
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GridToolbar;
