import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { X, Images, Video, Globe, Lock } from 'lucide-react-native';

import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { postApi, uploadMediaAssets, MediaAsset } from '../../api/postApi';
import { RootStackParamList } from '../../navigation/types';
import { Avatar } from '../../components/common/Avatar';
import PassionFruitRating from '../../components/icons/PassionFruitRating';

type NavProp    = StackNavigationProp<RootStackParamList, 'CreatePostScreen'>;
type RoutePropT = RouteProp<RootStackParamList, 'CreatePostScreen'>;

type Visibility = 'public' | 'private';
type PostType   = 'post' | 'review';

const MAX_MEDIA = 12;
const SCREEN_W  = Dimensions.get('window').width;

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropT>();
  const { userId } = useAuth();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const editPost = route.params?.post;
  const isEdit   = !!editPost;

  const [content,         setContent]        = useState(editPost?.content ?? '');
  const [passionId,       setPassionId]       = useState<string | null>(editPost?.passion_id ?? null);
  const [visibility,      setVisibility]      = useState<Visibility>(editPost?.visibility ?? 'public');
  const [commentsEnabled, setCommentsEnabled] = useState(editPost?.comments_enabled ?? true);
  const [postType,        setPostType]        = useState<PostType>(editPost?.is_review ? 'review' : 'post');
  const [rating,          setRating]          = useState<number>(editPost?.rating ?? 0);
  const [mediaAssets,     setMediaAssets]     = useState<MediaAsset[]>([]);
  const [previewUris,     setPreviewUris]     = useState<string[]>(editPost?.media_urls ?? []);
  const [submitting,      setSubmitting]      = useState(false);
  const [previewIndex,    setPreviewIndex]    = useState(0);

  const isReview  = postType === 'review';
  const canSubmit = (content.trim().length > 0 || previewUris.length > 0) && !submitting;

  useEffect(() => {
    if (!isReview) setRating(0);
  }, [isReview]);

  useEffect(() => {
    if (visibility === 'private') setCommentsEnabled(false);
  }, [visibility]);

  const pickMedia = async (type: 'photo' | 'video' | 'mixed') => {
    const remaining = MAX_MEDIA - previewUris.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', `You can add at most ${MAX_MEDIA} items.`);
      return;
    }
    try {
      const result = await launchImageLibrary({
        mediaType: type,
        selectionLimit: remaining,
        includeBase64: true,
        videoQuality: 'medium',
      });
      if (!result.assets?.length) return;

      const newAssets: MediaAsset[] = result.assets.map(a => ({
        uri:      a.uri ?? '',
        base64:   a.base64 ?? undefined,
        mimeType: a.type ?? (a.uri?.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'),
        ext:      a.uri?.split('.').pop()?.toLowerCase() ?? 'jpg',
      }));

      setMediaAssets(prev => [...prev, ...newAssets]);
      setPreviewUris(prev => [...prev, ...newAssets.map(a => a.uri)]);
    } catch {
      Alert.alert('Error', 'Could not open media library.');
    }
  };

  const removeMedia = (index: number) => {
    setMediaAssets(prev => prev.filter((_, i) => i !== index));
    setPreviewUris(prev => prev.filter((_, i) => i !== index));
    setPreviewIndex(p => Math.min(p, previewUris.length - 2));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Upload any local assets that haven't been uploaded yet
      let finalUrls = previewUris;
      const localAssets = mediaAssets.filter(a => a.uri.startsWith('file://') || a.uri.startsWith('ph://'));
      if (localAssets.length > 0 && userId) {
        const uploaded = await uploadMediaAssets(localAssets, userId);
        // Replace local URIs with public URLs in the same order
        finalUrls = previewUris.map(uri => {
          const idx = localAssets.findIndex(a => a.uri === uri);
          return idx >= 0 ? uploaded[idx] : uri;
        });
      }

      const payload = {
        content:          content.trim(),
        passion_id:       passionId,
        visibility,
        comments_enabled: commentsEnabled,
        is_review:        isReview,
        rating:           isReview && rating > 0 ? rating : null,
        media_urls:       finalUrls,
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

  // ── Media preview strip ────────────────────────────────────────────────────
  const PREVIEW_GAP  = 16;
  const PREVIEW_SIZE = SCREEN_W - spacing['8'] * 2;
  const PREVIEW_STEP = PREVIEW_SIZE + PREVIEW_GAP;

  const renderPreviewItem = ({ item, index }: { item: string; index: number }) => {
    const isVideo = item.endsWith('.mp4') || item.endsWith('.mov') ||
      (mediaAssets[index]?.mimeType ?? '').startsWith('video');
    return (
      <View style={{ width: PREVIEW_SIZE, aspectRatio: 1, borderRadius: radii.lg, overflow: 'hidden', marginRight: index < previewUris.length - 1 ? PREVIEW_GAP : 0 }}>
        <Image
          source={{ uri: item }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {isVideo && (
          <View style={{
            ...StyleSheet_absoluteFill,
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Video size={40} color="#fff" />
          </View>
        )}
        <TouchableOpacity
          onPress={() => removeMedia(index)}
          style={{
            position: 'absolute', top: spacing['2'], right: spacing['2'],
            backgroundColor: 'rgba(0,0,0,0.55)',
            borderRadius: 12, padding: 4,
          }}
        >
          <X size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
            {isEdit ? 'Edit Post' : 'New Post'}
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? colors.primary : colors.border,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['2'],
              borderRadius: radii.full,
            }}
          >
            {submitting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: '#fff' }}>
                  {isEdit ? 'Save' : 'Post'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Compose area ──────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: spacing['4'],
          paddingTop: spacing['4'],
          paddingBottom: spacing['2'],
        }}>
          <Avatar size="md" name={userId ?? ''} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: spacing['3'] }}>
            <TextInput
              style={{
                fontSize: fontSizes.md,
                color: colors.textPrimary,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder={isReview ? 'Share your thoughts on this passion…' : "What's on your mind?"}
              placeholderTextColor={colors.textDisabled}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus={!isEdit}
            />
            {/* Review rating */}
            {isReview && (
              <View style={{ marginTop: spacing['2'] }}>
                <PassionFruitRating value={rating} onChange={setRating} size={26} />
              </View>
            )}
          </View>
        </View>

        {/* ── Media preview carousel ─────────────────────────────────────────── */}
        {previewUris.length > 0 && (
          <View style={{ marginHorizontal: spacing['4'], marginBottom: spacing['3'] }}>
            <FlatList
              data={previewUris}
              keyExtractor={(_, i) => String(i)}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={PREVIEW_STEP}
              decelerationRate="fast"
              renderItem={renderPreviewItem}
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / PREVIEW_STEP);
                setPreviewIndex(idx);
              }}
              getItemLayout={(_, index) => ({ length: PREVIEW_STEP, offset: PREVIEW_STEP * index, index })}
            />
            {/* Dot indicators */}
            {previewUris.length > 1 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing['2'] }}>
                {previewUris.map((_, i) => (
                  <View key={i} style={{
                    width: i === previewIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === previewIndex ? colors.primary : colors.border,
                    marginHorizontal: 2,
                  }} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Bottom toolbar ─────────────────────────────────────────────────── */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          gap: spacing['4'],
        }}>
          {/* Media pickers */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['5'] }}>
            <TouchableOpacity
              onPress={() => pickMedia('photo')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}
              disabled={previewUris.length >= MAX_MEDIA}
            >
              <Images size={22} color={previewUris.length >= MAX_MEDIA ? colors.textDisabled : colors.textSecondary} />
              <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickMedia('video')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}
              disabled={previewUris.length >= MAX_MEDIA}
            >
              <Video size={22} color={previewUris.length >= MAX_MEDIA ? colors.textDisabled : colors.textSecondary} />
              <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary }}>Video</Text>
            </TouchableOpacity>

            {previewUris.length > 0 && (
              <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled, marginLeft: 'auto' }}>
                {previewUris.length}/{MAX_MEDIA}
              </Text>
            )}
          </View>

          {/* Post / Review + Visibility row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
            {/* Post / Review pill toggle */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 3,
            }}>
              {(['post', 'review'] as PostType[]).map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setPostType(opt)}
                  style={{
                    paddingHorizontal: spacing['4'],
                    paddingVertical: spacing['1'],
                    borderRadius: radii.full,
                    backgroundColor: postType === opt ? colors.primary : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.medium,
                    color: postType === opt ? '#fff' : colors.textSecondary,
                    textTransform: 'capitalize',
                  }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Visibility toggle */}
            <TouchableOpacity
              onPress={() => setVisibility(v => v === 'public' ? 'private' : 'public')}
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
              {visibility === 'public'
                ? <Globe size={14} color={colors.textSecondary} />
                : <Lock size={14} color={colors.textSecondary} />
              }
              <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, textTransform: 'capitalize' }}>
                {visibility}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Inline helper to avoid importing StyleSheet just for absoluteFill
const StyleSheet_absoluteFill = {
  position: 'absolute' as const,
  top: 0, left: 0, right: 0, bottom: 0,
};

export default CreatePostScreen;
