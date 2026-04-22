// src/components/cards/PassionCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Users } from 'lucide-react-native';
import { useTheme } from '../../theme';

export type PassionCardData = {
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined?: boolean;
  coverUrl?: string | null;
  coverColor?: string;
};

type PassionCardProps = {
  passion: PassionCardData;
  onPress?: () => void;
  onJoinPress?: () => void;
};

const formatMemberCount = (count: number): string =>
  `${count.toLocaleString()} member${count === 1 ? '' : 's'}`;

const PassionCard: React.FC<PassionCardProps> = ({
  passion,
  onPress,
  onJoinPress,
}) => {
  const {
    colors,
    spacing,
    fontSizes,
    fontWeights,
    lineHeights,
    radii,
    shadows,
  } = useTheme();

  const RADIUS = radii['2xl'];

  const s = {
    pressable: {
      flex: 1,
    },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: RADIUS,
      overflow: 'hidden' as const,
      ...shadows.md,
    },
    banner: {
      height: 100,
      backgroundColor: passion.coverColor ?? colors.primarySubtle,
    },
    bannerImage: {
      borderTopLeftRadius: RADIUS,
      borderTopRightRadius: RADIUS,
    },
    bannerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
    content: {
      paddingHorizontal: spacing['3'],
      paddingTop: spacing['3'],
      paddingBottom: spacing['3'],
      minHeight: 150,
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
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.textPrimary,
      lineHeight: fontSizes.lg * lineHeights.tight,
      marginRight: spacing['1'],
    },
    categoryBadge: {
      backgroundColor: colors.primarySubtle,
      borderRadius: radii.full,
      paddingHorizontal: spacing['2'],
      paddingVertical: spacing['1'],
      alignSelf: 'flex-start' as const,
      maxWidth: 78,
    },
    categoryBadgeText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
    },
    description: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
      color: colors.textSecondary,
      lineHeight: fontSizes.sm * lineHeights.relaxed,
      marginBottom: spacing['3'],
      minHeight: 44,
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginBottom: spacing['3'],
    },
    footer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: spacing['2'],
    },
    memberRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flex: 1,
      minWidth: 0,
    },
    memberIcon: {},
    memberCount: {
      flexShrink: 1,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      color: colors.textSecondary,
    },
    joinButton: {
      backgroundColor: colors.primary,
      borderRadius: radii.full,
      paddingHorizontal: spacing['4'],
      paddingVertical: spacing['2'],
      minWidth: 72,
      alignItems: 'center' as const,
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
    },
    joinButtonTextJoined: {
      color: colors.textSecondary,
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={s.pressable}
      disabled={!onPress}
    >
      <View style={s.card}>
        <ImageBackground
          source={passion.coverUrl ? { uri: passion.coverUrl } : undefined}
          style={s.banner}
          imageStyle={s.bannerImage}
        >
          <View style={s.bannerOverlay} />
        </ImageBackground>

        <View style={s.content}>
          <View style={s.topRow}>
            <Text style={s.passionName} numberOfLines={2}>
              {passion.name}
            </Text>

            <View style={s.categoryBadge}>
              <Text style={s.categoryBadgeText} numberOfLines={1}>
                {passion.category}
              </Text>
            </View>
          </View>

          <Text style={s.description} numberOfLines={2}>
            {passion.description}
          </Text>

          <View style={s.divider} />

          <View style={s.footer}>
            <View style={s.memberRow}>
              <Users size={14} color={colors.textSecondary} style={{ marginRight: spacing['1'] }} />
              <Text style={s.memberCount} numberOfLines={1}>
                {formatMemberCount(passion.memberCount)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onJoinPress}
              style={[
                s.joinButton,
                passion.isJoined && s.joinButtonJoined,
              ]}
              activeOpacity={0.75}
              disabled={!onJoinPress}
            >
              <Text
                style={[
                  s.joinButtonText,
                  passion.isJoined && s.joinButtonTextJoined,
                ]}
              >
                {passion.isJoined ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PassionCard;