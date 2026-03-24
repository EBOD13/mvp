import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 64,
  xl: 88,
};

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const dimension = SIZES[size];
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const fontSize =
    dimension <= 24 ? fontSizes.xs :
    dimension <= 44 ? fontSizes.sm :
    dimension <= 64 ? fontSizes.lg :
    fontSizes['2xl'];

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <View style={[containerStyle, style]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize, fontWeight: fontWeights.semibold as any, color: colors.primary }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
