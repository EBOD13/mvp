import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Search, X, PenLine, MessageSquare, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useMessages } from '../../hooks/useMessages';
import { passionApi, PassionListItem } from '../../api/passionApi';
import { phriendApi, PhriendItem } from '../../api/phriendApi';
import { ConversationSummary } from '../../api/messageApi';
import { RootStackParamList } from '../../navigation/types';

type NavProp = StackNavigationProp<RootStackParamList>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#7C1F88', '#A84DC0', '#5B8DEF', '#48A6A7',
  '#E26D6D', '#E59D5C', '#6D9F71', '#8C6AD9',
];

const avatarColor = (id: string) => {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// ── Phriend Picker Sheet ──────────────────────────────────────────────────────

const PhriendPickerSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (phriend: PhriendItem) => void;
}> = ({ visible, onClose, onSelect }) => {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const [phriends, setPhriends] = useState<PhriendItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearch('');
      setLoading(true);
      phriendApi.getPhriends()
        .then(res => setPhriends(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
      Animated.spring(slideAnim, {
        toValue: 0, friction: 8, tension: 80, useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600, duration: 220, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const filtered = search.trim()
    ? phriends.filter(p =>
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
      )
    : phriends;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' } as any}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: radii['2xl'],
          borderTopRightRadius: radii['2xl'],
          maxHeight: '75%',
          transform: [{ translateY: slideAnim }],
          ...shadows.lg,
        }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing['3'], marginBottom: spacing['3'] }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing['5'], paddingBottom: spacing['3'] }}>
            <Text style={{ flex: 1, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
              New Message
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing['1'] }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.surface, borderRadius: radii.full,
            paddingHorizontal: spacing['4'], paddingVertical: spacing['2'],
            marginHorizontal: spacing['5'], marginBottom: spacing['3'],
            borderWidth: 1, borderColor: colors.border,
          }}>
            <Search size={16} color={colors.textSecondary} style={{ marginRight: spacing['2'] }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search phriends..."
              placeholderTextColor={colors.textSecondary}
              style={{ flex: 1, color: colors.textPrimary, fontSize: fontSizes.sm }}
              autoFocus
            />
          </View>
          {loading ? (
            <View style={{ padding: spacing['8'], alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.user_id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const displayName = `${item.first_name} ${item.last_name}`.trim() || item.username;
                const color = avatarColor(item.user_id);
                return (
                  <TouchableOpacity
                    onPress={() => { onClose(); onSelect(item); }}
                    activeOpacity={0.75}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing['5'], paddingVertical: spacing['3'] }}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: color, alignItems: 'center', justifyContent: 'center',
                      marginRight: spacing['3'],
                    }}>
                      <Text style={{ color: '#fff', fontWeight: fontWeights.bold, fontSize: fontSizes.md }}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
                        {displayName}
                      </Text>
                      <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>@{item.username}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ padding: spacing['8'], alignItems: 'center' }}>
                  <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center' }}>
                    {search ? 'No phriends match that name.' : 'No phriends yet.'}
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: spacing['8'] }}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Conversation Row ──────────────────────────────────────────────────────────

const ConversationRow: React.FC<{
  item: ConversationSummary;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const color = avatarColor(item.other_user_id);
  const hasUnread = item.unread_count > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceElevated,
        borderRadius: radii.xl,
        marginBottom: spacing['2'],
        overflow: 'hidden',
        ...shadows.sm,
        borderLeftWidth: hasUnread ? 3 : 0,
        borderLeftColor: colors.primary,
      }}
    >
      <View style={{
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: color,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: hasUnread ? spacing['3'] : spacing['3'],
        marginRight: spacing['3'],
        marginVertical: spacing['3'],
      }}>
        <Text style={{ color: '#fff', fontWeight: fontWeights.bold, fontSize: fontSizes.lg }}>
          {item.other_user_username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: fontSizes.md,
          fontWeight: hasUnread ? fontWeights.bold : fontWeights.semibold,
          color: colors.textPrimary, marginBottom: 2,
        }}>
          @{item.other_user_username}
        </Text>
        <Text numberOfLines={1} style={{
          fontSize: fontSizes.sm,
          color: hasUnread ? colors.textPrimary : colors.textSecondary,
          fontWeight: hasUnread ? fontWeights.medium : fontWeights.regular,
        }}>
          {item.last_message}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', marginRight: spacing['4'], marginLeft: spacing['2'] }}>
        <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 }}>
          {relativeTime(item.last_message_at)}
        </Text>
        {hasUnread && (
          <View style={{
            backgroundColor: colors.primary, borderRadius: radii.full,
            minWidth: 20, height: 20,
            alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
          }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: fontWeights.bold }}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Passion Server Row ────────────────────────────────────────────────────────

const PassionRow: React.FC<{
  passion: PassionListItem;
  onPress: () => void;
}> = ({ passion, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const color = avatarColor(passion.id.toString());

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceElevated,
        borderRadius: radii.xl,
        marginBottom: spacing['2'],
        overflow: 'hidden',
        ...shadows.sm,
      }}
    >
      {/* Accent strip — like Discord's active server indicator */}
      <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: color }} />

      {/* Avatar */}
      <View style={{
        width: 48, height: 48,
        borderRadius: radii.lg,
        backgroundColor: color + '22',
        alignItems: 'center', justifyContent: 'center',
        marginLeft: spacing['3'],
        marginRight: spacing['3'],
        marginVertical: spacing['3'],
        borderWidth: 1.5,
        borderColor: color + '66',
      }}>
        <Text style={{ color, fontWeight: fontWeights.extrabold, fontSize: fontSizes.xl }}>
          {passion.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Name & category */}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{
          fontSize: fontSizes.md,
          fontWeight: fontWeights.bold,
          color: colors.textPrimary,
        }}>
          {passion.name}
        </Text>
        {passion.category ? (
          <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 }}>
            {passion.category}
          </Text>
        ) : null}
      </View>

      {/* Chevron */}
      <ArrowLeft
        size={15}
        color={colors.textDisabled}
        style={{ transform: [{ rotate: '180deg' }], marginRight: spacing['4'] }}
      />
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const [tab, setTab] = useState<'direct' | 'passions'>('direct');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPhriendPicker, setShowPhriendPicker] = useState(false);

  const { dmList, dmListLoading, fetchDmList } = useMessages();

  const [passions, setPassions] = useState<PassionListItem[]>([]);
  const [passionsLoading, setPassionsLoading] = useState(false);

  useEffect(() => {
    fetchDmList();
    loadPassions();
  }, []);

  const loadPassions = async () => {
    setPassionsLoading(true);
    try {
      const res = await passionApi.getMyPassions();
      setPassions(res.data);
    } catch {
      // silent
    } finally {
      setPassionsLoading(false);
    }
  };

  const toggleSearch = () => {
    if (searchVisible) setSearchQuery('');
    setSearchVisible(v => !v);
  };

  const filteredDms = searchQuery.trim()
    ? dmList.filter(d => d.other_user_username.toLowerCase().includes(searchQuery.toLowerCase()))
    : dmList;

  const filteredPassions = searchQuery.trim()
    ? passions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : passions;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ flex: 1 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing['4'],
          paddingTop: spacing['4'],
          paddingBottom: spacing['2'],
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

          <Text style={{ flex: 1, fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.textPrimary }}>
            Messages
          </Text>

          <TouchableOpacity
            onPress={() => setShowPhriendPicker(true)}
            style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: colors.primarySubtle,
              alignItems: 'center', justifyContent: 'center',
              marginRight: spacing['2'],
              borderWidth: 1, borderColor: colors.primary + '33',
            }}
          >
            <PenLine size={17} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleSearch}
            style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: searchVisible ? colors.primarySubtle : colors.surface,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1,
              borderColor: searchVisible ? colors.primary + '44' : colors.border,
            }}
          >
            {searchVisible
              ? <X size={18} color={colors.primary} />
              : <Search size={18} color={colors.textSecondary} />
            }
          </TouchableOpacity>
        </View>

        {/* ── Search bar (slide-down) ─────────────────────────────────────── */}
        {searchVisible && (
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: radii.full,
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['2'] + 2,
            marginHorizontal: spacing['5'],
            marginTop: spacing['1'],
            marginBottom: spacing['2'],
            borderWidth: 1, borderColor: colors.border,
          }}>
            <Search size={15} color={colors.textSecondary} style={{ marginRight: spacing['2'] }} />
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={tab === 'direct' ? 'Search conversations...' : 'Search passions...'}
              placeholderTextColor={colors.textSecondary}
              style={{ flex: 1, color: colors.textPrimary, fontSize: fontSizes.sm }}
            />
          </View>
        )}

        {/* ── Segmented Control ──────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: spacing['5'],
          marginTop: searchVisible ? 0 : spacing['2'],
          marginBottom: spacing['3'],
          backgroundColor: colors.surface,
          borderRadius: radii.full,
          padding: 3,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          {(['direct', 'passions'] as const).map(t => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => { setTab(t); setSearchQuery(''); }}
                style={{
                  flex: 1,
                  paddingVertical: spacing['2'] + 2,
                  borderRadius: radii.full,
                  backgroundColor: active ? colors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.semibold,
                  color: active ? colors.textInverse : colors.textSecondary,
                  textTransform: 'capitalize',
                }}>
                  {t === 'direct' ? 'Direct' : 'Passions'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <View style={{ flex: 1, paddingHorizontal: spacing['4'] }}>
          {tab === 'direct' ? (
            dmListLoading && dmList.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredDms.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['6'] }}>
                <MessageSquare size={52} color={colors.border} style={{ marginBottom: spacing['4'] }} />
                <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing['2'] }}>
                  {searchQuery ? 'No results' : 'No conversations yet'}
                </Text>
                <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['5'] }}>
                  {searchQuery ? 'Try a different name.' : 'Start a conversation with one of your phriends.'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    onPress={() => setShowPhriendPicker(true)}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: colors.primary,
                      borderRadius: radii.full,
                      paddingHorizontal: spacing['5'],
                      paddingVertical: spacing['3'],
                      gap: spacing['2'],
                    }}
                    activeOpacity={0.85}
                  >
                    <PenLine size={16} color={colors.textInverse} />
                    <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textInverse }}>
                      Message a Phriend
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredDms}
                keyExtractor={item => item.other_user_id}
                renderItem={({ item }) => (
                  <ConversationRow
                    item={item}
                    onPress={() => navigation.navigate('DmConversationScreen', {
                      otherUserId: item.other_user_id,
                      otherUsername: item.other_user_username,
                    })}
                  />
                )}
                contentContainerStyle={{ paddingTop: spacing['1'], paddingBottom: spacing['8'] }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : passionsLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredPassions.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['6'] }}>
              <Sparkles size={52} color={colors.border} style={{ marginBottom: spacing['4'] }} />
              <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing['2'] }}>
                {searchQuery ? 'No results' : 'No passions yet'}
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center' }}>
                {searchQuery ? 'Try a different name.' : 'Join a passion from the Discover tab to see its channels here.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPassions}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <PassionRow
                  passion={item}
                  onPress={() => navigation.navigate('PassionChannelsScreen', {
                    passionId: item.id.toString(),
                    passionName: item.name,
                    accentColor: avatarColor(item.id.toString()),
                  })}
                />
              )}
              contentContainerStyle={{ paddingTop: spacing['1'], paddingBottom: spacing['8'] }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

      </View>

      <PhriendPickerSheet
        visible={showPhriendPicker}
        onClose={() => setShowPhriendPicker(false)}
        onSelect={phriend =>
          navigation.navigate('DmConversationScreen', {
            otherUserId: phriend.user_id,
            otherUsername: phriend.username,
          })
        }
      />
    </SafeAreaView>
  );
};

export default MessagesScreen;
