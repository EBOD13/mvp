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
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';

type SignUpNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SignUpScreen'
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

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpNavigationProp>();
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Invalid password', 'Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms required', 'You must agree to the Terms and Conditions.');
      return;
    }

    try {
      await signup(email.trim(), password, username.trim(), `${firstName.trim()} ${lastName.trim()}`.trim());
      Alert.alert('Account created', 'Your account was successfully created.');
      navigation.navigate('LoginScreen');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      Alert.alert('Sign up failed', message);
    }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Let&apos;s get you set up</Text>

          <View style={styles.form}>
            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={COLORS.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor={COLORS.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />

            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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

            {/* TODO: Replace TextInput with shared Input component when available */}
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={COLORS.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setAgreedToTerms(prev => !prev)}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the Terms and Conditions
              </Text>
            </Pressable>

            {/* TODO: Replace TouchableOpacity with shared Button component when available */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* TODO: Replace TouchableOpacity with shared Button component when available */}
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}
              activeOpacity={0.7}
            >
              <Text style={styles.textButton}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

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
    paddingVertical: SPACING.xl,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.buttonText,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
//* TODO: remove once component is added */
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
//* TODO: remove once component is added */
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
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
});