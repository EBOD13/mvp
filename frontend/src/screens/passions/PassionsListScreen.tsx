import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../../lib/apiClient';
import { EmptyState } from '../../components/EmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PassionRole = 'member' | 'admin' | 'organizer';

export interface Passion {
  id: string;
  name: string;
  memberCount: number;
  category: string;
  role: PassionRole;
}

type RootStackParamList = {
  PassionsListScreen: undefined;
  PassionDetailScreen: { passionId: string };
  DiscoverScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ─── PassionCard ──────────────────────────────────────────────────────────────

interface PassionCardProps {
  passion: Passion;
  onPress: (id: string) => void;
}

const ROLE_COLORS: Record<PassionRole, string> = {
  organizer: '#7C3AED',
  admin: '#0EA5E9',
  member: '#6B7280',
};

function PassionCard({ passion, onPress }: PassionCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(passion.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.cardName}>{passion.name}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaText}>
          {passion.memberCount.toLocaleString()} members
        </Text>
        <Text style={styles.cardMetaDot}>·</Text>
        <Text style={styles.cardMetaText}>{passion.category}</Text>
        <Text style={styles.cardMetaDot}>·</Text>
        <Text
          style={[styles.cardRole, { color: ROLE_COLORS[passion.role] }]}
        >
          {passion.role}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── PassionsListScreen ───────────────────────────────────────────────────────

export function PassionsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [passions, setPassions] = useState<Passion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPassions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<Passion[]>('/passions/me');
      setPassions(data);
    } catch (err) {
      setError('Failed to load passions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassions();
  }, [fetchPassions]);

  const handleCardPress = useCallback(
    (passionId: string) => {
      navigation.navigate('PassionDetailScreen', { passionId });
    },
    [navigation],
  );

  const handleDiscoverPress = useCallback(() => {
    navigation.navigate('DiscoverScreen');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Passion }) => (
      <PassionCard passion={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback((item: Passion) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Passions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPassions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={passions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={
            passions.length === 0
              ? styles.emptyListContainer
              : styles.listContainer
          }
          ListEmptyComponent={
            <EmptyState
              title="No passions yet"
              actionLabel="Discover Passions"
              onAction={handleDiscoverPress}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  backArrow: {
    fontSize: 22,
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardMetaDot: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  cardRole: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
