import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  secureToggle = false,
  containerStyle,
  secureTextEntry,
  ...rest
}: InputProps) {
  const { colors, spacing, radii, textVariants, fontSizes } = useTheme();
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[textVariants.label as any, { color: colors.textSecondary, marginBottom: spacing['1'] }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputRow,
        {
          borderColor,
          borderRadius: radii.md,
          paddingHorizontal: spacing['3'],
          backgroundColor: colors.surface,
        },
      ]}>
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
          style={[
            textVariants.body as any,
            styles.input,
            { color: colors.textPrimary, fontSize: fontSizes.md },
          ]}
          placeholderTextColor={colors.textDisabled}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
              {hidden ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[textVariants.caption as any, { color: colors.error, marginTop: spacing['1'] }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    height: 48,
  },
  input: { flex: 1, height: '100%' },
});
