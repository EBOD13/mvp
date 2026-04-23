import React, { useEffect, useRef, useState } from 'react';
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
import { useTheme } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../hooks/useAuth';
import { MessageResponse } from '../../api/messageApi';

type RouteProps = RouteProp<RootStackParamList, 'DmConversationScreen'>;

const DmConversationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { otherUserId, otherUsername } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { conversation, loading, fetchConversation, sendDm } = useMessages();
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchConversation(otherUserId);
  }, [otherUserId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversation.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [conversation]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await sendDm(otherUserId, text);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: MessageResponse }) => {
    const isMe = item.sender_id === user?.id || item.sender_id === 'me';

    return (
      <View
        style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          maxWidth: '75%',
          marginVertical: 4,
          marginHorizontal: spacing['4'],
        }}
      >
        <View
          style={{
            backgroundColor: isMe ? colors.primary : colors.surface,
            borderRadius: radii.md,
            paddingHorizontal: spacing['3'],
            paddingVertical: spacing['2'],
          }}
        >
          <Text style={{ fontSize: fontSizes.md, color: isMe ? colors.background : colors.textPrimary }}>
            {item.content}
          </Text>
        </View>
        <Text
          style={{
            fontSize: fontSizes.xs,
            color: colors.textSecondary,
            marginTop: 2,
            alignSelf: isMe ? 'flex-end' : 'flex-start',
          }}
        >
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: spacing['3'] }}>
          <Text style={{ fontSize: fontSizes.lg, color: colors.primary }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
          {otherUsername}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages list */}
        {loading && conversation.length === 0 ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={conversation}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: spacing['3'] }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['3'],
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['2'],
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              maxHeight: 100,
              marginRight: spacing['2'],
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={{
              backgroundColor: inputText.trim() ? colors.primary : colors.surface,
              borderRadius: radii.md,
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['2'],
            }}
          >
            <Text style={{ color: inputText.trim() ? colors.background : colors.textSecondary, fontWeight: fontWeights.semibold }}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DmConversationScreen;