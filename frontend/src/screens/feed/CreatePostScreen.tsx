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
import { launchImageLibrary } from 'react-native-image-picker';

import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { postApi, uploadPostImage } from '../../api/postApi';
import { RootStackParamList } from '../../navigation/types';
import { X, Camera } from 'lucide-react-native';
import { Avatar } from '../../components/common/Avatar';
import PassionFruitRating from '../../components/icons/PassionFruitRating';

type NavProp    = StackNavigationProp<RootStackParamList, 'CreatePostScreen'>;
type RoutePropT = RouteProp<RootStackParamList, 'CreatePostScreen'>;

type Visibility = 'public' | 'private';
type PostType   = 'post' | 'review';

// ---------------------------------------------------------------------------
// Reusable segment toggle
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

  const editPost = route.params?.post;
  const isEdit   = editPost !== undefined;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [content,         setContent]         = useState(editPost?.content ?? '');
  const [passionId,       setPassionId]        = useState<string | null>(editPost?.passion_id ?? null);
  const [visibility,      setVisibility]       = useState<Visibility>(editPost?.visibility ?? 'public');
  const [commentsEnabled, setCommentsEnabled]  = useState(editPost?.comments_enabled ?? true);
  const [postType,        setPostType]         = useState<PostType>(editPost?.is_review ? 'review' : 'post');
  const [rating,          setRating]           = useState<number>(editPost?.rating ?? 0);
  const [mediaUrls,       setMediaUrls]        = useState<string[]>(editPost?.media_urls ?? []);
  const [mediaBase64,     setMediaBase64]      = useState<{ base64: string; ext: string } | null>(null);
  const [submitting,      setSubmitting]       = useState(false);

  const isReview = postType === 'review';

  useEffect(() => {
    if (visibility === 'private') setCommentsEnabled(false);
  }, [visibility]);

  useEffect(() => {
    if (!isReview) {
      setRating(0);
      setMediaUrls([]);
      setMediaBase64(null);
    }
  }, [isReview]);

  const canSubmit = content.trim().length > 0 && !submitting;

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
      });
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) setMediaUrls([asset.uri]);
        if (asset.base64) {
          const ext = (asset.uri?.split('.').pop()?.toLowerCase()) ?? 'jpg';
          setMediaBase64({ base64: asset.base64, ext });
        }
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Upload image to Supabase Storage if we have a new local pick
      let finalMediaUrls = isReview ? mediaUrls : [];
      if (isReview && mediaBase64 && userId) {
        const publicUrl = await uploadPostImage(mediaBase64.base64, mediaBase64.ext, userId);
        finalMediaUrls = [publicUrl];
      }

      const payload = {
        content:          content.trim(),
        passion_id:       passionId,
        visibility,
        comments_enabled: commentsEnabled,
        is_review:        isReview,
        rating:           isReview && rating > 0 ? rating : null,
        media_urls:       finalMediaUrls,
      };
      if (isEdit && editPost) {
        await postApi.updatePost(editPost.id, payload);
      } else {
        await postApi.createPost(payload);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save post. Please try again.');
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['1'],
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['2'],
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <X size={14} color={colors.textSecondary} />
            <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.medium, color: colors.textSecondary }}>
              Cancel
            </Text>
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
          {/* ── Compose area ──────────────────────────────────────────────── */}
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
              placeholder={isReview ? 'Share your thoughts on this passion…' : "What's on your mind?"}
              placeholderTextColor={colors.textDisabled}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus={!isEdit}
            />
          </View>

          {/* ── Options ───────────────────────────────────────────────────── */}
          <View style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: spacing['4'],
            gap: spacing['4'],
          }}>

            {/* Post / Review toggle */}
            <SegmentToggle<PostType>
              options={[
                { value: 'post',   label: 'Post'   },
                { value: 'review', label: 'Review' },
              ]}
              value={postType}
              onChange={setPostType}
            />

            {/* Rating — only when review */}
            {isReview && (
              <View>
                <Text style={{
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.medium,
                  color: colors.textSecondary,
                  marginBottom: spacing['2'],
                }}>
                  Rating
                </Text>
                <PassionFruitRating value={rating} onChange={setRating} size={28} />
              </View>
            )}

            {/* Passion selector — stub */}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: fontSizes.md, color: colors.textPrimary }}>
                  Allow comments
                </Text>
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

            {/* Photo — only when review */}
            {isReview && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing['2'],
                  padding: spacing['3'],
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: mediaUrls.length > 0 ? colors.primary : colors.border,
                }}
                activeOpacity={0.7}
                onPress={handlePickPhoto}
              >
                <Camera size={20} color={mediaUrls.length > 0 ? colors.primary : colors.textSecondary} />
                <Text style={{
                  flex: 1,
                  fontSize: fontSizes.md,
                  color: mediaUrls.length > 0 ? colors.primary : colors.textSecondary,
                }}>
                  {mediaUrls.length > 0 ? 'Photo added  ✓' : 'Add photo'}
                </Text>
                {mediaUrls.length > 0 && (
                  <TouchableOpacity
                    onPress={() => { setMediaUrls([]); setMediaBase64(null); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;
