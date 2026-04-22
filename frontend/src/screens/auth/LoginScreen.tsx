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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme';
import { Image } from 'react-native';

type LoginNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useAuth();
  const { colors, spacing, radii, textVariants } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
      backgroundColor: colors.background,
    },
    logo: {
      width: 140,
      height: 140,
      alignSelf: 'center',
      marginBottom: spacing['4'],
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
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: radii.lg,
      paddingVertical: spacing['4'],
      alignItems: 'center',
      marginTop: spacing['2'],
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
      marginTop: spacing['4'],
    },
  });

  const handleLogin = async () => {
    try {
      await login(email.trim(), password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Login failed', message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Log In</Text>
            <Text style={styles.subtitle}>Welcome back</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
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

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => console.log('Forgot password pressed')}
                activeOpacity={0.7}
              >
                <Text style={styles.textButton}>Forgot password?</Text>
              </TouchableOpacity>

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
    </SafeAreaView>
  );
};

export default LoginScreen;