import React, { useMemo, useCallback, useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { useTailGrid } from '../hooks/useTailGrid';
import { GridToolbar } from './GridToolbar';
import { AIQueryBar } from './AIQueryBar';
import { SelectionCheckbox } from './SelectionCheckbox';
import { ColumnResizer } from './ColumnResizer';
import type { TailGridProps, TailGridRenderContext } from '../types';
import { defaultClassNames, mergeClassNames, cx } from '../types';
import type { TailGridColumn } from '@tailgrid/core';

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * TailGrid - The AI-native data grid for React
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TailGrid
 *   data={users}
 *   columns={columns}
 *   enableSorting
 *   enableFiltering
 *   enablePagination
 * />
 *
 * // With AI Query Bar
 * <TailGrid
 *   data={customers}
 *   columns={columns}
 *   enableAI
 *   aiProvider={openaiProvider}
 *   aiQueryBarMode="visible"
 * />
 * ```
 */
export function TailGrid<TData>({
  // Styling
  className,
  classNames: customClassNames,
  theme = 'default',

  // UI State
  loading = false,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',

  // AI Features
  aiProvider,
  aiQueryBarMode = 'hidden',
  aiQueryBarConfig,
  onAIQuery,

  // Accessibility
  enableAccessiblePrimitives = false,
  enableKeyboardNavigation = false,
  a11yConfig,

  // Custom Rendering
  renderHeaderCell,
  renderCell,
  renderToolbar,
  renderPagination,
  renderEmpty,
  renderLoading,

  // Core options passed to useTailGrid
  ...options
}: TailGridProps<TData>) {
  // Merge class names
  const classNamesMap = useMemo(
    () => mergeClassNames(defaultClassNames, customClassNames),
    [customClassNames]
  );

  // Get grid instance from hook
  const grid = useTailGrid(options);
  const { table, rows, paginationInfo, globalFilter, setGlobalFilter } = grid;

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiBar, setShowAiBar] = useState(aiQueryBarMode === 'visible');

  // Handle AI query
  const handleAIQuery = useCallback(
    async (query: string) => {
      if (!aiProvider || !options.enableAI) return;

      setAiLoading(true);
      setAiError(null);

      try {
        // Convert columns to schema for AI
        const schema = options.columns.map((col) => ({
          id: col.id,
          name: col.header,
          type: col.dataType || 'string',
          description: col.header,
        }));

        const result = await aiProvider.parseQuery(query, schema);

        // Apply filters from AI result
        if (result.filters && result.filters.length > 0) {
          result.filters.forEach((filter) => {
            grid.setColumnFilter(filter.id, filter.value);
          });
        }

        // Apply sorting from AI result
        if (result.sorting && result.sorting.length > 0) {
          grid.setSorting(
            result.sorting.map((s) => ({ id: s.id, desc: s.desc }))
          );
        }

        onAIQuery?.(result);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI query failed';
        setAiError(message);
        throw error;
      } finally {
        setAiLoading(false);
      }
    },
    [aiProvider, options.enableAI, options.columns, grid, onAIQuery]
  );

  // Build render context for custom renderers
  const renderContext: TailGridRenderContext<TData> = useMemo(
    () => ({
      ...grid,
      columns: options.columns,
      aiQuery: options.enableAI && aiProvider ? handleAIQuery : undefined,
      aiLoading,
      aiError,
    }),
    [grid, options.columns, options.enableAI, aiProvider, handleAIQuery, aiLoading, aiError]
  );

  // Toggle AI bar visibility (for toggle mode)
  const toggleAiBar = useCallback(() => {
    if (aiQueryBarMode === 'toggle') {
      setShowAiBar((prev) => !prev);
    }
  }, [aiQueryBarMode]);

  // Keyboard shortcut for AI bar
  React.useEffect(() => {
    if (aiQueryBarMode === 'hidden' || !options.enableAI) return;

    const shortcut = aiQueryBarConfig?.shortcut || 'mod+k';
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (shortcut === 'mod+k' && isMod && key === 'k') {
        e.preventDefault();
        if (aiQueryBarMode === 'toggle') {
          toggleAiBar();
        }
        // Focus the AI input
        const input = document.querySelector(`.${classNamesMap.aiInput}`) as HTMLInputElement;
        input?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aiQueryBarMode, aiQueryBarConfig?.shortcut, options.enableAI, toggleAiBar, classNamesMap.aiInput]);

  // Container class with theme
  const containerClass = cx(
    classNamesMap.container,
    theme === 'dark' && 'tailgrid-dark',
    className
  );

  // Render loading state
  if (loading) {
    return (
      <div className={containerClass}>
        {renderLoading ? (
          renderLoading()
        ) : (
          <div className={classNamesMap.loading}>{loadingMessage}</div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      {renderToolbar ? (
        renderToolbar(renderContext)
      ) : (
        <GridToolbar
          classNames={classNamesMap}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          enableGlobalFilter={options.enableGlobalFilter}
          enableAI={options.enableAI}
          aiQueryBarMode={aiQueryBarMode}
          showAiBar={showAiBar}
          onToggleAiBar={toggleAiBar}
          columns={options.columns}
          columnFilters={grid.columnFilters}
          onClearFilters={grid.clearFilters}
        />
      )}

      {/* AI Query Bar */}
      {options.enableAI && aiProvider && (showAiBar || aiQueryBarMode === 'visible') && (
        <AIQueryBar
          classNames={classNamesMap}
          placeholder={aiQueryBarConfig?.placeholder || 'Ask in natural language... (e.g., "show customers in California")'}
          onQuery={handleAIQuery}
          loading={aiLoading}
          error={aiError}
          onClearError={() => setAiError(null)}
        />
      )}

      {/* Table */}
      <div className={classNamesMap.tableWrapper}>
        {rows.length === 0 ? (
          renderEmpty ? (
            renderEmpty()
          ) : (
            <div className={classNamesMap.empty}>{emptyMessage}</div>
          )
        ) : (
          <table className={classNamesMap.table}>
            <thead className={classNamesMap.thead}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={classNamesMap.headerRow}>
                  {/* Selection checkbox column */}
                  {options.enableRowSelection && (
                    <th className={classNamesMap.th} style={{ width: 40 }}>
                      {options.enableMultiRowSelection !== false && (
                        <SelectionCheckbox
                          classNames={classNamesMap}
                          checked={table.getIsAllRowsSelected()}
                          indeterminate={table.getIsSomeRowsSelected()}
                          onChange={table.getToggleAllRowsSelectedHandler()}
                          aria-label={a11yConfig?.ariaLabels?.selectAllRows || 'Select all rows'}
                        />
                      )}
                    </th>
                  )}

                  {headerGroup.headers.map((header) => {
                    const column = options.columns.find((c) => c.id === header.id);
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={cx(
                          classNamesMap.th,
                          canSort && classNamesMap.thSortable
                        )}
                        style={{ width: header.getSize(), position: 'relative' }}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        aria-sort={
                          sortDirection === 'asc'
                            ? 'ascending'
                            : sortDirection === 'desc'
                            ? 'descending'
                            : 'none'
                        }
                      >
                        {renderHeaderCell && column ? (
                          renderHeaderCell(column)
                        ) : (
                          <div className="tailgrid-th-content">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            {sortDirection && (
                              <span className={classNamesMap.sortIndicator}>
                                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Column Resizer */}
                        {options.enableColumnResizing && column?.enableResizing !== false && (
                          <ColumnResizer
                            classNames={classNamesMap}
                            header={header}
                            table={table}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className={classNamesMap.tbody}>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cx(
                    classNamesMap.row,
                    row.getIsSelected() && classNamesMap.rowSelected
                  )}
                  onClick={
                    options.enableRowSelection
                      ? () => row.toggleSelected()
                      : undefined
                  }
                  data-selected={row.getIsSelected()}
                >
                  {/* Selection checkbox */}
                  {options.enableRowSelection && (
                    <td className={classNamesMap.td}>
                      <SelectionCheckbox
                        classNames={classNamesMap}
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={a11yConfig?.ariaLabels?.selectRow || 'Select row'}
                      />
                    </td>
                  )}

                  {row.getVisibleCells().map((cell) => {
                    const column = options.columns.find((c) => c.id === cell.column.id);
                    return (
                      <td
                        key={cell.id}
                        className={classNamesMap.td}
                        style={{
                          textAlign: column?.align || 'left',
                        }}
                      >
                        {renderCell && column ? (
                          renderCell(cell.getValue(), row.original, column)
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {options.enablePagination && rows.length > 0 && (
        renderPagination ? (
          renderPagination(renderContext)
        ) : (
          <DefaultPagination
            classNames={classNamesMap}
            paginationInfo={paginationInfo}
            pageSizeOptions={options.pageSizeOptions}
            onPageIndexChange={grid.setPageIndex}
            onPageSizeChange={grid.setPageSize}
            onFirstPage={grid.firstPage}
            onPreviousPage={grid.previousPage}
            onNextPage={grid.nextPage}
            onLastPage={grid.lastPage}
            a11yConfig={a11yConfig}
          />
        )
      )}
    </div>
  );
}

// ============================================
// DEFAULT PAGINATION
// ============================================

interface DefaultPaginationProps {
  classNames: typeof defaultClassNames;
  paginationInfo: TailGridRenderContext<unknown>['paginationInfo'];
  pageSizeOptions?: number[];
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  a11yConfig?: TailGridProps<unknown>['a11yConfig'];
}

function DefaultPagination({
  classNames,
  paginationInfo,
  pageSizeOptions = [10, 20, 50, 100],
  onPageIndexChange,
  onPageSizeChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  a11yConfig,
}: DefaultPaginationProps) {
  const startRow = paginationInfo.pageIndex * paginationInfo.pageSize + 1;
  const endRow = Math.min(
    (paginationInfo.pageIndex + 1) * paginationInfo.pageSize,
    paginationInfo.totalRows
  );

  return (
    <div className={classNames.pagination}>
      <div className={classNames.paginationInfo}>
        Showing {startRow} to {endRow} of {paginationInfo.totalRows}
      </div>

      <div className="tailgrid-pagination-controls">
        <button
          className={classNames.paginationButton}
          onClick={onFirstPage}
          disabled={!paginationInfo.canPreviousPage}
          aria-label={a11yConfig?.ariaLabels?.firstPage || 'Go to first page'}
        >
          {'<<'}
        </button>
        <button
          className={classNames.paginationButton}
          onClick={onPreviousPage}
          disabled={!paginationInfo.canPreviousPage}
          aria-label={a11yConfig?.ariaLabels?.previousPage || 'Go to previous page'}
        >
          {'<'}
        </button>

        <span className="tailgrid-pagination-page">
          Page {paginationInfo.pageIndex + 1} of {paginationInfo.pageCount}
        </span>

        <button
          className={classNames.paginationButton}
          onClick={onNextPage}
          disabled={!paginationInfo.canNextPage}
          aria-label={a11yConfig?.ariaLabels?.nextPage || 'Go to next page'}
        >
          {'>'}
        </button>
        <button
          className={classNames.paginationButton}
          onClick={onLastPage}
          disabled={!paginationInfo.canNextPage}
          aria-label={a11yConfig?.ariaLabels?.lastPage || 'Go to last page'}
        >
          {'>>'}
        </button>

        <select
          className={classNames.pageSizeSelect}
          value={paginationInfo.pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TailGrid;
