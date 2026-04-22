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
import { useTheme } from '../../theme';

type SignUpNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SignUpScreen'
>;

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpNavigationProp>();
  const { signup } = useAuth();
  const { colors, spacing, radii, textVariants } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const styles = StyleSheet.create({
    keyboardContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing['6'],
      paddingVertical: spacing['8'],
      backgroundColor: colors.background,
    },
    title: {
      ...textVariants.h1,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing['2'],
    },
    subtitle: {
      ...textVariants.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing['8'],
    },
    form: {
      width: '100%',
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: spacing['4'],
      paddingVertical: spacing['4'],
      color: colors.textPrimary,
      marginBottom: spacing['4'],
      ...textVariants.body,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing['6'],
    },
    checkbox: {
      width: 22,
      height: 22,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing['2'],
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: colors.textInverse,
      ...textVariants.bodyS,
      fontWeight: '700',
    },
    checkboxLabel: {
      flex: 1,
      ...textVariants.bodyS,
      color: colors.textPrimary,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: radii.lg,
      paddingVertical: spacing['4'],
      alignItems: 'center',
      marginBottom: spacing['4'],
    },
    primaryButtonText: {
      ...textVariants.button,
      color: colors.textInverse,
    },
    textButton: {
      ...textVariants.bodyS,
      color: colors.primary,
      textAlign: 'center',
      marginTop: spacing['2'],
      marginBottom: spacing['4'],
    },
  });

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
      console.log('Starting signup...');
      await signup(
        email.trim(),
        password,
        username.trim(),
        `${firstName.trim()} ${lastName.trim()}`.trim()
      );
      console.log('Signup finished');
      Alert.alert('Account created', 'Your account was successfully created.');
    } catch (error: unknown) {
      console.log('Signup error:', error);
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
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor={colors.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={colors.textSecondary}
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

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

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