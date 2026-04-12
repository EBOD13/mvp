import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import { CommentResponse } from '../../types/feed';

export type CommentSheetProps = {
  postId: string;
  visible: boolean;
  onClose: () => void;
};

// ---------------------------------------------------------------------------
// CommentRow — single comment in the list
// ---------------------------------------------------------------------------
type CommentRowProps = {
  comment: CommentResponse;
  isAuthor: boolean;
  onLike: () => void;
  onDelete: () => void;
};

const CommentRow: React.FC<CommentRowProps> = ({ comment, isAuthor, onLike, onDelete }) => {
  const { colors, spacing, fontSizes, fontWeights, lineHeights, radii } = useTheme();

  const formatTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={{ flexDirection: 'row', marginBottom: spacing['4'], gap: spacing['2'] }}>
      <Avatar name={comment.author_name} size="xs" />

      <View style={{ flex: 1 }}>
        {/* Author + timestamp */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['1'], marginBottom: 2 }}>
          <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
            {comment.author_username}
          </Text>
          <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled }}>
            · {formatTime(comment.created_at)}
          </Text>
        </View>

        {/* Comment text */}
        <Text style={{
          fontSize: fontSizes.sm,
          color: colors.textPrimary,
          lineHeight: fontSizes.sm * lineHeights.normal,
          marginBottom: spacing['1'],
        }}>
          {comment.content}
        </Text>

        {/* Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['4'] }}>
          <TouchableOpacity
            onPress={onLike}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['1'] }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: fontSizes.sm, color: comment.is_liked ? colors.primary : colors.textDisabled }}>
              {comment.is_liked ? '♥' : '♡'}
            </Text>
            {comment.like_count > 0 && (
              <Text style={{ fontSize: fontSizes.xs, color: comment.is_liked ? colors.primary : colors.textDisabled }}>
                {comment.like_count}
              </Text>
            )}
          </TouchableOpacity>

          {/* Delete — only for comment author */}
          {isAuthor && (
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
              <Text style={{ fontSize: fontSizes.sm, color: colors.textDisabled }}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// CommentSheet
// ---------------------------------------------------------------------------
const CommentSheet: React.FC<CommentSheetProps> = ({ postId, visible, onClose }) => {
  const { userId } = useAuth();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { comments, loading, fetchComments, addComment, deleteComment, likeComment } = useComments(postId);

  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Fetch comments each time the sheet opens
  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible, fetchComments]);

  const handleSubmit = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await addComment(trimmed);
      setInputText('');
    } catch {
      // Input stays filled so the user can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        {/* Tap-outside-to-close backdrop */}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Sheet body */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            maxHeight: '72%',
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingVertical: spacing['3'] }}>
            <View style={{
              width: 36,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: radii.full,
            }} />
          </View>

          {/* Sheet header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing['4'],
            paddingBottom: spacing['3'],
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
              Comments{comments.length > 0 ? ` (${comments.length})` : ''}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Text style={{ fontSize: fontSizes.lg, color: colors.textDisabled }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: spacing['8'] }}
            />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id}
              contentContainerStyle={{
                paddingHorizontal: spacing['4'],
                paddingTop: spacing['3'],
                paddingBottom: spacing['2'],
              }}
              renderItem={({ item }) => (
                <CommentRow
                  comment={item}
                  isAuthor={item.author_id === userId}
                  onLike={() => likeComment(item.id)}
                  onDelete={() => deleteComment(item.id)}
                />
              )}
              ListEmptyComponent={
                <Text style={{
                  color: colors.textDisabled,
                  textAlign: 'center',
                  paddingVertical: spacing['8'],
                  fontSize: fontSizes.sm,
                }}>
                  No comments yet. Be the first!
                </Text>
              }
            />
          )}

          {/* Input row */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing['4'],
            paddingTop: spacing['3'],
            paddingBottom: spacing['3'] + bottom,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: spacing['2'],
          }}>
            <TextInput
              ref={inputRef}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: radii.full,
                paddingHorizontal: spacing['4'],
                paddingVertical: spacing['2'],
                fontSize: fontSizes.md,
                color: colors.textPrimary,
                minHeight: 38,
              }}
              placeholder="Add a comment…"
              placeholderTextColor={colors.textDisabled}
              value={inputText}
              onChangeText={setInputText}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!inputText.trim() || submitting}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: inputText.trim() && !submitting ? colors.primary : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: inputText.trim() && !submitting ? colors.primary : colors.border,
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{
                  color: inputText.trim() ? colors.textInverse : colors.textDisabled,
                  fontSize: fontSizes.md,
                }}>
                  ▶
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CommentSheet;
