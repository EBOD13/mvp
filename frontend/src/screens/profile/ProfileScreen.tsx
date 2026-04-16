/**
 * ProfileScreen — additions for Phase 2:
 *   • My Passions button → PassionsListScreen
 *   • Phriends button    → PhriendsListScreen  (confirm already present; added here if missing)
 *   • Settings icon in top-right header → SettingsScreen
 *
 * NOTE: This file shows the profile-adjacent additions in context.
 * Merge or replace your existing ProfileScreen with the additions below.
 */
import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

type RootStackParamList = {
  ProfileScreen: undefined;
  PassionsListScreen: undefined;
  PhriendsListScreen: undefined;
  SettingsScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ─── ProfileScreen ────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const handlePassionsPress = useCallback(() => {
    navigation.navigate('PassionsListScreen');
  }, [navigation]);

  const handlePhriendsPress = useCallback(() => {
    navigation.navigate('PhriendsListScreen');
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('SettingsScreen');
  }, [navigation]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Your Name';

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {/* Settings icon — top-right */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          {/* Simple gear icon via Unicode; replace with your icon lib */}
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Avatar / Name (existing content — adjust as needed) ──── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {user?.username ? (
            <Text style={styles.username}>@{user.username}</Text>
          ) : null}
        </View>

        {/* ── Navigation rows ──────────────────────────────────────── */}
        <View style={styles.navSection}>
          {/* My Passions */}
          <TouchableOpacity
            style={styles.navRow}
            onPress={handlePassionsPress}
            activeOpacity={0.6}
          >
            <Text style={styles.navRowIcon}>🔥</Text>
            <Text style={styles.navRowLabel}>My Passions</Text>
            <Text style={styles.navRowChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Phriends */}
          <TouchableOpacity
            style={styles.navRow}
            onPress={handlePhriendsPress}
            activeOpacity={0.6}
          >
            <Text style={styles.navRowIcon}>👥</Text>
            <Text style={styles.navRowLabel}>Phriends</Text>
            <Text style={styles.navRowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Existing profile body content can follow below */}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
    color: '#374151',
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
  },
  navSection: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  navRowIcon: {
    fontSize: 20,
  },
  navRowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  navRowChevron: {
    fontSize: 20,
    color: '#D1D5DB',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
    marginLeft: 48,
  },
});
