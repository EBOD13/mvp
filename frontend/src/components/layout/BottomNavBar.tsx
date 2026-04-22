import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Mail, CircleUser, Plus } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';

export type BottomNavBarProps = {
  activeRoute: keyof RootStackParamList;
  onAddPress: () => void;
};

type NavProp = StackNavigationProp<RootStackParamList>;
type TabRoute = 'HomeFeedScreen' | 'DiscoverScreen' | 'MessagesScreen' | 'ProfileScreen';

const NAV_HEIGHT = 64;

type TabDef = {
  key: TabRoute;
  label: string;
  Icon: React.FC<{ size: number; color: string }>;
};

const TABS: TabDef[] = [
  { key: 'HomeFeedScreen', label: 'Home',     Icon: Home },
  { key: 'DiscoverScreen', label: 'Discover', Icon: Compass },
  { key: 'MessagesScreen', label: 'Messages', Icon: Mail },
  { key: 'ProfileScreen',  label: 'Profile',  Icon: CircleUser },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeRoute, onAddPress }) => {
  const navigation = useNavigation<NavProp>();
  const { colors, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const renderTab = (tab: TabDef) => {
    const isActive = activeRoute === tab.key;
    const color = isActive ? colors.primary : colors.textDisabled;
    return (
      <TouchableOpacity
        key={tab.key}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: spacing['2'],
        }}
        onPress={() => navigation.navigate(tab.key)}
        activeOpacity={0.7}
      >
        <tab.Icon size={22} color={color} />
        <Text style={{ fontSize: 11, color, marginTop: 3, fontWeight: '500' }}>{tab.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          height: NAV_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.surfaceElevated,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          alignItems: 'flex-start',
        },
        shadows.md,
      ]}
    >
      {TABS.slice(0, 2).map(renderTab)}

      {/* Center Add Button */}
      <TouchableOpacity
        style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: spacing['2'] }}
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
              marginTop: -16,
            },
            shadows.md,
          ]}
        >
          <Plus size={26} color={colors.textInverse} />
        </View>
      </TouchableOpacity>

      {TABS.slice(2).map(renderTab)}
    </View>
  );
};

export { NAV_HEIGHT };
export default BottomNavBar;
