// src/components/cards/PostCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme';
import { Avatar } from '../common/Avatar';
import { PostResponse } from '../../types/feed';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export type PostCardProps = {
  post: PostResponse;
  onLike: () => void;
  onUnlike: () => void;
  onSave: () => void;
  onUnsave: () => void;
  onCommentPress: () => void;
  onAuthorPress: () => void;
  /** Provided only when the viewer is the post author */
  onEditPress?: () => void;
  /** Provided only when the viewer is the post author */
  onDeletePress?: () => void;
};

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------
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

        {/* Options menu — only for the post author */}
        {showOptionsMenu && (
          <TouchableOpacity onPress={handleOptionsMenu} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Text style={{ fontSize: fontSizes.lg, color: colors.textDisabled, letterSpacing: 2 }}>···</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Passion badge ───────────────────────────────────────────────── */}
      {post.passion_name && (
        <TouchableOpacity style={s.badge} activeOpacity={0.7} onPress={() => {}}>
          <Text style={s.badgeText}># {post.passion_name}</Text>
        </TouchableOpacity>
      )}

      {/* ── Post body ───────────────────────────────────────────────────── */}
      <Text style={s.content}>{post.content}</Text>

      {/* ── Action row ──────────────────────────────────────────────────── */}
      <View style={s.actions}>
        {/* Like */}
        <TouchableOpacity
          onPress={() => (post.is_liked ? onUnlike() : onLike())}
          style={s.actionButton}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: fontSizes.lg, color: post.is_liked ? colors.primary : colors.textDisabled }}>
            {post.is_liked ? '♥' : '♡'}
          </Text>
          <Text style={[s.actionCount, { color: post.is_liked ? colors.primary : colors.textSecondary }]}>
            {post.like_count}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity onPress={onCommentPress} style={s.actionButton} activeOpacity={0.7}>
          <Text style={{ fontSize: fontSizes.lg, color: colors.textDisabled }}>💬</Text>
          <Text style={[s.actionCount, { color: colors.textSecondary }]}>{post.comment_count}</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          onPress={() => (post.is_saved ? onUnsave() : onSave())}
          style={s.actionButton}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: fontSizes.lg, color: post.is_saved ? colors.primary : colors.textDisabled }}>
            🔖
          </Text>
          <Text style={[s.actionCount, { color: post.is_saved ? colors.primary : colors.textSecondary }]}>
            {post.is_saved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
