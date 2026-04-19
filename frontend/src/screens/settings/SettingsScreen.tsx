import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import apiClient from '../../lib/apiClient';
import { useThemeContext } from '../../context/ThemeContext';

type Navigation = StackNavigationProp<RootStackParamList, 'SettingsScreen'>;

type VisibilityValue = 'public' | 'private';
type FabPositionValue = 'left' | 'right';

const NOTIFICATIONS_KEY = 'notifications_enabled';

interface MeResponse {
  username?: string;
  display_name?: string;
  email?: string;
  default_post_visibility?: VisibilityValue;
  fab_position?: FabPositionValue;
}

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (next: T) => void;
}) {
  const { colors, spacing, radii, textVariants } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 3,
        marginTop: spacing['2'],
      }}
    >
      {options.map(option => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              borderRadius: radii.full,
              backgroundColor: selected ? colors.primary : 'transparent',
              paddingVertical: spacing['2'],
              alignItems: 'center',
            }}
          >
            <Text
              style={[
                textVariants.caption as any,
                { color: selected ? colors.textInverse : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { colors, spacing, textVariants, radii } = useTheme();
  const { logout } = useAuth();
  const { themePreference, setThemePreference } = useThemeContext();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [defaultVisibility, setDefaultVisibility] = useState<VisibilityValue>('public');
  const [fabPosition, setFabPosition] = useState<FabPositionValue>('right');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const load = useCallback(async () => {
    try {
      const [meRes, notifRes] = await Promise.all([
        apiClient.get<MeResponse>('/users/me'),
        AsyncStorage.getItem(NOTIFICATIONS_KEY),
      ]);

      const me = meRes.data ?? {};
      setDisplayName(me.display_name ?? '');
      setUsername(me.username ?? '');
      setEmail(me.email ?? 'Email changes coming soon');
      setDefaultVisibility(me.default_post_visibility ?? 'public');
      setFabPosition(me.fab_position ?? 'right');
      setNotificationsEnabled(notifRes === 'true');
    } catch {
      setEmail('Email changes coming soon');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sectionTitleStyle = useMemo(
    () => [textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['2'] }],
    [textVariants.h4, colors.textPrimary, spacing],
  );

  const rowStyle = {
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const saveVisibility = async (value: VisibilityValue) => {
    setDefaultVisibility(value);
    try {
      await apiClient.patch('/users/me', { default_post_visibility: value });
    } catch {
      Alert.alert('Update failed', 'Could not update default post visibility yet.');
    }
  };

  const saveFabPosition = async (value: FabPositionValue) => {
    setFabPosition(value);
    try {
      await apiClient.patch('/users/me', { fab_position: value });
    } catch {
      Alert.alert('Update failed', 'Could not update floating button position yet.');
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? 'true' : 'false');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: spacing['3'] }}>
          <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing['4'] }}>
        <View style={{ marginBottom: spacing['6'] }}>
          <Text style={sectionTitleStyle}>Account</Text>

          <Pressable onPress={() => navigation.navigate('EditProfileScreen')} style={rowStyle}>
            <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>Display name</Text>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>{displayName || 'Set display name'}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('EditProfileScreen')} style={rowStyle}>
            <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>Username</Text>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>{username || 'Set username'}</Text>
          </Pressable>

          <View style={rowStyle}>
            <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>{email}</Text>
            <Text style={[textVariants.caption as any, { color: colors.textSecondary, marginTop: spacing['1'] }]}>Email changes coming soon</Text>
          </View>

          <Pressable
            style={[rowStyle, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert('Coming soon', 'Change Password is coming soon.')}
          >
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>Change Password</Text>
          </Pressable>
        </View>

        <View style={{ marginBottom: spacing['6'] }}>
          <Text style={sectionTitleStyle}>Appearance</Text>
          <View style={[rowStyle, { borderBottomWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>Dark mode</Text>
            <Switch
              value={themePreference === 'dark'}
              onValueChange={async enabled => {
                await setThemePreference(enabled ? 'dark' : 'light');
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: spacing['6'] }}>
          <Text style={sectionTitleStyle}>Preferences</Text>

          <View style={rowStyle}>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>Default post visibility</Text>
            <SegmentedControl<VisibilityValue>
              value={defaultVisibility}
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
              ]}
              onChange={saveVisibility}
            />
          </View>

          <View style={[rowStyle, { borderBottomWidth: 0 }]}>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>Floating button position</Text>
            <SegmentedControl<FabPositionValue>
              value={fabPosition}
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ]}
              onChange={saveFabPosition}
            />
          </View>
        </View>

        <View style={{ marginBottom: spacing['6'] }}>
          <Text style={sectionTitleStyle}>Notifications</Text>
          <View style={[rowStyle, { borderBottomWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>Push notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
          </View>
        </View>

        <View
          style={{
            marginBottom: spacing['6'],
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: colors.surface,
          }}
        >
          <Pressable onPress={handleLogout} style={{ padding: spacing['4'], borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>Log Out</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Coming soon', 'Delete Account API is not wired yet.') },
              ])
            }
            style={{ padding: spacing['4'] }}
          >
            <Text style={[textVariants.body as any, { color: colors.error }]}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
