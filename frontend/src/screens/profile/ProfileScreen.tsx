import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import BottomNavBar from '../../components/layout/BottomNavBar';
import FloatingActionButton from '../../components/layout/FloatingActionButton';

/*
TODO(ProfileScreen) explicit checklist:
- [x] Move all hardcoded style values to src/theme tokens.
- [x] Replace avatar placeholder with shared Avatar component (if available).
- [x] Confirm placeholder values match product-approved copy.
- [x] Render passions as pills/tags if design requires tag UI instead of list.
- [x] Keep all fields view-only (no editable inputs on this screen).
- [x] Keep Edit Profile button navigation to EditProfileScreen.
- [x] Wire real user data in follow-up API integration issue.
*/

type ProfileRoutes = RootStackParamList & {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
};

type ProfileNavigationProp = StackNavigationProp<ProfileRoutes, 'ProfileScreen'>;

// Placeholder display data for local UI validation only.
const profileData = {
  fullName: 'Daniel Esambu',
  username: '@daniel',
  bio: 'Building practical products that empower people and simplify everyday life.',
  passions: ['Music', 'Product Design', 'Travel'],
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { colors, spacing, textVariants } = useTheme();
  const [fabVisible, setFabVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: spacing['4'], paddingVertical: spacing['4'] }}>
        {/* Avatar with real name initials fallback. */}
        <View style={{ alignItems: 'center', marginBottom: spacing['6'] }}>
          <Avatar
            name={profileData.fullName}
            size="xl"
            style={{ marginBottom: spacing['4'] }}
          />
        </View>

        {/* Static display fields (view-only). */}
        <Text style={[textVariants.h2 as any, { color: colors.textPrimary, textAlign: 'center' }]}>
          {profileData.fullName}
        </Text>
        <Text style={[textVariants.body as any, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['6'] }]}>
          {profileData.username}
        </Text>

        <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['2'] }]}>
          Bio
        </Text>
        <Text style={[textVariants.body as any, { color: colors.textSecondary, marginBottom: spacing['6'] }]}>
          {profileData.bio}
        </Text>

        <Text style={[textVariants.h4 as any, { color: colors.textPrimary, marginBottom: spacing['2'] }]}>
          Passions / Interests
        </Text>
        <View style={{ marginBottom: spacing['6'] }}>
          {profileData.passions.map(item => (
            <Text key={item} style={[textVariants.body as any, { color: colors.textSecondary, marginBottom: spacing['2'] }]}>
              {'• '}
              {item}
            </Text>
          ))}
        </View>

        <Button
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfileScreen')}
          variant="primary"
          size="md"
          style={{ marginTop: spacing['4'] }}
        />
      </View>
      </ScrollView>
      <BottomNavBar
        activeRoute="ProfileScreen"
        onAddPress={() => setFabVisible(v => !v)}
      />
      <FloatingActionButton
        visible={fabVisible}
        onClose={() => setFabVisible(false)}
        position="right"
      />
    </View>
  );
};

export default ProfileScreen;
