/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import { RootStackParamList } from './src/navigation/types';

const Stack = createStackNavigator<RootStackParamList>();


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen">
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUpScreen"
              component={SignUpScreen}
              options={{ title: 'Sign Up' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;