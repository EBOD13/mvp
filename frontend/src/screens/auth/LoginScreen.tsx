import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type LoginNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

{/* TODO: Replace COLORS with theme import when available */}
const COLORS = {
  background: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#D1D5DB',
  primary: '#2563EB',
  buttonText: '#FFFFFF',
};

{/* TODO: Replace SPACING with theme import when available */}
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

{/* TODO: Replace FONT_SIZES with theme import when available */}
const FONT_SIZES = {
  sm: 14,
  md: 16,
  xl: 24,
  xxl: 32,
};

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigationProp>();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login form values:', {
      usernameOrEmail,
      password,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Log In</Text>
          <Text style={styles.subtitle}>Welcome back</Text>

          <View style={styles.form}>
            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="Username or email"
              placeholderTextColor={COLORS.textSecondary}
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* TODO: Replace TouchableOpacity with shared Button component when available */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Log In</Text>
            </TouchableOpacity>

            {/* TODO: Replace TouchableOpacity with shared Button component when available */}
            <TouchableOpacity
              onPress={() => console.log('Forgot password pressed')}
              activeOpacity={0.7}
            >
              <Text style={styles.textButton}>Forgot password?</Text>
            </TouchableOpacity>

            {/* TODO: Replace TouchableOpacity with shared Button component when available */}
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUpScreen')}
              activeOpacity={0.7}
            >
              <Text style={styles.textButton}>
                Don&apos;t have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  form: {
    width: '100%',
  },
//* TODO: remove once component is added *
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
//* TODO: remove once component is added *
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
//* TODO: remove once component is added *
  primaryButtonText: {
    color: COLORS.buttonText,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
//* TODO: remove once component is added (consult if this needs to stay for layout purposes) *
  textButton: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});