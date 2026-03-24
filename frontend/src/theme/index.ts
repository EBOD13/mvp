import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from './colors';
import { fontSizes, fontWeights, lineHeights, textVariants } from './typography';
import { spacing, radii, shadows } from './spacing';

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

export type Theme = typeof theme;

export function useTheme(): Theme & { colors: Colors } {
  const scheme = useColorScheme();
  return {
    ...theme,
    colors: scheme === 'dark' ? darkColors : lightColors,
  };
}

// Re-export everything for convenience
export * from './colors';
export * from './typography';
export * from './spacing';
