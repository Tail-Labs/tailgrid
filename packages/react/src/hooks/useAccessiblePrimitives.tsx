import { useState, useEffect, useCallback, type ComponentType } from 'react';

// ============================================
// TYPES
// ============================================

/**
 * Radix UI Popover components
 */
export interface RadixPopover {
  Root: ComponentType<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
  Trigger: ComponentType<{ asChild?: boolean; children: React.ReactNode }>;
  Portal: ComponentType<{ children: React.ReactNode }>;
  Content: ComponentType<{
    className?: string;
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    children: React.ReactNode;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
  }>;
  Arrow: ComponentType<{ className?: string }>;
  Close: ComponentType<{ asChild?: boolean; children: React.ReactNode }>;
}

/**
 * Radix UI Dropdown Menu components
 */
export interface RadixDropdownMenu {
  Root: ComponentType<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
  Trigger: ComponentType<{ asChild?: boolean; children: React.ReactNode }>;
  Portal: ComponentType<{ children: React.ReactNode }>;
  Content: ComponentType<{
    className?: string;
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    children: React.ReactNode;
  }>;
  Item: ComponentType<{
    className?: string;
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }>;
  CheckboxItem: ComponentType<{
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    children: React.ReactNode;
  }>;
  RadioGroup: ComponentType<{ value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }>;
  RadioItem: ComponentType<{ className?: string; value: string; children: React.ReactNode }>;
  Separator: ComponentType<{ className?: string }>;
  Label: ComponentType<{ className?: string; children: React.ReactNode }>;
  ItemIndicator: ComponentType<{ children: React.ReactNode }>;
}

/**
 * Fallback components when Radix is not available
 */
export interface FallbackComponents {
  Popover: FallbackPopover;
  DropdownMenu: FallbackDropdownMenu;
}

export interface FallbackPopover {
  Root: ComponentType<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
  Trigger: ComponentType<{ asChild?: boolean; children: React.ReactNode; onClick?: () => void }>;
  Content: ComponentType<{ className?: string; children: React.ReactNode }>;
  Close: ComponentType<{ asChild?: boolean; children: React.ReactNode; onClick?: () => void }>;
}

export interface FallbackDropdownMenu {
  Root: ComponentType<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
  Trigger: ComponentType<{ asChild?: boolean; children: React.ReactNode; onClick?: () => void }>;
  Content: ComponentType<{ className?: string; children: React.ReactNode }>;
  Item: ComponentType<{ className?: string; onSelect?: () => void; disabled?: boolean; children: React.ReactNode }>;
  Separator: ComponentType<{ className?: string }>;
}

export interface UseAccessiblePrimitivesOptions {
  /** Enable loading Radix UI components */
  enabled?: boolean;
  /** Called when Radix components are loaded */
  onLoad?: () => void;
  /** Called if loading fails */
  onError?: (error: Error) => void;
}

export interface UseAccessiblePrimitivesReturn {
  /** Popover component (Radix or fallback) */
  Popover: RadixPopover | FallbackPopover;
  /** DropdownMenu component (Radix or fallback) */
  DropdownMenu: RadixDropdownMenu | FallbackDropdownMenu;
  /** Whether Radix components are loaded */
  isLoaded: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Loading error if any */
  error: Error | null;
  /** Whether using Radix (true) or fallback (false) */
  isUsingRadix: boolean;
}

// ============================================
// FALLBACK COMPONENTS
// ============================================

/**
 * Simple fallback Popover using native HTML
 */
const createFallbackPopover = (): FallbackPopover => ({
  Root: ({ children }) => <div className="tailgrid-popover-root">{children}</div>,
  Trigger: ({ children, onClick }) => (
    <div className="tailgrid-popover-trigger" onClick={onClick}>
      {children}
    </div>
  ),
  Content: ({ className, children }) => (
    <div className={`tailgrid-popover-content ${className || ''}`} role="dialog">
      {children}
    </div>
  ),
  Close: ({ children, onClick }) => (
    <div className="tailgrid-popover-close" onClick={onClick}>
      {children}
    </div>
  ),
});

/**
 * Simple fallback DropdownMenu using native HTML
 */
const createFallbackDropdownMenu = (): FallbackDropdownMenu => ({
  Root: ({ children }) => <div className="tailgrid-dropdown-root">{children}</div>,
  Trigger: ({ children, onClick }) => (
    <div className="tailgrid-dropdown-trigger" onClick={onClick}>
      {children}
    </div>
  ),
  Content: ({ className, children }) => (
    <div className={`tailgrid-dropdown-content ${className || ''}`} role="menu">
      {children}
    </div>
  ),
  Item: ({ className, onSelect, disabled, children }) => (
    <div
      className={`tailgrid-dropdown-item ${className || ''} ${disabled ? 'disabled' : ''}`}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect?.()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          !disabled && onSelect?.();
        }
      }}
      aria-disabled={disabled}
    >
      {children}
    </div>
  ),
  Separator: ({ className }) => (
    <div className={`tailgrid-dropdown-separator ${className || ''}`} role="separator" />
  ),
});

// ============================================
// HOOK
// ============================================

/**
 * useAccessiblePrimitives - Lazy-load Radix UI components
 *
 * Provides accessible UI primitives that work without JavaScript,
 * with enhanced Radix UI components loaded on-demand when enabled.
 *
 * @example
 * ```tsx
 * const { Popover, DropdownMenu, isLoaded } = useAccessiblePrimitives({
 *   enabled: enableAccessiblePrimitives,
 * });
 *
 * // Use Popover and DropdownMenu - they work the same whether
 * // Radix is loaded or using fallbacks
 * <Popover.Root>
 *   <Popover.Trigger>Open</Popover.Trigger>
 *   <Popover.Content>Content here</Popover.Content>
 * </Popover.Root>
 * ```
 */
export function useAccessiblePrimitives({
  enabled = false,
  onLoad,
  onError,
}: UseAccessiblePrimitivesOptions = {}): UseAccessiblePrimitivesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [radixPopover, setRadixPopover] = useState<RadixPopover | null>(null);
  const [radixDropdown, setRadixDropdown] = useState<RadixDropdownMenu | null>(null);

  // Lazy load Radix components
  const loadRadix = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dynamic imports for Radix UI
      const [popoverModule, dropdownModule] = await Promise.all([
        import('@radix-ui/react-popover').catch(() => null),
        import('@radix-ui/react-dropdown-menu').catch(() => null),
      ]);

      if (popoverModule) {
        setRadixPopover(popoverModule as unknown as RadixPopover);
      }

      if (dropdownModule) {
        setRadixDropdown(dropdownModule as unknown as RadixDropdownMenu);
      }

      setIsLoaded(true);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load Radix UI');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading, onLoad, onError]);

  // Load Radix when enabled
  useEffect(() => {
    if (enabled && !isLoaded && !isLoading) {
      loadRadix();
    }
  }, [enabled, isLoaded, isLoading, loadRadix]);

  // Use Radix components if loaded, otherwise use fallbacks
  const Popover = radixPopover || createFallbackPopover();
  const DropdownMenu = radixDropdown || createFallbackDropdownMenu();

  return {
    Popover,
    DropdownMenu,
    isLoaded,
    isLoading,
    error,
    isUsingRadix: !!radixPopover || !!radixDropdown,
  };
}

export default useAccessiblePrimitives;
