import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { TailGridClassNames, AIQueryResult } from '@tailgrid/core';
import { cx } from '../types';

// ============================================
// TYPES
// ============================================

export interface AIQueryBarProps {
  /** Class names map */
  classNames: TailGridClassNames;
  /** Placeholder text */
  placeholder?: string;
  /** Execute AI query */
  onQuery: (query: string) => Promise<AIQueryResult | undefined>;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Clear error */
  onClearError?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

// ============================================
// COMPONENT
// ============================================

/**
 * AIQueryBar - Natural language query input for AI-powered filtering
 *
 * @example
 * ```tsx
 * <AIQueryBar
 *   classNames={classNames}
 *   placeholder="Ask in natural language..."
 *   onQuery={handleAIQuery}
 *   loading={aiLoading}
 *   error={aiError}
 * />
 * ```
 */
export function AIQueryBar({
  classNames,
  placeholder = 'Ask in natural language... (e.g., "show customers in California")',
  onQuery,
  loading = false,
  error = null,
  onClearError,
  disabled = false,
  autoFocus = false,
}: AIQueryBarProps) {
  const [query, setQuery] = useState('');
  const [lastResult, setLastResult] = useState<AIQueryResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || loading || disabled) return;

      try {
        const result = await onQuery(query.trim());
        if (result) {
          setLastResult(result);
        }
      } catch {
        // Error is handled by parent
      }
    },
    [query, loading, disabled, onQuery]
  );

  // Clear query
  const handleClear = useCallback(() => {
    setQuery('');
    setLastResult(null);
    onClearError?.();
    inputRef.current?.focus();
  }, [onClearError]);

  // Handle key down
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div className={classNames.aiBar}>
      <form onSubmit={handleSubmit} className="tailgrid-ai-form">
        {/* AI Icon */}
        <div className="tailgrid-ai-icon">
          {loading ? (
            <svg
              className="tailgrid-ai-spinner"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          className={cx(classNames.aiInput, error && 'tailgrid-ai-input-error')}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-label="AI query input"
          aria-describedby={error ? 'ai-error' : undefined}
        />

        {/* Clear button */}
        {query && !loading && (
          <button
            type="button"
            className="tailgrid-ai-clear"
            onClick={handleClear}
            aria-label="Clear query"
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

        {/* Submit button */}
        <button
          type="submit"
          className="tailgrid-ai-submit"
          disabled={!query.trim() || loading || disabled}
          aria-label="Execute AI query"
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <span>Ask</span>
              <kbd className="tailgrid-ai-enter-hint">↵</kbd>
            </>
          )}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div id="ai-error" className={classNames.aiError} role="alert">
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{error}</span>
          {onClearError && (
            <button
              type="button"
              className="tailgrid-ai-error-dismiss"
              onClick={onClearError}
              aria-label="Dismiss error"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
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

      {/* Success feedback */}
      {lastResult && !error && lastResult.confidence > 0 && (
        <div className="tailgrid-ai-success">
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
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>
            Applied {lastResult.filters?.length || 0} filter(s)
            {lastResult.sorting?.length ? ` and ${lastResult.sorting.length} sort(s)` : ''}
            {lastResult.confidence < 0.8 && (
              <span className="tailgrid-ai-confidence-warning">
                {' '}(confidence: {Math.round(lastResult.confidence * 100)}%)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export default AIQueryBar;
