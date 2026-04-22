import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { EmptyState } from '../../components/common/EmptyState';
import { passionApi, PassionListItem } from '../../api/passionApi';

type Navigation = StackNavigationProp<RootStackParamList, 'PassionsListScreen'>;
type PassionsRoute = RouteProp<RootStackParamList, 'PassionsListScreen'>;

const PassionsListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<PassionsRoute>();
  const { colors, spacing, textVariants, radii } = useTheme();
  const requestedUserId = route.params?.userId;
  const requestedUsername = route.params?.username;
  const screenTitle = route.params?.title ?? 'My Passions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import apiClient from '../../lib/apiClient';
import { EmptyState } from '../../components/common/EmptyState';

type Navigation = StackNavigationProp<RootStackParamList, 'PassionsListScreen'>;

interface PassionListItem {
  id: string;
  name: string;
  member_count: number;
  category: string | null;
  my_role: 'member' | 'admin' | 'organizer';
}

const PassionsListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();

  const [items, setItems] = useState<PassionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = requestedUserId
        ? await passionApi.getUserPassions(requestedUserId)
        : requestedUsername
          ? await passionApi.getPassionsByUsername(requestedUsername)
        : await passionApi.getMyPassions();
      const response = await apiClient.get<PassionListItem[]>('/passions/me');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setItems([]);
    }
  }, [requestedUserId, requestedUsername]);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const toggleFavorite = useCallback(async (item: PassionListItem) => {
    // Optimistic update
    setItems(prev =>
      prev.map(p => p.id === item.id ? { ...p, is_favorite: !p.is_favorite } : p)
    );
    try {
      if (item.is_favorite) {
        await passionApi.removeFavorite(item.id);
      } else {
        await passionApi.addFavorite(item.id);
      }
    } catch {
      // Revert on failure
      setItems(prev =>
        prev.map(p => p.id === item.id ? { ...p, is_favorite: item.is_favorite } : p)
      );
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ marginRight: spacing['3'] }}
        >
          <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>{screenTitle}</Text>
          style={{ marginRight: 12 }}
        >
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: '#111827' }}>My Passions</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{
            padding: spacing['4'],
            padding: 16,
            flexGrow: items.length === 0 ? 1 : 0,
          }}
          ListEmptyComponent={
            <EmptyState
              title="No passions yet"
              actionLabel="Discover Passions"
              onAction={() => navigation.navigate('DiscoverScreen')}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('PassionDetailScreen', { passionId: item.id })
              }
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
              onPress={() => navigation.navigate('PassionDetailScreen', { passionId: item.id })}
              style={{
                backgroundColor: '#F9FAFB',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                {item.member_count} members · {item.category ?? 'General'} · {item.my_role}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default PassionsListScreen;
