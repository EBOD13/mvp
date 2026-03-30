import React, { useEffect, useRef, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, AppState, AppStateStatus } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';

// Imports
import { RootStackParamList } from './types';
import SignUpScreen from '../screens/auth/SignUpScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Create Stack 
const Stack = createStackNavigator<RootStackParamList>();

// ================ AUTH STACK ================
function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{
                    gestureEnabled: false
                }}
            />
            <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{
                presentation: 'card',
                gestureEnabled: true,}}
            />
        </Stack.Navigator>
    );
}

