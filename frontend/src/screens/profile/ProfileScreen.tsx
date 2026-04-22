import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Settings } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { passionApi, PassionListItem } from '../../api/passionApi';
import { getMe, UserProfile } from '../../api/userApi';
import BottomNavBar from '../../components/layout/BottomNavBar';
import FloatingActionButton from '../../components/layout/FloatingActionButton';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList>;

const SongPlayer = ({ title, artist }: { title: string; artist: string }) => {
  const { colors, spacing, textVariants, radii } = useTheme();
  return (
    <View style={{
      marginBottom: spacing['6'],
      paddingHorizontal: spacing['4'],
      paddingVertical: spacing['3'],
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['2'] }}>
        <View style={{
          width: 0, height: 0,
          borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 13,
          borderTopColor: 'transparent', borderBottomColor: 'transparent',
          borderLeftColor: colors.textPrimary,
          marginRight: spacing['3'],
        }} />
        <View style={{ flex: 1, height: 2, backgroundColor: colors.border, borderRadius: 1 }}>
          <View style={{
            position: 'absolute', left: '30%', top: -5,
            width: 12, height: 12, borderRadius: 6,
            backgroundColor: colors.textPrimary,
          }} />
        </View>
      </View>
      <Text style={[textVariants.caption as any, { color: colors.textSecondary }]}>
        {title} – {artist}
      </Text>
    </View>
  );
};

const FavoriteCard = ({ name, coverUrl }: { name: string; coverUrl: string | null }) => {
  const { colors, spacing, textVariants, radii } = useTheme();
  return (
    <View style={{ width: 90, marginRight: spacing['3'], alignItems: 'center' }}>
      <View style={{
        width: 80, height: 80,
        borderRadius: radii.sm,
        borderWidth: 1, borderColor: colors.border,
        backgroundColor: colors.surface,
        marginBottom: spacing['1'],
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>★</Text>
        )}
      </View>
      <Text style={[textVariants.caption as any, { color: colors.textPrimary, textAlign: 'center' }]} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
};

const PostsGrid = () => {
  const { colors, spacing, radii } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={{
          width: '31%', aspectRatio: 1,
          backgroundColor: colors.surface,
          borderRadius: radii.sm,
          borderWidth: 1, borderColor: colors.border,
        }} />
      ))}
    </View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { colors, spacing, textVariants } = useTheme();
  const { isLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passions, setPassions] = useState<PassionListItem[]>([]);
  const [fabVisible, setFabVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;
      getMe().then(setProfile).catch(() => {});
      passionApi.getMyPassions()
        .then(res => setPassions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setPassions([]));
    }, [isLoading])
  );

  const favorites = passions.filter(p => p.is_favorite);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, paddingHorizontal: spacing['4'], paddingTop: spacing['4'], paddingBottom: spacing['4'] }}>

          {/* ── Top bar ── */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: spacing['4'],
          }}>
            <Text style={[textVariants.h2 as any, { color: colors.primary, letterSpacing: -0.5 }]}>
              MVP
            </Text>
            <Pressable hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} onPress={() => navigation.navigate('SettingsScreen')}>
              <Settings size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* ── Header: avatar + stats ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['4'] }}>
            <Avatar
              name={profile?.display_name ?? ''}
              uri={profile?.avatar_url ?? undefined}
              size="xl"
              style={{ marginRight: spacing['4'] }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>
                {profile?.display_name ?? ''}
              </Text>
              <Text style={[textVariants.body as any, { color: colors.textSecondary, marginBottom: spacing['1'] }]}>
                @{profile?.username ?? ''}
              </Text>
              {!!profile?.bio && (
                <Text style={[textVariants.caption as any, { color: colors.textSecondary, marginBottom: spacing['2'] }]}>
                  {profile.bio}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: spacing['4'] }}>
                <Pressable
                  onPress={() => navigation.navigate('PassionsListScreen', { title: 'My Passions' })}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                    My Passions{' '}
                    <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{passions.length}</Text>
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('PhriendsListScreen')}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                >
                  <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                    Phriends{' '}
                    <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{profile?.phriends_count ?? 0}</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ── Edit Profile ── */}
          <Button
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfileScreen' as any)}
            variant="primary"
            size="md"
            style={{ marginBottom: spacing['6'] }}
          />

          {/* ── Profile Song ── */}
          <SongPlayer title="Song 2" artist="Blur" />

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
          <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['3'] }]}>
            Posts
          </Text>
          <PostsGrid />
        </View>
      </ScrollView>

      <BottomNavBar
        activeRoute="ProfileScreen"
        onAddPress={() => setFabVisible(v => !v)}
      />

      <FloatingActionButton
        visible={fabVisible}
        onClose={() => setFabVisible(false)}
        position="right"
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
