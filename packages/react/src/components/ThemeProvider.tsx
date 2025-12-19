import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useTheme, type UseThemeReturn, type UseThemeOptions } from '../hooks/useTheme';
import type { TailGridThemeConfig, PartialThemeConfig } from '@tailgrid/core';

// ============================================
// CONTEXT
// ============================================

const ThemeContext = createContext<UseThemeReturn | null>(null);

// ============================================
// PROVIDER PROPS
// ============================================

export interface ThemeProviderProps extends UseThemeOptions {
  /** Children components */
  children: ReactNode;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

/**
 * ThemeProvider - Provides theme context to TailGrid components
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ThemeProvider>
 *   <TailGrid data={data} columns={columns} />
 * </ThemeProvider>
 *
 * // With initial dark theme
 * <ThemeProvider initialTheme="dark">
 *   <TailGrid data={data} columns={columns} />
 * </ThemeProvider>
 *
 * // With custom theme
 * <ThemeProvider initialTheme={{ name: 'brand', mode: 'light', colors: { primary: '#8b5cf6' } }}>
 *   <TailGrid data={data} columns={columns} />
 * </ThemeProvider>
 *
 * // Respect system preference
 * <ThemeProvider respectSystemPreference>
 *   <TailGrid data={data} columns={columns} />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  initialTheme,
  themeEngine,
  autoApply = true,
  respectSystemPreference = false,
}: ThemeProviderProps) {
  const themeValue = useTheme({
    initialTheme,
    themeEngine,
    autoApply,
    respectSystemPreference,
  });

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// CONSUMER HOOK
// ============================================

/**
 * Hook to consume theme context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, isDarkMode, toggleDarkMode } = useThemeContext();
 *   return (
 *     <button onClick={toggleDarkMode}>
 *       {isDarkMode ? 'Light Mode' : 'Dark Mode'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useThemeContext(): UseThemeReturn {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// ============================================
// HELPER COMPONENTS
// ============================================

export interface ThemeToggleProps {
  /** Custom class name */
  className?: string;
  /** Custom light mode label */
  lightLabel?: ReactNode;
  /** Custom dark mode label */
  darkLabel?: ReactNode;
}

/**
 * ThemeToggle - Button to toggle between light and dark mode
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <ThemeToggle />
 * </ThemeProvider>
 * ```
 */
export function ThemeToggle({
  className = 'tailgrid-theme-toggle',
  lightLabel = '☀️ Light',
  darkLabel = '🌙 Dark',
}: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useThemeContext();

  return (
    <button className={className} onClick={toggleDarkMode} type="button">
      {isDarkMode ? lightLabel : darkLabel}
    </button>
  );
}

export interface ThemeSelectorProps {
  /** Custom class name */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * ThemeSelector - Dropdown to select from available themes
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <ThemeSelector />
 * </ThemeProvider>
 * ```
 */
export function ThemeSelector({
  className = 'tailgrid-theme-selector',
  placeholder = 'Select theme...',
}: ThemeSelectorProps) {
  const { themeName, setTheme, availableThemes } = useThemeContext();

  return (
    <select
      className={className}
      value={themeName}
      onChange={(e) => setTheme(e.target.value)}
      aria-label="Select theme"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {availableThemes.map((name) => (
        <option key={name} value={name}>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </option>
      ))}
    </select>
  );
}

// ============================================
// EXPORTS
// ============================================

export { ThemeContext };
export type { TailGridThemeConfig, PartialThemeConfig };
