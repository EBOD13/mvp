export const palette = {
  // Brand — passion fruit purple
  primary:        '#7C1F88',
  primaryDark:    '#571260',
  primaryLight:   '#A84DC0',
  primarySubtle:  '#F5EAF8',

  // Neutrals — slightly warm grey scale
  white:          '#FFFFFF',
  black:          '#0A0A0A',
  grey50:         '#FAF9FB',
  grey100:        '#F4F2F6',
  grey200:        '#E8E4ED',
  grey300:        '#CFC8D8',
  grey400:        '#9E94AA',
  grey500:        '#6E6478',
  grey600:        '#4E4558',
  grey700:        '#342D3C',
  grey800:        '#201A28',
  grey900:        '#120D18',

  // Semantic
  success:        '#22C55E',
  successSubtle:  '#DCFCE7',
  error:          '#EF4444',
  errorSubtle:    '#FEE2E2',
  warning:        '#F59E0B',
  warningSubtle:  '#FEF3C7',
  info:           '#3B82F6',
  infoSubtle:     '#DBEAFE',
} as const;
export const lightColors = {
  background:         palette.white,
  surface:            palette.grey50,
  surfaceElevated:    palette.white,
  border:             palette.grey200,
  borderStrong:       palette.grey300,

  textPrimary:        palette.grey900,
  textSecondary:      palette.grey600,
  textDisabled:       palette.grey400,
  textInverse:        palette.white,

  primary:            palette.primary,
  primaryDark:        palette.primaryDark,
  primaryLight:       palette.primaryLight,
  primarySubtle:      palette.primarySubtle,

  success:            palette.success,
  successSubtle:      palette.successSubtle,
  error:              palette.error,
  errorSubtle:        palette.errorSubtle,
  warning:            palette.warning,
  warningSubtle:      palette.warningSubtle,
} as const;

export type Colors = { readonly [K in keyof typeof lightColors]: string };

export const darkColors: Colors = {
  background:         palette.grey900,
  surface:            palette.grey800,
  surfaceElevated:    palette.grey700,
  border:             palette.grey700,
  borderStrong:       palette.grey600,

  textPrimary:        palette.white,
  textSecondary:      palette.grey400,
  textDisabled:       palette.grey600,
  textInverse:        palette.grey900,

  primary:            palette.primaryLight,
  primaryDark:        palette.primary,
  primaryLight:       '#C278D6',
  primarySubtle:      '#2A0D30',

  success:            palette.success,
  successSubtle:      '#14532D',
  error:              palette.error,
  errorSubtle:        '#7F1D1D',
  warning:            palette.warning,
  warningSubtle:      '#78350F',
} as const;