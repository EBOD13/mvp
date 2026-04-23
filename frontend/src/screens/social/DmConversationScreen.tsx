import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { useMessages } from '../../hooks/useMessages';
import { useAuthContext } from '../../context/AuthContext';
import { MessageResponse } from '../../api/messageApi';
import { RootStackParamList } from '../../navigation/types';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'DmConversationScreen'>;

const AVATAR_COLORS = [
  '#7C1F88', '#A84DC0', '#5B8DEF', '#48A6A7',
  '#E26D6D', '#E59D5C', '#6D9F71', '#8C6AD9',
];

const avatarColor = (id: string) => {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const MessageBubble: React.FC<{
  msg: MessageResponse;
  isMine: boolean;
  showAvatar: boolean;
  otherUsername: string;
  otherUserId: string;
}> = ({ msg, isMine, showAvatar, otherUsername, otherUserId }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const color = avatarColor(otherUserId);

  return (
    <View
      style={{
        flexDirection: isMine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        marginBottom: spacing['1'],
        paddingHorizontal: spacing['4'],
      }}
    >
      {/* Avatar placeholder (their side only) */}
      {!isMine && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: showAvatar ? color : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing['2'],
            flexShrink: 0,
          }}
        >
          {showAvatar && (
            <Text style={{ color: '#fff', fontWeight: fontWeights.bold, fontSize: fontSizes.sm }}>
              {otherUsername.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      )}

      <View style={{ maxWidth: '72%' }}>
        {!isMine && showAvatar && (
          <Text
            style={{
              fontSize: fontSizes.xs,
              color: colors.textSecondary,
              marginBottom: 2,
              marginLeft: 2,
            }}
          >
            @{otherUsername}
          </Text>
        )}

        <View
          style={{
            backgroundColor: isMine ? colors.primary : colors.surface,
            borderRadius: radii.xl,
            borderBottomRightRadius: isMine ? radii.sm : radii.xl,
            borderBottomLeftRadius: isMine ? radii.xl : radii.sm,
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['2'] + 2,
            borderWidth: isMine ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.md,
              color: isMine ? colors.textInverse : colors.textPrimary,
              lineHeight: fontSizes.md * 1.4,
            }}
          >
            {msg.content}
          </Text>
        </View>

        <Text
          style={{
            fontSize: fontSizes.xs,
            color: colors.textSecondary,
            marginTop: 3,
            textAlign: isMine ? 'right' : 'left',
            marginHorizontal: 2,
          }}
        >
          {formatTime(msg.created_at)}
        </Text>
      </View>
    </View>
  );
};

const DmConversationScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { otherUserId, otherUsername } = route.params;

  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const { userId } = useAuthContext();
  const { conversation, convLoading: loading, fetchConversation, sendDm } = useMessages();
  const flatListRef = useRef<FlatList<MessageResponse>>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversation(otherUserId);
  }, [otherUserId]);

  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [conversation.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setText('');
    setSending(true);
    await sendDm(otherUserId, content);
    setSending(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const color = avatarColor(otherUserId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['3'],
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surfaceElevated,
            ...shadows.sm,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing['3'],
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Avatar */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing['3'],
            }}
          >
            <Text style={{ color: '#fff', fontWeight: fontWeights.bold, fontSize: fontSizes.md }}>
              {otherUsername.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.textPrimary }}>
              @{otherUsername}
            </Text>
          </View>
        </View>

        {/* ── Messages ─────────────────────────────────────────────────── */}
        {loading && conversation.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={conversation}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              const isMine = item.sender_id === userId || item.sender_id === 'me';
              const prevMsg = index > 0 ? conversation[index - 1] : null;
              const showAvatar = !isMine && (
                !prevMsg || prevMsg.sender_id !== item.sender_id
              );
              return (
                <MessageBubble
                  msg={item}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  otherUsername={otherUsername}
                  otherUserId={otherUserId}
                />
              );
            }}
            contentContainerStyle={{
              paddingTop: spacing['4'],
              paddingBottom: spacing['3'],
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
                <MessageCircle size={52} color={colors.border} style={{ marginBottom: spacing['3'] }} />
                <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textSecondary, textAlign: 'center' }}>
                  Say hello to @{otherUsername}!
                </Text>
              </View>
            }
          />
        )}

        {/* ── Input bar ────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['3'],
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surfaceElevated,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`Message @${otherUsername}...`}
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['2'] + 2,
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              maxHeight: 120,
              borderWidth: 1,
              borderColor: colors.border,
              marginRight: spacing['2'],
            }}
            onSubmitEditing={Platform.OS === 'web' ? handleSend : undefined}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() ? colors.primary : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <Send size={18} color={colors.textInverse} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DmConversationScreen;
