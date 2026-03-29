// src/components/cards/PassionCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../../theme';

const passion = {
  name: 'Urban Photography',
  description:
    'A space for photographers who find beauty in city streets, architecture, and everyday urban life.',
  memberCount: 1240,
  isJoined: false,
  category: 'Creative Arts',
};

const formatMemberCount = (count: number): string =>
  `${count.toLocaleString()} members`;

const PassionCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.passionName}>{passion.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{passion.category}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {passion.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.memberRow}>
          <Text style={styles.memberIcon}>👥</Text>
          <Text style={styles.memberCount}>
            {formatMemberCount(passion.memberCount)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {}}
          style={[styles.joinButton, passion.isJoined && styles.joinButtonJoined]}
          activeOpacity={0.75}
        >
          <Text style={[styles.joinButtonText, passion.isJoined && styles.joinButtonTextJoined]}>
            {passion.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  passionName: {
    flex: 1,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed,
  },
  categoryBadge: {
    backgroundColor: colors.badgeBg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semiBold,
    color: colors.badgeText,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberIcon: {
    fontSize: typography.size.base,
  },
  memberCount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  joinButton: {
    backgroundColor: colors.buttonJoin,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  joinButtonJoined: {
    backgroundColor: colors.buttonJoined,
  },
  joinButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    color: colors.textOnPrimary,
    letterSpacing: 0.3,
  },
  joinButtonTextJoined: {
    color: colors.buttonJoinedText,
  },
});

export default PassionCard;