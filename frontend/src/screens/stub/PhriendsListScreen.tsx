import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Star } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { phriendApi, PhriendItem } from '../../api/phriendApi';
import { Avatar } from '../../components/common/Avatar';

type NavProp = StackNavigationProp<RootStackParamList>;

const BEST_LIMIT = 5;

type PhriendRowProps = {
  item: PhriendItem;
  isBest: boolean;
  bestCount: number;
  onPress: () => void;
  onToggleBest: () => void;
};

const PhriendRow: React.FC<PhriendRowProps> = ({ item, isBest, bestCount, onPress, onToggleBest }) => {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const displayName = [item.first_name, item.last_name].filter(Boolean).join(' ') || item.username;

  const handleStarPress = () => {
    if (!isBest && bestCount >= BEST_LIMIT) {
      Alert.alert(
        'Best Phriends Full',
        `You can only have up to ${BEST_LIMIT} Best Phriends. Remove one to add another.`,
      );
      return;
    }
    onToggleBest();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing['3'],
        paddingHorizontal: spacing['4'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Avatar uri={item.profile_photo_url} name={displayName} size="md" style={{ marginRight: spacing['3'] }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
          {displayName}
        </Text>
        <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>
          @{item.username}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleStarPress}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        style={{ paddingLeft: spacing['3'] }}
      >
        <Star
          size={20}
          color={isBest ? colors.primary : colors.textDisabled}
          fill={isBest ? colors.primary : 'transparent'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const PhriendsListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const [phriends, setPhriends] = useState<PhriendItem[]>([]);
  const [bestIds, setBestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
      Promise.all([
        phriendApi.getPhriends(),
        phriendApi.getBestPhriendIds(),
      ])
        .then(([phRes, bestRes]) => {
          if (!mounted) return;
          setPhriends(phRes.data);
          setBestIds(new Set(bestRes.data));
        })
        .catch(() => { if (mounted) { setPhriends([]); setBestIds(new Set()); } })
        .finally(() => { if (mounted) setLoading(false); });
      return () => { mounted = false; };
    }, [])
  );

  const handleToggleBest = async (item: PhriendItem) => {
    const isCurrentlyBest = bestIds.has(item.user_id);
    // Optimistic update
    setBestIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyBest) next.delete(item.user_id);
      else next.add(item.user_id);
      return next;
    });
    try {
      if (isCurrentlyBest) {
        await phriendApi.removeBestPhriend(item.user_id);
      } else {
        await phriendApi.addBestPhriend(item.user_id);
      }
    } catch (err: any) {
      // Roll back on error
      setBestIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyBest) next.add(item.user_id);
        else next.delete(item.user_id);
        return next;
      });
      const msg = err?.response?.data?.detail ?? 'Something went wrong.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* ── Header ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ marginRight: spacing['3'] }}
        >
          <ChevronLeft size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
          Phriends
        </Text>
        <Text style={{ marginLeft: spacing['2'], fontSize: fontSizes.sm, color: colors.textSecondary }}>
          ★ {bestIds.size}/{BEST_LIMIT} Best
        </Text>
      </View>

      {/* ── Add Phriends Banner ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: spacing['4'],
        marginTop: spacing['4'],
        marginBottom: spacing['2'],
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
          Add new Phriends?
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('DiscoverScreen')}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['2'],
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textInverse }}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── List ── */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing['8'] }} />
      ) : (
        <FlatList
          data={phriends}
          keyExtractor={item => item.user_id}
          renderItem={({ item }) => (
            <PhriendRow
              item={item}
              isBest={bestIds.has(item.user_id)}
              bestCount={bestIds.size}
              onPress={() => navigation.navigate('OtherUserScreen', { userId: item.user_id })}
              onToggleBest={() => handleToggleBest(item)}
            />
          )}
          ListEmptyComponent={
            <View style={{ padding: spacing['8'], alignItems: 'center' }}>
              <Text style={{ fontSize: fontSizes.md, color: colors.textDisabled, textAlign: 'center', lineHeight: fontSizes.md * 1.6 }}>
                No phriends yet.{'\n'}Search for people to connect with!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: spacing['6'] }}
        />
      )}
    </SafeAreaView>
  );
};

export default PhriendsListScreen;
