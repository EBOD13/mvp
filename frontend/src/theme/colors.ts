export const palette = {
  // Brand
  primary:        '#E63244',
  primaryDark:    '#B8253A',
  primaryLight:   '#FF6075',
  primarySubtle:  '#FDE8EB',

  // Neutrals
  white:          '#FFFFFF',
  black:          '#000000',
  grey50:         '#F9FAFB',
  grey100:        '#F3F4F6',
  grey200:        '#E5E7EB',
  grey300:        '#D1D5DB',
  grey400:        '#9CA3AF',
  grey500:        '#6B7280',
  grey600:        '#4B5563',
  grey700:        '#374151',
  grey800:        '#1F2937',
  grey900:        '#111827',

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

export const darkColors: typeof lightColors = {
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
  primaryLight:       '#FF8A9A',
  primarySubtle:      '#3D0A12',

  success:            palette.success,
  successSubtle:      '#14532D',
  error:              palette.error,
  errorSubtle:        '#7F1D1D',
  warning:            palette.warning,
  warningSubtle:      '#78350F',
} as const;

export type Colors = typeof lightColors;
