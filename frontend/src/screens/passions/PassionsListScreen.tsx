import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Search } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { EmptyState } from '../../components/common/EmptyState';
import { passionApi, PassionListItem } from '../../api/passionApi';

const CATEGORY_FILTERS = ['All', 'Movies', 'TV Shows', 'Books', 'Music'];

type Navigation = StackNavigationProp<RootStackParamList, 'PassionsListScreen'>;
type PassionsRoute = RouteProp<RootStackParamList, 'PassionsListScreen'>;

const PassionsListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<PassionsRoute>();
  const { colors, spacing, textVariants, radii } = useTheme();

  const requestedUserId = route.params?.userId;
  const requestedUsername = route.params?.username;
  const screenTitle = route.params?.title ?? 'My Passions';

  const [items, setItems] = useState<PassionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const load = useCallback(async () => {
    try {
      const response = requestedUserId
        ? await passionApi.getUserPassions(requestedUserId)
        : requestedUsername
          ? await passionApi.getPassionsByUsername(requestedUsername)
          : await passionApi.getMyPassions();
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setItems([]);
    }
  }, [requestedUserId, requestedUsername]);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'All' ||
      (item.category ?? '').toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const toggleFavorite = useCallback(async (item: PassionListItem) => {
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_favorite: !p.is_favorite } : p));
    try {
      if (item.is_favorite) {
        await passionApi.removeFavorite(item.id);
      } else {
        await passionApi.addFavorite(item.id);
      }
    } catch {
      setItems(prev => prev.map(p => p.id === item.id ? { ...p, is_favorite: item.is_favorite } : p));
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ marginRight: spacing['3'] }}
        >
          <ChevronLeft size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>{screenTitle}</Text>
      </View>

      {/* ── Search bar ── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing['4'],
        marginTop: spacing['3'],
        marginBottom: spacing['2'],
        paddingHorizontal: spacing['3'],
        paddingVertical: spacing['2'],
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing['2'],
      }}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search passions…"
          placeholderTextColor={colors.textDisabled}
          style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 }}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {/* ── Category filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: spacing['2'] }}
        contentContainerStyle={{ paddingHorizontal: spacing['4'], gap: spacing['2'] }}
      >
        {CATEGORY_FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => setCategoryFilter(f)}
            style={{
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['1'],
              borderRadius: 20,
              backgroundColor: categoryFilter === f ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: categoryFilter === f ? colors.primary : colors.border,
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: categoryFilter === f ? '600' : '400',
              color: categoryFilter === f ? colors.textInverse : colors.textSecondary,
            }}>
              {f}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ padding: spacing['4'], flexGrow: filteredItems.length === 0 ? 1 : 0 }}
          ListEmptyComponent={
            <EmptyState
              title="No passions yet"
              actionLabel="Discover Passions"
              onAction={() => navigation.navigate('DiscoverScreen')}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('PassionDetailScreen', { passionId: item.id })}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing['4'],
                marginBottom: spacing['3'],
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['1'] }]}>
                  {item.name}
                </Text>
                <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                  {item.member_count} members · {item.category ?? 'General'} · {item.my_role}
                </Text>
              </View>
              <Pressable
                onPress={() => toggleFavorite(item)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                style={{ paddingLeft: spacing['3'] }}
              >
                <Text style={{ fontSize: 22, color: item.is_favorite ? colors.primary : colors.textSecondary }}>
                  {item.is_favorite ? '★' : '☆'}
                </Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default PassionsListScreen;
