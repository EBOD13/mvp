import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';

import { AuthProvider } from './src/context/AuthContext';
import { useAuthContext } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { RootStackParamList } from './src/navigation/types';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';

// Auth screens
import LoginScreen   from './src/screens/auth/LoginScreen';
import SignUpScreen  from './src/screens/auth/SignUpScreen';

// Main app screens
import HomeFeedScreen      from './src/screens/feed/HomeFeedScreen';
import CreatePostScreen    from './src/screens/feed/CreatePostScreen';
import ProfileScreen       from './src/screens/profile/ProfileScreen';
import EditProfileScreen   from './src/screens/stub/EditProfileScreen';
import CreatePassionScreen from './src/screens/stub/CreatePassionScreen';
import OtherUserScreen     from './src/screens/stub/OtherUserScreen';
import PassionsListScreen  from './src/screens/passions/PassionsListScreen';
import SettingsScreen      from './src/screens/settings/SettingsScreen';
import DiscoverScreen      from './src/screens/stub/DiscoverScreen';
import PassionDetailScreen from './src/screens/stub/PassionDetailScreen';
import PhriendsListScreen  from './src/screens/stub/PhriendsListScreen';

enableScreens();

const Stack = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { accessToken, isLoading } = useAuthContext();
  const isDarkMode = useColorScheme() === 'dark';

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {accessToken ? (
            // ── Authenticated stack ──────────────────────────────────────
            <>
              <Stack.Screen name="HomeFeedScreen"      component={HomeFeedScreen} />
              <Stack.Screen name="DiscoverScreen"      component={DiscoverScreen} />
              <Stack.Screen name="ProfileScreen"       component={ProfileScreen} />
              <Stack.Screen name="PassionsListScreen"  component={PassionsListScreen} />
              <Stack.Screen name="SettingsScreen"      component={SettingsScreen} />
              <Stack.Screen name="PhriendsListScreen"  component={PhriendsListScreen} />
              <Stack.Screen name="PassionDetailScreen" component={PassionDetailScreen} />
              <Stack.Screen name="CreatePostScreen"    component={CreatePostScreen} />
              <Stack.Screen name="CreatePassionScreen" component={CreatePassionScreen} />
              <Stack.Screen name="OtherUserScreen"     component={OtherUserScreen} />
              <Stack.Screen name="EditProfileScreen"   component={EditProfileScreen} />
            </>
          ) : (
            // ── Unauthenticated stack ────────────────────────────────────
            <>
              <Stack.Screen name="LoginScreen"  component={LoginScreen} />
              <Stack.Screen name="SignUpScreen" component={SignUpScreen}
                options={{ headerShown: true, title: 'Sign Up' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
