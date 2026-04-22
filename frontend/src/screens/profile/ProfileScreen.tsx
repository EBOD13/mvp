import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
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
import { passionApi, PassionListItem } from '../../api/passionApi';

/*
TODO(ProfileScreen) explicit checklist:
- [x] Move all hardcoded style values to src/theme tokens.
- [x] Replace avatar placeholder with shared Avatar component (if available).
- [x] Confirm placeholder values match product-approved copy.
- [x] Keep all fields view-only (no editable inputs on this screen).
- [x] Keep Edit Profile button navigation to EditProfileScreen.
- [x] Wire real user data in follow-up API integration issue.
- [x] Added profile link, follows/friends counts, profile song player, favorites
       horizontal scroll, and posts grid to match new design spec.
- [x] Load real passions and favorites from API.
*/

type ProfileRoutes = RootStackParamList & {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
type RootStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  PassionsListScreen: undefined;
  PhriendsListScreen: undefined;
  SettingsScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Placeholder display data for fields not yet wired to an API.
const profileData = {
  fullName: 'John Doe',
  username: '@johndoe',
  link: 'www.link.com',
  friendsCount: 100,
  profileSong: {
    title: 'Song 2',
    artist: 'Blur',
  },
};

/** Minimal inline audio-progress bar (UI-only, no real playback in this issue). */
const SongPlayer = ({ title, artist }: { title: string; artist: string }) => {
  const { colors, spacing, textVariants, radii } = useTheme();
  return (
    <View
      style={{
        marginBottom: spacing['6'],
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['2'] }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: 7,
            borderBottomWidth: 7,
            borderLeftWidth: 13,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: colors.textPrimary,
            marginRight: spacing['3'],
          }}
        />
        <View style={{ flex: 1, height: 2, backgroundColor: colors.border, borderRadius: 1 }}>
          <View
            style={{
              position: 'absolute',
              left: '30%',
              top: -5,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.textPrimary,
            }}
          />
        </View>
      </View>
      <Text style={[textVariants.caption as any, { color: colors.textSecondary }]}>
        {title} – {artist}
      </Text>
    </View>
  );
};

/** Single favorite card for a passion. */
const FavoriteCard = ({ name, coverUrl }: { name: string; coverUrl: string | null }) => {
  const { colors, spacing, textVariants, radii } = useTheme();
  return (
    <View style={{ width: 90, marginRight: spacing['3'], alignItems: 'center' }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          marginBottom: spacing['1'],
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: 28 }}>★</Text>
        )}
      </View>
      <Text
        style={[textVariants.caption as any, { color: colors.textPrimary, textAlign: 'center' }]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  );
};

/** 3-column post grid placeholder. */
const PostsGrid = () => {
  const { colors, spacing, radii } = useTheme();
  const placeholders = Array.from({ length: 6 }, (_, i) => i);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
      {placeholders.map(i => (
        <View
          key={i}
          style={{
            width: '31%',
            aspectRatio: 1,
            backgroundColor: colors.surface,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />
      ))}
    </View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { colors, spacing, textVariants } = useTheme();
  const { isLoading } = useAuth();

  const [passions, setPassions] = useState<PassionListItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) {
        return;
      }

      const loadPassions = async () => {
        try {
          const response = await passionApi.getMyPassions();
          setPassions(Array.isArray(response.data) ? response.data : []);
        } catch {
          setPassions([]);
        }
      };

      loadPassions();
    }, [isLoading])
  );

  const favorites = passions.filter(p => p.is_favorite);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: spacing['4'], paddingTop: spacing['4'], paddingBottom: spacing['4'] }}>

        {/* ── Top bar: MVP logo + settings ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing['4'],
        }}>
          <Text style={[textVariants.h2 as any, { color: colors.primary, letterSpacing: -0.5 }]}>
            MVP
          </Text>
          <Pressable
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <Text style={{ fontSize: 20, color: colors.textSecondary }}>⚙️</Text>
          </Pressable>
        </View>

        {/* ── Header: avatar + username + link + stats ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['4'] }}>
          <Avatar
            name={profileData.fullName}
            size="xl"
            style={{ marginRight: spacing['4'] }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>
              {profileData.username}
            </Text>
            <Text style={[textVariants.body as any, { color: colors.primary, marginBottom: spacing['2'] }]}>
              {profileData.link}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing['4'] }}>
              <Pressable
                onPress={() =>
                  navigation.navigate('PassionsListScreen', {
                    title: 'My Passions',
                  })
                }
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                  My Passions{' '}
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                    {passions.length}
                  </Text>
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('PhriendsListScreen')}
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                  Phriends{' '}
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                    {profileData.friendsCount}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Edit Profile button ── */}
        <Button
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfileScreen' as any)}
          variant="primary"
          size="md"
          style={{ marginBottom: spacing['6'] }}
        />

        {/* ── Profile Song ── */}
        <SongPlayer
          title={profileData.profileSong.title}
          artist={profileData.profileSong.artist}
        />

        {/* ── Favorites ── */}
        <View style={{ marginBottom: spacing['6'] }}>
          <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['3'] }]}>
            Favorites
          </Text>
          {favorites.length === 0 ? (
            <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
              Star a passion from your list to add it here.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favorites.map(item => (
                <FavoriteCard key={item.id} name={item.name} coverUrl={item.cover_url} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Posts ── */}
        <Text
          style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['3'] }]}
        >
          Posts
        </Text>
        <PostsGrid />
      </View>
    </ScrollView>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View style={styles.navSection}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

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

export default ProfileScreen;
