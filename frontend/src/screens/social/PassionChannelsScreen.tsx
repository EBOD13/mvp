import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Hash, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { passionApi, SubchannelListItem } from '../../api/passionApi';
import { RootStackParamList } from '../../navigation/types';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'PassionChannelsScreen'>;

const ChannelRow: React.FC<{
  item: SubchannelListItem;
  accentColor: string;
  onPress: () => void;
  isLast: boolean;
}> = ({ item, accentColor, onPress, isLast }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'] + 2,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Hash badge */}
      <View style={{
        width: 38,
        height: 38,
        borderRadius: radii.lg,
        backgroundColor: accentColor + '18',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing['3'],
        borderWidth: 1.5,
        borderColor: accentColor + '44',
      }}>
        <Hash size={16} color={accentColor} />
      </View>

      {/* Name + description */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: fontSizes.md,
          fontWeight: fontWeights.semibold,
          color: colors.textPrimary,
        }}>
          {item.name}
        </Text>
        {item.description ? (
          <Text numberOfLines={1} style={{
            fontSize: fontSizes.xs,
            color: colors.textSecondary,
            marginTop: 2,
          }}>
            {item.description}
          </Text>
        ) : null}
      </View>

      {/* Chevron */}
      <ArrowLeft
        size={14}
        color={colors.textDisabled}
        style={{ transform: [{ rotate: '180deg' }] }}
      />
    </TouchableOpacity>
  );
};

const PassionChannelsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { passionId, passionName, accentColor } = route.params;

  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const [subchannels, setSubchannels] = useState<SubchannelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    passionApi.getSubchannels(passionId)
      .then(res => setSubchannels(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [passionId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        backgroundColor: colors.surfaceElevated,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.sm,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38, height: 38, borderRadius: 19,
            backgroundColor: colors.surface,
            alignItems: 'center', justifyContent: 'center',
            marginRight: spacing['3'],
            borderWidth: 1, borderColor: colors.border,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Passion avatar */}
        <View style={{
          width: 36,
          height: 36,
          borderRadius: radii.lg,
          backgroundColor: accentColor + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing['2'],
          borderWidth: 1.5,
          borderColor: accentColor + '66',
        }}>
          <Text style={{ color: accentColor, fontWeight: fontWeights.bold, fontSize: fontSizes.md }}>
            {passionName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
            {passionName}
          </Text>
          {!loading && !error && (
            <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 1 }}>
              {subchannels.length} {subchannels.length === 1 ? 'channel' : 'channels'}
            </Text>
          )}
        </View>
      </View>

      {/* ── Accent bar ───────────────────────────────────────────────────── */}
      <View style={{ height: 3, backgroundColor: accentColor + '55' }} />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['6'] }}>
          <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center' }}>
            Could not load channels. Check your connection and try again.
          </Text>
        </View>
      ) : subchannels.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['6'] }}>
          <View style={{
            width: 72, height: 72,
            borderRadius: radii['2xl'],
            backgroundColor: accentColor + '18',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: spacing['4'],
            borderWidth: 2,
            borderColor: accentColor + '33',
          }}>
            <MessageCircle size={32} color={accentColor} />
          </View>
          <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing['2'] }}>
            No channels yet
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center' }}>
            The organizer hasn't created any channels for this passion yet. Check back soon!
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: spacing['4'], paddingTop: spacing['4'] }}>
          {/* Section label */}
          <Text style={{
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.bold,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: spacing['2'],
            marginLeft: spacing['1'],
          }}>
            Channels
          </Text>

          {/* Channel list card */}
          <View style={{
            backgroundColor: colors.surfaceElevated,
            borderRadius: radii.xl,
            overflow: 'hidden',
            ...shadows.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {subchannels.map((sc, idx) => (
              <ChannelRow
                key={sc.id}
                item={sc}
                accentColor={accentColor}
                isLast={idx === subchannels.length - 1}
                onPress={() => navigation.navigate('SubchannelScreen', {
                  subchannelId: sc.id,
                  subchannelName: sc.name,
                  passionName,
                })}
              />
            ))}
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

export default PassionChannelsScreen;
