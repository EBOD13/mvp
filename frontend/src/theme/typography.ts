import { TextStyle } from 'react-native';

export const fontSizes = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeights = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
} as const;

export const lineHeights = {
  tight:   1.25,
  normal:  1.5,
  relaxed: 1.75,
} as const;

export const textVariants: Record<string, TextStyle> = {
  h1:      { fontSize: fontSizes['3xl'], fontWeight: fontWeights.bold,     lineHeight: fontSizes['3xl'] * lineHeights.tight },
  h2:      { fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold,     lineHeight: fontSizes['2xl'] * lineHeights.tight },
  h3:      { fontSize: fontSizes.xl,    fontWeight: fontWeights.semibold,  lineHeight: fontSizes.xl    * lineHeights.tight },
  h4:      { fontSize: fontSizes.lg,    fontWeight: fontWeights.semibold,  lineHeight: fontSizes.lg    * lineHeights.normal },
  body:    { fontSize: fontSizes.md,    fontWeight: fontWeights.regular,   lineHeight: fontSizes.md    * lineHeights.normal },
  bodyS:   { fontSize: fontSizes.sm,    fontWeight: fontWeights.regular,   lineHeight: fontSizes.sm    * lineHeights.normal },
  label:   { fontSize: fontSizes.sm,    fontWeight: fontWeights.medium,    lineHeight: fontSizes.sm    * lineHeights.normal },
  caption: { fontSize: fontSizes.xs,    fontWeight: fontWeights.regular,   lineHeight: fontSizes.xs    * lineHeights.normal },
  button:  { fontSize: fontSizes.md,    fontWeight: fontWeights.semibold,  lineHeight: fontSizes.md    * lineHeights.tight },
};
