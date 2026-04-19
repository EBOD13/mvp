import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

type PassionDetailRoute = RouteProp<RootStackParamList, 'PassionDetailScreen'>;

const PassionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PassionDetailRoute>();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['6'] }}>
        <Text style={{ fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing['3'] }}>
          Passion Detail
        </Text>
        <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['2'] }}>
          Passion ID: {route.params.passionId}
        </Text>
        <Text style={{ fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['6'] }}>
          Full detail screen is coming soon.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PassionDetailScreen;
