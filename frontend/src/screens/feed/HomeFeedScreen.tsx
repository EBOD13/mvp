import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useFeed } from '../../hooks/useFeed';
import { RootStackParamList } from '../../navigation/types';
import { PostResponse } from '../../types/feed';

import PostCard from '../../components/cards/PostCard';
import BottomNavBar from '../../components/layout/BottomNavBar';
import FloatingActionButton from '../../components/layout/FloatingActionButton';
import CommentSheet from '../../components/common/CommentSheet';

type NavProp = StackNavigationProp<RootStackParamList>;

type FeedFilter = 'phriends' | 'passions';

// ---------------------------------------------------------------------------
// Feed filter toggle (custom SegmentedControl)
// ---------------------------------------------------------------------------
type FilterToggleProps = {
  value: FeedFilter;
  onChange: (v: FeedFilter) => void;
};

const FilterToggle: React.FC<FilterToggleProps> = ({ value, onChange }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      marginHorizontal: spacing['4'],
      marginVertical: spacing['3'],
      backgroundColor: colors.surface,
      borderRadius: radii.full,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      {(['phriends', 'passions'] as FeedFilter[]).map(opt => (
        <TouchableOpacity
          key={opt}
          style={{
            flex: 1,
            paddingVertical: spacing['2'],
            borderRadius: radii.full,
            backgroundColor: value === opt ? colors.primary : 'transparent',
            alignItems: 'center',
          }}
          onPress={() => onChange(opt)}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.semibold,
            color: value === opt ? colors.textInverse : colors.textSecondary,
          }}>
            {opt === 'phriends' ? 'Phriends' : 'Passions'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ---------------------------------------------------------------------------
// HomeFeedScreen
// ---------------------------------------------------------------------------
const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { userId } = useAuth();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  const [filter, setFilter] = useState<FeedFilter>('phriends');
  const [fabVisible, setFabVisible] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    deletePost,
  } = useFeed(filter);

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePost(postId) },
      ],
    );
  };

  const renderPost = ({ item }: { item: PostResponse }) => (
    <PostCard
      post={item}
      onLike={() => likePost(item.id)}
      onUnlike={() => unlikePost(item.id)}
      onSave={() => savePost(item.id)}
      onUnsave={() => unsavePost(item.id)}
      onCommentPress={() => setCommentPostId(item.id)}
      onAuthorPress={() => {
        if (item.author_id === userId) {
          navigation.navigate('ProfileScreen');
        } else {
          navigation.navigate('OtherUserScreen', { userId: item.author_id });
        }
      }}
      onEditPress={
        item.author_id === userId
          ? () => navigation.navigate('CreatePostScreen', { post: item })
          : undefined
      }
      onDeletePress={
        item.author_id === userId
          ? () => handleDelete(item.id)
          : undefined
      }
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing['4'],
        paddingTop: spacing['5'],
        paddingBottom: spacing['3'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Text style={{
          fontSize: fontSizes['2xl'],
          fontWeight: fontWeights.extrabold,
          color: colors.primary,
          letterSpacing: -0.5,
        }}>
          MVP
        </Text>
        <TouchableOpacity hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Text style={{ fontSize: fontSizes.xl, color: colors.textSecondary }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* ── Feed filter toggle ────────────────────────────────────────────── */}
      <FilterToggle value={filter} onChange={setFilter} />

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <View style={{
          marginHorizontal: spacing['4'],
          marginBottom: spacing['2'],
          padding: spacing['3'],
          backgroundColor: colors.errorSubtle,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{ fontSize: fontSizes.sm, color: colors.error, flex: 1 }}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.error }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Posts ────────────────────────────────────────────────────────── */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: spacing['2'] }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        onRefresh={refresh}
        refreshing={loading && posts.length === 0}
        ListFooterComponent={
          loading && posts.length > 0 ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: spacing['4'] }}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: spacing['8'], alignItems: 'center' }}>
              <Text style={{
                fontSize: fontSizes.md,
                color: colors.textDisabled,
                textAlign: 'center',
                lineHeight: fontSizes.md * 1.6,
              }}>
                {filter === 'phriends'
                  ? 'No posts from phriends yet.\nStart adding phriends to see their posts!'
                  : 'No posts from your passions yet.\nJoin passions to see what people are sharing!'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* ── Bottom nav ───────────────────────────────────────────────────── */}
      <BottomNavBar
        activeRoute="HomeFeedScreen"
        onAddPress={() => setFabVisible(v => !v)}
      />

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <FloatingActionButton
        visible={fabVisible}
        onClose={() => setFabVisible(false)}
        position="right"
      />

      {/* ── Comment sheet ────────────────────────────────────────────────── */}
      {commentPostId !== null && (
        <CommentSheet
          postId={commentPostId}
          visible
          onClose={() => setCommentPostId(null)}
        />
      )}
    </View>
  );
};

export default HomeFeedScreen;
