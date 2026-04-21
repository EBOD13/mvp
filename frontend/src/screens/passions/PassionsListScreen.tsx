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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ marginRight: 12 }}
        >
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: '600', color: '#111827' }}>My Passions</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{
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
