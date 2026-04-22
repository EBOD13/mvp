// src/components/cards/PostCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, FlatList, Dimensions } from 'react-native';
import { MessageCircle, Bookmark, Ellipsis } from 'lucide-react-native';
import PassionFruitLike from '../icons/PassionFruitLike';
import PassionFruitRating from '../icons/PassionFruitRating';
import { useTheme } from '../../theme';
import { Avatar } from '../common/Avatar';
import { PostResponse } from '../../types/feed';

const SCREEN_W = Dimensions.get('window').width;

export type PostCardProps = {
  post: PostResponse;
  onLike: () => void;
  onUnlike: () => void;
  onSave: () => void;
  onUnsave: () => void;
  onCommentPress: () => void;
  onAuthorPress: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onUnlike,
  onSave,
  onUnsave,
  onCommentPress,
  onAuthorPress,
  onEditPress,
  onDeletePress,
}) => {
  const { colors, spacing, fontSizes, fontWeights, lineHeights, radii, shadows } = useTheme();

  const [mediaIndex, setMediaIndex] = useState(0);

  const showOptionsMenu = onEditPress !== undefined || onDeletePress !== undefined;

  const handleOptionsMenu = () => {
    const buttons: { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (onEditPress)   buttons.push({ text: 'Edit',   onPress: onEditPress });
    if (onDeletePress) buttons.push({ text: 'Delete', style: 'destructive', onPress: onDeletePress });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Post options', undefined, buttons);
  };

  const s = {
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      marginHorizontal: spacing['4'],
      marginVertical: spacing['2'],
      padding: spacing['4'],
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      marginBottom: spacing['2'],
    },
    authorInfo: {
      flex: 1,
      justifyContent: 'center' as const,
      marginLeft: spacing['3'],
    },
    nameRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flexWrap: 'wrap' as const,
      gap: spacing['1'],
      marginBottom: 2,
    },
    authorName: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: colors.textPrimary,
    },
    authorUsername: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
      color: colors.textDisabled,
    },
    timeAgo: {
      fontSize: fontSizes.xs,
      color: colors.textDisabled,
    },
    badge: {
      alignSelf: 'flex-start' as const,
      backgroundColor: colors.primarySubtle,
      borderRadius: radii.full,
      paddingHorizontal: spacing['3'],
      paddingVertical: spacing['1'],
      marginBottom: spacing['3'],
    },
    badgeText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      letterSpacing: 0.3,
    },
    content: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.regular,
      color: colors.textPrimary,
      lineHeight: fontSizes.md * lineHeights.relaxed,
      marginBottom: spacing['4'],
    },
    actions: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing['3'],
      gap: spacing['6'],
    },
    actionButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing['1'],
    },
    actionCount: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
  };

  const formatTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={s.card}>
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={onAuthorPress} activeOpacity={0.8}>
          <Avatar name={post.author_name} size="md" />
        </TouchableOpacity>

        <View style={s.authorInfo}>
          <TouchableOpacity onPress={onAuthorPress} activeOpacity={0.8}>
            <View style={s.nameRow}>
              <Text style={s.authorName}>{post.author_name}</Text>
              <Text style={s.authorUsername}>{post.author_username}</Text>
            </View>
          </TouchableOpacity>
          <Text style={s.timeAgo}>{formatTime(post.created_at)}</Text>
        </View>

        {showOptionsMenu && (
          <TouchableOpacity onPress={handleOptionsMenu} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ellipsis size={20} color={colors.textDisabled} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Passion badge ───────────────────────────────────────────────── */}
      {post.passion_name && (
        <TouchableOpacity style={s.badge} activeOpacity={0.7} onPress={() => {}}>
          <Text style={s.badgeText}># {post.passion_name}</Text>
        </TouchableOpacity>
      )}

      {/* ── Review rating ───────────────────────────────────────────────── */}
      {post.is_review && post.rating != null && post.rating > 0 && (
        <View style={{ marginBottom: spacing['3'] }}>
          <PassionFruitRating value={post.rating} size={18} />
        </View>
      )}

      {/* ── Post body ───────────────────────────────────────────────────── */}
      <Text style={s.content}>{post.content}</Text>

      {/* ── Media carousel ──────────────────────────────────────────────── */}
      {post.media_urls && post.media_urls.length > 0 && (() => {
        const GAP = 8;
        const CARD_W = SCREEN_W - spacing['4'] * 2 - spacing['4'] * 2;
        const STEP = CARD_W + GAP;
        const urls = post.media_urls;
        return (
          <View style={{ marginBottom: spacing['3'] }}>
            <FlatList
              data={urls}
              keyExtractor={(_, i) => String(i)}
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              snapToInterval={STEP}
              decelerationRate="fast"
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / STEP);
                setMediaIndex(idx);
              }}
              getItemLayout={(_, index) => ({ length: STEP, offset: STEP * index, index })}
              renderItem={({ item, index }) => (
                <Image
                  source={{ uri: item }}
                  style={{
                    width: CARD_W,
                    aspectRatio: 4 / 3,
                    borderRadius: radii.md,
                    backgroundColor: colors.border,
                    marginRight: index < urls.length - 1 ? GAP : 0,
                  }}
                  resizeMode="cover"
                />
              )}
            />
            {urls.length > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing['2'], gap: 4 }}>
                {urls.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: i === mediaIndex ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === mediaIndex ? colors.primary : colors.border,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })()}

      {/* ── Action row ──────────────────────────────────────────────────── */}
      <View style={s.actions}>
        {/* Like — passion fruit animation */}
        <View style={s.actionButton}>
          <PassionFruitLike
            liked={post.is_liked}
            onPress={() => (post.is_liked ? onUnlike() : onLike())}
            size={24}
          />
          <Text style={[s.actionCount, { color: post.is_liked ? colors.primary : colors.textSecondary }]}>
            {post.like_count}
          </Text>
        </View>

        {/* Comments */}
        <TouchableOpacity onPress={onCommentPress} style={s.actionButton} activeOpacity={0.7}>
          <MessageCircle size={18} color={colors.textDisabled} />
          <Text style={[s.actionCount, { color: colors.textSecondary }]}>{post.comment_count}</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          onPress={() => (post.is_saved ? onUnsave() : onSave())}
          style={s.actionButton}
          activeOpacity={0.7}
        >
          <Bookmark
            size={18}
            color={post.is_saved ? colors.primary : colors.textDisabled}
            fill={post.is_saved ? colors.primary : 'transparent'}
          />
          <Text style={[s.actionCount, { color: post.is_saved ? colors.primary : colors.textSecondary }]}>
            {post.is_saved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
