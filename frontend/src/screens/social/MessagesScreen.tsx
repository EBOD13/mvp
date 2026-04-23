import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useMessages } from '../../hooks/useMessages';
import { ConversationSummary } from '../../api/messageApi';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MessagesScreen'>;

type Tab = 'direct' | 'passions';

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { dmList, loading, error, fetchDmList } = useMessages();

  const [activeTab, setActiveTab] = useState<Tab>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchDmList();
  }, [fetchDmList]);

  // Filter DM list by search query
  const filteredDmList = dmList.filter(convo =>
    convo.other_user_username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  const renderDmItem = ({ item }: { item: ConversationSummary }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('DmConversationScreen', {
          otherUserId: item.other_user_id,
          otherUsername: item.other_user_username,
        })
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Avatar placeholder */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing['3'],
        }}
      >
        <Text style={{ fontSize: fontSizes.lg, color: colors.textSecondary }}>
          {item.other_user_username[0].toUpperCase()}
        </Text>
      </View>

      {/* Message preview */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
          <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
            {item.other_user_username}
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>
            {formatTime(item.last_message_at)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontSize: fontSizes.sm, color: colors.textSecondary }}
          >
            {item.last_message}
          </Text>
          {item.unread_count > 0 && (
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing['2'],
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ fontSize: fontSizes.xs, color: colors.background, fontWeight: fontWeights.bold }}>
                {item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.textPrimary }}>
          Messages
        </Text>
        <TouchableOpacity onPress={() => setShowSearch(prev => !prev)}>
          <Text style={{ fontSize: fontSizes.lg, color: colors.primary }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      {showSearch && (
        <View style={{ paddingHorizontal: spacing['4'], paddingVertical: spacing['2'] }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={activeTab === 'direct' ? 'Search conversations...' : 'Search passions...'}
            placeholderTextColor={colors.textSecondary}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['2'],
              fontSize: fontSizes.md,
              color: colors.textPrimary,
            }}
          />
        </View>
      )}

      {/* Segmented control */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: spacing['4'],
          marginVertical: spacing['3'],
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          padding: 4,
        }}
      >
        {(['direct', 'passions'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: spacing['2'],
              alignItems: 'center',
              borderRadius: radii.sm,
              backgroundColor: activeTab === tab ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: fontSizes.sm,
                fontWeight: fontWeights.semibold,
                color: activeTab === tab ? colors.background : colors.textSecondary,
              }}
            >
              {tab === 'direct' ? 'Direct' : 'Passions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === 'direct' ? (
        loading ? (
          <ActivityIndicator style={{ marginTop: spacing['8'] }} color={colors.primary} />
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.md }}>{error}</Text>
          </View>
        ) : filteredDmList.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.md }}>
              No conversations yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredDmList}
            keyExtractor={item => item.other_user_id}
            renderItem={renderDmItem}
          />
        )
      ) : (
        // Passions tab — placeholder for now
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSizes.md }}>
            Passions channels coming soon
          </Text>
        </View>
      )}

    </SafeAreaView>
  );
};

export default MessagesScreen;