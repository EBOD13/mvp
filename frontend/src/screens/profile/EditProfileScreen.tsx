import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChevronLeft, Camera, Music } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../../components/common/Avatar';
import { getMe, updateMe } from '../../api/userApi';
import { supabase } from '../../lib/supabase';

type Nav = StackNavigationProp<RootStackParamList, 'EditProfileScreen'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { userId } = useAuth();

  const [displayName,  setDisplayName]  = useState('');
  const [username,     setUsername]     = useState('');
  const [bio,          setBio]          = useState('');
  const [avatarUri,    setAvatarUri]    = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<{ base64: string; ext: string } | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    getMe()
      .then(me => {
        setDisplayName(me.display_name ?? '');
        setUsername(me.username ?? '');
        setBio(me.bio ?? '');
        setAvatarUri(me.avatar_url ?? null);
      })
      .catch(() => Alert.alert('Error', 'Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, includeBase64: true });
      if (result.didCancel || !result.assets?.length) return;
      const asset = result.assets[0];
      if (asset.uri) setAvatarUri(asset.uri);
      if (asset.base64) {
        const ext = asset.uri?.split('.').pop()?.toLowerCase() ?? 'jpg';
        setAvatarBase64({ base64: asset.base64, ext });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick an image.');
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarBase64 || !userId) return null;
    const { base64, ext } = avatarBase64;
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const path = `avatars/${userId}/avatar.${ext}`;
    const arrayBuffer = await fetch(`data:${mimeType};base64,${base64}`).then(r => r.arrayBuffer());
    const { error } = await supabase.storage
      .from('post-media')
      .upload(path, arrayBuffer, { contentType: mimeType, upsert: true });
    if (error) throw new Error(`Avatar upload failed: ${error.message}`);
    return supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Validation', 'Display name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const newAvatarUrl = avatarBase64 ? await uploadAvatar() : undefined;
      await updateMe({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        ...(newAvatarUrl ? { avatar_url: newAvatarUrl } : {}),
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = displayName.trim().length > 0 && !saving;

  const fieldStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  };

  const labelStyle = {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: spacing['2'],
  };

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
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary }}>
            Edit Profile
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {saving
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={{
                  fontSize: fontSizes.md,
                  fontWeight: fontWeights.semibold,
                  color: canSave ? colors.primary : colors.textDisabled,
                }}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: spacing['6'] }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Avatar ── */}
            <View style={{ alignItems: 'center', marginBottom: spacing['8'] }}>
              <View style={{ position: 'relative' }}>
                <Avatar uri={avatarUri} name={displayName} size="xl" />
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: colors.background,
                  }}
                >
                  <Camera size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handlePickPhoto} style={{ marginTop: spacing['3'] }}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.medium, color: colors.primary }}>
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Display Name ── */}
            <View style={{ marginBottom: spacing['5'] }}>
              <Text style={labelStyle}>Display Name</Text>
              <TextInput
                style={fieldStyle}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* ── Username (read-only) ── */}
            <View style={{ marginBottom: spacing['5'] }}>
              <Text style={labelStyle}>Username</Text>
              <View style={[fieldStyle, { backgroundColor: colors.surface }]}>
                <Text style={{ fontSize: fontSizes.md, color: colors.textDisabled }}>
                  @{username}
                </Text>
              </View>
              <Text style={{ fontSize: fontSizes.xs, color: colors.textDisabled, marginTop: spacing['1'] }}>
                Username changes are not available yet
              </Text>
            </View>

            {/* ── Bio ── */}
            <View style={{ marginBottom: spacing['5'] }}>
              <Text style={labelStyle}>Bio</Text>
              <TextInput
                style={[fieldStyle, { minHeight: 90, textAlignVertical: 'top' }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself…"
                placeholderTextColor={colors.textDisabled}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* ── Profile Song ── */}
            <View style={{ marginBottom: spacing['5'] }}>
              <Text style={labelStyle}>Profile Song</Text>
              <View style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing['4'],
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Music size={16} color={colors.textDisabled} style={{ marginRight: spacing['2'] }} />
                  <Text style={{ fontSize: fontSizes.sm, color: colors.textDisabled, flex: 1 }}>
                    Profile song coming soon — MP3 upload not yet available.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
