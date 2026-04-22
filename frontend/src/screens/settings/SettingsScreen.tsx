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
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 3,
        marginTop: 8,
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
              borderRadius: 20,
              backgroundColor: selected ? '#7C3AED' : 'transparent',
              paddingVertical: 6,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 13, color: selected ? '#FFFFFF' : '#6B7280' }}>
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
      const me = meRes.data ?? {};
      setDisplayName(me.display_name ?? '');
      setUsername(me.username ?? '');
      setEmail(me.email ?? '');
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
      Alert.alert('Update failed', 'Could not update default post visibility.');
    }
  };

  const saveFabPosition = async (value: FabPositionValue) => {
    setFabPosition(value);
    try {
      await apiClient.patch('/users/me', { fab_position: value });
    } catch {
      Alert.alert('Update failed', 'Could not update floating button position yet.');
      Alert.alert('Update failed', 'Could not update floating button position.');
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
  const rowStyle = {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top']}>
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
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: '#111827' }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Account</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24, padding: 4 }}>
          <Pressable onPress={() => navigation.navigate('EditProfileScreen')} style={rowStyle}>
            <Text style={{ fontSize: 15, color: '#6B7280' }}>Display name</Text>
            <Text style={{ fontSize: 15, color: '#111827' }}>{displayName || 'Set display name'}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('EditProfileScreen')} style={rowStyle}>
            <Text style={{ fontSize: 15, color: '#6B7280' }}>Username</Text>
            <Text style={{ fontSize: 15, color: '#111827' }}>{username || 'Set username'}</Text>
          </Pressable>
          <View style={rowStyle}>
            <Text style={{ fontSize: 15, color: '#6B7280' }}>Email</Text>
            <Text style={{ fontSize: 15, color: '#111827' }}>{email}</Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Email changes coming soon</Text>
          </View>
          <Pressable style={{ paddingVertical: 14 }} onPress={() => Alert.alert('Coming soon', 'Change Password is coming soon.')}>
            <Text style={{ fontSize: 15, color: '#111827' }}>Change Password</Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Appearance</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24, padding: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, color: '#111827' }}>Dark mode</Text>
            <Switch
              value={themePreference === 'dark'}
              onValueChange={async enabled => setThemePreference(enabled ? 'dark' : 'light')}
              trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
              thumbColor="#FFFFFF"
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
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Preferences</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24, padding: 4 }}>
          <View style={rowStyle}>
            <Text style={{ fontSize: 15, color: '#111827' }}>Default post visibility</Text>
            <SegmentedControl<VisibilityValue>
              value={defaultVisibility}
              options={[{ label: 'Public', value: 'public' }, { label: 'Private', value: 'private' }]}
              onChange={saveVisibility}
            />
          </View>
          <View style={{ paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, color: '#111827' }}>Floating button position</Text>
            <SegmentedControl<FabPositionValue>
              value={fabPosition}
              options={[{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]}
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
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Notifications</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24, padding: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, color: '#111827' }}>Push notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: '#D1D5DB', true: '#7C3AED' }} thumbColor="#FFFFFF" />
          </View>
        </View>

        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Account Actions</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 40, padding: 4 }}>
          <Pressable onPress={handleLogout} style={rowStyle}>
            <Text style={{ fontSize: 15, color: '#EF4444' }}>Log Out</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Delete Account', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Coming soon', 'Delete Account is not wired yet.') },
              ])
            }
            style={{ paddingVertical: 14 }}
          >
            <Text style={{ fontSize: 15, color: '#EF4444' }}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
