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
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Check, ChevronDown, Globe, Hash, Images, Lock, Video, X } from 'lucide-react-native';

import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { postApi, uploadMediaAssets, MediaAsset } from '../../api/postApi';
import { passionApi, PassionListItem } from '../../api/passionApi';
import { RootStackParamList } from '../../navigation/types';
import { Avatar } from '../../components/common/Avatar';
import PassionFruitRating from '../../components/icons/PassionFruitRating';

type NavProp    = StackNavigationProp<RootStackParamList, 'CreatePostScreen'>;
type RoutePropT = RouteProp<RootStackParamList, 'CreatePostScreen'>;

type Visibility = 'public' | 'private';
type PostType   = 'post' | 'review';

const MAX_MEDIA = 12;
const SCREEN_W  = Dimensions.get('window').width;

const ACCENT_COLORS = [
  '#8C6AD9', '#5B8DEF', '#E26D6D', '#48A6A7',
  '#E59D5C', '#6D9F71', '#D4848A', '#7B8FA1',
];
const accentColor = (id: string) => {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return ACCENT_COLORS[n % ACCENT_COLORS.length];
};

// ── Passion picker modal ──────────────────────────────────────────────────────

interface PassionPickerProps {
  visible: boolean;
  passions: PassionListItem[];
  selectedId: string | null;
  onSelect: (id: string | null, name: string | null) => void;
  onClose: () => void;
}

const PassionPicker: React.FC<PassionPickerProps> = ({ visible, passions, selectedId, onSelect, onClose }) => {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose}>
        <Pressable
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            backgroundColor: colors.background,
            borderTopLeftRadius: radii['2xl'] ?? 24,
            borderTopRightRadius: radii['2xl'] ?? 24,
            paddingTop: spacing['2'],
            paddingBottom: spacing['8'],
            maxHeight: '75%',
          }}
          onPress={() => {}}
        >
          {/* Handle bar */}
          <View style={{
            width: 40, height: 4, borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: 'center',
            marginBottom: spacing['4'],
          }} />

          <Text style={{
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.bold,
            color: colors.textPrimary,
            paddingHorizontal: spacing['5'],
            marginBottom: spacing['3'],
          }}>
            Post in…
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* None option */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { onSelect(null, null); onClose(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing['5'],
                paddingVertical: spacing['4'],
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1.5, borderColor: colors.border,
                alignItems: 'center', justifyContent: 'center',
                marginRight: spacing['3'],
              }}>
                <Globe size={20} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
                  No passion (global)
                </Text>
                <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 }}>
                  Visible to everyone on your feed
                </Text>
              </View>
              {selectedId === null && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>

            {/* Passion list */}
            {passions.map(p => {
              const color = accentColor(p.id);
              const selected = selectedId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.7}
                  onPress={() => { onSelect(p.id, p.name); onClose(); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing['5'],
                    paddingVertical: spacing['4'],
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: selected ? color + '0A' : 'transparent',
                  }}
                >
                  <View style={{
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: color + '20',
                    borderWidth: 1.5, borderColor: color + '55',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: spacing['3'],
                  }}>
                    <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color }}>
                      {p.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
                      {p.name}
                    </Text>
                    {p.category && (
                      <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 }}>
                        {p.category}  ·  {p.member_count} members
                      </Text>
                    )}
                  </View>
                  {selected && <Check size={18} color={color} />}
                </TouchableOpacity>
              );
            })}

            {passions.length === 0 && (
              <View style={{ padding: spacing['6'], alignItems: 'center' }}>
                <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center' }}>
                  Join some passions to post in them.
                </Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ── CreatePostScreen ──────────────────────────────────────────────────────────

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropT>();
  const { userId } = useAuth();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const editPost = route.params?.post;
  const isEdit   = !!editPost;

  const [content,         setContent]        = useState(editPost?.content ?? '');
  const [passionId,       setPassionId]       = useState<string | null>(editPost?.passion_id ?? null);
  const [passionName,     setPassionName]     = useState<string | null>(editPost?.passion_name ?? null);
  const [visibility,      setVisibility]      = useState<Visibility>(editPost?.visibility ?? 'public');
  const [commentsEnabled, setCommentsEnabled] = useState(editPost?.comments_enabled ?? true);
  const [postType,        setPostType]        = useState<PostType>(editPost?.is_review ? 'review' : 'post');
  const [rating,          setRating]          = useState<number>(editPost?.rating ?? 0);
  const [mediaAssets,     setMediaAssets]     = useState<MediaAsset[]>([]);
  const [previewUris,     setPreviewUris]     = useState<string[]>(editPost?.media_urls ?? []);
  const [submitting,      setSubmitting]      = useState(false);
  const [previewIndex,    setPreviewIndex]    = useState(0);
  const [passions,        setPassions]        = useState<PassionListItem[]>([]);
  const [pickerVisible,   setPickerVisible]   = useState(false);

  const isReview  = postType === 'review';
  const canSubmit = (content.trim().length > 0 || previewUris.length > 0) && !submitting;

  // Load user's passions for the picker
  useEffect(() => {
    passionApi.getMyPassions()
      .then(res => setPassions(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPassions([]));
  }, []);

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
      let finalUrls = previewUris;
      const localAssets = mediaAssets.filter(a => a.uri.startsWith('file://') || a.uri.startsWith('ph://'));
      if (localAssets.length > 0 && userId) {
        const uploaded = await uploadMediaAssets(localAssets, userId);
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

  // ── Media preview strip ───────────────────────────────────────────────────

  const PREVIEW_GAP  = 16;
  const PREVIEW_SIZE = SCREEN_W - spacing['8'] * 2;
  const PREVIEW_STEP = PREVIEW_SIZE + PREVIEW_GAP;

  const renderPreviewItem = ({ item, index }: { item: string; index: number }) => {
    const isVideo = item.endsWith('.mp4') || item.endsWith('.mov') ||
      (mediaAssets[index]?.mimeType ?? '').startsWith('video');
    return (
      <View style={{ width: PREVIEW_SIZE, aspectRatio: 1, borderRadius: radii.lg, overflow: 'hidden', marginRight: index < previewUris.length - 1 ? PREVIEW_GAP : 0 }}>
        <Image source={{ uri: item }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        {isVideo && (
          <View style={{
            ...StyleSheet_absoluteFill,
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center', justifyContent: 'center',
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

  // ── Derived colors ────────────────────────────────────────────────────────

  const selectedColor = passionId ? accentColor(passionId) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ── */}
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
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textInverse }}>
                  {isEdit ? 'Save' : 'Post'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Compose area ── */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: spacing['4'],
          paddingTop: spacing['4'],
          paddingBottom: spacing['2'],
        }}>
          <Avatar size="md" name={userId ?? ''} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: spacing['3'] }}>
            {/* Passion context label */}
            {passionId && passionName && selectedColor && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing['2'],
                gap: spacing['1'],
              }}>
                <Hash size={12} color={selectedColor} />
                <Text style={{
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.semibold,
                  color: selectedColor,
                }}>
                  {passionName}
                </Text>
              </View>
            )}
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
            {isReview && (
              <View style={{ marginTop: spacing['2'] }}>
                <PassionFruitRating value={rating} onChange={setRating} size={26} />
              </View>
            )}
          </View>
        </View>

        {/* ── Media preview carousel ── */}
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

        {/* ── Bottom toolbar ── */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          gap: spacing['3'],
        }}>

          {/* Passion selector */}
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['2'],
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['2'],
              borderRadius: radii.lg,
              borderWidth: 1.5,
              borderColor: selectedColor ? selectedColor + '88' : colors.border,
              backgroundColor: selectedColor ? selectedColor + '0F' : colors.surface,
              alignSelf: 'flex-start',
            }}
          >
            {selectedColor
              ? <Hash size={14} color={selectedColor} />
              : <Globe size={14} color={colors.textSecondary} />
            }
            <Text style={{
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
              color: selectedColor ?? colors.textSecondary,
              maxWidth: 180,
            }} numberOfLines={1}>
              {passionName ?? 'Select passion (optional)'}
            </Text>
            <ChevronDown size={14} color={selectedColor ?? colors.textSecondary} />
          </TouchableOpacity>

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
                    color: postType === opt ? colors.textInverse : colors.textSecondary,
                    textTransform: 'capitalize',
                  }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

      {/* ── Passion picker modal ── */}
      <PassionPicker
        visible={pickerVisible}
        passions={passions}
        selectedId={passionId}
        onSelect={(id, name) => {
          setPassionId(id);
          setPassionName(name);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
};

const StyleSheet_absoluteFill = {
  position: 'absolute' as const,
  top: 0, left: 0, right: 0, bottom: 0,
};

export default CreatePostScreen;
