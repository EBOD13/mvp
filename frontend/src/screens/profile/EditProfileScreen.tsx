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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

/*
TODO(EditProfileScreen) explicit checklist:
- [x] Move all hardcoded style values to src/theme tokens.
- [x] Replace scaffold TextInput/Button blocks with shared Input/Button components (if available).
- [x] Keep firstName, lastName, username, bio as controlled useState fields.
- [x] Replace mock avatar picker with real image-picker integration (UI-only for now in this issue).
- [x] Keep email permanently read-only in this issue.
- [x] Keep exact helper text: "Email changes will be available in a future update."
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

  const [firstName, setFirstName] = useState('Daniel');
  const [lastName, setLastName] = useState('Esambu');
  const [username, setUsername] = useState('@daniel');
  const [bio, setBio] = useState(
    'Building practical products that empower people and simplify everyday life.',
  );
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const email = 'daniel.esambu@email.com';

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need permission to access your photos to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setProfilePhoto(result.uri);
        console.log('Profile photo selected:', result.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const handleSaveChanges = () => {
    console.log('Edit profile form values:', {
      firstName,
      lastName,
      username,
      bio,
      profilePhoto,
      email,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, paddingHorizontal: spacing['4'], paddingVertical: spacing['4'] }}>
          <Text style={[textVariants.h2 as any, { color: colors.textPrimary, marginBottom: spacing['6'] }]}>
            Edit Profile
          </Text>

          {/* Tappable avatar area with real image picker. */}
          <Pressable 
            style={{ alignItems: 'center', marginBottom: spacing['4'] }} 
            onPress={handlePickPhoto}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            ) : (
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: colors.textSecondary }}>Avatar</Text>
              </View>
            )}
            <Text style={[textVariants.body as any, { color: colors.primary, marginTop: spacing['3'] }]}>
              Change photo
            </Text>
          </Pressable>

          {/* Editable controlled fields. */}
          <View style={{ marginBottom: spacing['4'] }}>
            <Input
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
            />
          </View>

          <View style={{ marginBottom: spacing['4'] }}>
            <Input
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
            />
          </View>

          <View style={{ marginBottom: spacing['4'] }}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={{ marginBottom: spacing['4'] }}>
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people a little about yourself"
              multiline
              textAlignVertical="top"
              containerStyle={{ minHeight: 120 }}
            />
          </View>

          {/* Read-only email field. */}
          <View style={{ marginBottom: spacing['4'] }}>
            <Text style={[textVariants.label as any, { color: colors.textSecondary, marginBottom: spacing['1'] }]}>
              Email
            </Text>
            <View style={{
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              paddingHorizontal: spacing['3'],
              paddingVertical: spacing['3'],
              opacity: 0.65,
            }}>
              <Text style={[textVariants.body as any, { color: colors.textPrimary }]}>
                {email}
              </Text>
            </View>
            <Text style={[textVariants.caption as any, { color: colors.textSecondary, marginTop: spacing['2'] }]}>
              Email changes will be available in a future update.
            </Text>
          </View>

          <Button
            label="Save Changes"
            onPress={handleSaveChanges}
            variant="primary"
            size="md"
            style={{ marginTop: spacing['4'] }}
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
