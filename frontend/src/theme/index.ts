import { lightColors, darkColors, Colors } from './colors';
import { fontSizes, fontWeights, lineHeights, textVariants } from './typography';
import { spacing, radii, shadows } from './spacing';
import { useThemeContext } from '../context/ThemeContext';

export const theme = {
  colors: lightColors,
  fontSizes,
  fontWeights,
  lineHeights,
  textVariants,
  spacing,
  radii,
  shadows,
} as const;

export type Theme = Omit<typeof theme, 'colors'> & { colors: Colors };

export function useTheme(): Theme {
  const { themePreference } = useThemeContext();
  return {
    ...theme,
    colors: themePreference === 'dark' ? darkColors : lightColors,
  };
}

// Re-export everything for convenience
export * from './colors';
export * from './typography';
export * from './spacing';
