/**
 * TailGridThemeEngine - Centralized theme configuration and management
 *
 * Provides a TypeScript-first approach to theming with:
 * - Preset themes (light, dark)
 * - Custom theme creation
 * - CSS variable generation
 * - Runtime theme switching
 */

// ============================================
// THEME TYPES
// ============================================

/**
 * Color palette for TailGrid themes
 */
export interface ThemeColors {
  /** Background color */
  bg: string;
  /** Hover background color */
  bgHover: string;
  /** Selected row background */
  bgSelected: string;
  /** Border color */
  border: string;
  /** Primary text color */
  text: string;
  /** Secondary text color */
  textSecondary: string;
  /** Muted/disabled text color */
  textMuted: string;
  /** Primary accent color */
  primary: string;
  /** Primary hover color */
  primaryHover: string;
  /** Success color */
  success: string;
  /** Error/danger color */
  error: string;
  /** Warning color */
  warning: string;
}

/**
 * Spacing scale for TailGrid themes
 */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Border radius scale
 */
export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
}

/**
 * Shadow definitions
 */
export interface ThemeShadows {
  sm: string;
  md: string;
  lg?: string;
}

/**
 * Typography settings
 */
export interface ThemeTypography {
  fontFamily: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
}

/**
 * Transition durations
 */
export interface ThemeTransitions {
  fast: string;
  normal: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  /** Theme name identifier */
  name: string;
  /** Theme mode (light or dark) */
  mode: 'light' | 'dark';
  /** Color palette */
  colors: ThemeColors;
  /** Spacing scale */
  spacing: ThemeSpacing;
  /** Border radius scale */
  radius: ThemeRadius;
  /** Shadow definitions */
  shadows: ThemeShadows;
  /** Typography settings */
  typography: ThemeTypography;
  /** Transition durations */
  transitions: ThemeTransitions;
}

/**
 * Partial theme config for creating custom themes
 */
export type PartialThemeConfig = {
  name?: string;
  mode?: 'light' | 'dark';
  colors?: Partial<ThemeColors>;
  spacing?: Partial<ThemeSpacing>;
  radius?: Partial<ThemeRadius>;
  shadows?: Partial<ThemeShadows>;
  typography?: Partial<ThemeTypography>;
  transitions?: Partial<ThemeTransitions>;
};

// ============================================
// PRESET THEMES
// ============================================

/**
 * Default light theme
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  mode: 'light',
  colors: {
    bg: '#ffffff',
    bgHover: '#f9fafb',
    bgSelected: '#eff6ff',
    border: '#e5e7eb',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSizeXs: '11px',
    fontSizeSm: '13px',
    fontSizeMd: '14px',
    fontSizeLg: '16px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
  },
};

/**
 * Dark theme
 */
export const darkTheme: ThemeConfig = {
  name: 'dark',
  mode: 'dark',
  colors: {
    bg: '#1f2937',
    bgHover: '#374151',
    bgSelected: '#1e3a5f',
    border: '#374151',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  spacing: lightTheme.spacing,
  radius: lightTheme.radius,
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
  },
  typography: lightTheme.typography,
  transitions: lightTheme.transitions,
};

// ============================================
// THEME ENGINE
// ============================================

/**
 * TailGridThemeEngine - Manages themes and CSS variable injection
 */
export class ThemeEngine {
  private currentTheme: ThemeConfig;
  private customThemes: Map<string, ThemeConfig> = new Map();
  private styleElement: HTMLStyleElement | null = null;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();

  constructor(initialTheme: ThemeConfig = lightTheme) {
    this.currentTheme = initialTheme;
    this.customThemes.set('light', lightTheme);
    this.customThemes.set('dark', darkTheme);
  }

  /**
   * Get the current theme
   */
  getTheme(): ThemeConfig {
    return this.currentTheme;
  }

  /**
   * Get theme by name
   */
  getThemeByName(name: string): ThemeConfig | undefined {
    return this.customThemes.get(name);
  }

  /**
   * Get all registered theme names
   */
  getThemeNames(): string[] {
    return Array.from(this.customThemes.keys());
  }

  /**
   * Set the active theme
   */
  setTheme(theme: ThemeConfig | string): void {
    if (typeof theme === 'string') {
      const namedTheme = this.customThemes.get(theme);
      if (!namedTheme) {
        console.warn(`Theme "${theme}" not found. Available themes: ${this.getThemeNames().join(', ')}`);
        return;
      }
      this.currentTheme = namedTheme;
    } else {
      this.currentTheme = theme;
    }
    this.applyTheme();
    this.notifyListeners();
  }

  /**
   * Register a custom theme
   */
  registerTheme(name: string, config: PartialThemeConfig): ThemeConfig {
    const baseTheme = config.mode === 'dark' ? darkTheme : lightTheme;
    const theme = this.mergeTheme(baseTheme, config);
    theme.name = name;
    this.customThemes.set(name, theme);
    return theme;
  }

  /**
   * Create a custom theme by extending an existing one
   */
  extendTheme(baseName: string, overrides: PartialThemeConfig): ThemeConfig {
    const baseTheme = this.customThemes.get(baseName) ?? lightTheme;
    return this.mergeTheme(baseTheme, overrides);
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Generate CSS variables from the current theme
   */
  generateCSSVariables(theme: ThemeConfig = this.currentTheme): string {
    return `
:root {
  /* Colors */
  --tailgrid-bg: ${theme.colors.bg};
  --tailgrid-bg-hover: ${theme.colors.bgHover};
  --tailgrid-bg-selected: ${theme.colors.bgSelected};
  --tailgrid-border: ${theme.colors.border};
  --tailgrid-text: ${theme.colors.text};
  --tailgrid-text-secondary: ${theme.colors.textSecondary};
  --tailgrid-text-muted: ${theme.colors.textMuted};
  --tailgrid-primary: ${theme.colors.primary};
  --tailgrid-primary-hover: ${theme.colors.primaryHover};
  --tailgrid-success: ${theme.colors.success};
  --tailgrid-error: ${theme.colors.error};
  --tailgrid-warning: ${theme.colors.warning};

  /* Spacing */
  --tailgrid-spacing-xs: ${theme.spacing.xs};
  --tailgrid-spacing-sm: ${theme.spacing.sm};
  --tailgrid-spacing-md: ${theme.spacing.md};
  --tailgrid-spacing-lg: ${theme.spacing.lg};
  --tailgrid-spacing-xl: ${theme.spacing.xl};

  /* Border Radius */
  --tailgrid-radius-sm: ${theme.radius.sm};
  --tailgrid-radius-md: ${theme.radius.md};
  --tailgrid-radius-lg: ${theme.radius.lg};

  /* Shadows */
  --tailgrid-shadow-sm: ${theme.shadows.sm};
  --tailgrid-shadow-md: ${theme.shadows.md};
  ${theme.shadows.lg ? `--tailgrid-shadow-lg: ${theme.shadows.lg};` : ''}

  /* Typography */
  --tailgrid-font-family: ${theme.typography.fontFamily};
  --tailgrid-font-size-xs: ${theme.typography.fontSizeXs};
  --tailgrid-font-size-sm: ${theme.typography.fontSizeSm};
  --tailgrid-font-size-md: ${theme.typography.fontSizeMd};
  --tailgrid-font-size-lg: ${theme.typography.fontSizeLg};

  /* Transitions */
  --tailgrid-transition-fast: ${theme.transitions.fast};
  --tailgrid-transition-normal: ${theme.transitions.normal};
}
`.trim();
  }

  /**
   * Generate CSS variables scoped to a specific selector
   */
  generateScopedCSSVariables(theme: ThemeConfig, selector: string): string {
    const vars = this.generateCSSVariables(theme);
    return vars.replace(':root', selector);
  }

  /**
   * Apply the current theme by injecting CSS variables into the document
   * (only works in browser environment)
   */
  applyTheme(): void {
    if (typeof document === 'undefined') return;

    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'tailgrid-theme-variables';
      document.head.appendChild(this.styleElement);
    }

    this.styleElement.textContent = this.generateCSSVariables();
  }

  /**
   * Remove injected theme styles
   */
  removeTheme(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleMode(): void {
    const newTheme = this.currentTheme.mode === 'light' ? darkTheme : lightTheme;
    this.setTheme(newTheme);
  }

  /**
   * Check if current theme is dark mode
   */
  isDarkMode(): boolean {
    return this.currentTheme.mode === 'dark';
  }

  /**
   * Create a theme config object for inline styles (React style prop)
   */
  getStyleObject(): Record<string, string> {
    const theme = this.currentTheme;
    return {
      '--tailgrid-bg': theme.colors.bg,
      '--tailgrid-bg-hover': theme.colors.bgHover,
      '--tailgrid-bg-selected': theme.colors.bgSelected,
      '--tailgrid-border': theme.colors.border,
      '--tailgrid-text': theme.colors.text,
      '--tailgrid-text-secondary': theme.colors.textSecondary,
      '--tailgrid-text-muted': theme.colors.textMuted,
      '--tailgrid-primary': theme.colors.primary,
      '--tailgrid-primary-hover': theme.colors.primaryHover,
      '--tailgrid-success': theme.colors.success,
      '--tailgrid-error': theme.colors.error,
      '--tailgrid-warning': theme.colors.warning,
      '--tailgrid-spacing-xs': theme.spacing.xs,
      '--tailgrid-spacing-sm': theme.spacing.sm,
      '--tailgrid-spacing-md': theme.spacing.md,
      '--tailgrid-spacing-lg': theme.spacing.lg,
      '--tailgrid-spacing-xl': theme.spacing.xl,
      '--tailgrid-radius-sm': theme.radius.sm,
      '--tailgrid-radius-md': theme.radius.md,
      '--tailgrid-radius-lg': theme.radius.lg,
      '--tailgrid-shadow-sm': theme.shadows.sm,
      '--tailgrid-shadow-md': theme.shadows.md,
      '--tailgrid-font-family': theme.typography.fontFamily,
      '--tailgrid-font-size-xs': theme.typography.fontSizeXs,
      '--tailgrid-font-size-sm': theme.typography.fontSizeSm,
      '--tailgrid-font-size-md': theme.typography.fontSizeMd,
      '--tailgrid-font-size-lg': theme.typography.fontSizeLg,
      '--tailgrid-transition-fast': theme.transitions.fast,
      '--tailgrid-transition-normal': theme.transitions.normal,
    };
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private mergeTheme(base: ThemeConfig, overrides: PartialThemeConfig): ThemeConfig {
    return {
      name: overrides.name ?? base.name,
      mode: overrides.mode ?? base.mode,
      colors: { ...base.colors, ...overrides.colors },
      spacing: { ...base.spacing, ...overrides.spacing },
      radius: { ...base.radius, ...overrides.radius },
      shadows: { ...base.shadows, ...overrides.shadows },
      typography: { ...base.typography, ...overrides.typography },
      transitions: { ...base.transitions, ...overrides.transitions },
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentTheme));
  }
}

// ============================================
// SINGLETON & HELPERS
// ============================================

/**
 * Default theme engine instance
 */
export const themeEngine = new ThemeEngine();

/**
 * Create a new theme engine with custom initial theme
 */
export function createThemeEngine(initialTheme?: ThemeConfig | string): ThemeEngine {
  if (typeof initialTheme === 'string') {
    const preset = initialTheme === 'dark' ? darkTheme : lightTheme;
    return new ThemeEngine(preset);
  }
  return new ThemeEngine(initialTheme);
}

/**
 * Create a custom theme config
 */
export function defineTheme(config: PartialThemeConfig): ThemeConfig {
  const baseTheme = config.mode === 'dark' ? darkTheme : lightTheme;
  return {
    name: config.name ?? 'custom',
    mode: config.mode ?? baseTheme.mode,
    colors: { ...baseTheme.colors, ...config.colors },
    spacing: { ...baseTheme.spacing, ...config.spacing },
    radius: { ...baseTheme.radius, ...config.radius },
    shadows: { ...baseTheme.shadows, ...config.shadows },
    typography: { ...baseTheme.typography, ...config.typography },
    transitions: { ...baseTheme.transitions, ...config.transitions },
  };
}

// Export preset themes
export const presetThemes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
