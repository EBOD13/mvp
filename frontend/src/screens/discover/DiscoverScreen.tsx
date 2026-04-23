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
import { Globe, Search, UserSearch, Users } from 'lucide-react-native';
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
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing['4'],
        marginBottom: spacing['3'],
        borderWidth: 1,
        borderColor: colors.border,
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
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  return (
    <View
      style={{
        paddingVertical: spacing['12'],
        paddingHorizontal: spacing['6'],
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing['3'],
      }}
    >
      {icon}
      <Text
        style={{
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          color: colors.textPrimary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={{
            fontSize: fontSizes.sm,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: fontSizes.sm * 1.6,
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
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
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
      coverUrl: item.coverUrl,
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
              backgroundColor: colors.surface,
              borderRadius: radii.full,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['3'],
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing['4'],
            }}
          >
            <Search
              size={18}
              color={colors.textSecondary}
              style={{ marginRight: spacing['2'] }}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={tab === 'passions' ? 'Search all communities...' : 'Search by name or @username...'}
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
              backgroundColor: colors.surface,
              borderRadius: radii.full,
              padding: 4,
              borderWidth: 1,
              borderColor: colors.border,
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
                    borderRadius: radii.full,
                    backgroundColor: active ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSizes.md,
                      fontWeight: fontWeights.semibold,
                      color: active ? colors.textInverse : colors.textSecondary,
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
                  icon={<Globe size={52} color={colors.border} />}
                  title={query.trim() ? `No communities match "${query.trim()}"` : 'No communities yet'}
                  subtitle={query.trim() ? 'Try a different keyword — or create a new community!' : 'Be the first to create a community for your passion.'}
                />
              ) : (
                <FlatList
                  data={passions}
                  renderItem={renderPassion}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  ListHeaderComponent={
                    <View style={{ paddingHorizontal: spacing['4'], paddingTop: spacing['2'], paddingBottom: spacing['3'] }}>
                      <Text style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {query.trim() ? `Results for "${query.trim()}"` : 'All Communities'}
                        {passions.length > 0 ? `  ·  ${passions.length}${passions.length >= 20 ? '+' : ''}` : ''}
                      </Text>
                    </View>
                  }
                  columnWrapperStyle={{
                    paddingHorizontal: spacing['4'],
                    gap: spacing['3'],
                    marginBottom: spacing['4'],
                  }}
                  contentContainerStyle={{
                    paddingBottom: spacing['8'],
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
                  icon={<UserSearch size={52} color={colors.border} />}
                  title="Find people"
                  subtitle={'Search by name or @username\nto connect with people around you.'}
                />
              ) : loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : users.length === 0 ? (
                <EmptyState
                  icon={<Users size={52} color={colors.border} />}
                  title={`No results for "${query.trim()}"`}
                  subtitle="Double-check the spelling or try a different name."
                />
              ) : (
                <FlatList
                  data={users}
                  renderItem={renderUser}
                  keyExtractor={item => item.id}
                  ListHeaderComponent={
                    <View style={{ paddingHorizontal: spacing['2'], paddingTop: spacing['2'], paddingBottom: spacing['3'] }}>
                      <Text style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {`People  ·  ${users.length}${users.length >= 20 ? '+' : ''}`}
                      </Text>
                    </View>
                  }
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