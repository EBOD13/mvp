import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { getMe, updateMe } from '../../api/userApi';
import { supabase } from '../../lib/supabase';

type Nav = StackNavigationProp<RootStackParamList, 'EditProfileScreen'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors, spacing, radii, textVariants } = useTheme();
  const { userId } = useAuth();

  const [displayName,  setDisplayName]  = useState('');
  const [username,     setUsername]     = useState('');
  const [bio,          setBio]          = useState('');
  const [avatarUri,    setAvatarUri]    = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<{ base64: string; ext: string } | null>(null);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    getMe().then(me => {
      setDisplayName(me.display_name ?? '');
      setUsername(me.username ?? '');
      setBio(me.bio ?? '');
      setAvatarUri(me.avatar_url ?? null);
    }).catch(() => {});
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
      let newAvatarUrl: string | null | undefined;
      if (avatarBase64) {
        newAvatarUrl = await uploadAvatar();
      }

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

  const SectionLabel = ({ children }: { children: string }) => (
    <Text style={[textVariants.caption as any, {
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing['2'],
    }]}>
      {children}
    </Text>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, paddingHorizontal: spacing['4'], paddingVertical: spacing['4'] }}>

          {/* Header */}
          <Text style={[textVariants.h2 as any, { color: colors.textPrimary, marginBottom: spacing['6'] }]}>
            Edit Profile
          </Text>

          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: spacing['6'] }}>
            <Avatar uri={avatarUri} name={displayName} size="xl" style={{ marginBottom: spacing['3'] }} />
            <Pressable onPress={handlePickPhoto}>
              <Text style={[textVariants.body as any, { color: colors.primary }]}>Change Photo</Text>
            </Pressable>
            {avatarBase64 && (
              <Pressable onPress={() => { setAvatarUri(null); setAvatarBase64(null); }} style={{ marginTop: spacing['1'] }}>
                <Text style={[textVariants.caption as any, { color: colors.textSecondary }]}>Remove</Text>
              </Pressable>
            )}
          </View>

          {/* Display Name */}
          <View style={{ marginBottom: spacing['4'] }}>
            <SectionLabel>Display Name</SectionLabel>
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              autoCapitalize="words"
            />
          </View>

          {/* Username (read-only for now) */}
          <View style={{ marginBottom: spacing['4'] }}>
            <SectionLabel>Username</SectionLabel>
            <View style={{
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['3'],
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={[textVariants.body as any, { color: colors.textSecondary }]}>
                @{username}
              </Text>
            </View>
            <Text style={[textVariants.caption as any, { color: colors.textSecondary, marginTop: spacing['1'] }]}>
              Username changes coming soon
            </Text>
          </View>

          {/* Bio */}
          <View style={{ marginBottom: spacing['6'] }}>
            <SectionLabel>Bio</SectionLabel>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself…"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Actions */}
          <Button
            label={saving ? 'Saving…' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            size="md"
            style={{ marginBottom: spacing['3'] }}
          />
          <Button
            label="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="md"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
