import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, message, actionLabel, onAction, style }: EmptyStateProps) {
  const { colors, spacing, textVariants } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing['8'] }, style]}>
      <Text style={[textVariants.h3 as any, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing['2'] }]}>
        {title}
      </Text>
      {message && (
        <Text style={[textVariants.body as any, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['6'] }]}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="outline" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
