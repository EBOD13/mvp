import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useDiscover } from '../../hooks/useDiscover';
import { RootStackParamList } from '../../navigation/types';
import { DiscoverUser, Passion } from '../../api/passionApi';
import PassionCard from '../../components/cards/PassionCard';
import BottomNavBar from '../../components/layout/BottomNavBar';
import FloatingActionButton from '../../components/layout/FloatingActionButton';

const UserRow: React.FC<{
  item: DiscoverUser;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const displayName = item.display_name || item.username || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface ?? '#FFFFFF',
        borderRadius: radii?.lg ?? 16,
        padding: spacing['4'],
        marginBottom: spacing['3'],
        borderWidth: 1,
        borderColor: colors.border ?? '#E5E7EB',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing['3'],
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: fontWeights.bold,
            fontSize: fontSizes.md,
          }}
        >
          {avatarLetter}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: fontSizes.md,
            fontWeight: fontWeights.semibold,
            color: colors.textPrimary,
          }}
        >
          {displayName}
        </Text>
        <Text
          style={{
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          @{item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  return (
    <View
      style={{
        paddingVertical: spacing['12'],
        paddingHorizontal: spacing['6'],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          color: colors.textPrimary,
          marginBottom: spacing['2'],
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={{
            fontSize: fontSizes.md,
            color: colors.textSecondary,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};


type NavProp = StackNavigationProp<RootStackParamList>;

const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [fabVisible, setFabVisible] = useState(false);

  const {
    passions,
    users,
    loading,
    error,
    query,
    setQuery,
    tab,
    setTab,
    loadMore,
    refresh,
  } = useDiscover();

const renderPassion: ListRenderItem<Passion> = ({ item }) => (
  <PassionCard
    passion={{
      name: item.name,
      description: item.description,
      memberCount: item.memberCount,
      category: item.category,
      isJoined: item.membershipStatus === 'member',
      coverImageUrl: item.coverImageUrl,
      coverColor: item.coverColor,
    }}
    onPress={() =>
      navigation.navigate('PassionDetailScreen', { passionId: item.id })
    }
    onJoinPress={() =>
      navigation.navigate('PassionDetailScreen', { passionId: item.id })
    }
  />
);

  const renderUser: ListRenderItem<DiscoverUser> = ({ item }) => (
    <UserRow
      item={item}
      onPress={() => navigation.navigate('OtherUserScreen', { userId: item.id })}
    />
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: spacing['5'],
            paddingTop: spacing['4'],
            paddingBottom: spacing['3'],
          }}
        >
          <Text
            style={{
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.textPrimary,
              marginBottom: spacing['4'],
            }}
          >
            Discover
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface ?? '#FFFFFF',
              borderRadius: borderRadius?.xl ?? 18,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['3'],
              borderWidth: 1,
              borderColor: colors.border ?? '#E5E7EB',
              marginBottom: spacing['4'],
            }}
          >
            <Text
              style={{
                marginRight: spacing['2'],
                fontSize: fontSizes.lg,
              }}
            >
              🔍
            </Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={tab === 'passions' ? 'Search passions...' : 'Search people...'}
              placeholderTextColor={colors.textSecondary}
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontSize: fontSizes.md,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.card ?? '#F3F4F6',
              borderRadius: borderRadius?.xl ?? 18,
              padding: 4,
            }}
          >
            {(['passions', 'people'] as const).map(segment => {
              const active = tab === segment;
              return (
                <TouchableOpacity
                  key={segment}
                  onPress={() => setTab(segment)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing['3'],
                    borderRadius: borderRadius?.lg ?? 14,
                    backgroundColor: active ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSizes.md,
                      fontWeight: fontWeights.semibold,
                      color: active ? '#FFFFFF' : colors.textSecondary,
                      textTransform: 'capitalize',
                    }}
                  >
                    {segment}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: spacing['3'] }}>
          {tab === 'passions' ? (
            <>
              {loading && passions.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : passions.length === 0 ? (
                <EmptyState
                  title="No passions found"
                  subtitle="Try a different search term."
                />
              ) : (
                <FlatList
                  data={passions}
                  renderItem={renderPassion}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={{
                    paddingHorizontal: spacing['4'],
                    justifyContent: 'space-between',
                    marginBottom: spacing['3'],
                  }}
                  contentContainerStyle={{
                    paddingBottom: spacing['8'],
                    paddingTop: spacing['2'],
                  }}
                  showsVerticalScrollIndicator={false}
                  onEndReachedThreshold={0.4}
                  onEndReached={loadMore}
                />
              )}
            </>
          ) : (
            <>
              {!query.trim() ? (
                <EmptyState
                  title="Search for people by name or username"
                  subtitle="Results will appear once you start typing."
                />
              ) : loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : users.length === 0 ? (
                <EmptyState
                  title="No people found"
                  subtitle="Try a different name or username."
                />
              ) : (
                <FlatList
                  data={users}
                  renderItem={renderUser}
                  keyExtractor={item => item.id}
                  contentContainerStyle={{
                    paddingTop: spacing['2'],
                    paddingHorizontal: spacing['2'],
                    paddingBottom: spacing['8'],
                  }}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}
        </View>

        {/* ── Bottom nav ───────────────────────────────────────────────────── */}
        <BottomNavBar
          activeRoute="DiscoverScreen"
          onAddPress={() => setFabVisible(v => !v)}
        />
        <FloatingActionButton
          visible={fabVisible}
          onClose={() => setFabVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
};

export default DiscoverScreen;