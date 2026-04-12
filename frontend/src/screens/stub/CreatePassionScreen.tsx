import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';

const CreatePassionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing['6'] }}>
      <Text style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
        Create a Passion Group
      </Text>
      <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['6'] }}>
        This screen is coming soon.
      </Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.primary }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreatePassionScreen;
