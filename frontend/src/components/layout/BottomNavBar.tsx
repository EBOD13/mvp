import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';

export type BottomNavBarProps = {
  activeRoute: keyof RootStackParamList;
  onAddPress: () => void;
};

type NavProp = StackNavigationProp<RootStackParamList>;

type TabRoute = 'HomeFeedScreen' | 'DiscoverScreen' | 'MessagesScreen' | 'ProfileScreen';

const TABS: { key: TabRoute; label: string; icon: string }[] = [
  { key: 'HomeFeedScreen', label: 'Home',     icon: '⌂' },
  { key: 'DiscoverScreen', label: 'Discover', icon: '⊙' },
  { key: 'MessagesScreen', label: 'Messages', icon: '✉' },
  { key: 'ProfileScreen',  label: 'Profile',  icon: '◉' },
];

const NAV_HEIGHT = 64;

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeRoute, onAddPress }) => {
  const navigation = useNavigation<NavProp>();
  const { colors, spacing, shadows } = useTheme();

  const renderTab = (tab: { key: TabRoute; label: string; icon: string }) => {
    const isActive = activeRoute === tab.key;
    const color = isActive ? colors.primary : colors.textDisabled;
    return (
      <TouchableOpacity
        key={tab.key}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing['2'],
        }}
        onPress={() => navigation.navigate(tab.key)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 22, color, lineHeight: 26 }}>{tab.icon}</Text>
        <Text style={{ fontSize: 11, color, marginTop: 2, fontWeight: '500' }}>{tab.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          height: NAV_HEIGHT,
          backgroundColor: colors.surfaceElevated,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          alignItems: 'center',
        },
        shadows.md,
      ]}
    >
      {/* Home, Discover */}
      {TABS.slice(0, 2).map(renderTab)}

      {/* Center Add Button — visually elevated above the bar */}
      <TouchableOpacity
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        onPress={onAddPress}
        activeOpacity={0.8}
      >
        <View
          style={[
            {
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            },
            shadows.md,
          ]}
        >
          <Text
            style={{
              fontSize: 30,
              color: colors.textInverse,
              lineHeight: 34,
              fontWeight: '300',
              includeFontPadding: false,
            }}
          >
            +
          </Text>
        </View>
      </TouchableOpacity>

      {/* Messages, Profile */}
      {TABS.slice(2).map(renderTab)}
    </View>
  );
};

export { NAV_HEIGHT };
export default BottomNavBar;
