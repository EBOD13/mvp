import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

/*
TODO(EditProfileScreen) explicit checklist:
- [x] Move all hardcoded style values to src/theme tokens.
- [x] Replace scaffold TextInput/Button blocks with shared Input/Button components.
- [x] Keep username as a controlled useState field.
- [x] Added Links section: display existing links and an "+ ADD" action.
- [x] Added Profile Song section with Change / Remove buttons (UI-only).
- [x] Profile Picture section: thumbnail + Change / Remove buttons with real image picker.
- [x] Added Private Profile toggle (UI-only state in this issue).
- [x] Keep Save Changes as console.log only (no API call in this issue).
- [x] Keep Cancel as navigation.goBack() with no save side effects.
- [x] Validate keyboard behavior on iOS and Android with KeyboardAvoidingView.
*/

type ProfileRoutes = RootStackParamList & {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
};

type ProfileNavigationProp = StackNavigationProp<
  ProfileRoutes,
  'EditProfileScreen'
>;

const EditProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { colors, spacing, radii, textVariants } = useTheme();

  const [username, setUsername] = useState('@jerrycan');
  const [links, setLinks] = useState<string[]>(['www.link.com']);
  const [profileSong, setProfileSong] = useState<string | null>('Song 2');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePickPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', 'Failed to pick an image. Please try again.');
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setProfilePhoto(uri);
        console.log('Profile photo selected:', uri);
      } else {
        Alert.alert('Error', 'No image was selected. Please try again.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const handleAddLink = () => {
    // UI-only: append a placeholder new link for now.
    console.log('Add link tapped');
    setLinks(prev => [...prev, 'www.newlink.com']);
  };

  const handleChangeSong = () => {
    console.log('Change song tapped');
    // Placeholder: in a real implementation open a song picker.
  };

  const handleRemoveSong = () => {
    setProfileSong(null);
    console.log('Profile song removed');
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    console.log('Profile photo removed');
  };

  const handleSaveChanges = () => {
    console.log('Edit profile form values:', {
      username,
      links,
      profileSong,
      profilePhoto,
      isPrivate,
    });
  };

  // ── Shared section-header style ────────────────────────────────────────────
  const SectionLabel = ({ children }: { children: string }) => (
    <Text
      style={[
        textVariants.h4 as any,
        { color: colors.textPrimary, marginBottom: spacing['3'] },
      ]}
    >
      {children}
    </Text>
  );

  // ── Shared small action button ─────────────────────────────────────────────
  const SmallButton = ({
    label,
    onPress,
  }: {
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.sm,
        paddingHorizontal: spacing['3'],
        paddingVertical: spacing['1'],
        marginRight: spacing['2'],
      }}
    >
      <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing['4'],
            paddingVertical: spacing['4'],
          }}
        >
          <Text
            style={[
              textVariants.h2 as any,
              { color: colors.textPrimary, marginBottom: spacing['6'] },
            ]}
          >
            Edit Profile
          </Text>

          {/* ── Username ── */}
          <View style={{ marginBottom: spacing['6'] }}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* ── Added Links ── */}
          <View style={{ marginBottom: spacing['6'] }}>
            <SectionLabel>Added Links</SectionLabel>
            {links.map((link, idx) => (
              <Text
                key={idx}
                style={[
                  textVariants.body as any,
                  { color: colors.textSecondary, marginBottom: spacing['1'] },
                ]}
              >
                {link}
              </Text>
            ))}
            <Pressable onPress={handleAddLink} style={{ marginTop: spacing['2'] }}>
              <Text
                style={[textVariants.body as any, { color: colors.primary }]}
              >
                + ADD
              </Text>
            </Pressable>
          </View>

          {/* ── Profile Song ── */}
          <View style={{ marginBottom: spacing['6'] }}>
            <SectionLabel>Profile Song</SectionLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {profileSong ? (
                <>
                  <Text
                    style={[
                      textVariants.body as any,
                      { color: colors.textSecondary, marginRight: spacing['3'] },
                    ]}
                  >
                    {profileSong}
                  </Text>
                  <SmallButton label="Change" onPress={handleChangeSong} />
                  <SmallButton label="Remove" onPress={handleRemoveSong} />
                </>
              ) : (
                <SmallButton label="+ Add Song" onPress={handleChangeSong} />
              )}
            </View>
          </View>

          {/* ── Profile Picture ── */}
          <View style={{ marginBottom: spacing['6'] }}>
            <SectionLabel>Profile Picture</SectionLabel>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Thumbnail */}
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: radii.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: spacing['4'],
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: radii.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    marginRight: spacing['4'],
                  }}
                />
              )}
              {/* Change / Remove stacked vertically */}
              <View>
                <SmallButton label="Change" onPress={handlePickPhoto} />
                <View style={{ height: spacing['2'] }} />
                <SmallButton label="Remove" onPress={handleRemovePhoto} />
              </View>
            </View>
          </View>

          {/* ── Private Profile toggle ── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing['6'],
            }}
          >
            <Text
              style={[textVariants.h4 as any, { color: colors.textPrimary }]}
            >
              Private Profile
            </Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {/* ── Actions ── */}
          <Button
            label="Save Changes"
            onPress={handleSaveChanges}
            variant="primary"
            size="md"
            style={{ marginTop: spacing['2'] }}
          />
          <Button
            label="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="md"
            style={{ marginTop: spacing['2'] }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;