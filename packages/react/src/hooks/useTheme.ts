import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ThemeEngine,
  themeEngine as defaultThemeEngine,
  lightTheme,
  darkTheme,
  defineTheme,
  type TailGridThemeConfig,
  type PartialThemeConfig,
} from '@tailgrid/core';

// ============================================
// HOOK OPTIONS
// ============================================

export interface UseThemeOptions {
  /** Initial theme name or config */
  initialTheme?: string | TailGridThemeConfig;
  /** Custom theme engine instance */
  themeEngine?: ThemeEngine;
  /** Auto-apply theme to document */
  autoApply?: boolean;
  /** Respect system preference for dark mode */
  respectSystemPreference?: boolean;
}

// ============================================
// HOOK RETURN TYPE
// ============================================

export interface UseThemeReturn {
  /** Current theme configuration */
  theme: TailGridThemeConfig;
  /** Current theme name */
  themeName: string;
  /** Is dark mode active */
  isDarkMode: boolean;
  /** Set theme by name or config */
  setTheme: (theme: string | TailGridThemeConfig) => void;
  /** Toggle between light and dark mode */
  toggleDarkMode: () => void;
  /** Register a custom theme */
  registerTheme: (name: string, config: PartialThemeConfig) => TailGridThemeConfig;
  /** Get style object for inline styles */
  getStyleObject: () => Record<string, string>;
  /** Get CSS variables string */
  getCSSVariables: () => string;
  /** Available theme names */
  availableThemes: string[];
  /** Theme engine instance */
  engine: ThemeEngine;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * React hook for TailGrid theme management
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { theme, setTheme, toggleDarkMode } = useTheme();
 *
 * // With initial dark theme
 * const { theme } = useTheme({ initialTheme: 'dark' });
 *
 * // With custom theme
 * const { theme, registerTheme } = useTheme();
 * useEffect(() => {
 *   registerTheme('brand', {
 *     colors: { primary: '#8b5cf6' }
 *   });
 * }, []);
 *
 * // Respect system preference
 * const { theme, isDarkMode } = useTheme({ respectSystemPreference: true });
 * ```
 */
export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const {
    initialTheme,
    themeEngine = defaultThemeEngine,
    autoApply = true,
    respectSystemPreference = false,
  } = options;

  // Initialize theme state
  const [theme, setThemeState] = useState<TailGridThemeConfig>(() => {
    if (typeof initialTheme === 'string') {
      return themeEngine.getThemeByName(initialTheme) ?? lightTheme;
    }
    if (initialTheme) {
      return initialTheme;
    }
    return themeEngine.getTheme();
  });

  // Handle system preference
  useEffect(() => {
    if (!respectSystemPreference) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const prefersDark = e.matches;
      const newTheme = prefersDark ? darkTheme : lightTheme;
      themeEngine.setTheme(newTheme);
      setThemeState(newTheme);
    };

    // Set initial preference
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [respectSystemPreference, themeEngine]);

  // Subscribe to theme engine changes
  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((newTheme) => {
      setThemeState(newTheme);
    });
    return unsubscribe;
  }, [themeEngine]);

  // Apply theme to document
  useEffect(() => {
    if (autoApply) {
      themeEngine.applyTheme();
    }
    return () => {
      if (autoApply) {
        themeEngine.removeTheme();
      }
    };
  }, [autoApply, themeEngine]);

  // Set theme
  const setTheme = useCallback(
    (newTheme: string | TailGridThemeConfig) => {
      themeEngine.setTheme(newTheme);
    },
    [themeEngine]
  );

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    themeEngine.toggleMode();
  }, [themeEngine]);

  // Register custom theme
  const registerTheme = useCallback(
    (name: string, config: PartialThemeConfig) => {
      return themeEngine.registerTheme(name, config);
    },
    [themeEngine]
  );

  // Get style object
  const getStyleObject = useCallback(() => {
    return themeEngine.getStyleObject();
  }, [themeEngine]);

  // Get CSS variables
  const getCSSVariables = useCallback(() => {
    return themeEngine.generateCSSVariables();
  }, [themeEngine]);

  // Available themes
  const availableThemes = useMemo(() => {
    return themeEngine.getThemeNames();
  }, [themeEngine]);

  return {
    theme,
    themeName: theme.name,
    isDarkMode: theme.mode === 'dark',
    setTheme,
    toggleDarkMode,
    registerTheme,
    getStyleObject,
    getCSSVariables,
    availableThemes,
    engine: themeEngine,
  };
}

// ============================================
// ADDITIONAL EXPORTS
// ============================================

export { defineTheme, lightTheme, darkTheme };
export type { TailGridThemeConfig, PartialThemeConfig };
