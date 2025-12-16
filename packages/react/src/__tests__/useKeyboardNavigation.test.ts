import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  const defaultOptions = {
    rowCount: 10,
    columnCount: 5,
  };

  describe('initialization', () => {
    it('should initialize with no focused cell', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      expect(result.current.focusedCell).toBeNull();
    });

    it('should provide setFocusedCell function', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      expect(typeof result.current.setFocusedCell).toBe('function');
    });
  });

  describe('setFocusedCell', () => {
    it('should set focused cell correctly', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 2, columnIndex: 3 });
    });

    it('should clamp row index to valid range', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(100, 2);
      });

      expect(result.current.focusedCell?.rowIndex).toBe(9); // max is rowCount - 1
    });

    it('should clamp column index to valid range', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 100);
      });

      expect(result.current.focusedCell?.columnIndex).toBe(4); // max is columnCount - 1
    });

    it('should clamp negative indices to 0', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(-5, -3);
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 0, columnIndex: 0 });
    });
  });

  describe('clearFocus', () => {
    it('should clear focused cell', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(result.current.focusedCell).not.toBeNull();

      act(() => {
        result.current.clearFocus();
      });

      expect(result.current.focusedCell).toBeNull();
    });
  });

  describe('isCellFocused', () => {
    it('should return true for focused cell', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(result.current.isCellFocused(2, 3)).toBe(true);
    });

    it('should return false for non-focused cells', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(result.current.isCellFocused(0, 0)).toBe(false);
      expect(result.current.isCellFocused(2, 4)).toBe(false);
      expect(result.current.isCellFocused(3, 3)).toBe(false);
    });
  });

  describe('getCellTabIndex', () => {
    it('should return 0 for first cell when nothing is focused', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      expect(result.current.getCellTabIndex(0, 0)).toBe(0);
      expect(result.current.getCellTabIndex(1, 0)).toBe(-1);
    });

    it('should return 0 for focused cell', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(result.current.getCellTabIndex(2, 3)).toBe(0);
    });

    it('should return -1 for non-focused cells when something is focused', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(result.current.getCellTabIndex(0, 0)).toBe(-1);
    });
  });

  describe('keyboard navigation', () => {
    const createKeyboardEvent = (key: string, options = {}) => ({
      key,
      preventDefault: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      ...options,
    } as unknown as React.KeyboardEvent);

    it('should navigate down with ArrowDown', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 3, columnIndex: 3 });
    });

    it('should navigate up with ArrowUp', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 1, columnIndex: 3 });
    });

    it('should navigate right with ArrowRight', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 2, columnIndex: 4 });
    });

    it('should navigate left with ArrowLeft', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 2, columnIndex: 2 });
    });

    it('should not navigate past boundaries without wrapAround', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(0, 0);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 0, columnIndex: 0 });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 0, columnIndex: 0 });
    });

    it('should wrap around with wrapAround enabled', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ ...defaultOptions, wrapAround: true })
      );

      act(() => {
        result.current.setFocusedCell(0, 0);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'));
      });

      expect(result.current.focusedCell?.rowIndex).toBe(9);
    });

    it('should go to first cell in row with Home', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(5, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Home'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 5, columnIndex: 0 });
    });

    it('should go to last cell in row with End', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(5, 1);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('End'));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 5, columnIndex: 4 });
    });

    it('should go to first cell with Ctrl+Home', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(5, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Home', { ctrlKey: true }));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 0, columnIndex: 0 });
    });

    it('should go to last cell with Ctrl+End', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(0, 0);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('End', { ctrlKey: true }));
      });

      expect(result.current.focusedCell).toEqual({ rowIndex: 9, columnIndex: 4 });
    });

    it('should clear focus with Escape', () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Escape'));
      });

      expect(result.current.focusedCell).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('should call onCellActivate on Enter', () => {
      const onCellActivate = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ ...defaultOptions, onCellActivate })
      );

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent);
      });

      expect(onCellActivate).toHaveBeenCalledWith(2, 3);
    });

    it('should call onSpaceSelect on Space', () => {
      const onSpaceSelect = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ ...defaultOptions, onSpaceSelect })
      );

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      act(() => {
        result.current.handleKeyDown({
          key: ' ',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent);
      });

      expect(onSpaceSelect).toHaveBeenCalledWith(2);
    });

    it('should call onFocusChange when focus changes', () => {
      const onFocusChange = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ ...defaultOptions, onFocusChange })
      );

      act(() => {
        result.current.setFocusedCell(2, 3);
      });

      expect(onFocusChange).toHaveBeenCalledWith(2, 3);
    });
  });

  describe('skipHeader option', () => {
    it('should start from row 1 when skipHeader is true', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ ...defaultOptions, skipHeader: true })
      );

      expect(result.current.getCellTabIndex(1, 0)).toBe(0);
      expect(result.current.getCellTabIndex(0, 0)).toBe(-1);
    });

    it('should not navigate to header row when skipHeader is true', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ ...defaultOptions, skipHeader: true })
      );

      act(() => {
        result.current.setFocusedCell(1, 0);
      });

      act(() => {
        result.current.handleKeyDown({
          key: 'ArrowUp',
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedCell?.rowIndex).toBe(1);
    });
  });
});
