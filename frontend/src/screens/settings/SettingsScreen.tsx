import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

type PostVisibility = 'public' | 'private';
type FabPosition = 'left' | 'right';

type RootStackParamList = {
  SettingsScreen: undefined;
  EditProfileScreen: undefined;
  LoginScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

interface TappableRowProps {
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}

function TappableRow({ label, value, onPress, destructive }: TappableRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <Text style={[styles.rowLabel, destructive && styles.destructiveLabel]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Text style={styles.rowChevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

interface DisplayRowProps {
  label: string;
  value: string;
  note?: string;
}

function DisplayRow({ label, value, note }: DisplayRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {note ? <Text style={styles.rowNote}>{note}</Text> : null}
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

function SegmentedControl({
  options,
  selectedValue,
  onValueChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.segmentedControl}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segmentedOption,
            selectedValue === opt.value && styles.segmentedOptionSelected,
          ]}
          onPress={() => onValueChange(opt.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentedOptionText,
              selectedValue === opt.value && styles.segmentedOptionTextSelected,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface SegmentedRowProps {
  label: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

function SegmentedRow({
  label,
  options,
  selectedValue,
  onValueChange,
}: SegmentedRowProps) {
  return (
    <View style={styles.segmentedRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <SegmentedControl
        options={options}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
      />
    </View>
  );
}

// ─── SettingsScreen ───────────────────────────────────────────────────────────

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [postVisibility, setPostVisibility] = useState<PostVisibility>('public');
  const [fabPosition, setFabPosition] = useState<FabPosition>('right');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // ── Load persisted preferences on mount ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [notifRaw, visibilityRaw, fabRaw] = await Promise.all([
          AsyncStorage.getItem('notifications_enabled'),
          // Visibility & fab come from user object (API) but fall back to
          // AsyncStorage if not yet loaded.
          Promise.resolve(user?.default_post_visibility ?? null),
          Promise.resolve(user?.fab_position ?? null),
        ]);

        if (notifRaw !== null) {
          setNotificationsEnabled(notifRaw === 'true');
        }
        if (visibilityRaw === 'public' || visibilityRaw === 'private') {
          setPostVisibility(visibilityRaw);
        }
        if (fabRaw === 'left' || fabRaw === 'right') {
          setFabPosition(fabRaw);
        }
      } catch {
        // Non-fatal
      }
    })();
  }, [user]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleNotificationsToggle = useCallback(async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notifications_enabled', String(value));
    } catch {
      // Non-fatal
    }
  }, []);

  const handlePostVisibilityChange = useCallback(
    async (value: string) => {
      const newValue = value as PostVisibility;
      setPostVisibility(newValue);
      try {
        await apiClient.patch('/users/me', { default_post_visibility: newValue });
      } catch {
        // Revert on failure
        setPostVisibility(postVisibility);
        Alert.alert('Error', 'Failed to save preference. Please try again.');
      }
    },
    [postVisibility],
  );

  const handleFabPositionChange = useCallback(
    async (value: string) => {
      const newValue = value as FabPosition;
      setFabPosition(newValue);
      try {
        await apiClient.patch('/users/me', { fab_position: newValue });
      } catch {
        setFabPosition(fabPosition);
        Alert.alert('Error', 'Failed to save preference. Please try again.');
      }
    },
    [fabPosition],
  );

  const handleChangePassword = useCallback(() => {
    Alert.alert('Coming Soon', 'Password changes are coming soon.');
  }, []);

  const handleLogOut = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            // AuthContext + AppNavigator handle the redirect to LoginScreen
          } catch {
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Stub — no API call yet
            Alert.alert(
              'Coming Soon',
              'Account deletion will be available in a future update.',
            );
          },
        },
      ],
    );
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—';
  const username = user?.username ? `@${user.username}` : '—';
  const email = user?.email ?? '—';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Account ─────────────────────────────────────────────────── */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <TappableRow
            label="Display Name"
            value={displayName}
            onPress={() => navigation.navigate('EditProfileScreen')}
          />
          <View style={styles.separator} />
          <TappableRow
            label="Username"
            value={username}
            onPress={() => navigation.navigate('EditProfileScreen')}
          />
          <View style={styles.separator} />
          <DisplayRow
            label="Email"
            value={email}
            note="Email changes coming soon"
          />
          <View style={styles.separator} />
          <TappableRow
            label="Change Password"
            onPress={handleChangePassword}
          />
        </View>

        {/* ── Appearance ──────────────────────────────────────────────── */}
        <SectionHeader title="Appearance" />
        <View style={styles.section}>
          <ToggleRow
            label="Dark Mode"
            value={theme === 'dark'}
            onValueChange={toggleTheme}
          />
        </View>

        {/* ── Preferences ─────────────────────────────────────────────── */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SegmentedRow
            label="Default Post Visibility"
            options={[
              { label: 'Public', value: 'public' },
              { label: 'Private', value: 'private' },
            ]}
            selectedValue={postVisibility}
            onValueChange={handlePostVisibilityChange}
          />
          <View style={styles.separator} />
          <SegmentedRow
            label="Button Position"
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
            ]}
            selectedValue={fabPosition}
            onValueChange={handleFabPositionChange}
          />
        </View>

        {/* ── Notifications ───────────────────────────────────────────── */}
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <ToggleRow
            label="Push Notifications"
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
          />
        </View>

        {/* ── Account Actions ─────────────────────────────────────────── */}
        <SectionHeader title="Account Actions" />
        <View style={styles.section}>
          <TappableRow
            label="Log Out"
            onPress={handleLogOut}
            destructive
          />
          <View style={styles.separator} />
          <TappableRow
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 22,
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    marginBottom: 28,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginLeft: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLabel: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontSize: 15,
    color: '#6B7280',
    maxWidth: 180,
    textAlign: 'right',
  },
  rowChevron: {
    fontSize: 20,
    color: '#D1D5DB',
    marginLeft: 2,
  },
  rowNote: {
    position: 'absolute',
    bottom: 4,
    left: 20,
    fontSize: 11,
    color: '#9CA3AF',
  },
  destructiveLabel: {
    color: '#EF4444',
  },
  segmentedRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  segmentedOption: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
  },
  segmentedOptionSelected: {
    backgroundColor: '#7C3AED',
  },
  segmentedOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  segmentedOptionTextSelected: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 40,
  },
});
