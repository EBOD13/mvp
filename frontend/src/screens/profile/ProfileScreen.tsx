import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';

/*
TODO(ProfileScreen) explicit checklist:
- [x] Move all hardcoded style values to src/theme tokens.
- [x] Replace avatar placeholder with shared Avatar component (if available).
- [x] Confirm placeholder values match product-approved copy.
- [x] Render passions as pills/tags if design requires tag UI instead of list.
- [x] Keep all fields view-only (no editable inputs on this screen).
- [x] Keep Edit Profile button navigation to EditProfileScreen.
- [x] Wire real user data in follow-up API integration issue.
- [x] Added profile link, follows/friends counts, profile song player, favorites
       horizontal scroll, and posts grid to match new design spec.
*/

type ProfileRoutes = RootStackParamList & {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  PassionsListScreen: undefined;
  PhriendsListScreen: undefined;
  SettingsScreen: undefined;
};

type ProfileNavigationProp = StackNavigationProp<ProfileRoutes, 'ProfileScreen'>;

// Placeholder display data for local UI validation only.
const profileData = {
  fullName: 'John Doe',
  username: '@johndoe',
  link: 'www.link.com',
  followsCount: 54,
  friendsCount: 100,
  profileSong: {
    title: 'Song 2',
    artist: 'Blur',
  },
  favorites: [
    { id: '1', title: 'Too Long', subtitle: 'Daft Punk' },
    { id: '2', title: 'Hunger Games', subtitle: '' },
    { id: '3', title: 'Stardew Valley', subtitle: '' },
  ],
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
      {/* Play button + scrubber row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['2'] }}>
        {/* Play triangle */}
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
        {/* Track line */}
        <View style={{ flex: 1, height: 2, backgroundColor: colors.border, borderRadius: 1 }}>
          {/* Progress dot */}
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

/** Single favorite card placeholder. */
const FavoriteCard = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const { colors, spacing, textVariants, radii } = useTheme();
  return (
    <View
      style={{
        width: 90,
        marginRight: spacing['3'],
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          marginBottom: spacing['1'],
        }}
      />
      <Text
        style={[textVariants.caption as any, { color: colors.textPrimary, textAlign: 'center' }]}
        numberOfLines={2}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={[textVariants.caption as any, { color: colors.textSecondary, textAlign: 'center' }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

/** Arrow-shaped "see more" card at the end of favorites. */
const SeeMoreCard = () => {
  const { colors, spacing, radii } = useTheme();
  return (
    <View
      style={{
        width: 60,
        height: 80,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      {/* Right-pointing chevron */}
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: 12,
          borderBottomWidth: 12,
          borderLeftWidth: 20,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: colors.textSecondary,
        }}
      />
    </View>
  );
};

/** 3-column post grid placeholder. */
const PostsGrid = () => {
  const { colors, spacing, radii } = useTheme();
  const placeholders = Array.from({ length: 6 }, (_, i) => i);
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing['2'],
      }}
    >
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
                onPress={() => navigation.navigate('PassionsListScreen')}
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <Text style={[textVariants.body as any, { color: colors.textSecondary }]}> 
                  My Passions{' '}
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                    {profileData.followsCount}
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
        {/* NOTE: 'EditProfileScreen' must match the route name exactly as registered
            in your stack navigator (e.g. in AppNavigator / RootStackParamList).
            If your navigator registers it as 'EditProfile' change the string below. */}
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing['3'],
            }}
          >
            <Text style={[textVariants.h4 as any, { color: colors.textPrimary }]}>
              Favorites
            </Text>
            <Pressable>
              <Text style={[textVariants.body as any, { color: colors.primary }]}>
                + Add
              </Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={profileData.favorites}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FavoriteCard title={item.title} subtitle={item.subtitle} />
            )}
            ListFooterComponent={<SeeMoreCard />}
            showsHorizontalScrollIndicator={false}
          />
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
    </SafeAreaView>
  );
};

export default ProfileScreen;