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
  return (
    <View
      style={{
        flexDirection: 'row',
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

  const saveVisibility = async (value: VisibilityValue) => {
    setDefaultVisibility(value);
    try {
      await apiClient.patch('/users/me', { default_post_visibility: value });
    } catch {
      Alert.alert('Update failed', 'Could not update default post visibility.');
    }
  };

  const saveFabPosition = async (value: FabPositionValue) => {
    setFabPosition(value);
    try {
      await apiClient.patch('/users/me', { fab_position: value });
    } catch {
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
