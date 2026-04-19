import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
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
  const { colors, spacing, textVariants, radii } = useTheme();

  const [items, setItems] = useState<PassionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await apiClient.get<PassionListItem[]>('/passions/me');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setItems([]);
    }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ marginRight: spacing['3'] }}
        >
          <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[textVariants.h3 as any, { color: colors.textPrimary }]}>My Passions</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{
            padding: spacing['4'],
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
                navigation.navigate('PassionDetailScreen', {
                  passionId: item.id,
                })
              }
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing['4'],
                marginBottom: spacing['3'],
              }}
            >
              <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['1'] }]}>
                {item.name}
              </Text>
              <Text style={[textVariants.body as any, { color: colors.textSecondary }]}> 
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
