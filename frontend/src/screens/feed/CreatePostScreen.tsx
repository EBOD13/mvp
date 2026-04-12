import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { postApi } from '../../api/postApi';
import { RootStackParamList } from '../../navigation/types';
import { Avatar } from '../../components/common/Avatar';

type NavProp   = StackNavigationProp<RootStackParamList, 'CreatePostScreen'>;
type RoutePropT = RouteProp<RootStackParamList, 'CreatePostScreen'>;

type Visibility = 'public' | 'private';

// ---------------------------------------------------------------------------
// Reusable segment toggle used for Visibility and future controls
// ---------------------------------------------------------------------------
type SegmentProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

function SegmentToggle<T extends string>({ options, value, onChange }: SegmentProps<T>) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radii.full,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={{
            flex: 1,
            paddingVertical: spacing['2'],
            borderRadius: radii.full,
            backgroundColor: value === opt.value ? colors.primary : 'transparent',
            alignItems: 'center',
          }}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.semibold,
            color: value === opt.value ? colors.textInverse : colors.textSecondary,
          }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// CreatePostScreen
// ---------------------------------------------------------------------------
const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropT>();
  const { userId } = useAuth();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const editPost  = route.params?.post;
  const isEdit    = editPost !== undefined;

  // ── Form state ────────────────────────────────────────────────────────────
  const [content,         setContent]         = useState(editPost?.content ?? '');
  const [passionId,       setPassionId]        = useState<string | null>(editPost?.passion_id ?? null);
  const [visibility,      setVisibility]       = useState<Visibility>(editPost?.visibility ?? 'public');
  const [commentsEnabled, setCommentsEnabled]  = useState(editPost?.comments_enabled ?? true);
  const [submitting,      setSubmitting]       = useState(false);

  // Auto-disable comments when switched to private
  useEffect(() => {
    if (visibility === 'private') {
      setCommentsEnabled(false);
    }
  }, [visibility]);

  const canSubmit = content.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        content: content.trim(),
        passion_id:       passionId,
        visibility,
        comments_enabled: commentsEnabled,
      };
      if (isEdit && editPost) {
        await postApi.updatePost(editPost.id, payload);
      } else {
        await postApi.createPost(payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing['4'],
        paddingTop: spacing['5'],
        paddingBottom: spacing['3'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary }}>✕  Cancel</Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          color: colors.textPrimary,
        }}>
          {isEdit ? 'Edit Post' : 'New Post'}
        </Text>

        <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit}>
          <Text style={{
            fontSize: fontSizes.md,
            fontWeight: fontWeights.semibold,
            color: canSubmit ? colors.primary : colors.textDisabled,
          }}>
            {submitting ? 'Saving…' : isEdit ? 'Save' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        {/* ── Compose area ─────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          padding: spacing['4'],
          gap: spacing['3'],
          minHeight: 120,
        }}>
          <Avatar size="md" name={userId ?? 'Me'} />

          <TextInput
            style={{
              flex: 1,
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              textAlignVertical: 'top',
              paddingTop: 2,
            }}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textDisabled}
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus={!isEdit}
          />
        </View>

        {/* ── Options ──────────────────────────────────────────────────── */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: spacing['4'],
          gap: spacing['4'],
        }}>
          {/* Passion selector — stub, no list yet */}
          <View>
            <Text style={{
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.medium,
              color: colors.textSecondary,
              marginBottom: spacing['1'],
            }}>
              Passion
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing['3'],
                backgroundColor: colors.surface,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
              onPress={() => {
                // TODO: open passion picker when PassionPickerScreen is built
              }}
            >
              <Text style={{
                fontSize: fontSizes.md,
                color: passionId ? colors.textPrimary : colors.textDisabled,
              }}>
                {passionId ?? 'Select a passion (optional)'}
              </Text>
              <Text style={{ color: colors.textDisabled }}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Visibility */}
          <View>
            <Text style={{
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.medium,
              color: colors.textSecondary,
              marginBottom: spacing['1'],
            }}>
              Visibility
            </Text>
            <SegmentToggle<Visibility>
              options={[
                { value: 'public',  label: 'Public'  },
                { value: 'private', label: 'Private' },
              ]}
              value={visibility}
              onChange={setVisibility}
            />
          </View>

          {/* Comments toggle — only when public */}
          {visibility === 'public' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{ fontSize: fontSizes.md, color: colors.textPrimary }}>
                Allow comments
              </Text>

              {/* Simple toggle switch */}
              <TouchableOpacity
                onPress={() => setCommentsEnabled(v => !v)}
                style={{
                  width: 46,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: commentsEnabled ? colors.primary : colors.border,
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}
                activeOpacity={0.8}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.textInverse,
                  alignSelf: commentsEnabled ? 'flex-end' : 'flex-start',
                }} />
              </TouchableOpacity>
            </View>
          )}

          {/* Photo — stub only */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['2'],
              padding: spacing['3'],
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: implement media upload
            }}
          >
            <Text style={{ fontSize: fontSizes.lg }}>📷</Text>
            <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary }}>
              Add photo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;
