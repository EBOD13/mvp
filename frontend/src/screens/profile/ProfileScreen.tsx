import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
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
import { phriendApi, PhriendItem } from '../../api/phriendApi';
import { postApi } from '../../api/postApi';
import { PostResponse } from '../../types/feed';
import PostCard from '../../components/cards/PostCard';
import CommentSheet from '../../components/common/CommentSheet';
import BottomNavBar from '../../components/layout/BottomNavBar';
import FloatingActionButton from '../../components/layout/FloatingActionButton';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList>;

const SongPlayer = () => {
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
          borderLeftColor: colors.textDisabled,
          marginRight: spacing['3'],
        }} />
        <View style={{ flex: 1, height: 2, backgroundColor: colors.border, borderRadius: 1 }}>
          <View style={{
            position: 'absolute', left: '30%', top: -5,
            width: 12, height: 12, borderRadius: 6,
            backgroundColor: colors.textDisabled,
          }} />
        </View>
      </View>
      <Text style={[textVariants.caption as any, { color: colors.textDisabled }]}>
        Profile song coming soon
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

const BestPhriendCard = ({ item, onPress }: { item: PhriendItem; onPress: () => void }) => {
  const { colors, spacing, textVariants } = useTheme();
  const name = [item.first_name, item.last_name].filter(Boolean).join(' ') || item.username;
  return (
    <Pressable onPress={onPress} style={{ width: 72, marginRight: spacing['3'], alignItems: 'center' }}>
      <Avatar uri={item.profile_photo_url} name={name} size="lg" style={{ marginBottom: spacing['1'] }} />
      <Text style={[textVariants.caption as any, { color: colors.textPrimary, textAlign: 'center' }]} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { colors, spacing, textVariants } = useTheme();
  const { isLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passions, setPassions] = useState<PassionListItem[]>([]);
  const [fabVisible, setFabVisible] = useState(false);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [favFilter, setFavFilter] = useState<string>('All');
  const [bestPhriends, setBestPhriends] = useState<PhriendItem[]>([]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await postApi.getMyPosts(0, 50);
      setPosts(res.data);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;
      getMe().then(setProfile).catch(() => {});
      passionApi.getMyPassions()
        .then(res => setPassions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setPassions([]));
      phriendApi.getBestPhriends()
        .then(res => setBestPhriends(res.data))
        .catch(() => setBestPhriends([]));
      loadPosts();
    }, [isLoading, loadPosts])
  );

  const handleDeletePost = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setPosts(prev => prev.filter(p => p.id !== postId));
          try { await postApi.deletePost(postId); } catch {
            loadPosts();
          }
        },
      },
    ]);
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p));
    try { await postApi.likePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p));
    }
  };

  const handleUnlike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p));
    try { await postApi.unlikePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p));
    }
  };

  const handleSave = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p));
    try { await postApi.savePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: false } : p));
    }
  };

  const handleUnsave = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: false } : p));
    try { await postApi.unsavePost(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p));
    }
  };

  const FAV_FILTERS = ['All', 'Movies', 'TV Shows', 'Books', 'Music'];
  const favorites = passions.filter(p => p.is_favorite);
  const filteredFavorites = favFilter === 'All'
    ? favorites
    : favorites.filter(p => (p.category ?? '').toLowerCase() === favFilter.toLowerCase());

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
          <SongPlayer />

          {/* ── Best Phriends ── */}
          <View style={{ marginBottom: spacing['6'] }}>
            <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['3'] }]}>
              Best Phriends
            </Text>
            {bestPhriends.length === 0 ? (
              <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                Star up to 5 phriends from your Phriends list to add them here.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {bestPhriends.map(item => (
                  <BestPhriendCard
                    key={item.user_id}
                    item={item}
                    onPress={() => navigation.navigate('OtherUserScreen', { userId: item.user_id })}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* ── Favorites ── */}
          <View style={{ marginBottom: spacing['6'] }}>
            <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['3'] }]}>
              Phavorite Passions
            </Text>
            {favorites.length === 0 ? (
              <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                Star a passion from your list to add it here.
              </Text>
            ) : (
              <>
                {/* Filter tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: spacing['3'] }}
                  contentContainerStyle={{ gap: spacing['2'] }}
                >
                  {FAV_FILTERS.map(f => (
                    <Pressable
                      key={f}
                      onPress={() => setFavFilter(f)}
                      style={{
                        paddingHorizontal: spacing['3'],
                        paddingVertical: spacing['1'],
                        borderRadius: 20,
                        backgroundColor: favFilter === f ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: favFilter === f ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={{
                        fontSize: 13,
                        fontWeight: favFilter === f ? '600' : '400',
                        color: favFilter === f ? colors.textInverse : colors.textSecondary,
                      }}>
                        {f}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Cards */}
                {filteredFavorites.length === 0 ? (
                  <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                    No favorites in this category.
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filteredFavorites.map(item => (
                      <FavoriteCard key={item.id} name={item.name} coverUrl={item.cover_url} />
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>

          {/* ── Posts ── */}
          <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['3'] }]}>
            Posts
          </Text>
          {postsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing['4'] }} />
          ) : posts.length === 0 ? (
            <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
              No posts yet.
            </Text>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onUnlike={() => handleUnlike(post.id)}
                onSave={() => handleSave(post.id)}
                onUnsave={() => handleUnsave(post.id)}
                onCommentPress={() => setCommentPostId(post.id)}
                onAuthorPress={() => {}}
                onEditPress={() => navigation.navigate('CreatePostScreen', { post })}
                onDeletePress={() => handleDeletePost(post.id)}
              />
            ))
          )}
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

      {commentPostId !== null && (
        <CommentSheet
          postId={commentPostId}
          visible
          onClose={() => setCommentPostId(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;
