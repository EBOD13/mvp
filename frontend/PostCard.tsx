// src/components/cards/PostCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../../theme';

// ---------------------------------------------------------------------------
// Hardcoded dummy data — no props or API calls needed yet
// ---------------------------------------------------------------------------
const post = {
  authorName: 'Alex Rivera',
  authorUsername: '@alexrivera',
  authorAvatar: null,       // null → initials fallback
  avatarInitials: 'AR',
  passionName: 'Jazz Music',
  timeAgo: '2h ago',
  content:
    'Just discovered this incredible Miles Davis record from 1959. The way he layers the harmonics is unlike anything I have heard before.',
  likeCount: 42,
  commentCount: 8,
  isSaved: false,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular initials avatar */
const InitialsAvatar: React.FC<{ initials: string }> = ({ initials }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{initials}</Text>
  </View>
);

/** Pill-shaped passion badge */
const PassionBadge: React.FC<{ name: string }> = ({ name }) => (
  <TouchableOpacity onPress={() => {}} style={styles.badge} activeOpacity={0.7}>
    <Text style={styles.badgeText}># {name}</Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// HeartIcon / CommentIcon / BookmarkIcon — simple inline SVG-free versions
// using Unicode symbols so there's no icon-library dependency
// ---------------------------------------------------------------------------
const LikeIcon = () => <Text style={styles.actionIcon}>♡</Text>;
const CommentIcon = () => <Text style={styles.actionIcon}>💬</Text>;
const SaveIcon = () => <Text style={styles.actionIcon}>🔖</Text>;

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------
const PostCard: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <InitialsAvatar initials={post.avatarInitials} />

        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.authorUsername}>{post.authorUsername}</Text>
          </View>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
      </View>

      {/* ── Passion badge ───────────────────────────────────────────────── */}
      <PassionBadge name={post.passionName} />

      {/* ── Post body ───────────────────────────────────────────────────── */}
      <Text style={styles.content}>{post.content}</Text>

      {/* ── Action row ──────────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => {}} style={styles.actionButton} activeOpacity={0.7}>
          <LikeIcon />
          <Text style={styles.actionCount}>{post.likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.actionButton} activeOpacity={0.7}>
          <CommentIcon />
          <Text style={styles.actionCount}>{post.commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.actionButton} activeOpacity={0.7}>
          <SaveIcon />
          <Text style={styles.actionCount}>{post.isSaved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles — all values from theme tokens
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: 2,
  },
  authorName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semiBold,
    color: colors.textPrimary,
  },
  authorUsername: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    color: colors.textTertiary,
  },
  timeAgo: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.badgeBg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.badgeText,
    letterSpacing: 0.3,
  },

  // Content
  content: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: typography.size.lg,
  },
  actionCount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
});

export default PostCard;
