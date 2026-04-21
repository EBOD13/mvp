// src/components/cards/PassionCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

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
  const { colors, spacing, fontSizes, fontWeights, lineHeights, radii, shadows } = useTheme();

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
    topRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      justifyContent: 'space-between' as const,
      marginBottom: spacing['2'],
      gap: spacing['2'],
    },
    passionName: {
      flex: 1,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.textPrimary,
      lineHeight: fontSizes.xl * lineHeights.tight,
    },
    categoryBadge: {
      backgroundColor: colors.primarySubtle,
      borderRadius: radii.full,
      paddingHorizontal: spacing['3'],
      paddingVertical: spacing['1'],
      alignSelf: 'flex-start' as const,
    },
    categoryBadgeText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      letterSpacing: 0.3,
    },
    description: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.regular,
      color: colors.textSecondary,
      lineHeight: fontSizes.md * lineHeights.relaxed,
      marginBottom: spacing['4'],
    },
    footer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing['3'],
    },
    memberRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing['1'],
    },
    memberIcon: {
      fontSize: fontSizes.md,
    },
    memberCount: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.textSecondary,
    },
    joinButton: {
      backgroundColor: colors.primary,
      borderRadius: radii.full,
      paddingHorizontal: spacing['6'],
      paddingVertical: spacing['2'],
    },
    joinButtonJoined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    joinButtonText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.textInverse,
      letterSpacing: 0.3,
    },
    joinButtonTextJoined: {
      color: colors.textSecondary,
    },
  };

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <Text style={s.passionName}>{passion.name}</Text>
        <View style={s.categoryBadge}>
          <Text style={s.categoryBadgeText}>{passion.category}</Text>
        </View>
      </View>

      <Text style={s.description} numberOfLines={2}>
        {passion.description}
      </Text>

      <View style={s.footer}>
        <View style={s.memberRow}>
          <Text style={s.memberIcon}>👥</Text>
          <Text style={s.memberCount}>{formatMemberCount(passion.memberCount)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {}}
          style={[s.joinButton, passion.isJoined && s.joinButtonJoined]}
          activeOpacity={0.75}
        >
          <Text style={[s.joinButtonText, passion.isJoined && s.joinButtonTextJoined]}>
            {passion.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PassionCard;
