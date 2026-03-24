import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors, spacing, radii, textVariants } = useTheme();

  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const paddings: Record<Size, number> = { sm: spacing['3'], md: spacing['4'], lg: spacing['6'] };

  const containerStyles: ViewStyle[] = [
    styles.base,
    { height: heights[size], paddingHorizontal: paddings[size], borderRadius: radii.md },
    variant === 'primary' && { backgroundColor: disabled ? colors.borderStrong : colors.primary },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: disabled ? colors.border : colors.primary },
    variant === 'ghost'   && { backgroundColor: 'transparent' },
    (disabled || loading) && { opacity: 0.6 },
    style ?? {},
  ];

  const labelStyles: TextStyle[] = [
    textVariants.button as TextStyle,
    variant === 'primary' && { color: colors.textInverse },
    variant === 'outline' && { color: disabled ? colors.textDisabled : colors.primary },
    variant === 'ghost'   && { color: disabled ? colors.textDisabled : colors.primary },
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.textInverse : colors.primary} />
        : <Text style={labelStyles}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
